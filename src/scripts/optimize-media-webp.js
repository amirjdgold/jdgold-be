/**
 * Converts already-stored PNG/JPEG assets to WebP, rewrites every reference to
 * them, and drops the original file. New uploads arrive as WebP already; this
 * is the one-off pass for media uploaded before that.
 *
 *   node src/scripts/optimize-media-webp.js --dry-run
 *   node src/scripts/optimize-media-webp.js
 *   node src/scripts/optimize-media-webp.js --only=screenshot --limit=5
 *
 * Against production, supply that environment explicitly — MONGODB_URI and
 * BLOB_READ_WRITE_TOKEN must match, or the run rewrites one database while
 * deleting another's files:
 *
 *   node --env-file=.env.production.local src/scripts/optimize-media-webp.js --dry-run
 *
 * A second database sharing the same Blob store (e.g. a local copy) still
 * names the old files afterwards. --relink adopts the converted files there
 * without re-encoding or deleting anything:
 *
 *   node src/scripts/optimize-media-webp.js --relink
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { del, put } from '@vercel/blob';
import { connectDb } from '../db/connect.js';
import { MediaAsset } from '../models/MediaAsset.js';
import { SiteContent } from '../models/SiteContent.js';
import { Page } from '../models/Page.js';
import { GlobalBanner } from '../models/GlobalBanner.js';
import { rewriteMediaReferences } from '../utils/media-references.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const CMS_UPLOAD_DIR = path.join(ROOT_DIR, 'uploads', 'cms');
const CONVERTIBLE = new Set(['image/png', 'image/jpeg', 'image/jpg']);
const MAX_EDGE = 2000;
const WEBP_QUALITY = 82;

const DRY_RUN = process.argv.includes('--dry-run');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const ONLY = onlyArg ? onlyArg.slice('--only='.length) : '';
/** Repairs a second database whose records still name files already converted. */
const RELINK = process.argv.includes('--relink');

async function loadEnv() {
  try {
    const text = await fs.readFile(path.join(ROOT_DIR, '.env'), 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator < 0) continue;
      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) value = value.slice(1, -1);
      // Explicit env wins, so a production run is never redirected by .env.
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // Environment variables may be supplied by the process.
  }
}

const isRemote = (url) => /^https?:\/\//i.test(url);

async function readAsset(asset) {
  if (isRemote(asset.url)) {
    const response = await fetch(asset.url);
    if (!response.ok) throw new Error(`download failed (${response.status})`);
    return Buffer.from(await response.arrayBuffer());
  }
  if (!asset.url.startsWith('/uploads/cms/')) {
    throw new Error('not managed storage');
  }
  const relative = decodeURIComponent(asset.url.slice('/uploads/cms/'.length));
  const absolute = path.resolve(CMS_UPLOAD_DIR, relative);
  if (!absolute.startsWith(`${CMS_UPLOAD_DIR}${path.sep}`)) {
    throw new Error('invalid local path');
  }
  return fs.readFile(absolute);
}

/** Keeps the original name so the media library stays recognisable. */
async function freeWebpPathname(pathname) {
  const base = pathname.replace(/\.[^./]+$/, '');
  for (let attempt = 0; ; attempt += 1) {
    const candidate = attempt ? `${base}-${attempt}.webp` : `${base}.webp`;
    const taken = await MediaAsset.exists({ pathname: candidate });
    if (!taken) return candidate;
  }
}

async function writeAsset(asset, pathname, buffer, token) {
  if (isRemote(asset.url)) {
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is required');
    const blob = await put(pathname, buffer, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/webp',
      token,
    });
    return blob.url;
  }
  const filename = pathname.split('/').pop();
  await fs.writeFile(path.join(CMS_UPLOAD_DIR, filename), buffer);
  return `/uploads/cms/${filename}`;
}

/**
 * The WebP a previous run already produced for this file, if it is there. Used
 * by --relink so a second database can adopt it without re-encoding.
 */
async function findConvertedTwin(asset) {
  const pathname = asset.pathname.replace(/\.[^./]+$/, '.webp');
  if (isRemote(asset.url)) {
    const url = new URL(asset.url);
    url.pathname = `/${pathname}`;
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return null;
    return {
      pathname,
      url: url.toString(),
      size: Number(response.headers.get('content-length') || 0),
    };
  }
  const filename = pathname.split('/').pop();
  const stat = await fs
    .stat(path.join(CMS_UPLOAD_DIR, filename))
    .catch(() => null);
  if (!stat) return null;
  return { pathname, url: `/uploads/cms/${filename}`, size: stat.size };
}

async function removeOriginal(asset, token) {
  if (isRemote(asset.url)) {
    await del(asset.url, { token });
    return;
  }
  const relative = decodeURIComponent(asset.url.slice('/uploads/cms/'.length));
  await fs.unlink(path.resolve(CMS_UPLOAD_DIR, relative)).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

/**
 * Points site content, pages and banners at one converted file. Called before
 * the original is deleted, so an interrupted run never strands a reference.
 */
async function rewriteReferences(from, to) {
  const replacements = new Map([[from, to]]);
  const [sites, pages, banners] = await Promise.all([
    SiteContent.find({}).lean(),
    Page.find({}).lean(),
    GlobalBanner.find({}).lean(),
  ]);
  let replaced = 0;
  for (const site of sites) {
    const stats = { replaced: 0 };
    const content = rewriteMediaReferences(site.content, replacements, stats);
    if (!stats.replaced) continue;
    replaced += stats.replaced;
    await SiteContent.updateOne({ _id: site._id }, { $set: { content } });
  }
  for (const page of pages) {
    const stats = { replaced: 0 };
    const hero = rewriteMediaReferences(page.hero, replacements, stats);
    const sections = rewriteMediaReferences(page.sections, replacements, stats);
    const content = rewriteMediaReferences(page.content, replacements, stats);
    if (!stats.replaced) continue;
    replaced += stats.replaced;
    await Page.updateOne(
      { _id: page._id },
      { $set: { hero, sections, content } },
    );
  }
  for (const banner of banners) {
    const stats = { replaced: 0 };
    const images = rewriteMediaReferences(banner.images, replacements, stats);
    if (!stats.replaced) continue;
    replaced += stats.replaced;
    await GlobalBanner.updateOne({ _id: banner._id }, { $set: { images } });
  }
  return replaced;
}

/** Named so an operator can see which database is about to be rewritten. */
function describeTarget() {
  try {
    const uri = new URL(process.env.MONGODB_URI);
    return `${uri.host}${uri.pathname}`;
  } catch {
    return 'the configured database';
  }
}

await loadEnv();
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
const token = process.env.BLOB_READ_WRITE_TOKEN;
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

console.log(
  `${DRY_RUN ? 'DRY RUN' : 'LIVE RUN'}${RELINK ? ' (relink only)' : ''} against ` +
    `${describeTarget()}, storage: ` +
    `${token ? 'Vercel Blob + local uploads' : 'local uploads only'}`,
);

await connectDb();
try {
  const filter = { mimeType: { $in: [...CONVERTIBLE] } };
  if (ONLY) filter.pathname = { $regex: ONLY, $options: 'i' };
  const assets = (
    await MediaAsset.find(filter).sort({ size: -1 }).lean()
  ).slice(0, LIMIT);

  const failures = [];
  let before = 0;
  let after = 0;
  let converted = 0;
  let rewritten = 0;

  for (const asset of assets) {
    try {
      if (RELINK) {
        const existing = await findConvertedTwin(asset);
        if (!existing) continue;
        console.log(
          `${DRY_RUN ? 'would relink' : 'relink'}  ${asset.pathname} -> ${existing.pathname}`,
        );
        converted += 1;
        before += asset.size || 0;
        after += existing.size;
        if (DRY_RUN) continue;
        rewritten += await rewriteReferences(asset.url, existing.url);
        await MediaAsset.updateOne(
          { _id: asset._id },
          {
            $set: {
              pathname: existing.pathname,
              url: existing.url,
              mimeType: 'image/webp',
              size: existing.size,
            },
          },
        );
        continue;
      }

      const original = await readAsset(asset);
      const webp = await sharp(original, { failOn: 'none' })
        .rotate()
        .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer({ resolveWithObject: true });

      if (webp.data.length >= original.length) {
        console.log(`skip  ${asset.pathname} (WebP is not smaller)`);
        continue;
      }

      before += original.length;
      after += webp.data.length;
      converted += 1;
      console.log(
        `${DRY_RUN ? 'would convert' : 'convert'}  ${asset.pathname}  ` +
          `${kb(original.length)} -> ${kb(webp.data.length)}`,
      );
      if (DRY_RUN) continue;

      const pathname = await freeWebpPathname(asset.pathname);
      const url = await writeAsset(asset, pathname, webp.data, token);
      rewritten += await rewriteReferences(asset.url, url);
      await MediaAsset.updateOne(
        { _id: asset._id },
        {
          $set: {
            pathname,
            url,
            mimeType: 'image/webp',
            size: webp.data.length,
            dimensions: { width: webp.info.width, height: webp.info.height },
          },
        },
      );
      await removeOriginal(asset, token);
    } catch (error) {
      failures.push({ pathname: asset.pathname, reason: error.message });
      console.error(`fail  ${asset.pathname}: ${error.message}`);
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Dry run' : 'Done'}: ` +
      `${converted} of ${assets.length} asset(s) ${RELINK ? 'relinked' : 'converted'}, ` +
      `${kb(before)} -> ${kb(after)} ` +
      `(${before ? Math.round((1 - after / before) * 100) : 0}% smaller), ` +
      `${rewritten} reference(s) rewritten, ${failures.length} failure(s).`,
  );
  if (failures.length) console.log(JSON.stringify(failures, null, 2));
} finally {
  await mongoose.disconnect();
}

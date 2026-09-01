import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { list, put } from '@vercel/blob';
import { connectDb } from '../db/connect.js';
import { MediaAsset } from '../models/MediaAsset.js';
import { SiteContent } from '../models/SiteContent.js';
import { Page } from '../models/Page.js';
import { GlobalBanner } from '../models/GlobalBanner.js';
import { getSiteContent } from '../services/site-content.js';
import {
  collectMediaReferences,
  rewriteMediaReferences,
} from '../utils/media-references.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const DEFAULT_FRONTEND_PUBLIC = path.resolve(
  ROOT_DIR,
  '..',
  'jdg-web-frontend',
  'public',
);
const DRY_RUN = process.argv.includes('--dry-run');
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
};

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
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // Environment variables may be supplied by the process.
  }
}

async function walk(directory) {
  const output = [];
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(
    (error) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    },
  );
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(absolute)));
    else if (entry.isFile()) output.push(absolute);
  }
  return output;
}

function encodeBlobPart(value) {
  const normalized = value.split(path.sep).join('/');
  const extension = path.posix.extname(normalized).toLowerCase();
  const basename = path.posix.basename(normalized, extension);
  const directory = path.posix.dirname(normalized);
  const safeDirectory = directory === '.'
    ? ''
    : directory
        .split('/')
        .map((part) => part.replace(/[^a-zA-Z0-9._-]+/g, '-'))
        .join('/') + '/';
  const safeBasename =
    basename.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') ||
    'media';
  const digest = createHash('sha256').update(normalized).digest('hex').slice(0, 12);
  return `${safeDirectory}${safeBasename}-${digest}${extension}`;
}

async function discoverFiles() {
  const frontendPublic = path.resolve(
    process.env.FRONTEND_PUBLIC_DIR ||
      (process.env.FRONTEND_PATH
        ? path.join(process.env.FRONTEND_PATH, 'public')
        : DEFAULT_FRONTEND_PUBLIC),
  );
  const sources = [
    {
      root: path.join(frontendPublic, 'images'),
      publicPrefix: '/images/',
      blobPrefix: 'cms/migrated/frontend/images/',
    },
    {
      root: path.join(frontendPublic, 'videos'),
      publicPrefix: '/videos/',
      blobPrefix: 'cms/migrated/frontend/videos/',
    },
    {
      root: path.join(ROOT_DIR, 'uploads', 'cms'),
      publicPrefix: '/uploads/cms/',
      blobPrefix: 'cms/migrated/backend/',
    },
  ];
  const discovered = [];
  for (const source of sources) {
    for (const absolute of await walk(source.root)) {
      const relative = path.relative(source.root, absolute);
      const mimeType = MIME_TYPES[path.extname(relative).toLowerCase()];
      if (!mimeType) continue;
      discovered.push({
        absolute,
        sourcePath: source.publicPrefix + relative.split(path.sep).join('/'),
        pathname: source.blobPrefix + encodeBlobPart(relative),
        mimeType,
      });
    }
  }
  return discovered;
}

async function existingBlobs(token) {
  const blobs = new Map();
  let cursor;
  do {
    const page = await list({ prefix: 'cms/', cursor, token });
    page.blobs.forEach((blob) => blobs.set(blob.pathname, blob));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

async function imageDimensions(file) {
  if (!file.mimeType.startsWith('image/') || file.mimeType === 'image/svg+xml') {
    return undefined;
  }
  const metadata = await sharp(file.absolute, { failOn: 'none' })
    .metadata()
    .catch(() => null);
  return metadata?.width && metadata?.height
    ? { width: metadata.width, height: metadata.height }
    : undefined;
}

function categoryFor(file) {
  if (file.mimeType.startsWith('video/')) return 'video';
  if (/logo/i.test(file.sourcePath)) return 'logo';
  if (/hero/i.test(file.sourcePath)) return 'hero';
  return 'general';
}

async function migrateDocuments(replacements) {
  const [sites, pages, banners] = await Promise.all([
    SiteContent.find({}).lean(),
    Page.find({}).lean(),
    GlobalBanner.find({}).lean(),
  ]);
  const stats = { replaced: 0 };
  const writes = [];
  for (const site of sites) {
    const content = rewriteMediaReferences(site.content, replacements, stats);
    writes.push(() =>
      SiteContent.updateOne({ _id: site._id }, { $set: { content } }),
    );
  }
  for (const page of pages) {
    const hero = rewriteMediaReferences(page.hero, replacements, stats);
    const sections = rewriteMediaReferences(page.sections, replacements, stats);
    const content = rewriteMediaReferences(page.content, replacements, stats);
    writes.push(() =>
      Page.updateOne({ _id: page._id }, { $set: { hero, sections, content } }),
    );
  }
  for (const banner of banners) {
    const images = rewriteMediaReferences(banner.images, replacements, stats);
    writes.push(() =>
      GlobalBanner.updateOne({ _id: banner._id }, { $set: { images } }),
    );
  }
  if (!DRY_RUN) {
    for (const write of writes) await write();
  }
  return { stats, documents: [...sites, ...pages, ...banners] };
}

await loadEnv();
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');

await connectDb();
try {
  const files = await discoverFiles();
  const knownBlobs = token ? await existingBlobs(token) : new Map();
  const registeredAssets = await MediaAsset.find(
    { pathname: { $in: files.map((file) => file.pathname) } },
  ).lean();
  for (const asset of registeredAssets) {
    if (!knownBlobs.has(asset.pathname)) {
      knownBlobs.set(asset.pathname, asset);
    }
  }
  const replacements = new Map();
  let uploaded = 0;
  let reused = 0;

  for (const file of files) {
    const stat = await fs.stat(file.absolute);
    let blob = knownBlobs.get(file.pathname);
    if (!blob && !DRY_RUN) {
      if (!token) {
        throw new Error(
          `BLOB_READ_WRITE_TOKEN is required to upload missing asset: ${file.sourcePath}`,
        );
      }
      blob = await put(file.pathname, await fs.readFile(file.absolute), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: file.mimeType,
        token,
      });
      uploaded += 1;
    } else if (blob) {
      reused += 1;
    }
    const url = blob?.url || `[dry-run] ${file.pathname}`;
    replacements.set(file.sourcePath, url);
    if (!DRY_RUN) {
      await MediaAsset.findOneAndUpdate(
        { pathname: file.pathname },
        {
          $set: {
            pathname: file.pathname,
            url,
            sourcePath: file.sourcePath,
            mimeType: file.mimeType,
            size: blob?.size ?? stat.size,
            dimensions: await imageDimensions(file),
            category: categoryFor(file),
          },
        },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    }
  }

  // Ensure a fresh database has its singleton before rewriting assignments.
  await getSiteContent();
  const { stats, documents } = await migrateDocuments(replacements);
  const beforeReferences = collectMediaReferences(documents);
  const unresolved = [...beforeReferences].filter(
    (reference) =>
      /^\/(images|videos|uploads\/cms)\//.test(reference) &&
      !replacements.has(reference),
  );
  const rewrittenDocuments = rewriteMediaReferences(documents, replacements);
  const usedAfter = collectMediaReferences(rewrittenDocuments);
  const orphaned = [...replacements.entries()]
    .filter(
      ([sourcePath, url]) =>
        !beforeReferences.has(sourcePath) &&
        !beforeReferences.has(url) &&
        !usedAfter.has(url),
    )
    .map(([sourcePath]) => sourcePath);

  console.log(
    `${DRY_RUN ? 'Dry run' : 'Migration complete'}: ${files.length} file(s), ` +
      `${uploaded} uploaded, ${reused} reused, ${stats.replaced} reference(s) rewritten.`,
  );
  console.log(
    JSON.stringify({ unresolved, orphaned }, null, 2),
  );
} finally {
  await mongoose.disconnect();
}

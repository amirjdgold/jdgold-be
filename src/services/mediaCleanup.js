import { MediaAsset } from '../models/MediaAsset.js';
import { SiteContent } from '../models/SiteContent.js';
import { Page } from '../models/Page.js';
import { GlobalBanner } from '../models/GlobalBanner.js';
import { collectMediaReferences } from '../utils/media-references.js';
import { deleteStoredFile } from './mediaService.js';

/** Uploads picked but not yet saved into a page must survive a sweep. */
const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * References the save dropped from a document. A slot that only moved inside
 * the document still resolves, so re-used images are never reported.
 */
export function droppedMediaReferences(before, after) {
  const previous = collectMediaReferences(before);
  if (!previous.size) return [];
  const current = collectMediaReferences(after);
  return [...previous].filter((reference) => !current.has(reference));
}

/**
 * Seed-backed assets stay: data/site.json and src/seed/pages.js still point at
 * their sourcePath, so a fresh seed would 404 once the blob is gone.
 */
export function isPrunableAsset(asset) {
  if (!asset || asset.sourcePath) return false;
  if (typeof asset.url !== 'string') return false;
  return (
    /^https?:\/\//i.test(asset.url) || asset.url.startsWith('/uploads/cms/')
  );
}

export function isAssetReferenced(asset, referenced) {
  if (referenced.has(asset.url)) return true;
  const pathname = String(asset.pathname || '').replace(/^\/+/, '');
  return Boolean(pathname) && referenced.has(`/${pathname}`);
}

/** Every media URL still live in site content, pages and banners. */
async function collectReferencedMedia() {
  const [siteDocuments, pages, banners] = await Promise.all([
    SiteContent.find({}, 'content').lean(),
    Page.find({}).lean(),
    GlobalBanner.find({}).lean(),
  ]);
  const referenced = new Set();
  for (const doc of siteDocuments) {
    collectMediaReferences(doc.content, referenced);
  }
  for (const doc of pages) collectMediaReferences(doc, referenced);
  for (const doc of banners) collectMediaReferences(doc, referenced);
  return referenced;
}

async function removeAsset(asset, result, label) {
  try {
    await deleteStoredFile(asset);
    await MediaAsset.deleteOne({ _id: asset._id });
    result.deleted.push(asset.url);
  } catch (error) {
    result.kept.push({ url: asset.url, reason: 'error' });
    console.error(`Media cleanup failed for ${asset.url} (${label})`, error);
  }
}

/**
 * Drops storage files and registry rows for images an Admin save replaced.
 * Call it after the write so the usage scan sees the new state. Failures are
 * logged and swallowed — cleanup must never fail the content save itself.
 */
export async function pruneReplacedMedia(before, after, label = 'content') {
  const result = { deleted: [], kept: [] };
  let assets = [];
  let referenced = new Set();
  try {
    const dropped = droppedMediaReferences(before, after);
    if (!dropped.length) return result;
    [assets, referenced] = await Promise.all([
      MediaAsset.find({
        $or: [
          { url: { $in: dropped } },
          { pathname: { $in: dropped.map((ref) => ref.replace(/^\/+/, '')) } },
        ],
      }).lean(),
      collectReferencedMedia(),
    ]);
  } catch (error) {
    console.error(`Media cleanup lookup failed (${label})`, error);
    return result;
  }

  for (const asset of assets) {
    if (!isPrunableAsset(asset)) {
      result.kept.push({ url: asset.url, reason: 'not-managed' });
      continue;
    }
    if (isAssetReferenced(asset, referenced)) {
      result.kept.push({ url: asset.url, reason: 'still-referenced' });
      continue;
    }
    await removeAsset(asset, result, label);
  }

  if (result.deleted.length) {
    console.log(
      `Media cleanup (${label}): removed ${result.deleted.length} replaced file(s)`,
    );
  }
  return result;
}

/**
 * Admin-triggered sweep for uploads that never made it into a saved layout,
 * e.g. a crop that was uploaded and then abandoned.
 */
export async function sweepUnreferencedMedia({
  olderThanMs = ORPHAN_GRACE_MS,
} = {}) {
  const [assets, referenced] = await Promise.all([
    MediaAsset.find({}).lean(),
    collectReferencedMedia(),
  ]);
  const cutoff = Date.now() - olderThanMs;
  const result = { scanned: assets.length, deleted: [], kept: [] };
  for (const asset of assets) {
    if (!isPrunableAsset(asset)) continue;
    if (isAssetReferenced(asset, referenced)) continue;
    if (new Date(asset.createdAt || 0).getTime() > cutoff) {
      result.kept.push({ url: asset.url, reason: 'too-recent' });
      continue;
    }
    await removeAsset(asset, result, 'sweep');
  }
  console.log(
    `Media sweep: removed ${result.deleted.length} of ${result.scanned} asset(s)`,
  );
  return result;
}

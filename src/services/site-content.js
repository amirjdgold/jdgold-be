import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SITE_CONTENT_ID, SiteContent } from '../models/SiteContent.js';
import { resolveSeedMedia } from './seed-media.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SITE_CONTENT_SEED_PATH = path.join(
  __dirname,
  '..',
  '..',
  'data',
  'site.json',
);

let seedPromise;

export function readSiteContentSeed() {
  if (!seedPromise) {
    seedPromise = fs
      .readFile(SITE_CONTENT_SEED_PATH, 'utf8')
      .then((raw) => JSON.parse(raw))
      .catch((error) => {
        seedPromise = undefined;
        throw error;
      });
  }
  return seedPromise;
}

/**
 * Returns the singleton document, creating it from the bundled JSON seed once.
 * $setOnInsert makes concurrent cold starts safe and avoids rewriting live CMS data.
 */
export async function getSiteContent() {
  const existing = await SiteContent.findOne({
    _id: SITE_CONTENT_ID,
  }).lean();
  if (existing) return existing.content;

  const seed = await resolveSeedMedia(await readSiteContentSeed());
  const inserted = await SiteContent.findOneAndUpdate(
    { _id: SITE_CONTENT_ID },
    { $setOnInsert: { _id: SITE_CONTENT_ID, content: seed } },
    { upsert: true, new: true, setDefaultsOnInsert: true, lean: true },
  );
  return inserted.content;
}

export async function saveSiteContent(content) {
  const saved = await SiteContent.findOneAndUpdate(
    { _id: SITE_CONTENT_ID },
    { $set: { content } },
    { upsert: true, new: true, setDefaultsOnInsert: true, lean: true },
  );
  return saved.content;
}

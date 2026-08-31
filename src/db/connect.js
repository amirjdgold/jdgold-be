import { connectDB } from '../config/db.js';
import { Page } from '../models/Page.js';
import { GlobalBanner } from '../models/GlobalBanner.js';
import { SeedState } from '../models/SeedState.js';
import { PAGE_SEEDS } from '../seed/pages.js';
import {
  migrateLegacyPageSlugs,
  upsertGlobalBanners,
} from '../seed/runSeed.js';

/** Bump when Phase 4 page / banner seed shape changes. */
const PAGE_SEED_VERSION = 2;

const seedCache =
  globalThis.__jdgSeedCache ||
  (globalThis.__jdgSeedCache = { seedPromise: null });

/**
 * Connect MongoDB, then ensure Phase 4 page / banner documents exist.
 * Startup only fills missing / legacy docs; use `npm run seed` to force refresh.
 * Pass `{ seedPages: false }` for one-off scripts (e.g. migrate:blob).
 */
export async function connectDb({ seedPages = true } = {}) {
  await connectDB();

  if (seedPages && !seedCache.seedPromise) {
    seedCache.seedPromise = seedIfNeeded().catch((err) => {
      seedCache.seedPromise = null;
      throw err;
    });
  }
  if (seedPages) await seedCache.seedPromise;
}

function needsPageUpgrade(existing, seed) {
  if (!existing) return true;
  if (existing.pageType !== seed.pageType) return true;
  if (!Array.isArray(existing.sections) || existing.sections.length === 0) {
    if (seed.sections.length > 0) return true;
  }
  if (!existing.hero || typeof existing.hero !== 'object') return true;
  // Legacy Mixed `content` docs from Phase 1
  if (existing.content != null && existing.pageType == null) return true;
  return false;
}

async function seedIfNeeded() {
  const state = await SeedState.findOne({ key: 'pages' }).lean();
  if (state?.version !== PAGE_SEED_VERSION) {
    await seedPagesIfNeeded();
    await SeedState.findOneAndUpdate(
      { key: 'pages' },
      { $set: { version: PAGE_SEED_VERSION } },
      { upsert: true },
    );
  }
  await seedGlobalBannersIfNeeded();
}

async function seedPagesIfNeeded() {
  await migrateLegacyPageSlugs();

  for (const seed of PAGE_SEEDS) {
    const existing = await Page.findOne({ slug: seed.slug }).lean();
    if (needsPageUpgrade(existing, seed)) {
      await Page.findOneAndUpdate(
        { slug: seed.slug },
        { $set: seed },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
      console.log(`Seeded/updated page: ${seed.slug}`);
    }
  }

  console.log(
    `MongoDB pages collection: ${await Page.countDocuments()} document(s)`
  );
}

async function seedGlobalBannersIfNeeded() {
  const count = await GlobalBanner.countDocuments();
  if (count > 0) {
    console.log(`MongoDB globalbanners collection: ${count} document(s)`);
    return;
  }

  await upsertGlobalBanners();
  console.log(
    `MongoDB globalbanners collection: ${await GlobalBanner.countDocuments()} document(s)`
  );
}

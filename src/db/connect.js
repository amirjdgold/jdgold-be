import mongoose from 'mongoose';
import { Page } from '../models/Page.js';
import { SeedState } from '../models/SeedState.js';
import { PAGE_SEEDS } from '../seed/pages.js';

const PAGE_SEED_VERSION = 1;

const connectionCache =
  globalThis.__jdgMongooseConnection ||
  (globalThis.__jdgMongooseConnection = {
    promise: null,
    seedPromise: null,
  });

export async function connectDb({ seedPages = true } = {}) {
  const uri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jdg-web';

  mongoose.set('strictQuery', true);
  if (mongoose.connection.readyState !== 1) {
    if (mongoose.connection.readyState === 0) {
      connectionCache.promise = null;
      connectionCache.seedPromise = null;
    }
    if (!connectionCache.promise) {
      connectionCache.promise = mongoose
        .connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 })
        .then((instance) => {
          console.log('MongoDB connected');
          return instance;
        })
        .catch((err) => {
          connectionCache.promise = null;
          console.error(
            'MongoDB connection failed. Install MongoDB locally or set MONGODB_URI in backend/.env (e.g. MongoDB Atlas).',
          );
          throw err;
        });
    }
    await connectionCache.promise;
  }

  if (seedPages && !connectionCache.seedPromise) {
    connectionCache.seedPromise = seedPagesIfNeeded().catch((err) => {
      connectionCache.seedPromise = null;
      throw err;
    });
  }
  if (seedPages) await connectionCache.seedPromise;

  return mongoose;
}

async function seedPagesIfNeeded() {
  const state = await SeedState.findOne({ key: 'pages' }).lean();
  if (state?.version === PAGE_SEED_VERSION) return;

  await seedPagesIfEmpty();
  await SeedState.findOneAndUpdate(
    { key: 'pages' },
    { $set: { version: PAGE_SEED_VERSION } },
    { upsert: true },
  );
}

async function seedPagesIfEmpty() {
  for (const seed of PAGE_SEEDS) {
    const existing = await Page.findOne({ slug: seed.slug }).lean();
    const licensesNeedFlags =
      seed.slug === 'license-and-offices' &&
      (existing?.content?.offices || []).some(
        (o) =>
          !o.flagSrc ||
          !String(o.flagSrc).endsWith('.svg') ||
          !Array.isArray(o.details) ||
          o.details.length === 0
      );
    const licensesNeedFooterIcons =
      seed.slug === 'license-and-offices' &&
      (existing?.content?.footerPoints || []).some((p) => !p.icon);
    const aboutNeedsRefresh =
      seed.slug === 'about' &&
      (!existing?.content?.aboutBodySecondary ||
        !existing?.content?.jewelleryDeptManagedBy ||
        !existing?.content?.heroBackgroundImage ||
        !(existing?.content?.commitments || []).every((c) => c.description));
    const advantagesNeedHero =
      seed.slug === 'factories-and-refinery' &&
      (!existing?.content?.heroImage ||
        !String(existing.content.heroImage).includes('product-cast-gold-bars'));

    const needsUpgrade =
      !existing ||
      !existing.content ||
      !existing.content.layout ||
      existing.content.layout !== seed.content.layout ||
      licensesNeedFlags ||
      licensesNeedFooterIcons ||
      aboutNeedsRefresh ||
      advantagesNeedHero;

    if (needsUpgrade) {
      await Page.findOneAndReplace(
        { slug: seed.slug },
        { slug: seed.slug, title: seed.title, content: seed.content },
        { upsert: true }
      );
      console.log(`Seeded/updated page: ${seed.slug}`);
    }
  }
  console.log(
    `MongoDB pages collection: ${await Page.countDocuments()} document(s)`,
  );
}

import mongoose from 'mongoose';
import { Page } from '../models/Page.js';
import { PAGE_SEEDS } from '../seed/pages.js';

export async function connectDb() {
  const uri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jdg-web';

  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected (${uri})`);
    await seedPagesIfEmpty();
  } catch (err) {
    console.error(
      'MongoDB connection failed. Install MongoDB locally or set MONGODB_URI in backend/.env (e.g. MongoDB Atlas).'
    );
    throw err;
  }
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
  console.log(`MongoDB pages collection: ${await Page.countDocuments()} document(s)`);
}

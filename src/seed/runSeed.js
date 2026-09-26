import { Page } from '../models/Page.js';
import { GlobalBanner } from '../models/GlobalBanner.js';
import { SITE_CONTENT_ID, SiteContent } from '../models/SiteContent.js';
import {
  PAGE_SEEDS,
  GLOBAL_BANNER_SEEDS,
  SEEDED_PAGE_SLUGS,
  SEEDED_BANNER_TITLES,
  PAGE_SLUG_ALIASES,
} from './pages.js';
import { resolveSeedMedia } from '../services/seed-media.js';

/**
 * Migrate non-canonical page slugs to preferred public slugs.
 */
/** Move advantages off the factory URL so Factory & Refinery can own that slug. */
export async function migrateAdvantagesSlug() {
  const occupied = await Page.findOne({ slug: 'factories-and-refinery' }).lean();
  if (!occupied || occupied.pageType !== 'market-advantages') return;

  const products = await Page.findOne({ slug: 'products' }).lean();
  if (products) {
    await Page.deleteOne({ slug: 'factories-and-refinery' });
    console.log(
      'Removed advantages page from factories-and-refinery (kept products)'
    );
    return;
  }

  await Page.updateOne(
    { slug: 'factories-and-refinery' },
    { $set: { slug: 'products' } }
  );
  console.log('Migrated advantages page slug: factories-and-refinery → products');
}

/** Move hardcoded achievements badge/title into CMS fields on existing products pages. */
export async function migrateAchievementsDisplayFields() {
  const page = await Page.findOne({
    slug: 'products',
    pageType: 'market-advantages',
  });
  if (!page?.sections?.length) return;

  let changed = false;
  for (const section of page.sections) {
    if (section.key !== 'achievements' && section.type !== 'achievements') continue;
    if (!section.icon) {
      section.icon = '06';
      changed = true;
    }
    if (!section.subheading) {
      section.subheading = 'Achievements / Projects';
      changed = true;
    }
  }

  if (!changed) return;
  page.markModified('sections');
  await page.save();
  console.log('Filled achievements badge and subheading on products page');
}

/** Copy the live Home team roster onto Management Gallery leadership. */
export async function migrateManagementGalleryLeaders() {
  const page = await Page.findOne({
    slug: 'management',
    pageType: 'management-gallery',
  });
  if (!page?.sections?.length) return;

  const site = await SiteContent.findById(SITE_CONTENT_ID).lean();
  const members = site?.content?.teamManagement?.members || [];
  const valid = members.filter(
    (member) => member?.name?.trim() && member?.image?.trim()
  );
  if (valid.length < 2) return;

  const section = page.sections.find(
    (item) => item.key === 'leadership' || item.type === 'leadership'
  );
  if (!section) return;
  if ((section.leadership || []).length >= valid.length) return;

  section.leadership = valid.map((member) => ({
    title: member.designation || '',
    name: member.name,
    experience: '',
    image: member.image,
    imageAlt: member.imageAlt || member.name,
  }));
  page.markModified('sections');
  await page.save();
  console.log(
    `Updated management gallery leaders from home team (${valid.length})`
  );
}

/** Expand Events and Offices into a larger mixed-size collage set. */
export async function migrateManagementEventsCollage() {
  const seed = PAGE_SEEDS.find((page) => page.slug === 'management');
  const seedSection = seed?.sections?.find(
    (section) => section.key === 'events-and-offices'
  );
  if (!seedSection?.gallery?.length) return;

  const page = await Page.findOne({
    slug: 'management',
    pageType: 'management-gallery',
  });
  if (!page?.sections?.length) return;

  const section = page.sections.find(
    (item) => item.key === 'events-and-offices'
  );
  if (!section) return;
  if ((section.gallery || []).length >= seedSection.gallery.length) return;

  section.gallery = seedSection.gallery;
  page.markModified('sections');
  await page.save();
  console.log(
    `Expanded events-and-offices collage (${seedSection.gallery.length} photos)`
  );
}

/** Rename the CMS page to Management Galleries. */
export async function migrateManagementGalleriesName() {
  const page = await Page.findOne({ slug: 'management' });
  if (!page) return;
  let changed = false;
  if (page.title === 'Management Gallery') {
    page.title = 'Management Galleries';
    changed = true;
  }
  if (page.metaTitle === 'JD Gold Management Gallery') {
    page.metaTitle = 'JD Gold Management Galleries';
    changed = true;
  }
  if (!changed) return;
  await page.save();
  console.log('Renamed management CMS page to Management Galleries');
}

export async function migrateLegacyPageSlugs() {
  await migrateAdvantagesSlug();
  await migrateAchievementsDisplayFields();
  await migrateManagementGalleryLeaders();
  await migrateManagementEventsCollage();
  await migrateManagementGalleriesName();
  for (const [from, to] of Object.entries(PAGE_SLUG_ALIASES)) {
    const legacy = await Page.findOne({ slug: from }).lean();
    if (!legacy) continue;

    const conflict = await Page.findOne({ slug: to }).lean();
    if (conflict) {
      await Page.deleteOne({ slug: from });
      console.log(`Removed legacy page slug "${from}" (kept "${to}")`);
      continue;
    }

    await Page.updateOne({ slug: from }, { $set: { slug: to } });
    console.log(`Migrated page slug: ${from} → ${to}`);
  }
}

/**
 * Upsert all PAGE_SEEDS by unique slug (safe to re-run).
 */
export async function upsertPages() {
  await migrateLegacyPageSlugs();

  const results = [];
  for (const seed of PAGE_SEEDS) {
    const resolvedSeed = await resolveSeedMedia(seed);
    const doc = await Page.findOneAndUpdate(
      { slug: seed.slug },
      { $set: resolvedSeed },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    results.push({ slug: seed.slug, id: String(doc._id) });
    console.log(`Upserted page: ${seed.slug}`);
  }
  return results;
}

/**
 * Upsert GLOBAL_BANNER_SEEDS by title (safe to re-run).
 * Consolidates duplicate titles left from earlier create-only seeding.
 */
export async function upsertGlobalBanners() {
  const results = [];
  for (const seed of GLOBAL_BANNER_SEEDS) {
    const resolvedSeed = await resolveSeedMedia(seed);
    const existing = await GlobalBanner.find({ title: seed.title })
      .sort({ updatedAt: -1 })
      .lean();

    let doc;
    if (existing.length === 0) {
      doc = await GlobalBanner.create(resolvedSeed);
    } else {
      const [keep, ...dupes] = existing;
      doc = await GlobalBanner.findByIdAndUpdate(
        keep._id,
        { $set: resolvedSeed },
        {
          returnDocument: 'after',
          runValidators: true,
        }
      );
      if (dupes.length > 0) {
        await GlobalBanner.deleteMany({
          _id: { $in: dupes.map((d) => d._id) },
        });
        console.log(
          `Removed ${dupes.length} duplicate banner(s) titled "${seed.title}"`
        );
      }
    }

    results.push({ title: seed.title, id: String(doc._id) });
    console.log(`Upserted global banner: ${seed.title}`);
  }
  return results;
}

/**
 * Remove only records owned by this seed (does not wipe unrelated CMS docs).
 */
export async function clearSeedData() {
  const pageResult = await Page.deleteMany({
    slug: { $in: [...SEEDED_PAGE_SLUGS, ...Object.keys(PAGE_SLUG_ALIASES)] },
  });
  const bannerResult = await GlobalBanner.deleteMany({
    title: { $in: SEEDED_BANNER_TITLES },
  });

  console.log(
    `Cleared ${pageResult.deletedCount} page(s) and ${bannerResult.deletedCount} banner(s)`
  );
  return {
    pagesDeleted: pageResult.deletedCount,
    bannersDeleted: bannerResult.deletedCount,
  };
}

/**
 * Full seed: upsert pages + banners.
 */
export async function runSeed() {
  const pages = await upsertPages();
  const banners = await upsertGlobalBanners();
  console.log(
    `Seed complete: ${pages.length} page(s), ${banners.length} banner(s)`
  );
  return { pages, banners };
}

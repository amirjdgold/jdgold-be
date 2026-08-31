import 'dotenv/config';
import express from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { connectDb } from './db/connect.js';
import { createCorsMiddleware } from './middleware/cors.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler.js';
import { requireApiKey } from './middleware/requireApiKey.js';
import pagesRouter from './routes/pages.js';
import bannerRouter from './routes/banner.js';
import {
  blobUploadsEnabled,
  handleBlobMediaUpload,
} from './services/blob-media.js';
import {
  getSiteContent,
  readSiteContentSeed,
  saveSiteContent,
} from './services/site-content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_VERCEL = Boolean(process.env.VERCEL);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CMS_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'cms');
/** Optional local SPA folder when SERVE_STATIC=true (no longer tied to a monorepo). */
const FRONTEND_DIST = process.env.FRONTEND_DIST
  ? path.resolve(process.env.FRONTEND_DIST)
  : path.join(__dirname, '..', 'public', 'spa');

/**
 * Desktop center: fit inside 12∶5. Desktop side strip: ~1.5∶1 (13%×~130px on wide rows).
 * Mobile (below Tailwind sm): center ~34%×150px ≈ 0.82∶1; side ~13%×120px ≈ 0.39∶1 — separate cover crops.
 */
const SLIDE_IMAGE_TARGET_W = 1200;
const SLIDE_IMAGE_TARGET_H = 500;
const SLIDE_STRIP_TARGET_W = 480;
const SLIDE_STRIP_TARGET_H = 320;
/** Mobile center tile aspect (~0.82) */
const SLIDE_MAIN_SM_W = 490;
const SLIDE_MAIN_SM_H = 600;
/** Mobile side strip aspect (~0.39) */
const SLIDE_STRIP_SM_W = 200;
const SLIDE_STRIP_SM_H = 512;
const LOGO_IMAGE_MAX_W = 400;
const LOGO_IMAGE_MAX_H = 400;
/** Team member portrait cards (cover crop) */
const PORTRAIT_IMAGE_MAX_W = 640;
const PORTRAIT_IMAGE_MAX_H = 800;
/** Home right column gallery thumbnails (wide cover crop) */
const GALLERY_THUMB_W = 720;
const GALLERY_THUMB_H = 360;

function shouldOptimizeRasterImage(mimetype) {
  if (!mimetype || !mimetype.startsWith('image/')) return false;
  if (mimetype === 'image/svg+xml') return false;
  if (mimetype === 'image/gif') return false;
  return true;
}

async function optimizeLogoRaster(absPath) {
  const dir = path.dirname(absPath);
  const outName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`;
  const outAbs = path.join(dir, outName);
  await sharp(absPath, { failOn: 'none' })
    .rotate()
    .resize(LOGO_IMAGE_MAX_W, LOGO_IMAGE_MAX_H, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 86 })
    .toFile(outAbs);
  await fs.unlink(absPath);
  return outName;
}

async function optimizePortraitRaster(absPath) {
  const dir = path.dirname(absPath);
  const outName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`;
  const outAbs = path.join(dir, outName);
  await sharp(absPath, { failOn: 'none' })
    .rotate()
    .resize(PORTRAIT_IMAGE_MAX_W, PORTRAIT_IMAGE_MAX_H, {
      fit: 'cover',
      position: 'attention',
    })
    .webp({ quality: 86 })
    .toFile(outAbs);
  await fs.unlink(absPath);
  return outName;
}

async function optimizeGalleryThumbRaster(absPath) {
  const dir = path.dirname(absPath);
  const outName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`;
  const outAbs = path.join(dir, outName);
  await sharp(absPath, { failOn: 'none' })
    .rotate()
    .resize(GALLERY_THUMB_W, GALLERY_THUMB_H, {
      fit: 'cover',
      position: 'attention',
    })
    .webp({ quality: 86 })
    .toFile(outAbs);
  await fs.unlink(absPath);
  return outName;
}

/** Single slide WebP (fit inside 1200×500) — fallback if dual export fails */
async function optimizeSlideRasterSingle(absPath) {
  const dir = path.dirname(absPath);
  const outName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`;
  const outAbs = path.join(dir, outName);
  await sharp(absPath, { failOn: 'none' })
    .rotate()
    .resize(SLIDE_IMAGE_TARGET_W, SLIDE_IMAGE_TARGET_H, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 86 })
    .toFile(outAbs);
  await fs.unlink(absPath);
  return outName;
}

/**
 * Desktop + mobile center/strip WebPs from one upload (JPEG/PNG/WebP). GIF/SVG skip this path.
 * @returns {{ main: string, mainSm: string, strip: string, stripSm: string }} filenames in CMS dir
 */
async function optimizeSlideRasterResponsive(absPath) {
  const dir = path.dirname(absPath);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const mainName = `${id}-main.webp`;
  const mainSmName = `${id}-main-sm.webp`;
  const stripName = `${id}-strip.webp`;
  const stripSmName = `${id}-strip-sm.webp`;
  const mainAbs = path.join(dir, mainName);
  const mainSmAbs = path.join(dir, mainSmName);
  const stripAbs = path.join(dir, stripName);
  const stripSmAbs = path.join(dir, stripSmName);
  const base = sharp(absPath, { failOn: 'none' }).rotate();
  await base
    .clone()
    .resize(SLIDE_IMAGE_TARGET_W, SLIDE_IMAGE_TARGET_H, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 86 })
    .toFile(mainAbs);
  await base
    .clone()
    .resize(SLIDE_MAIN_SM_W, SLIDE_MAIN_SM_H, {
      fit: 'cover',
      position: 'attention',
    })
    .webp({ quality: 84 })
    .toFile(mainSmAbs);
  await base
    .clone()
    .resize(SLIDE_STRIP_TARGET_W, SLIDE_STRIP_TARGET_H, {
      fit: 'cover',
      position: 'attention',
    })
    .webp({ quality: 82 })
    .toFile(stripAbs);
  await base
    .clone()
    .resize(SLIDE_STRIP_SM_W, SLIDE_STRIP_SM_H, {
      fit: 'cover',
      position: 'attention',
    })
    .webp({ quality: 80 })
    .toFile(stripSmAbs);
  await fs.unlink(absPath);
  return {
    main: mainName,
    mainSm: mainSmName,
    strip: stripName,
    stripSm: stripSmName,
  };
}

const ALLOWED_UPLOAD_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
]);

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CMS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_UPLOAD_EXT.has(ext)) {
      const mt = file.mimetype || '';
      if (mt === 'image/jpeg') ext = '.jpg';
      else if (mt === 'image/png') ext = '.png';
      else if (mt === 'image/webp') ext = '.webp';
      else if (mt === 'image/gif') ext = '.gif';
      else if (mt.startsWith('video/')) ext = '.mp4';
      else ext = '.bin';
    }
    cb(
      null,
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    );
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    if (ok) cb(null, true);
    else cb(new Error('Only image or video files are allowed'));
  },
});

const slideSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('video'), src: z.string().min(1) }),
  z.object({
    type: z.literal('image'),
    src: z.string().min(1),
    alt: z.string(),
    /** Desktop side strip; pair with thumbSrcSm for mobile */
    thumbSrc: z.string().min(1).optional(),
    thumbSrcSm: z.string().min(1).optional(),
    /** Mobile center (< sm); falls back to src */
    srcSm: z.string().min(1).optional(),
  }),
]);

const heroBrandingSchema = z
  .object({
    logoSrc: z.string().min(1),
    logoAlt: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().min(1),
  })
  .optional();

const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  designation: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().optional(),
});

const teamManagementSchema = z.object({
  members: z.array(teamMemberSchema),
});

const homeGallerySlotSchema = z.object({
  image: z.string().min(1),
  alt: z.string().optional(),
});

const homeGallerySection3Schema = z.object({
  title: z.string().min(1),
  slots: z.array(homeGallerySlotSchema).length(3),
});

const homeGallerySection6Schema = z.object({
  title: z.string().min(1),
  slots: z.array(homeGallerySlotSchema).length(6),
});

const homeRightGallerySchema = z.object({
  staff: homeGallerySection6Schema,
  refinery: homeGallerySection6Schema,
  licenseOffice: homeGallerySection3Schema,
  jewelryFactory: homeGallerySection6Schema,
  products: homeGallerySection6Schema,
});

const whyChooseFeatureSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const whyChooseStatSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  labelLine2: z.string().optional(),
});

const whyChooseTextBlockSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const whyChooseSectionSchema = z.object({
  heading: z.string().min(1),
  features: z.array(whyChooseFeatureSchema).length(5),
  stats: z.array(whyChooseStatSchema).length(5),
  mission: whyChooseTextBlockSchema,
  missionImage: z.string().min(1),
  missionImageAlt: z.string().optional(),
  vision: whyChooseTextBlockSchema,
  visionIcon: z.string().min(1),
  visionIconAlt: z.string().optional(),
});

const buildingTrustSlotSchema = z.object({
  image: z.string().min(1),
  alt: z.string().optional(),
});

const buildingTrustSectionSchema = z.object({
  heading: z.string().min(1),
  slots: z.array(buildingTrustSlotSchema).length(5),
});

const goldProductItemSchema = z.object({
  label: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().optional(),
});

const goldProductsSectionSchema = z.object({
  heading: z.string().min(1),
  products: z.array(goldProductItemSchema).length(6),
});

const refiningProcessStepSchema = z.object({
  step: z.string().min(1),
  title: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().optional(),
});

const goldRefiningProcessSectionSchema = z.object({
  heading: z.string().min(1),
  steps: z.array(refiningProcessStepSchema).length(6),
});

const refiningGallerySlotSchema = z.object({
  image: z.string().min(1),
  alt: z.string().optional(),
});

const refiningGallerySectionSchema = z.object({
  slots: z.array(refiningGallerySlotSchema).length(3),
});

const industryItemSchema = z.object({
  label: z.string().min(1),
});

const industriesWeServeSectionSchema = z.object({
  heading: z.string().min(1),
  leftImage: z.string().min(1),
  leftImageAlt: z.string().optional(),
  rightImage: z.string().min(1),
  rightImageAlt: z.string().optional(),
  industries: z.array(industryItemSchema).length(6),
});

const miningExtractionSlotSchema = z.object({
  image: z.string().min(1),
  alt: z.string().optional(),
});

const miningExtractionSectionSchema = z.object({
  heading: z.string().min(1),
  slots: z.array(miningExtractionSlotSchema).length(5),
});

const globalShippingFeatureSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const globalShippingSectionSchema = z.object({
  heading: z.string().min(1),
  features: z.array(globalShippingFeatureSchema).length(5),
});

const getInTouchImageSlotSchema = z.object({
  image: z.string().min(1),
  alt: z.string().optional(),
});

const getInTouchSectionSchema = z.object({
  heading: z.string().min(1),
  topImages: z.array(getInTouchImageSlotSchema).length(3),
  leftImage: z.string().min(1),
  leftImageAlt: z.string().optional(),
  rightImage: z.string().min(1),
  rightImageAlt: z.string().optional(),
  phone: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.string().min(1),
  address: z.string().min(1),
});

const siteContentSchema = z
  .object({
    version: z.number().optional(),
    hero: z
      .object({
        slides: z.array(slideSchema),
        branding: heroBrandingSchema,
      })
      .optional(),
    teamManagement: teamManagementSchema.optional(),
    homeRightGallery: homeRightGallerySchema.optional(),
    whyChooseSection: whyChooseSectionSchema.optional(),
    buildingTrustSection: buildingTrustSectionSchema.optional(),
    goldProductsSection: goldProductsSectionSchema.optional(),
    goldRefiningProcessSection: goldRefiningProcessSectionSchema.optional(),
    refiningGallerySection: refiningGallerySectionSchema.optional(),
    industriesWeServeSection: industriesWeServeSectionSchema.optional(),
    miningExtractionSection: miningExtractionSectionSchema.optional(),
    globalShippingSection: globalShippingSectionSchema.optional(),
    getInTouchSection: getInTouchSectionSchema.optional(),
  })
  .passthrough();

/** PUT body may omit slides or branding; unchanged keys are preserved. */
const putBodySchema = z
  .object({
    version: z.number().optional(),
    hero: z
      .object({
        slides: z.array(slideSchema).optional(),
        branding: heroBrandingSchema,
      })
      .optional(),
    teamManagement: teamManagementSchema.optional(),
    homeRightGallery: homeRightGallerySchema.optional(),
    whyChooseSection: whyChooseSectionSchema.optional(),
    buildingTrustSection: buildingTrustSectionSchema.optional(),
    goldProductsSection: goldProductsSectionSchema.optional(),
    goldRefiningProcessSection: goldRefiningProcessSectionSchema.optional(),
    refiningGallerySection: refiningGallerySectionSchema.optional(),
    industriesWeServeSection: industriesWeServeSectionSchema.optional(),
    miningExtractionSection: miningExtractionSectionSchema.optional(),
    globalShippingSection: globalShippingSectionSchema.optional(),
    getInTouchSection: getInTouchSectionSchema.optional(),
  })
  .passthrough();

function mergeSiteContent(existing, incoming) {
  const out = { ...existing, ...incoming };
  if (incoming.hero !== undefined) {
    const prev = existing.hero || {};
    const next = incoming.hero;
    out.hero = {
      ...prev,
      ...next,
      slides: next.slides !== undefined ? next.slides : prev.slides,
      branding:
        next.branding !== undefined
          ? { ...(prev.branding || {}), ...next.branding }
          : prev.branding,
    };
  }
  if (incoming.teamManagement !== undefined) {
    const prev = existing.teamManagement || {};
    const next = incoming.teamManagement;
    out.teamManagement = {
      ...prev,
      ...next,
      members:
        next.members !== undefined ? next.members : prev.members || [],
    };
  }
  if (incoming.homeRightGallery !== undefined) {
    out.homeRightGallery = incoming.homeRightGallery;
  }
  if (incoming.whyChooseSection !== undefined) {
    out.whyChooseSection = incoming.whyChooseSection;
  }
  if (incoming.buildingTrustSection !== undefined) {
    out.buildingTrustSection = incoming.buildingTrustSection;
  }
  if (incoming.goldProductsSection !== undefined) {
    out.goldProductsSection = incoming.goldProductsSection;
  }
  if (incoming.goldRefiningProcessSection !== undefined) {
    out.goldRefiningProcessSection = incoming.goldRefiningProcessSection;
  }
  if (incoming.refiningGallerySection !== undefined) {
    out.refiningGallerySection = incoming.refiningGallerySection;
  }
  if (incoming.industriesWeServeSection !== undefined) {
    out.industriesWeServeSection = incoming.industriesWeServeSection;
  }
  if (incoming.miningExtractionSection !== undefined) {
    out.miningExtractionSection = incoming.miningExtractionSection;
  }
  if (incoming.globalShippingSection !== undefined) {
    out.globalShippingSection = incoming.globalShippingSection;
  }
  if (incoming.getInTouchSection !== undefined) {
    out.getInTouchSection = incoming.getInTouchSection;
  }
  return out;
}

async function createApp() {
  if (!IS_VERCEL) {
    await fs.mkdir(CMS_UPLOAD_DIR, { recursive: true });
  }
  await connectDb();

  const app = express();

  app.use(createCorsMiddleware());
  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      message: 'JD Gold API is running',
    });
  });

  app.get('/api/auth/verify', requireApiKey, (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/pages', pagesRouter);
  app.use('/api/banner', bannerRouter);

  app.get('/api/content', async (_req, res) => {
    try {
      const data = await getSiteContent();
      res.json(data);
    } catch (e) {
      console.error(e);
      try {
        res.json(await readSiteContentSeed());
      } catch (seedError) {
        console.error(seedError);
        res.status(500).json({ error: 'Failed to read content' });
      }
    }
  });

  app.get('/api/media/upload-mode', requireApiKey, (_req, res) => {
    if (blobUploadsEnabled()) {
      return res.json({ mode: 'blob', maxSize: 100 * 1024 * 1024 });
    }
    if (!IS_VERCEL) {
      return res.json({ mode: 'local', maxSize: 100 * 1024 * 1024 });
    }
    return res.status(503).json({
      error: 'BLOB_READ_WRITE_TOKEN is not configured',
    });
  });

  app.post('/api/media/blob', requireApiKey, async (req, res) => {
    try {
      res.json(await handleBlobMediaUpload(req));
    } catch (error) {
      console.error('Blob upload authorization failed', error);
      res.status(error.statusCode || 400).json({
        error: error.message || 'Failed to authorize Blob upload',
      });
    }
  });

  app.post('/api/media', requireApiKey, (req, res) => {
    if (IS_VERCEL || blobUploadsEnabled()) {
      return res.status(409).json({
        error: 'Use the browser-direct Blob upload flow',
      });
    }
    upload.single('file')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large (max 100MB)' });
        }
        return res.status(400).json({
          error: err.message || 'Upload failed',
        });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file' });
      }
      const logoOnly =
        req.query.logo === '1' ||
        req.query.logo === 'true' ||
        req.query.logo === 'yes';
      const portraitOnly =
        req.query.portrait === '1' ||
        req.query.portrait === 'true' ||
        req.query.portrait === 'yes';
      const galleryOnly =
        req.query.gallery === '1' ||
        req.query.gallery === 'true' ||
        req.query.gallery === 'yes';
      const modeCount = [logoOnly, portraitOnly, galleryOnly].filter(Boolean).length;
      if (modeCount > 1) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({
          error: 'Use only one of logo=1, portrait=1, or gallery=1',
        });
      }
      if (
        (logoOnly || portraitOnly || galleryOnly) &&
        !req.file.mimetype.startsWith('image/')
      ) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ error: 'Image file required' });
      }
      let filename = req.file.filename;
      let mimeType = req.file.mimetype;
      const absPath = req.file.path;
      /** @type {{ urlSm?: string, thumbUrl?: string, thumbSmUrl?: string }} */
      const extraUrls = {};
      if (shouldOptimizeRasterImage(req.file.mimetype)) {
        try {
          if (logoOnly) {
            filename = await optimizeLogoRaster(absPath);
          } else if (galleryOnly) {
            filename = await optimizeGalleryThumbRaster(absPath);
          } else if (portraitOnly) {
            filename = await optimizePortraitRaster(absPath);
          } else {
            const set = await optimizeSlideRasterResponsive(absPath);
            filename = set.main;
            extraUrls.urlSm = `/uploads/cms/${set.mainSm}`;
            extraUrls.thumbUrl = `/uploads/cms/${set.strip}`;
            extraUrls.thumbSmUrl = `/uploads/cms/${set.stripSm}`;
          }
          mimeType = 'image/webp';
        } catch (e) {
          console.error('Image optimization failed', e);
          if (logoOnly || portraitOnly || galleryOnly) {
            filename = req.file.filename;
            mimeType = req.file.mimetype;
          } else {
            try {
              filename = await optimizeSlideRasterSingle(absPath);
              mimeType = 'image/webp';
            } catch (e2) {
              console.error('Slide single fallback failed', e2);
              filename = req.file.filename;
              mimeType = req.file.mimetype;
            }
          }
        }
      }
      const url = `/uploads/cms/${filename}`;
      res.json({ url, mimeType, ...extraUrls });
    });
  });

  app.put('/api/content', requireApiKey, async (req, res) => {
    const parsed = putBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid body',
        details: parsed.error.flatten(),
      });
    }
    try {
      const existing = await getSiteContent().catch(() =>
        readSiteContentSeed(),
      );
      const merged = mergeSiteContent(existing, parsed.data);
      res.json(await saveSiteContent(merged));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to save content' });
    }
  });

  app.get('/admin', (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
  });

  app.get('/admin-upload.js', (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'admin-upload.js'));
  });

  if (!IS_VERCEL) {
    app.use('/uploads/cms', express.static(CMS_UPLOAD_DIR));
  }

  const serveStatic =
    process.env.SERVE_STATIC === 'true' || process.env.SERVE_STATIC === '1';

  if (serveStatic && !IS_VERCEL) {
    app.use(express.static(FRONTEND_DIST));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (req.path.startsWith('/api')) return next();
      if (req.path.startsWith('/uploads/')) return next();
      res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

let appPromise;

/** Cached Express app for local + Vercel serverless. */
export function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}

/** Vercel Node serverless entry. */
export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}

if (!IS_VERCEL) {
  getApp()
    .then((app) => {
      const port = Number(process.env.PORT) || 3001;
      app.listen(port, () => {
        console.log(
          `JD Gold API listening on http://localhost:${port} (${process.env.NODE_ENV || 'development'})`
        );
      });
    })
    .catch((err) => {
      console.error('Failed to start JD Gold API:', err.message || err);
      process.exit(1);
    });
}

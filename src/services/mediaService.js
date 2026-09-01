import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { del, head } from '@vercel/blob';
import { MediaAsset } from '../models/MediaAsset.js';
import { SiteContent } from '../models/SiteContent.js';
import { Page } from '../models/Page.js';
import { GlobalBanner } from '../models/GlobalBanner.js';
import { AppError } from '../utils/AppError.js';
import { assertValidObjectId } from '../utils/mongo.js';
import { containsMediaReference } from '../utils/media-references.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CMS_UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'cms');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function pathnameFromUrl(url) {
  if (url.startsWith('/uploads/cms/')) {
    return url.slice(1);
  }
  try {
    return new URL(url).pathname.replace(/^\/+/, '');
  } catch {
    return url.replace(/^\/+/, '');
  }
}

export async function upsertMediaAsset(payload) {
  const filter = {
    $or: [{ pathname: payload.pathname }, { url: payload.url }],
  };
  try {
    return await MediaAsset.findOneAndUpdate(
      filter,
      { $set: payload },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
        setDefaultsOnInsert: true,
        lean: true,
      },
    );
  } catch (error) {
    // The provider callback and authenticated browser verification can race.
    if (error?.code !== 11000) throw error;
    return MediaAsset.findOneAndUpdate(filter, { $set: payload }, {
      returnDocument: 'after',
      runValidators: true,
      lean: true,
    });
  }
}

export async function registerVerifiedBlob(url, metadata = {}) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new AppError('Blob storage is not configured', 503);
  }
  let blob;
  try {
    blob = await head(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {
    throw new AppError('Blob could not be verified', 400);
  }
  return upsertMediaAsset({
    pathname: blob.pathname,
    url: blob.url,
    mimeType: blob.contentType || metadata.mimeType || 'application/octet-stream',
    size: blob.size,
    category: metadata.category || 'general',
    alt: metadata.alt || '',
    caption: metadata.caption || '',
  });
}

export async function listMedia({
  page,
  limit,
  search,
  category,
  kind,
}) {
  const filter = {};
  if (category) filter.category = category;
  if (kind) filter.mimeType = new RegExp(`^${kind}/`, 'i');
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { pathname: regex },
      { url: regex },
      { alt: regex },
      { caption: regex },
    ];
  }
  const [items, total] = await Promise.all([
    MediaAsset.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MediaAsset.countDocuments(filter),
  ]);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function updateMedia(id, payload) {
  assertValidObjectId(id, 'media asset');
  const asset = await MediaAsset.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!asset) throw new AppError('Media asset not found', 404);
  return asset;
}

export async function findMediaUsage(asset) {
  const candidates = new Set([
    asset.url,
    `/${asset.pathname.replace(/^\/+/, '')}`,
    asset.sourcePath,
  ]);
  candidates.delete('');
  const [siteDocuments, pages, banners] = await Promise.all([
    SiteContent.find({}, 'content').lean(),
    Page.find({}).lean(),
    GlobalBanner.find({}).lean(),
  ]);
  const usage = [];
  for (const doc of siteDocuments) {
    if (containsMediaReference(doc.content, candidates)) {
      usage.push({ collection: 'SiteContent', id: String(doc._id) });
    }
  }
  for (const doc of pages) {
    if (containsMediaReference(doc, candidates)) {
      usage.push({ collection: 'Page', id: String(doc._id), slug: doc.slug });
    }
  }
  for (const doc of banners) {
    if (containsMediaReference(doc, candidates)) {
      usage.push({
        collection: 'GlobalBanner',
        id: String(doc._id),
        title: doc.title,
      });
    }
  }
  return usage;
}

async function deleteStoredFile(asset) {
  if (/^https?:\/\//i.test(asset.url)) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new AppError('Blob storage is not configured', 503);
    }
    await del(asset.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }
  if (!asset.url.startsWith('/uploads/cms/')) {
    throw new AppError('This asset is not managed storage', 409);
  }
  const relative = decodeURIComponent(asset.url.slice('/uploads/cms/'.length));
  const absolute = path.resolve(CMS_UPLOAD_DIR, relative);
  if (!absolute.startsWith(`${CMS_UPLOAD_DIR}${path.sep}`)) {
    throw new AppError('Invalid local media path', 400);
  }
  await fs.unlink(absolute).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

export async function deleteMedia(id) {
  assertValidObjectId(id, 'media asset');
  const asset = await MediaAsset.findById(id).lean();
  if (!asset) throw new AppError('Media asset not found', 404);
  const usage = await findMediaUsage(asset);
  if (usage.length) {
    throw new AppError(
      `Media is still referenced in ${usage
        .map((entry) => entry.collection)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(', ')}`,
      409,
    );
  }
  await deleteStoredFile(asset);
  await MediaAsset.deleteOne({ _id: asset._id });
  return { deleted: true, asset };
}

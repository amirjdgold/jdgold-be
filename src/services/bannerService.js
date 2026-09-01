import { GlobalBanner } from '../models/GlobalBanner.js';
import { AppError } from '../utils/AppError.js';
import { assertValidObjectId } from '../utils/mongo.js';

export async function listActiveBanners() {
  return GlobalBanner.find({ active: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();
}

export async function listAllBanners() {
  return GlobalBanner.find({}).sort({ order: 1, createdAt: 1 }).lean();
}

export async function createBanner(payload) {
  try {
    const banner = await GlobalBanner.create(payload);
    return banner.toObject();
  } catch (err) {
    throw mapBannerWriteError(err);
  }
}

export async function updateBannerById(id, payload) {
  assertValidObjectId(id, 'banner');

  try {
    const banner = await GlobalBanner.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!banner) {
      throw new AppError('Banner not found', 404);
    }
    return banner;
  } catch (err) {
    throw mapBannerWriteError(err);
  }
}

export async function deleteBannerById(id) {
  assertValidObjectId(id, 'banner');

  const banner = await GlobalBanner.findByIdAndDelete(id).lean();
  if (!banner) {
    throw new AppError('Banner not found', 404);
  }
  return banner;
}

function mapBannerWriteError(err) {
  if (err instanceof AppError) return err;

  if (err?.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return new AppError(first?.message || 'Invalid banner data', 400);
  }

  if (err?.name === 'CastError') {
    return new AppError('Invalid banner data', 400);
  }

  return err;
}

import { Page } from '../models/Page.js';
import { AppError } from '../utils/AppError.js';
import { assertValidObjectId } from '../utils/mongo.js';

const LIST_PROJECTION = 'slug title pageType sortOrder metaTitle isActive';

export async function listActivePages() {
  return Page.find({ isActive: true }, LIST_PROJECTION)
    .sort({ sortOrder: 1, slug: 1 })
    .lean();
}

export async function getPageBySlug(slug) {
  const page = await Page.findOne({ slug, isActive: true }).lean();
  if (!page) {
    throw new AppError('Page not found', 404);
  }
  return page;
}

export async function createPage(payload) {
  try {
    const page = await Page.create(payload);
    return page.toObject();
  } catch (err) {
    throw mapPageWriteError(err);
  }
}

export async function updatePageById(id, payload) {
  assertValidObjectId(id, 'page');

  try {
    const page = await Page.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!page) {
      throw new AppError('Page not found', 404);
    }
    return page;
  } catch (err) {
    throw mapPageWriteError(err);
  }
}

export async function deletePageById(id) {
  assertValidObjectId(id, 'page');

  const page = await Page.findByIdAndDelete(id).lean();
  if (!page) {
    throw new AppError('Page not found', 404);
  }
  return page;
}

function mapPageWriteError(err) {
  if (err instanceof AppError) return err;

  if (err?.code === 11000) {
    return new AppError('A page with this slug already exists', 409);
  }

  if (err?.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return new AppError(first?.message || 'Invalid page data', 400);
  }

  if (err?.name === 'CastError') {
    return new AppError('Invalid page data', 400);
  }

  return err;
}

import path from 'path';
import { handleUpload } from '@vercel/blob/client';
import { upsertMediaAsset } from './mediaService.js';

export const MAX_MEDIA_SIZE = 100 * 1024 * 1024;
export const ALLOWED_MEDIA_TYPES = ['image/*', 'video/*'];

const ALLOWED_UPLOAD_EXTENSIONS = new Set([
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

export function blobUploadsEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function parseClientPayload(clientPayload) {
  try {
    return JSON.parse(clientPayload || '{}');
  } catch {
    throw new Error('Invalid upload metadata');
  }
}

export function validateUploadRequest(pathname, clientPayload) {
  if (!/^cms\/[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$/.test(pathname)) {
    throw new Error('Invalid media pathname');
  }
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(path.extname(pathname).toLowerCase())) {
    throw new Error('Unsupported media file extension');
  }

  const { mimeType, size } = parseClientPayload(clientPayload);
  if (
    typeof mimeType !== 'string' ||
    (!mimeType.startsWith('image/') && !mimeType.startsWith('video/'))
  ) {
    throw new Error('Only image or video files are allowed');
  }
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_MEDIA_SIZE) {
    throw new Error('File too large (max 100MB)');
  }
}

function assertUploadAuthorization(req) {
  const expected = process.env.API_KEY;
  if (!expected) {
    const error = new Error('API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '')?.trim();
  const headerKey = req.headers['x-api-key'];
  const provided =
    bearer || (typeof headerKey === 'string' ? headerKey.trim() : '');
  if (provided !== expected) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
}

export async function handleBlobMediaUpload(req) {
  if (!blobUploadsEnabled()) {
    const error = new Error('Blob storage is not configured');
    error.statusCode = 503;
    throw error;
  }

  return handleUpload({
    request: req,
    body: req.body,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    onBeforeGenerateToken: async (pathname, clientPayload) => {
      assertUploadAuthorization(req);
      validateUploadRequest(pathname, clientPayload);
      const metadata = parseClientPayload(clientPayload);
      return {
        allowedContentTypes: ALLOWED_MEDIA_TYPES,
        maximumSizeInBytes: MAX_MEDIA_SIZE,
        addRandomSuffix: false,
        allowOverwrite: false,
        validUntil: Date.now() + 10 * 60 * 1000,
        tokenPayload: JSON.stringify({
          mimeType: metadata.mimeType,
          size: metadata.size,
          category: metadata.category || 'general',
          alt: metadata.alt || '',
        }),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const metadata = parseClientPayload(tokenPayload);
      await upsertMediaAsset({
        pathname: blob.pathname,
        url: blob.url,
        mimeType:
          blob.contentType ||
          metadata.mimeType ||
          'application/octet-stream',
        size: blob.size ?? metadata.size ?? 0,
        category: metadata.category || 'general',
        alt: metadata.alt || '',
        caption: '',
      });
    },
  });
}

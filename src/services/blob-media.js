import path from 'path';
import { handleUpload } from '@vercel/blob/client';

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

function parseClientPayload(clientPayload) {
  try {
    return JSON.parse(clientPayload || '{}');
  } catch {
    throw new Error('Invalid upload metadata');
  }
}

function validateUploadRequest(pathname, clientPayload) {
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
      validateUploadRequest(pathname, clientPayload);
      return {
        allowedContentTypes: ALLOWED_MEDIA_TYPES,
        maximumSizeInBytes: MAX_MEDIA_SIZE,
        addRandomSuffix: false,
        allowOverwrite: false,
        validUntil: Date.now() + 10 * 60 * 1000,
      };
    },
  });
}

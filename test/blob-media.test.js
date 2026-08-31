import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseClientPayload,
  validateUploadRequest,
} from '../src/services/blob-media.js';

test('accepts bounded image and video upload metadata', () => {
  assert.doesNotThrow(() =>
    validateUploadRequest(
      'cms/example-image.webp',
      JSON.stringify({ mimeType: 'image/webp', size: 1024 }),
    ),
  );
  assert.doesNotThrow(() =>
    validateUploadRequest(
      'cms/example-video.mp4',
      JSON.stringify({ mimeType: 'video/mp4', size: 5_000_000 }),
    ),
  );
});

test('rejects unsafe paths, unsupported MIME types, and oversized files', () => {
  assert.throws(() =>
    validateUploadRequest(
      'cms/nested/file.png',
      JSON.stringify({ mimeType: 'image/png', size: 100 }),
    ),
  );
  assert.throws(() =>
    validateUploadRequest(
      'cms/file.pdf',
      JSON.stringify({ mimeType: 'application/pdf', size: 100 }),
    ),
  );
  assert.throws(() =>
    validateUploadRequest(
      'cms/file.png',
      JSON.stringify({ mimeType: 'image/png', size: 101 * 1024 * 1024 }),
    ),
  );
});

test('rejects malformed client metadata', () => {
  assert.throws(() => parseClientPayload('{'));
});

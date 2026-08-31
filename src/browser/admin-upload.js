import { upload } from '@vercel/blob/client';

const nativeFetch = window.fetch.bind(window);
const MAX_MEDIA_SIZE = 100 * 1024 * 1024;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mediaRequestUrl(input) {
  const raw = input instanceof Request ? input.url : String(input);
  try {
    return new URL(raw, window.location.href);
  } catch {
    return null;
  }
}

function makeBlobPathname(file) {
  const cleaned = String(file.name || 'media')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-120);
  const random =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `cms/${Date.now()}-${random}-${cleaned || 'media'}`;
}

function categoryForRequest(url, file) {
  const requested = url.searchParams.get('category');
  if (['general', 'hero', 'logo', 'portrait', 'gallery', 'video'].includes(requested)) {
    return requested;
  }
  if (url.searchParams.has('logo')) return 'logo';
  if (url.searchParams.has('portrait')) return 'portrait';
  if (url.searchParams.has('gallery')) return 'gallery';
  if ((file.type || '').startsWith('video/')) return 'video';
  return 'hero';
}

async function directOrLocalMediaFetch(input, init = {}) {
  const url = mediaRequestUrl(input);
  const method = String(init.method || (input instanceof Request && input.method) || 'GET')
    .toUpperCase();
  const body = init.body;

  if (
    !url ||
    url.origin !== window.location.origin ||
    url.pathname !== '/api/media' ||
    method !== 'POST' ||
    !(body instanceof FormData)
  ) {
    return nativeFetch(input, init);
  }

  const file = body.get('file');
  if (!(file instanceof File)) return nativeFetch(input, init);
  if (
    !file.type ||
    (!file.type.startsWith('image/') && !file.type.startsWith('video/'))
  ) {
    return jsonResponse({ error: 'Only image or video files are allowed' }, 400);
  }
  if (file.size <= 0 || file.size > MAX_MEDIA_SIZE) {
    return jsonResponse({ error: 'File too large (max 100MB)' }, 400);
  }

  const requestHeaders = new Headers(init.headers || {});
  const category = categoryForRequest(url, file);
  const modeResponse = await nativeFetch('/api/media/upload-mode', {
    headers: requestHeaders,
  });
  if (!modeResponse.ok) return modeResponse;

  const config = await modeResponse.json();
  if (config.mode !== 'blob') return nativeFetch(input, init);

  try {
    const blob = await upload(makeBlobPathname(file), file, {
      access: 'public',
      contentType: file.type,
      handleUploadUrl: '/api/media/blob',
      headers: Object.fromEntries(requestHeaders.entries()),
      clientPayload: JSON.stringify({
        mimeType: file.type,
        size: file.size,
        category,
        alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      }),
      multipart: file.size > 5 * 1024 * 1024,
    });
    const registration = await nativeFetch('/api/media-assets/register', {
      method: 'POST',
      headers: {
        ...Object.fromEntries(requestHeaders.entries()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: blob.url,
        category,
        alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      }),
    });
    if (!registration.ok) {
      const detail = await registration.json().catch(() => ({}));
      throw new Error(
        detail.message || detail.error || 'Uploaded Blob could not be registered',
      );
    }
    return jsonResponse({
      url: blob.url,
      mimeType: blob.contentType || file.type,
    });
  } catch (error) {
    console.error('Direct Blob upload failed', error);
    return jsonResponse(
      { error: error.message || 'Direct Blob upload failed' },
      400,
    );
  }
}

window.fetch = directOrLocalMediaFetch;
window.JDGMedia = Object.freeze({
  maxSize: MAX_MEDIA_SIZE,
  makeBlobPathname,
});

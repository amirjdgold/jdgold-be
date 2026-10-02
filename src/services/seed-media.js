import { MediaAsset } from '../models/MediaAsset.js';
import {
  collectMediaReferences,
  rewriteMediaReferences,
} from '../utils/media-references.js';

/**
 * Resolve portable /images, /videos and /uploads seed references through the
 * media registry. Seeds never contain an account-specific Blob hostname.
 */
export async function resolveSeedMedia(value) {
  const assets = await MediaAsset.find(
    { sourcePath: { $ne: '' } },
    'sourcePath url',
  ).lean();
  const replacements = new Map(
    assets.map((asset) => [asset.sourcePath, asset.url]),
  );
  return rewriteMediaReferences(value, replacements);
}

/**
 * Local /uploads/cms paths 404 on Vercel. If the registry already has a Blob
 * URL for that pathname, swap it in when a page is served.
 */
export async function resolveRegisteredUploads(value) {
  const local = [...collectMediaReferences(value)].filter((ref) =>
    ref.startsWith('/uploads/cms/'),
  );
  if (!local.length) return value;
  const pathnames = local.map((ref) => ref.replace(/^\/+/, ''));
  const assets = await MediaAsset.find(
    { $or: [{ url: { $in: local } }, { pathname: { $in: pathnames } }] },
    'pathname url',
  ).lean();
  const replacements = new Map();
  for (const asset of assets) {
    if (!asset.url || asset.url.startsWith('/uploads/cms/')) continue;
    replacements.set(`/${asset.pathname.replace(/^\/+/, '')}`, asset.url);
    replacements.set(asset.url, asset.url);
  }
  return replacements.size ? rewriteMediaReferences(value, replacements) : value;
}

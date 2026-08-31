import { MediaAsset } from '../models/MediaAsset.js';
import { rewriteMediaReferences } from '../utils/media-references.js';

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

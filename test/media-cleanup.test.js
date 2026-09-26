import test from 'node:test';
import assert from 'node:assert/strict';
import {
  droppedMediaReferences,
  isAssetReferenced,
  isPrunableAsset,
} from '../src/services/mediaCleanup.js';

const blobHost = 'https://example.public.blob.vercel-storage.com';

test('reports images a save replaced', () => {
  const before = {
    hero: { image: `${blobHost}/cms/old-hero.webp` },
    sections: [{ items: [{ image: '/uploads/cms/old-tile.webp' }] }],
  };
  const after = {
    hero: { image: `${blobHost}/cms/new-hero.webp` },
    sections: [{ items: [{ image: '/uploads/cms/old-tile.webp' }] }],
  };
  assert.deepEqual(droppedMediaReferences(before, after), [
    `${blobHost}/cms/old-hero.webp`,
  ]);
});

test('keeps images that only moved to another slot', () => {
  const image = `${blobHost}/cms/shared.webp`;
  const before = { hero: { image }, gallery: [] };
  const after = { hero: { image: `${blobHost}/cms/new.webp` }, gallery: [{ image }] };
  assert.deepEqual(droppedMediaReferences(before, after), []);
});

test('treats a delete as dropping every reference', () => {
  const page = { hero: { image: '/uploads/cms/a.webp' }, logo: '/uploads/cms/b.webp' };
  assert.deepEqual(droppedMediaReferences(page, null).sort(), [
    '/uploads/cms/a.webp',
    '/uploads/cms/b.webp',
  ]);
});

test('only prunes managed uploads, never seeded assets', () => {
  assert.equal(
    isPrunableAsset({ url: `${blobHost}/cms/upload.webp`, sourcePath: '' }),
    true,
  );
  assert.equal(isPrunableAsset({ url: '/uploads/cms/upload.webp' }), true);
  assert.equal(
    isPrunableAsset({
      url: `${blobHost}/cms/hero.webp`,
      sourcePath: '/images/hero.webp',
    }),
    false,
  );
  assert.equal(isPrunableAsset({ url: '/images/hero.webp' }), false);
  assert.equal(isPrunableAsset(null), false);
});

test('matches live references by url or local pathname', () => {
  const referenced = new Set([
    `${blobHost}/cms/kept.webp`,
    '/uploads/cms/kept-local.webp',
  ]);
  assert.equal(
    isAssetReferenced(
      { url: `${blobHost}/cms/kept.webp`, pathname: 'cms/kept.webp' },
      referenced,
    ),
    true,
  );
  assert.equal(
    isAssetReferenced(
      { url: '/uploads/cms/kept-local.webp', pathname: 'uploads/cms/kept-local.webp' },
      referenced,
    ),
    true,
  );
  assert.equal(
    isAssetReferenced(
      { url: `${blobHost}/cms/orphan.webp`, pathname: 'cms/orphan.webp' },
      referenced,
    ),
    false,
  );
});

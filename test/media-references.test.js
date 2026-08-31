import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectMediaReferences,
  containsMediaReference,
  rewriteMediaReferences,
} from '../src/utils/media-references.js';
import { pathnameFromUrl } from '../src/services/mediaService.js';

test('recursively collects and rewrites exact media references', () => {
  const source = {
    hero: { image: '/images/hero.png' },
    sections: [
      { gallery: [{ url: '/uploads/cms/photo.webp' }] },
      { copy: 'Text mentioning /images/hero.png is not a media value' },
    ],
  };
  assert.deepEqual(
    [...collectMediaReferences(source)].sort(),
    ['/images/hero.png', '/uploads/cms/photo.webp'],
  );

  const stats = { replaced: 0 };
  const rewritten = rewriteMediaReferences(
    source,
    new Map([
      ['/images/hero.png', 'https://blob.example/hero.png'],
      ['/uploads/cms/photo.webp', 'https://blob.example/photo.webp'],
    ]),
    stats,
  );
  assert.equal(rewritten.hero.image, 'https://blob.example/hero.png');
  assert.equal(rewritten.sections[0].gallery[0].url, 'https://blob.example/photo.webp');
  assert.equal(stats.replaced, 2);
  assert.equal(source.hero.image, '/images/hero.png');
});

test('reference checks are exact and preserve special objects', () => {
  const date = new Date();
  const value = { nested: [{ url: '/images/a.png' }], date };
  assert.equal(containsMediaReference(value, ['/images/a.png']), true);
  assert.equal(containsMediaReference(value, ['/images/a']), false);
  assert.equal(rewriteMediaReferences(value, new Map()).date, date);
});

test('derives stable pathnames for Blob and local URLs', () => {
  assert.equal(
    pathnameFromUrl('https://store.public.blob.vercel-storage.com/cms/a.png'),
    'cms/a.png',
  );
  assert.equal(pathnameFromUrl('/uploads/cms/a.png'), 'uploads/cms/a.png');
});

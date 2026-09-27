import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin } from '../src/middleware/cors.js';

function fakeReq(host, proto = 'https') {
  return {
    protocol: proto,
    get(name) {
      if (name === 'host') return host;
      if (name === 'x-forwarded-proto') return proto;
      return undefined;
    },
  };
}

test('allows the Admin origin when it matches this API host', () => {
  const allowed = ['https://jdgold.llc', 'https://jdgold-fe.vercel.app'];
  assert.equal(
    isAllowedOrigin(
      'https://jdgold-be.vercel.app',
      fakeReq('jdgold-be.vercel.app'),
      allowed,
    ),
    true,
  );
});

test('rejects an unknown browser origin', () => {
  const allowed = ['https://jdgold.llc'];
  assert.equal(
    isAllowedOrigin(
      'https://other-site.example',
      fakeReq('jdgold-be.vercel.app'),
      allowed,
    ),
    false,
  );
});

test('allows listed frontend origins', () => {
  const allowed = ['https://jdgold.llc', 'https://www.jdgold.llc'];
  assert.equal(
    isAllowedOrigin('https://jdgold.llc', fakeReq('jdgold-be.vercel.app'), allowed),
    true,
  );
});

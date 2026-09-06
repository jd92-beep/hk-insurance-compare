import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyShareText, comparisonShareUrl } from '../src/lib/share-link.ts';

test('clipboard success means the write promise resolved', async () => {
  const writes = [];
  assert.equal(await copyShareText('value', async text => { writes.push(text); }, () => { throw Error('unused'); }), true);
  assert.deepEqual(writes, ['value']);
});
test('permission denial uses fallback and checks its actual result', async () => {
  const deny = async () => { throw Error('NotAllowedError'); };
  assert.equal(await copyShareText('value', deny, () => true), true);
  assert.equal(await copyShareText('value', deny, () => false), false);
  assert.equal(await copyShareText('value', deny, () => { throw Error('unsupported'); }), false);
});
test('unavailable APIs do not report success', async () => {
  assert.equal(await copyShareText('value'), false);
  assert.equal(await copyShareText('value', undefined, () => false), false);
  assert.equal(await copyShareText('value', undefined, () => true), true);
});
test('shared URL contains only current safe product IDs, not stale query or tracking fields', () => {
  const url = new URL(comparisonShareUrl('https://example.test/compare?ids=old&campaign=secret#section', ['travel-axa', 'travel-axa', 'home-msig']));
  assert.equal(url.pathname, '/compare'); assert.equal(url.hash, '');
  assert.equal(url.searchParams.get('ids'), 'travel-axa,home-msig');
  assert.equal(url.searchParams.has('campaign'), false);
});
test('share URL bounds selection and rejects malformed IDs or unsafe origins', () => {
  const url = new URL(comparisonShareUrl('https://example.test', ['../x', 'a', 'b', 'c', 'd']));
  assert.equal(url.searchParams.get('ids'), 'a,b,c');
  assert.throws(() => comparisonShareUrl('javascript:alert(1)', ['a']));
  assert.equal(new URL(comparisonShareUrl('https://example.test', [])).search, '');
});

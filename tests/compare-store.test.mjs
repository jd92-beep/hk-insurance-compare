import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSelectionStore, normalizeSelection } from '../src/lib/compare-store.ts';
function harness(raw = null) {
  let listener; const writes = []; let removed = 0;
  const store = createSelectionStore({ read: () => raw, write: next => { raw = next; writes.push(next); }, listen: cb => { listener = cb; return () => { removed++; listener = undefined; }; } }, 3);
  return { store, writes, external: value => { raw = value; listener?.(value); }, removed: () => removed };
}
test('selection normalization drops corrupt, duplicate, blank and unsafe IDs', () => {
  assert.deepEqual(normalizeSelection([' a ', 'a', null, 7, '', '../x', 'b', 'c', 'd'], 3), ['a', 'b', 'c']);
  assert.deepEqual(normalizeSelection({ a: 1 }, 3), []);
  assert.deepEqual(normalizeSelection(['a', 'b'], 3, new Set(['b'])), ['b']);
});
test('add, toggle, replace and clear retain order and respect capacity', () => {
  const { store } = harness();
  store.add('a'); store.add('b'); store.add('a'); store.add('c'); store.add('d');
  assert.deepEqual(store.getSnapshot(), ['a', 'b', 'c']);
  store.toggle('b'); store.add('d'); assert.deepEqual(store.getSnapshot(), ['a', 'c', 'd']);
  store.replace(['b', 'b', 'a']); assert.deepEqual(store.getSnapshot(), ['b', 'a']);
  store.clear(); assert.deepEqual(store.getSnapshot(), []);
});
test('cross-tab storage changes notify subscribers without echo writes', () => {
  const h = harness('["a"]'); let notified = 0;
  const stop = h.store.subscribe(() => notified++);
  h.external('["b","b","c"]');
  assert.deepEqual(h.store.getSnapshot(), ['b', 'c']); assert.equal(h.writes.length, 0);
  const same = h.store.getSnapshot(); h.external('["b","c"]');
  assert.equal(h.store.getSnapshot(), same); assert.equal(notified, 1);
  h.external(null); assert.deepEqual(h.store.getSnapshot(), []);
  stop(); assert.equal(h.removed(), 1);
});
test('blocked storage remains a usable in-memory tray', () => {
  const store = createSelectionStore({ read: () => { throw Error('denied'); }, write: () => { throw Error('quota'); }, listen: () => () => {} }, 3);
  const stop = store.subscribe(() => {}); store.add('a'); store.add('b');
  assert.deepEqual(store.getSnapshot(), ['a', 'b']); stop();
});
test('catalog reconciliation removes orphan IDs and rejects invalid additions', () => {
  const { store } = harness('["deleted","live"]');
  assert.deepEqual(store.getSnapshot(), ['deleted', 'live']);
  store.setKnownIds(new Set(['live', 'other']));
  assert.deepEqual(store.getSnapshot(), ['live']); store.add('deleted'); store.add('other');
  assert.deepEqual(store.getSnapshot(), ['live', 'other']);
});
test('multiple subscriptions share one storage listener and corrupt JSON is harmless', () => {
  const h = harness('{bad-json');
  const a = h.store.subscribe(() => {}), b = h.store.subscribe(() => {});
  assert.deepEqual(h.store.getSnapshot(), []);
  a(); assert.equal(h.removed(), 0); b(); assert.equal(h.removed(), 1);
});

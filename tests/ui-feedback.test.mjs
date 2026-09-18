import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyShareText, legacyCopyShareText } from '../src/lib/share-link.ts';
import { MOTION } from '../src/lib/motion-runtime.ts';

test('clipboard success requires a fulfilled write, not a silent attempt', async () => {
  assert.equal(await copyShareText('X', async () => {}, () => false), true);
  assert.equal(await copyShareText('X', async () => { throw new Error('denied'); }, () => true), true);
  assert.equal(await copyShareText('X', async () => { throw new Error('denied'); }, () => false), false);
  assert.equal(await copyShareText('X', undefined, () => false), false);
});

test('motion scale remains exaggerated but usable for compare cards', () => {
  assert.ok(MOTION.enterScale <= 0.75);
  assert.ok(MOTION.enterY >= 32);
  assert.ok(MOTION.springy.stiffness > MOTION.springSoft.stiffness);
});

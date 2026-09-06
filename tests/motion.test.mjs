import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFrameLoop, particleBudget, seededRandom } from '../src/lib/motion-runtime.ts';

test('a stopped frame loop cannot reschedule or multiply after remount', () => {
  const queue = new Map(); let id = 0; let frames = 0;
  const loop = createFrameLoop(() => { frames++; }, fn => { queue.set(++id, fn); return id; }, key => queue.delete(key));
  loop.start(); loop.start(); assert.equal(queue.size, 1);
  const cb = queue.values().next().value; queue.clear(); cb(10);
  assert.equal(frames, 1); assert.equal(queue.size, 1);
  loop.stop(); assert.equal(queue.size, 0); cb(20); assert.equal(queue.size, 0);
  loop.start(); assert.equal(queue.size, 1); loop.stop();
});
test('particle work is bounded even for pathological density and large displays', () => {
  assert.equal(particleBudget(Infinity, false), 56);
  assert.equal(particleBudget(-4, false), 0);
  assert.ok(particleBudget(10000, false) <= 84);
  assert.ok(particleBudget(1, true) <= 24);
});
test('particle composition is reproducible, not random visual noise on remount', () => {
  const a = seededRandom(92), b = seededRandom(92);
  for (let i = 0; i < 100; i++) { const n = a(); assert.equal(n, b()); assert.ok(n >= 0 && n < 1); }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { projectGem, tiltAt } from '../src/lib/depth-geometry.ts';
test('tilt is bounded, centered and safe for zero dimensions', () => {
  assert.deepEqual(tiltAt(50, 50, 100, 100, 40), { x: 0, y: 0 });
  assert.deepEqual(tiltAt(900, -900, 100, 100, 40), { x: 7, y: 7 });
  assert.deepEqual(tiltAt(10, 20, 0, 0, 6), { x: 0, y: 0 });
  assert.deepEqual(tiltAt(NaN, 20, 100, 100, 6), { x: 0, y: 0 });
});
test('gem projection has real depth, stable face ordering and bounded lighting', () => {
  const a = projectGem(0.4, 0.7), b = projectGem(0.4, 1.7);
  assert.equal(a.length, 33);
  assert.notDeepEqual(a, b);
  assert.deepEqual(a, projectGem(0.4, 0.7));
  for (let i = 0; i < a.length; i++) {
    assert.ok(a[i].light >= 0 && a[i].light <= 1);
    assert.ok(a[i].points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x) < 2 && Math.abs(p.y) < 2));
    if (i) assert.ok(a[i-1].depth <= a[i].depth);
  }
});

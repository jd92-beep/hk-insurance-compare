import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAnimationLoop, makeParticles, projectParticle } from '../src/lib/particle-scene.ts';

test('RAF has one owner, cancels on stop, and safely restarts', () => {
  let id = 0; const queue = new Map(); const frames = [];
  const loop = createAnimationLoop(t => frames.push(t), {
    request: f => { queue.set(++id, f); return id; }, cancel: n => queue.delete(n),
  });
  loop.start(); loop.start(); assert.equal(queue.size, 1);
  const [n, cb] = queue.entries().next().value; queue.delete(n); cb(20);
  assert.deepEqual(frames, [20]); assert.equal(queue.size, 1);
  loop.stop(); assert.equal(queue.size, 0); loop.start(); assert.equal(queue.size, 1);
  loop.stop(); cb(50); assert.equal(queue.size, 0);
});
test('particles are deterministic, bounded and sorted back to front', () => {
  const a = makeParticles(40); assert.deepEqual(a, makeParticles(40));
  assert.equal(makeParticles(Infinity).length, 0); assert.equal(makeParticles(1e6).length, 96);
  assert.equal(makeParticles(-1).length, 0);
  assert.ok(a.every((p, i) => Number.isFinite(p.z) && (i === 0 || a[i - 1].z >= p.z)));
});
test('projection has depth without huge particles or viewport-dependent motion', () => {
  const p = makeParticles(1)[0];
  const near = projectParticle({ ...p, z: 0 }, 1000, 800, 0, 0, 0, 0);
  const far = projectParticle({ ...p, z: 600 }, 1000, 800, 0, 0, 0, 0);
  assert.ok(near.scale > far.scale);
  assert.deepEqual(projectParticle(p, 1000, 800, 1, 0, 0, 0), projectParticle(p, 1000, 800, 1, 0, 0, 0));
});

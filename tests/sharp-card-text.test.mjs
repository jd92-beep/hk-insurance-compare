import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tilt = readFileSync('src/components/fx/TiltCard.tsx', 'utf8');
const css = readFileSync('src/index.css', 'utf8');
const insurer = readFileSync('src/components/insurers/InsurerCard.tsx', 'utf8');
const product = readFileSync('src/components/ProductCard.tsx', 'utf8');

test('TiltCard resting face has no 3D transform or perspective on text', () => {
  assert.ok(tilt.includes('!active'));
  assert.ok(tilt.includes('transform: "none"'));
  assert.ok(!tilt.includes('translateZ'));
  // perspective only applied while active
  assert.ok(tilt.includes('style={active ? { perspective'));
});

test('depth cards do not promote GPU layers at rest (no translateZ on surfaces)', () => {
  assert.ok(!css.includes('transform: translateZ(0)'));
  assert.ok(css.includes('.card-text-sharp'));
  assert.ok(/depth-z-bar[\s\S]*transform: none/.test(css));
});

test('insurer card copy containers stay flat at rest', () => {
  assert.ok(!insurer.includes('depth-z-icon'));
  assert.ok(insurer.includes('card-text-sharp'));
  assert.ok(!product.includes('translateZ'));
});

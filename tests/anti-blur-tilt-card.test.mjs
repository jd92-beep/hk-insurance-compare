import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tiltCardSource = readFileSync('src/components/fx/TiltCard.tsx', 'utf8');
const productCardSource = readFileSync('src/components/ProductCard.tsx', 'utf8');
const indexCssSource = readFileSync('src/index.css', 'utf8');

test('TiltCard hover never rotates or lifts the card in 3D (whole card stays sharp while hovered)', () => {
  for (const banned of ['rotateX', 'rotateY', 'translateZ', 'preserve-3d']) {
    assert.ok(!tiltCardSource.includes(banned), banned);
  }
  // glare stays, driven by CSS custom properties rather than per-frame React state
  assert.ok(tiltCardSource.includes('tilt-glare'));
  assert.ok(indexCssSource.includes('.tilt-stage:hover .tilt-glare'));
});

test('ProductCard copy container does not apply inline translateZ', () => {
  // ProductCard must not trap its text in a separate translateZ layer
  assert.ok(!productCardSource.includes("translateZ(12px)"));
  assert.ok(!productCardSource.includes("translateZ("));
});

test('index.css depth cards retain physical 3D shadows and edges without resting translateZ(0)', () => {
  // Must NOT have resting transform: translateZ(0) which degrades subpixel text antialiasing
  assert.ok(!indexCssSource.includes('transform: translateZ(0);'));

  // Must preserve 3D physical depth: sunlit top rim highlight and a layered warm drop-shadow stack
  assert.ok(indexCssSource.includes('inset 0 1px 0 rgba(255, 255, 255, 0.95)'));
  assert.ok(indexCssSource.includes('0 18px 30px -16px rgba(var(--shadow-warm), 0.3)'));
  assert.ok(indexCssSource.includes('0 34px 60px -30px rgba(var(--shadow-warm), 0.28)'));

  // Must enforce font smoothing and optimal legibility
  assert.ok(indexCssSource.includes('-webkit-font-smoothing: antialiased;'));
  assert.ok(indexCssSource.includes('text-rendering: optimizeLegibility;'));

  // Preserves 3D depth accents (chips, bars, icons)
  assert.ok(indexCssSource.includes('.depth-z-bar'));
  assert.ok(indexCssSource.includes('.depth-z-icon'));
  assert.ok(indexCssSource.includes('.depth-z-chip'));
  assert.ok(indexCssSource.includes('.chip-3d'));

  // Crisp perimeter borders: depth-surface, depth-card, shadow-card have solid contrast rules
  assert.ok(indexCssSource.includes('border-color: rgba(46, 42, 69, 0.16)'));
  assert.ok(indexCssSource.includes('border-top-color: rgba(255, 255, 255, 0.95)'));
  assert.ok(indexCssSource.includes('border-bottom-color: rgba(46, 42, 69, 0.22)'));

  // depth-card stays flat, and the hover lift is a pure 2D translate (no rotate → no resampling blur)
  assert.ok(indexCssSource.includes('.depth-card { transform-style: flat; }'));
  assert.ok(!/translateY\(-6px\) rotate/.test(indexCssSource));
});


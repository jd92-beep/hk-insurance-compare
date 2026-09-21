import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tiltCardSource = readFileSync('src/components/fx/TiltCard.tsx', 'utf8');
const productCardSource = readFileSync('src/components/ProductCard.tsx', 'utf8');
const indexCssSource = readFileSync('src/index.css', 'utf8');

test('TiltCard has anti-blur architecture: 0 resting lift and non-forced translateZ at rest', () => {
  // Resting lift must be 0 to prevent lifting resting text into a floating GPU raster layer
  assert.match(tiltCardSource, /const lift = useSpring\(0/);

  // Must track settled state to cleanly switch between dynamic 3D tilt and pixel-sharp resting vector text
  assert.ok(tiltCardSource.includes('isSettled'));
  assert.ok(tiltCardSource.includes('isInteracting'));

  // Content card container must NOT force translateZ(12px) at rest
  assert.ok(tiltCardSource.includes('isSettled ? "none" : "translateZ(8px)"'));

  // Dynamic 3D tilt properties must remain intact
  assert.ok(tiltCardSource.includes('rotateX'));
  assert.ok(tiltCardSource.includes('rotateY'));
  assert.ok(tiltCardSource.includes('perspective'));
  assert.ok(tiltCardSource.includes('glare'));

  // transformStyle must be "flat" when settled to enable 2D vector pixel snapping for crisp borders and hairlines
  assert.ok(tiltCardSource.includes('transformStyle: isSettled ? "flat" : "preserve-3d"'));
  assert.ok(tiltCardSource.includes('!isSettled && "preserve-3d"'));
});

test('ProductCard copy container does not apply inline translateZ', () => {
  // ProductCard must not trap its text in a separate translateZ layer
  assert.ok(!productCardSource.includes("translateZ(12px)"));
  assert.ok(!productCardSource.includes("translateZ("));
});

test('index.css depth cards retain physical 3D shadows and edges without resting translateZ(0)', () => {
  // Must NOT have resting transform: translateZ(0) which degrades subpixel text antialiasing
  assert.ok(!indexCssSource.includes('transform: translateZ(0);'));

  // Must preserve 3D physical depth: top rim highlight and multi-tier dropped shadows
  assert.ok(indexCssSource.includes('inset 0 1px 0 rgba(255,255,255,.95)'));
  assert.ok(indexCssSource.includes('0 2px 0 0 rgba(27,43,37,.08)'));
  assert.ok(indexCssSource.includes('0 14px 28px -16px rgba(27,43,37,.38)'));
  assert.ok(indexCssSource.includes('0 28px 56px -28px rgba(27,43,37,.32)'));

  // Must enforce font smoothing and optimal legibility
  assert.ok(indexCssSource.includes('-webkit-font-smoothing: antialiased;'));
  assert.ok(indexCssSource.includes('text-rendering: optimizeLegibility;'));

  // Preserves 3D depth accents (chips, bars, icons)
  assert.ok(indexCssSource.includes('.depth-z-bar'));
  assert.ok(indexCssSource.includes('.depth-z-icon'));
  assert.ok(indexCssSource.includes('.depth-z-chip'));
  assert.ok(indexCssSource.includes('.chip-3d'));

  // Crisp perimeter borders: depth-surface, depth-card, shadow-card have solid contrast rules
  assert.ok(indexCssSource.includes('border-color: rgba(24, 29, 46, 0.22)'));
  assert.ok(indexCssSource.includes('border-top-color: rgba(255, 255, 255, 0.95)'));
  assert.ok(indexCssSource.includes('border-bottom-color: rgba(24, 29, 46, 0.26)'));

  // depth-card is flat at rest and switches to preserve-3d when active/hover
  assert.ok(indexCssSource.includes('.depth-card { transform-style: flat; }'));
  assert.ok(indexCssSource.includes('transform-style: preserve-3d;'));
});


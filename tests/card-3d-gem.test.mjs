import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  projectGem,
  parseGemColor,
  computeGemShading,
  boundedDpr,
  boundedGemSize,
  renderGem,
  GEM_THEMES,
} from '../src/lib/depth-geometry.ts';
import { createFrameLoop } from '../src/lib/motion-runtime.ts';

test('3D crystal geometry produces 33 ordered faces with valid depth and light', () => {
  const facesA = projectGem(0.38, 0.55);
  const facesB = projectGem(0.38, 1.85);

  assert.equal(facesA.length, 33, 'Polyhedron must have exactly 33 facets (1 table + 32 facets)');
  assert.equal(facesB.length, 33);
  assert.notDeepEqual(facesA, facesB, 'Rotated yaw must produce distinct 3D projected vertices');

  // Verify back-to-front depth sorting and valid bounds
  for (let i = 0; i < facesA.length; i++) {
    const face = facesA[i];
    assert.ok(Number.isFinite(face.depth), 'Depth must be finite');
    assert.ok(face.light >= 0 && face.light <= 1, `Face light (${face.light}) must be in [0, 1]`);
    assert.ok(face.points.length >= 3, 'Face must have at least 3 vertices');
    assert.ok(
      face.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)),
      'Face coordinates must all be finite'
    );
    if (i > 0) {
      assert.ok(
        facesA[i - 1].depth <= face.depth,
        'Faces must be sorted in back-to-front painter order'
      );
    }
  }
});

test('gem shading calculates diffuse and specular highlight cleanly', () => {
  const base = [0, 166, 126]; // Jade

  // Low light (shadowed facet)
  const darkShading = computeGemShading(base, 0.1);
  assert.equal(darkShading.specular, 0, 'Shadowed facet has 0 specular highlight');
  assert.match(darkShading.fill, /^rgb\(\d+,\d+,\d+\)$/);
  assert.match(darkShading.stroke, /^rgba\(255,255,255,0\.\d+\)$/);

  // High light (glinting facet with specular highlight)
  const brightShading = computeGemShading(base, 0.95);
  assert.ok(brightShading.specular > 0.5, 'Facet facing light has prominent specular glint');
  assert.ok(brightShading.stroke.includes('0.'), 'Facet stroke remains translucent');

  // Verify high specular shifts facet closer to white
  const parseRgb = (str) => str.match(/\d+/g).map(Number);
  const darkRgb = parseRgb(darkShading.fill);
  const brightRgb = parseRgb(brightShading.fill);
  assert.ok(brightRgb[0] > darkRgb[0], 'Highlight increases red channel towards white');
  assert.ok(brightRgb[1] > darkRgb[1], 'Highlight increases green channel towards white');
  assert.ok(brightRgb[2] > darkRgb[2], 'Highlight increases blue channel towards white');

  // Boundary safety on extreme or non-finite inputs
  assert.doesNotThrow(() => computeGemShading(base, -10));
  assert.doesNotThrow(() => computeGemShading(base, 100));
  assert.doesNotThrow(() => computeGemShading(base, NaN));
});

test('color parser handles brand presets, hex formats and safe fallbacks', () => {
  // Brand themes
  assert.deepEqual(parseGemColor('jade'), GEM_THEMES.jade);
  assert.deepEqual(parseGemColor('amber'), GEM_THEMES.amber);
  assert.deepEqual(parseGemColor('ink'), GEM_THEMES.ink);
  assert.deepEqual(parseGemColor('ruby'), GEM_THEMES.ruby);

  // Hex codes
  assert.deepEqual(parseGemColor('#00a67e'), [0, 166, 126]);
  assert.deepEqual(parseGemColor('#D97706'), [217, 119, 6]);
  assert.deepEqual(parseGemColor('#fff'), [255, 255, 255]);
  assert.deepEqual(parseGemColor('#000000'), [0, 0, 0]);

  // CSS rgb syntax
  assert.deepEqual(parseGemColor('rgb(12, 34, 56)'), [12, 34, 56]);
  assert.deepEqual(parseGemColor('rgba(12, 34, 56, 0.8)'), [12, 34, 56]);

  // Malformed or unknown inputs safely fallback to brand jade
  assert.deepEqual(parseGemColor(''), GEM_THEMES.jade);
  assert.deepEqual(parseGemColor('unknown-color'), GEM_THEMES.jade);
  assert.deepEqual(parseGemColor('#xyz'), GEM_THEMES.jade);
  assert.deepEqual(parseGemColor(undefined), GEM_THEMES.jade);
  assert.deepEqual(parseGemColor(null), GEM_THEMES.jade);
});

test('safety bounds clamp DPR to [1, 2] and size to [12, 512]', () => {
  // DPR bounds
  assert.equal(boundedDpr(1), 1);
  assert.equal(boundedDpr(1.5), 1.5);
  assert.equal(boundedDpr(2), 2);
  assert.equal(boundedDpr(3), 2, 'DPR must be capped at 2 to avoid GPU overhead');
  assert.equal(boundedDpr(4), 2);
  assert.equal(boundedDpr(0), 1, 'Non-positive DPR must fallback to 1');
  assert.equal(boundedDpr(-2), 1);
  assert.equal(boundedDpr(NaN), 1);
  assert.equal(boundedDpr(Infinity), 1);

  // Size bounds
  assert.equal(boundedGemSize(32), 32);
  assert.equal(boundedGemSize(48), 48);
  assert.equal(boundedGemSize(8), 12, 'Size must have a safe lower bound of 12px');
  assert.equal(boundedGemSize(1000), 512, 'Size must have a safe upper bound of 512px');
  assert.equal(boundedGemSize(NaN), 32);
  assert.equal(boundedGemSize(undefined), 32);
});

test('renderGem draws 33 facets onto canvas context without error', () => {
  let beginPathCalls = 0;
  let fillCalls = 0;
  let strokeCalls = 0;
  let clearRectCalls = 0;

  const mockCtx = {
    clearRect() { clearRectCalls++; },
    beginPath() { beginPathCalls++; },
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() { fillCalls++; },
    stroke() { strokeCalls++; },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    save() {},
    restore() {},
    arc() {},
    createRadialGradient() {
      return { addColorStop() {} };
    },
  };

  renderGem(mockCtx, {
    width: 32,
    height: 32,
    pitch: 0.38,
    yaw: 0.55,
    color: 'jade',
    glow: true,
  });

  assert.equal(clearRectCalls, 1, 'Must clear canvas once per frame');
  assert.equal(fillCalls, 34, 'Must render 1 glow fill + 33 polygon face fills when glow is enabled');
  assert.equal(strokeCalls, 33, 'Must render exactly 33 polygon face strokes');
  assert.ok(beginPathCalls >= 33, 'Must call beginPath for each facet');

  // When glow is false: exactly 33 face fills
  fillCalls = 0;
  strokeCalls = 0;
  renderGem(mockCtx, {
    width: 32,
    height: 32,
    pitch: 0.38,
    yaw: 0.55,
    color: 'jade',
    glow: false,
  });
  assert.equal(fillCalls, 33, 'Without glow, must render exactly 33 face fills');
  assert.equal(strokeCalls, 33, 'Without glow, must render exactly 33 face strokes');

  // Zero dimension check: skips drawing
  fillCalls = 0;
  renderGem(mockCtx, { width: 0, height: 0, pitch: 0, yaw: 0 });
  assert.equal(fillCalls, 0, 'Zero dimension must safely skip drawing');
});

test('Card3DGem source code satisfies all lifecycle, a11y, and zero-leak contracts', () => {
  const src = readFileSync('src/components/fx/Card3DGem.tsx', 'utf8');

  // Canvas element
  assert.ok(src.includes('<canvas'), 'Must render an independent canvas element');

  // DPR Capping
  assert.ok(
    src.includes('boundedDpr') || src.includes('devicePixelRatio'),
    'Must handle DPR capping safely'
  );

  // prefers-reduced-motion support
  assert.ok(
    src.includes('prefers-reduced-motion'),
    'Must respect prefers-reduced-motion user preference'
  );

  // Strict unmount cleanup
  assert.ok(
    src.includes('loop.stop()') || src.includes('cancelAnimationFrame'),
    'Must cancel frame loop on unmount'
  );
  assert.ok(
    src.includes('removeEventListener'),
    'Must remove pointer and document event listeners on unmount'
  );
  assert.ok(
    src.includes('disconnect()'),
    'Must disconnect IntersectionObserver on unmount'
  );

  // Text layout & accessibility protection
  assert.ok(
    src.includes('aria-hidden'),
    'Must default to aria-hidden="true" when decorative to protect text readers'
  );
  assert.ok(
    src.includes('inline-block') || src.includes('shrink-0'),
    'Must render with safe inline-block / shrink-0 layout tokens'
  );
});

test('simulated frame loop with gem rendering respects start, stop and cancellation', () => {
  let frameCount = 0;
  const queue = new Map();
  let id = 0;

  const loop = createFrameLoop(
    () => { frameCount++; },
    (fn) => { queue.set(++id, fn); return id; },
    (key) => { queue.delete(key); }
  );

  loop.start();
  assert.equal(queue.size, 1, 'Loop start registers one frame callback');
  const cb = queue.values().next().value;
  queue.clear();
  cb(16.6);
  assert.equal(frameCount, 1);
  assert.equal(queue.size, 1, 'Tick registers next RAF callback');

  // Stop loop: cancels and prevents any further frames
  loop.stop();
  assert.equal(queue.size, 0, 'Loop stop unregisters pending RAF callback');
  cb(33.2);
  assert.equal(frameCount, 1, 'Calling old callback after stop does not increment frame');
});


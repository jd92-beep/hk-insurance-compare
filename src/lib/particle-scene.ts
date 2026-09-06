/** Small, deterministic spatial scene; no React state is updated per frame. */
export function createAnimationLoop(
  step: (time: number) => void,
  clock: { request: (f: FrameRequestCallback) => number; cancel: (id: number) => void },
) {
  let frame = 0;
  let running = false;
  const tick = (time: number) => {
    if (!running) return;
    step(time);
    if (running) frame = clock.request(tick);
  };
  return {
    start() { if (!running) { running = true; frame = clock.request(tick); } },
    stop() { running = false; clock.cancel(frame); frame = 0; },
  };
}

export interface Particle {
  x: number; y: number; z: number; phase: number; size: number; material: number;
}
export function makeParticles(count: number): Particle[] {
  let seed = 41927;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const n = Number.isFinite(count) ? Math.min(96, Math.max(0, Math.round(count))) : 0;
  return Array.from({ length: n }, () => ({
    x: random(), y: random(), z: random() * 700, phase: random() * Math.PI * 2,
    size: 6 + random() * 8, material: Math.floor(random() * 3),
  })).sort((a, b) => b.z - a.z);
}

export function projectParticle(p: Particle, width: number, height: number, seconds: number, mx: number, my: number, scroll: number) {
  const scale = 700 / (700 + p.z);
  const drift = (p.y * (height + 80) - seconds * (4 + 5 * scale)) % (height + 80);
  return {
    x: width / 2 + (p.x - 0.5) * width * 1.3 * scale + Math.sin(seconds * .18 + p.phase) * 14 + mx * 24 * scale,
    y: ((drift + height + 80) % (height + 80)) - 40 + my * 18 * scale - scroll * .06 * scale,
    scale,
    angle: p.phase + seconds * .08,
  };
}

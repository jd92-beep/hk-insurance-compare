/** A single cancellable owner for a frame loop; safe across StrictMode remounts. */
export function createFrameLoop(
  update: (time: number) => void,
  request: (callback: FrameRequestCallback) => number = requestAnimationFrame,
  cancel: (id: number) => void = cancelAnimationFrame,
) {
  let handle: number | null = null;
  let active = false;
  const tick = (time: number) => {
    if (!active) return;
    handle = null;
    update(time);
    if (active) handle = request(tick);
  };
  return {
    start() { if (!active) { active = true; handle = request(tick); } },
    stop() { active = false; if (handle !== null) cancel(handle); handle = null; },
  };
}

/**
 * Shared motion scale — intentionally punchy.
 * Bigger travel, stronger bounce, snappier springs for UI events.
 */
export const MOTION = {
  easeOutExpo: [0.22, 1, 0.36, 1] as [number, number, number, number],
  easeBounce: [0.22, 1.45, 0.36, 1] as [number, number, number, number],
  springy: { type: "spring" as const, stiffness: 480, damping: 16, mass: 0.65 },
  springSoft: { type: "spring" as const, stiffness: 280, damping: 20, mass: 0.8 },
  enterY: 40,
  enterX: 28,
  enterScale: 0.72,
  exitX: -36,
  hoverLiftPx: 8,
  pressScale: 0.88,
  duration: { snap: 0.22, fast: 0.32, base: 0.48, slow: 0.78, hero: 1.05 },
} as const;

/** Slightly denser particles than the old conservative budget; still bounded. */
export function particleBudget(density: number, coarse: boolean): number {
  return Math.round((coarse ? 34 : 78) * Math.min(1.6, Math.max(0, Number.isFinite(density) ? density : 1)));
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}

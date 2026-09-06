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

export function particleBudget(density: number, coarse: boolean): number {
  return Math.round((coarse ? 22 : 56) * Math.min(1.5, Math.max(0, Number.isFinite(density) ? density : 1)));
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}

import Lenis from "lenis";
import { createFrameLoop } from "./motion-runtime";

let lenis: Lenis | null = null;
let cleanup: (() => void) | null = null;

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return null;
  const instance = new Lenis({ lerp: 0.1, syncTouch: false });
  lenis = instance;
  const loop = createFrameLoop(time => instance.raf(time));
  const visibility = () => document.hidden ? loop.stop() : loop.start();
  const preference = () => { if (reduced.matches) destroyLenis(); };
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", preference);
  cleanup = () => {
    loop.stop();
    document.removeEventListener("visibilitychange", visibility);
    reduced.removeEventListener("change", preference);
  };
  visibility();
  return instance;
}

export function destroyLenis(): void {
  cleanup?.(); cleanup = null;
  lenis?.destroy(); lenis = null;
}

export function getLenis(): Lenis | null { return lenis; }

export function scrollToElement(target: string | HTMLElement): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis && !reduced) {
    lenis.scrollTo(target, { duration: 0.9, easing: t => 1 - Math.pow(1 - t, 4) });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
}

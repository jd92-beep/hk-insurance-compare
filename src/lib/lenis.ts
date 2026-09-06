import Lenis from "lenis";
import { createAnimationLoop } from "./particle-scene";

let lenis: Lenis | null = null;
let stopLoop: (() => void) | null = null;
export function initLenis(): Lenis | null {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  if (lenis) return lenis;
  const instance = new Lenis({ lerp: .1 });
  lenis = instance;
  const loop = createAnimationLoop(time => instance.raf(time), { request: requestAnimationFrame, cancel: cancelAnimationFrame });
  const sync = () => { if (document.hidden) loop.stop(); else loop.start(); };
  document.addEventListener("visibilitychange", sync); sync();
  stopLoop = () => { loop.stop(); document.removeEventListener("visibilitychange", sync); };
  return instance;
}
export function destroyLenis(): void { stopLoop?.(); stopLoop = null; lenis?.destroy(); lenis = null; }
export function getLenis(): Lenis | null { return lenis; }
export function scrollToElement(target: string | HTMLElement): void {
  if (lenis) { lenis.scrollTo(target, { duration: .9, easing: t => 1 - Math.pow(1 - t, 4) }); return; }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

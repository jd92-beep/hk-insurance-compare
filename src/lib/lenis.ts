import Lenis from "lenis";

/**
 * 全站 Lenis 單例（Layout 掛載時初始化）。
 * 頁面／組件可以透過 getLenis() 做 scrollTo 錨點跳轉。
 */
let lenis: Lenis | null = null;

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  if (lenis) return lenis;
  lenis = new Lenis({ lerp: 0.1 });
  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

export function destroyLenis(): void {
  lenis?.destroy();
  lenis = null;
}

export function getLenis(): Lenis | null {
  return lenis;
}

/** 平滑滾動到元素（Lenis 用緊 → 用佢；否則原生 scrollIntoView） */
export function scrollToElement(target: string | HTMLElement): void {
  if (lenis) {
    lenis.scrollTo(target, { duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

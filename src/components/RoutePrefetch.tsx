import { useEffect } from "react";
import { prefetchRoute, warmLikelyRoutes } from "@/lib/route-prefetch";

/**
 * Idle + hover module warmup for likely next routes.
 * Intentionally does not touch insurance-data.json (already preloaded/cached).
 */
export default function RoutePrefetch() {
  useEffect(() => {
    warmLikelyRoutes();
    const onPointerOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      prefetchRoute(href);
    };
    document.addEventListener("pointerover", onPointerOver, true);
    return () => document.removeEventListener("pointerover", onPointerOver, true);
  }, []);
  return null;
}

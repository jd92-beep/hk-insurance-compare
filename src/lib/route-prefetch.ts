/**
 * Idle/hover route module warmup.
 * Only warms JS page chunks — never re-fetches insurance-data.json.
 */
type Loader = () => Promise<unknown>;

const exactLoaders: Record<string, Loader> = {
  "/": () => import("@/pages/Home"),
  "/categories": () => import("@/pages/Categories"),
  "/compare": () => import("@/pages/Compare"),
  "/insurers": () => import("@/pages/Insurers"),
  "/guides": () => import("@/pages/Guides"),
  "/vhis": () => import("@/pages/Vhis"),
  "/about": () => import("@/pages/About"),
  "/data-quality": () => import("@/pages/DataQuality"),
  "/documents": () => import("@/pages/Documents"),
};

const prefixLoaders: ReadonlyArray<{ prefix: string; load: Loader }> = [
  { prefix: "/category/", load: () => import("@/pages/CategoryDetail") },
  { prefix: "/product/", load: () => import("@/pages/ProductDetail") },
];

const warmed = new Set<string>();

function normalizePath(pathname: string): string {
  const clean = pathname.split("#")[0]?.split("?")[0] ?? "/";
  if (clean.length > 1 && clean.endsWith("/")) return clean.slice(0, -1);
  return clean;
}

export function prefetchRoute(pathname: string): void {
  const path = normalizePath(pathname);
  if (!path.startsWith("/") || warmed.has(path)) return;
  const loader = exactLoaders[path] ?? prefixLoaders.find((entry) => path.startsWith(entry.prefix))?.load;
  if (!loader) return;
  warmed.add(path);
  void loader().catch(() => {
    warmed.delete(path);
  });
}

/** Warm the few routes users usually hit next; does not fetch all products. */
export function warmLikelyRoutes(): void {
  if (typeof window === "undefined") return;
  const idle =
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback.bind(window)
      : (cb: () => void) => window.setTimeout(cb, 200) as unknown as number;
  idle(() => {
    prefetchRoute("/categories");
    prefetchRoute("/compare");
    prefetchRoute("/insurers");
  });
}

export function resetPrefetchWarmupForTests(): void {
  warmed.clear();
}

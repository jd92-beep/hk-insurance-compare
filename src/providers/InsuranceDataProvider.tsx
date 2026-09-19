import { parseInsuranceData } from "@/lib/data-integrity";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Category, InsuranceData, Insurer, Product } from "@/types/insurance";
import { DEFAULT_CATEGORIES, deriveInsurers } from "@/lib/categories";
interface InsuranceDataState { data: InsuranceData | null; loading: boolean; error: string | null; generatedAt: string; retry: () => void }
const InsuranceDataContext = createContext<InsuranceDataState>({ data: null, loading: true, error: null, generatedAt: "未提供", retry: () => undefined });
const EMPTY: InsuranceData = { generated_at: "未提供", categories: DEFAULT_CATEGORIES, products: [] };

/** Module-level single-flight fetch: remounts reuse the same JSON parse cost once. */
let sharedJsonPromise: Promise<unknown> | null = null;
function loadInsuranceJson(): Promise<unknown> {
  if (!sharedJsonPromise) {
    sharedJsonPromise = fetch(`${import.meta.env.BASE_URL}data/insurance-data.json`).then(res => {
      if (!res.ok) throw new Error(`載入數據失敗（HTTP ${res.status}）`);
      return res.json() as Promise<unknown>;
    }).catch((err: unknown) => {
      sharedJsonPromise = null;
      throw err;
    });
  }
  return sharedJsonPromise;
}
function refreshScrollTriggers(cancelled: () => boolean): void {
  void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
    if (cancelled()) return;
    ScrollTrigger.refresh();
    window.setTimeout(() => {
      if (!cancelled()) ScrollTrigger.refresh();
    }, 100);
  }).catch(() => undefined);
}

export function InsuranceDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<InsuranceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setLoading(true); setError(null); setAttempt(n => n + 1); }, []);
  useEffect(() => {
    let cancelled = false;
    loadInsuranceJson()
      .then(json => {
        if (cancelled) return;
        setData(parseInsuranceData(json));
        setLoading(false);
        refreshScrollTriggers(() => cancelled);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "載入數據失敗");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [attempt]);
  const value = useMemo<InsuranceDataState>(() => ({ data, loading, error, generatedAt: data?.generated_at ?? "未提供", retry }), [data, loading, error, retry]);
  return <InsuranceDataContext.Provider value={value}>{children}</InsuranceDataContext.Provider>;
}
export function useInsuranceData(): InsuranceDataState { return useContext(InsuranceDataContext); }
export function useProducts(categoryId?: string): Product[] {
  const { data } = useInsuranceData();
  return useMemo(() => { const products = data?.products ?? EMPTY.products; return categoryId ? products.filter(p => p.category === categoryId) : products; }, [data, categoryId]);
}
export function useProduct(id: string | undefined): Product | undefined {
  const { data } = useInsuranceData();
  return useMemo(() => id ? data?.products.find(p => p.id === id) : undefined, [data, id]);
}
export function useInsurers(): Insurer[] {
  const { data } = useInsuranceData(); return useMemo(() => deriveInsurers(data?.products ?? []), [data]);
}
export function useCategories(): Category[] {
  const { data } = useInsuranceData(); return useMemo(() => data?.categories ?? EMPTY.categories, [data]);
}

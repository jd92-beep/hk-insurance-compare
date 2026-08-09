import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Category, InsuranceData, Insurer, Product } from "@/types/insurance";
import { deriveInsurers } from "@/lib/categories";

interface InsuranceDataState {
  data: InsuranceData | null;
  loading: boolean;
  error: string | null;
  /** 資料快照日期（例如 2026-08-09） */
  generatedAt: string;
}

const InsuranceDataContext = createContext<InsuranceDataState>({
  data: null,
  loading: true,
  error: null,
  generatedAt: "2026-08-09",
});

const EMPTY: InsuranceData = { generated_at: "2026-08-09", categories: [], products: [] };

export function InsuranceDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<InsuranceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}data/insurance-data.json`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`載入數據失敗（HTTP ${res.status}）`);
        return res.json() as Promise<InsuranceData>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "載入數據失敗");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<InsuranceDataState>(
    () => ({
      data,
      loading,
      error,
      generatedAt: data?.generated_at ?? "2026-08-09",
    }),
    [data, loading, error],
  );

  return <InsuranceDataContext.Provider value={value}>{children}</InsuranceDataContext.Provider>;
}

export function useInsuranceData(): InsuranceDataState {
  return useContext(InsuranceDataContext);
}

/** 全部產品，或者指定類別嘅產品 */
export function useProducts(categoryId?: string): Product[] {
  const { data } = useInsuranceData();
  return useMemo(() => {
    const products = data?.products ?? EMPTY.products;
    if (!categoryId) return products;
    return products.filter((p) => p.category === categoryId);
  }, [data, categoryId]);
}

/** 按 id 搵單一產品（未載入或搵唔到 → undefined） */
export function useProduct(id: string | undefined): Product | undefined {
  const { data } = useInsuranceData();
  return useMemo(
    () => (id ? data?.products.find((p) => p.id === id) : undefined),
    [data, id],
  );
}

/** 27 間保險公司名錄（由產品衍生，按產品數降序） */
export function useInsurers(): Insurer[] {
  const { data } = useInsuranceData();
  return useMemo(() => deriveInsurers(data?.products ?? []), [data]);
}

/** 9 大類別 */
export function useCategories(): Category[] {
  const { data } = useInsuranceData();
  return useMemo(() => data?.categories ?? EMPTY.categories, [data]);
}

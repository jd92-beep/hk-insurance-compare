import { useEffect, useState } from "react";
import type { VhisRegistry } from "@/types/vhis";

interface VhisRegistryState {
  data: VhisRegistry | null;
  loading: boolean;
  error: string | null;
}

/**
 * 載入自願醫保認可產品名單（public/data/vhis-plans.json）
 * 跟 InsuranceDataProvider 嘅 fetch 模式：cancelled flag + HTTP error + 中文錯誤訊息
 */
export function useVhisRegistry(): VhisRegistryState {
  const [data, setData] = useState<VhisRegistry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}data/vhis-plans.json`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`載入數據失敗（HTTP ${res.status}）`);
        return res.json() as Promise<VhisRegistry>;
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

  return { data, loading, error };
}

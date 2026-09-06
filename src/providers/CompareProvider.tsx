import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createSelectionStore } from "@/lib/compare-store";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";

const STORAGE_KEY = "ic-compare-tray";
export const COMPARE_LIMIT = 3;
interface CompareState {
  items: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  replace: (ids: string[]) => void;
  has: (id: string) => boolean;
  isFull: boolean;
}
const CompareContext = createContext<CompareState | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const { data } = useInsuranceData();
  const [store] = useState(() => createSelectionStore({
    read: () => typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY),
    write: raw => window.localStorage.setItem(STORAGE_KEY, raw),
    listen: receive => {
      if (typeof window === "undefined") return () => {};
      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY && event.key !== null) return;
        try { if (event.storageArea && event.storageArea !== window.localStorage) return; } catch { return; }
        receive(event.newValue);
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },
  }, COMPARE_LIMIT));
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  useEffect(() => {
    // Never clear saved selections while data is loading, failed, or unexpectedly empty.
    if (data?.products.length) store.setKnownIds(new Set(data.products.map(product => product.id)));
  }, [data, store]);
  const value = useMemo<CompareState>(() => ({
    items, add: store.add, remove: store.remove, toggle: store.toggle, clear: store.clear,
    replace: store.replace, has: id => items.includes(id), isFull: items.length >= COMPARE_LIMIT,
  }), [items, store]);
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
export function useCompare(): CompareState {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare 必須喺 <CompareProvider> 入面使用");
  return context;
}

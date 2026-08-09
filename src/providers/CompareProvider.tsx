import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "ic-compare-tray";
export const COMPARE_LIMIT = 3;

interface CompareState {
  /** 已選產品 id（最多 3 個，按加入順序） */
  items: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareState | null>(null);

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string").slice(0, COMPARE_LIMIT);
    }
  } catch {
    /* ignore corrupt storage */
  }
  return [];
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / private mode — non-fatal */
    }
  }, [items]);

  const add = useCallback((id: string) => {
    setItems((prev) =>
      prev.includes(id) || prev.length >= COMPARE_LIMIT ? prev : [...prev, id],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= COMPARE_LIMIT) return prev;
      return [...prev, id];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((id: string) => items.includes(id), [items]);

  const value = useMemo<CompareState>(
    () => ({ items, add, remove, toggle, clear, has, isFull: items.length >= COMPARE_LIMIT }),
    [items, add, remove, toggle, clear, has],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareState {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare 必須喺 <CompareProvider> 入面使用");
  return ctx;
}

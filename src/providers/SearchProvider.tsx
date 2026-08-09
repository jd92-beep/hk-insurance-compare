import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface SearchState {
  open: boolean;
  setOpen: (open: boolean) => void;
  openSearch: () => void;
}

const SearchContext = createContext<SearchState>({
  open: false,
  setOpen: () => {},
  openSearch: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ open, setOpen, openSearch }), [open, openSearch]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchState {
  return useContext(SearchContext);
}

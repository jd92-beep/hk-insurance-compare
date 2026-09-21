import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  createFavoritesStore,
  FAVORITES_STORAGE_KEY,
} from "@/lib/favorites-store";

export interface FavoritesContextType {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() =>
    createFavoritesStore({
      read: () =>
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem(FAVORITES_STORAGE_KEY),
      write: (raw) => {
        try {
          window.localStorage.setItem(FAVORITES_STORAGE_KEY, raw);
        } catch {
          // 靜默處理 Safari 無痕模式或 QuotaExceededError
        }
      },
      listen: (receive) => {
        if (typeof window === "undefined") return () => {};
        const onStorage = (event: StorageEvent) => {
          if (
            event.key !== FAVORITES_STORAGE_KEY &&
            event.key !== null
          ) {
            return;
          }
          try {
            if (
              event.storageArea &&
              event.storageArea !== window.localStorage
            ) {
              return;
            }
          } catch {
            return;
          }
          receive(event.newValue);
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
      },
    })
  );

  const favorites = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const value = useMemo<FavoritesContextType>(
    () => ({
      favorites,
      isFavorite: (id: string) => store.isFavorite(id),
      toggleFavorite: store.toggle,
      addFavorite: store.add,
      removeFavorite: store.remove,
      clearFavorites: store.clear,
      count: favorites.length,
    }),
    [favorites, store]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites 必須喺 <FavoritesProvider> 入面使用");
  }
  return context;
}

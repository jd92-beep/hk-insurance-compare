export const FAVORITES_STORAGE_KEY = "hk_insure_favorites";

export interface FavoritesPort {
  read: () => string | null;
  write: (raw: string) => void;
  listen: (receive: (raw: string | null) => void) => () => void;
}

const EMPTY: string[] = [];

/**
 * 安全清理與規範化最愛產品 ID 陣列：
 * - 排除非字串、空白字串、不符合格式的 ID
 * - 自動去除前後空白
 * - 自動去重複
 * - 限制合理上限（例如 500 份），防止惡意或畸形 payload 耗盡記憶體
 */
export function normalizeFavorites(value: unknown, limit = 500): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  const seen = new Set<string>();
  const capacity = Math.max(0, Math.min(2000, limit));

  for (const raw of value) {
    if (result.length >= capacity) break;
    if (typeof raw !== "string") continue;
    const clean = raw.trim();
    if (!clean) continue;
    // 保險產品 ID 一般為英數字、減號、底線
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,159}$/.test(clean)) continue;
    if (seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }
  return result;
}

export function decodeFavorites(raw: string | null): unknown {
  if (!raw || raw.length > 100000) return [];
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return [];
  }
}

export function createFavoritesStore(port: FavoritesPort, limit = 500) {
  let snapshot = EMPTY;
  let persistent = true;

  try {
    snapshot = normalizeFavorites(decodeFavorites(port.read()), limit);
  } catch {
    persistent = false;
  }

  const listeners = new Set<() => void>();
  let disconnect: (() => void) | undefined;

  const replace = (value: unknown, persist = true) => {
    const next = normalizeFavorites(value, limit);
    if (
      next.length === snapshot.length &&
      next.every((id, i) => id === snapshot[i])
    ) {
      return;
    }
    snapshot = next;
    if (persist) {
      try {
        port.write(JSON.stringify(next));
        persistent = true;
      } catch {
        persistent = false;
      }
    }
    for (const listener of listeners) listener();
  };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => EMPTY,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (listeners.size === 1) {
        disconnect = port.listen((raw) => replace(decodeFavorites(raw), false));
        if (persistent) {
          try {
            replace(decodeFavorites(port.read()), false);
          } catch {
            persistent = false;
          }
        }
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          disconnect?.();
          disconnect = undefined;
        }
      };
    },
    isFavorite: (id: string) => {
      if (!id || typeof id !== "string") return false;
      return snapshot.includes(id.trim());
    },
    add: (id: string) => {
      if (!id || typeof id !== "string") return;
      const clean = id.trim();
      if (!clean || snapshot.includes(clean)) return;
      replace([...snapshot, clean]);
    },
    remove: (id: string) => {
      if (!id || typeof id !== "string") return;
      const clean = id.trim();
      if (!clean || !snapshot.includes(clean)) return;
      replace(snapshot.filter((item) => item !== clean));
    },
    toggle: (id: string) => {
      if (!id || typeof id !== "string") return;
      const clean = id.trim();
      if (!clean) return;
      replace(
        snapshot.includes(clean)
          ? snapshot.filter((item) => item !== clean)
          : [...snapshot, clean]
      );
    },
    clear: () => replace([]),
    replace: (ids: string[]) => replace(ids),
  };
}

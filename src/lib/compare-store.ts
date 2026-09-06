export interface SelectionPort {
  read: () => string | null;
  write: (raw: string) => void;
  listen: (receive: (raw: string | null) => void) => () => void;
}
const EMPTY: string[] = [];
/** Bound input size before parsing or iterating untrusted browser storage. */
export function normalizeSelection(value: unknown, limit: number, knownIds?: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  const capacity = Number.isFinite(limit) ? Math.max(0, Math.min(20, Math.floor(limit))) : 0;
  for (const raw of value.slice(0, 1000)) {
    if (result.length >= capacity) break;
    if (typeof raw !== "string") continue;
    const id = raw.trim();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$/.test(id) || result.includes(id) || (knownIds && !knownIds.has(id))) continue;
    result.push(id);
  }
  return result;
}
function decode(raw: string | null): unknown {
  if (!raw || raw.length > 50000) return [];
  try { return JSON.parse(raw) as unknown; } catch { return []; }
}
/** Same-origin tab synchronization. Never echo remote storage events back into storage. */
export function createSelectionStore(port: SelectionPort, limit: number) {
  let knownIds: ReadonlySet<string> | undefined;
  let snapshot = EMPTY;
  let persistent = true;
  try { snapshot = normalizeSelection(decode(port.read()), limit); } catch { persistent = false; }
  const listeners = new Set<() => void>();
  let disconnect: (() => void) | undefined;
  const replace = (value: unknown, persist = true) => {
    const next = normalizeSelection(value, limit, knownIds);
    if (next.length === snapshot.length && next.every((id, i) => id === snapshot[i])) return;
    snapshot = next;
    if (persist) {
      try { port.write(JSON.stringify(next)); persistent = true; } catch { persistent = false; }
    }
    for (const listener of listeners) listener();
  };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => EMPTY,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (listeners.size === 1) {
        disconnect = port.listen(raw => replace(decode(raw), false));
        // Close the read/subscribe gap without discarding a private-mode in-memory selection.
        if (persistent) { try { replace(decode(port.read()), false); } catch { persistent = false; } }
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) { disconnect?.(); disconnect = undefined; }
      };
    },
    add: (id: string) => replace([...snapshot, id]),
    remove: (id: string) => replace(snapshot.filter(item => item !== id)),
    toggle: (id: string) => replace(snapshot.includes(id) ? snapshot.filter(item => item !== id) : [...snapshot, id]),
    replace: (ids: string[]) => replace(ids),
    clear: () => replace([]),
    setKnownIds: (ids: ReadonlySet<string>) => { knownIds = ids; replace(snapshot); },
  };
}

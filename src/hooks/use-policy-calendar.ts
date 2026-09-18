import { useSyncExternalStore } from "react";
import { hongKongDate } from "@/lib/calendar-date";

// One clock for all cards. Recheck after a background tab wakes and at HK midnight.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
function tick() {
  for (const listener of listeners) listener();
  clearTimeout(timer);
  if (listeners.size) {
    const next = Date.parse(`${hongKongDate()}T00:00:00+08:00`) + 86400000;
    timer = setTimeout(tick, Math.max(1000, next - Date.now() + 100));
  }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) { document.addEventListener("visibilitychange", tick); tick(); }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { clearTimeout(timer); document.removeEventListener("visibilitychange", tick); }
  };
}
const getSnapshot = () => hongKongDate();
const getServerSnapshot = () => "";
export function usePolicyCalendar() { return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot); }

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const snapshot = () => typeof window !== "undefined" && window.matchMedia(QUERY).matches;
const serverSnapshot = () => false;
function subscribe(changed: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", changed);
  return () => media.removeEventListener("change", changed);
}

/** React to a preference change while the page remains open. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

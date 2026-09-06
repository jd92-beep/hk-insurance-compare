/** A fulfilled write, not a completed attempt, is the criterion for success. */
export async function copyShareText(
  text: string,
  primary?: (value: string) => Promise<void>,
  fallback?: (value: string) => boolean,
): Promise<boolean> {
  if (primary) {
    try { await primary(text); return true; } catch { /* Optional legacy fallback below. */ }
  }
  try { return fallback?.(text) === true; } catch { return false; }
}

export function comparisonShareUrl(base: string, ids: readonly string[]): string {
  const url = new URL('/compare', base);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid share origin');
  const clean = [...new Set(ids.filter(id => /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$/.test(id)))].slice(0, 3);
  if (clean.length) url.searchParams.set('ids', clean.join(','));
  return url.href;
}

/** Last-resort compatibility only; failure falls back to a user-selectable URL. */
export function legacyCopyShareText(text: string): boolean {
  const active = document.activeElement;
  const selection = window.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.tabIndex = -1;
  field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;';
  try {
    document.body.appendChild(field); field.focus({ preventScroll: true }); field.select();
    return typeof document.execCommand === 'function' && document.execCommand('copy') === true;
  } finally {
    field.remove();
    if (active instanceof HTMLElement && active.isConnected) active.focus({ preventScroll: true });
    if (selection) { selection.removeAllRanges(); for (const range of ranges) selection.addRange(range); }
  }
}

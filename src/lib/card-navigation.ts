/**
 * Generic card navigation helper:
 * Enables clicking blank areas / card surface to navigate to the target detail page,
 * while strictly guarding interactive elements (buttons, links, inputs, etc.)
 * and text selection from triggering unintended card navigation.
 */

export const CARD_INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'details',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[data-prevent-card-click]',
].join(', ');

export interface CardNavigationOptions {
  /** Additional CSS selector to treat as interactive or prevent card navigation */
  ignoreSelector?: string;
  /** Custom window opener for modifier keys (Cmd/Ctrl + click) */
  openWindow?: (url: string, target?: string, features?: string) => WindowProxy | null | void;
  /** Custom getSelection provider (useful for testing or non-browser environments) */
  getSelection?: () => Selection | null | { toString(): string };
}

/**
 * Checks whether an event target is an interactive element that should handle its own events.
 */
export function isCardInteractiveTarget(
  target: unknown,
  additionalSelector?: string
): boolean {
  if (!target || typeof target !== 'object') return false;

  const selector = additionalSelector
    ? `${CARD_INTERACTIVE_SELECTOR}, ${additionalSelector}`
    : CARD_INTERACTIVE_SELECTOR;

  const element = (
    'closest' in target && typeof (target as { closest: unknown }).closest === 'function'
      ? (target as { closest: (s: string) => Element | null })
      : 'parentElement' in target && (target as { parentElement: unknown }).parentElement && typeof ((target as { parentElement: { closest?: unknown } }).parentElement?.closest) === 'function'
        ? ((target as { parentElement: { closest: (s: string) => Element | null } }).parentElement)
        : null
  );

  if (!element) return false;

  try {
    return element.closest(selector) !== null;
  } catch {
    return false;
  }
}

/**
 * Handles card surface click navigation.
 *
 * 1. Text Selection Guard: if user has selected text, abort navigation.
 * 2. Interactive Element Guard: if clicked inside an interactive element, allow default and abort card navigation.
 * 3. Modifier Keys: if Cmd/Ctrl is pressed, open in new tab.
 * 4. Default: trigger smooth SPA navigation via navigate(targetHref).
 *
 * @returns true if navigation was triggered (SPA or new window), false if guarded or aborted.
 */
export function handleCardClickNavigation(
  e: React.MouseEvent | MouseEvent | { target?: unknown; metaKey?: boolean; ctrlKey?: boolean; defaultPrevented?: boolean },
  targetHref: string,
  navigate: (to: string) => void,
  options: CardNavigationOptions = {}
): boolean {
  if (e.defaultPrevented) {
    return false;
  }

  // 1. Text Selection Guard
  const getSelectionFn = options.getSelection ?? (() => {
    if (typeof window !== 'undefined' && typeof window.getSelection === 'function') {
      return window.getSelection();
    }
    return null;
  });

  const selection = getSelectionFn();
  if (selection && selection.toString().trim().length > 0) {
    return false;
  }

  // 2. Interactive Element Guard
  if (isCardInteractiveTarget(e.target, options.ignoreSelector)) {
    return false;
  }

  // 3. Modifier key support (Cmd / Ctrl click opens new tab)
  if (e.metaKey || e.ctrlKey) {
    const opener = options.openWindow ?? (
      typeof window !== 'undefined' && typeof window.open === 'function'
        ? window.open.bind(window)
        : undefined
    );
    if (opener) {
      opener(targetHref, '_blank', 'noopener,noreferrer');
    }
    return true;
  }

  // 4. Default smooth SPA navigation
  navigate(targetHref);
  return true;
}

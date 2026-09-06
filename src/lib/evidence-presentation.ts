export const EVIDENCE_PREVIEW_LIMIT = 6;
/** Presentation only: keep original order and unknown rows, never rank or filter evidence. */
export function presentationRows<T>(rows: readonly T[], expanded: boolean): readonly T[] {
  return expanded ? rows : rows.slice(0, EVIDENCE_PREVIEW_LIMIT);
}

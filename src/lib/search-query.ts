/** Search is lexical, never a coverage or insurer identity inference. */
const normalize = (text: string) => text.normalize("NFKC").toLowerCase();
const compact = (text: string) => normalize(text).replace(/[\s\-‐‑‒–—]+/gu, "");
export function matchesSearchQuery(text: string, query: string): boolean {
  const terms = normalize(query).trim().split(/\s+/u).filter(Boolean);
  const target = compact(text);
  return terms.every(term => target.includes(compact(term)));
}

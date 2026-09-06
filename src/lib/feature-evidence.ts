import type { Product } from "../types/insurance";
export type FeatureEvidence = { matched: boolean; matchedKeyword?: string; status: "summary-match" | "excluded-or-conditional" | "unknown" };
const negative = /不(?:保(?:障)?|受保|涵蓋|包括|承保|賠償|適用|提供|支援|包含)|未(?:涵蓋|包括)|not\s+(?:covered|included|available)|exclud(?:e[ds]?|ing)|no\s+cover/i;
const unknown = /待(?:確認|核實|覆核)|未(?:提供|確認|列明)|資料不足|需(?:查詢|確認)|subject to confirmation|\btbc\b|\bn\/?a\b/i;
const normalize = (s: string) => s.normalize("NFKC").toLowerCase();
/** Conservative summary matching. This is not policy interpretation or suitability advice. */
export function assessFeature(product: Product, keywords: string[]): FeatureEvidence {
  const terms = keywords.map(k => k.trim()).filter(Boolean);
  const relevant = (s: string) => terms.some(k => normalize(s).includes(normalize(k)));
  if ((product.exclusions ?? []).some(relevant)) return { matched: false, status: "excluded-or-conditional" };
  const rows = (product.coverage ?? []).filter(c => relevant(`${c.item} ${c.limit}`));
  if (rows.some(c => negative.test(`${c.item} ${c.limit}`))) return { matched: false, status: "excluded-or-conditional" };
  for (const c of rows) {
    const text = `${c.item} ${c.limit}`;
    if (!c.limit?.trim() || unknown.test(text)) continue;
    if (/^(?:HK\$|HKD|\$)?\s*0(?:\.0+)?\s*$/i.test(c.limit) && !/自負額|墊底費|deductible|excess/i.test(c.item)) continue;
    return { matched: true, matchedKeyword: terms.find(k => normalize(text).includes(normalize(k))), status: "summary-match" };
  }
  const keyTerms = (product.key_terms ?? []).filter(relevant);
  if (keyTerms.some(t => negative.test(t))) return { matched: false, status: "excluded-or-conditional" };
  const text = keyTerms.find(t => !unknown.test(t));
  if (text) return { matched: true, matchedKeyword: terms.find(k => normalize(text).includes(normalize(k))), status: "summary-match" };
  // A plan's marketing name alone cannot establish a benefit.
  return { matched: false, status: "unknown" };
}

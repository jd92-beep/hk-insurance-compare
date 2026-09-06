import type { Product } from "../types/insurance";

export type FeatureEvidence = {
  matched: boolean;
  matchedKeyword?: string;
  status: "summary-match" | "excluded-or-conditional" | "unknown";
};
const normalize = (text: string) => text.normalize("NFKC").toLowerCase();
const negative = /不(?:保(?:障)?|受保|涵蓋|包括|承保|賠償|適用|提供|支援|包含)|未(?:涵蓋|包括)|\bnot\s+(?:covered|insured|included|available|applicable)|\b(?:does|do)\s+not\s+(?:cover|insure)|\bexclud(?:e[ds]?|ing)|\bno\s+cover(?:age)?\b|\bnon[\s-]*cfar\b/i;
const unknown = /待(?:確認|核實|覆核)|未(?:提供|確認|列明)|資料不足|需(?:查詢|確認)|subject to confirmation|\btbc\b|\bn\/?a\b/i;
const zero = /^(?:hk\$|hkd|\$)?\s*0(?:\.0+)?\s*$/i;
const deductible = /自負額|墊底費|deductible|excess/i;

/**
 * A strong term in a legacy OR-keyword list must not be diluted by generic synonyms.
 * Keep the caller API/catalog stable; standalone reimbursement searches remain valid.
 */
export function featureSearchTerms(keywords: string[]): string[] {
  const terms = [...new Set(keywords.map(term => normalize(term.trim())).filter(Boolean))];
  if (terms.includes("cfar")) return ["因任何原因取消", "任何原因取消", "cancel for any reason", "cfar"];
  if (terms.includes("全數賠償") || terms.includes("零自負額")) {
    return terms.filter(term => !["實報實銷", "100%實報實銷", "不設分項"].includes(term));
  }
  return terms;
}
function contains(text: string, term: string): boolean {
  // Acronyms are whole tokens: a marketing string such as 'notcfar' is not CFAR.
  if (term === "cfar") return /(?:^|[^a-z0-9])cfar(?:$|[^a-z0-9])/.test(text);
  return text.includes(term);
}

/** Conservative lexical evidence, never an underwriting or coverage certification. */
export function assessFeature(product: Product, keywords: string[]): FeatureEvidence {
  const terms = featureSearchTerms(keywords);
  if (!terms.length) return { matched: false, status: "unknown" };
  // Broader catalog terms may describe restrictions even when they cannot prove the benefit.
  const restrictionTerms = [...new Set([...terms, ...keywords.map(term => normalize(term.trim())).filter(Boolean)])];
  const relevant = (text: string) => restrictionTerms.some(term => contains(normalize(text), term));
  const positive = (text: string) => terms.some(term => contains(normalize(text), term));
  const rows = (product.coverage ?? []).filter(row => relevant(`${row.item} ${row.limit}`));
  const keyTerms = (product.key_terms ?? []).filter(relevant).map(normalize);
  const statements = [...rows.map(row => normalize(`${row.item} ${row.limit}`)), ...keyTerms];

  // Inspect every relevant field before returning a positive row. Order cannot hide conflicts.
  if ((product.exclusions ?? []).some(relevant) || statements.some(text => negative.test(text)) ||
      rows.some(row => zero.test(normalize(row.limit ?? "")) && !deductible.test(normalize(row.item)))) {
    return { matched: false, status: "excluded-or-conditional" };
  }
  if (statements.some(text => unknown.test(text))) return { matched: false, status: "unknown" };

  const row = rows.find(item => positive(`${item.item} ${item.limit}`) &&
    (item.limit?.trim() || /無上限|不設上限|unlimited/i.test(normalize(item.item))));
  const text = row ? normalize(`${row.item} ${row.limit}`) : keyTerms.find(positive);
  if (text) return { matched: true, matchedKeyword: terms.find(term => contains(text, term)), status: "summary-match" };
  // Plan/marketing names alone are not evidence. Missing is not the same as excluded.
  return { matched: false, status: "unknown" };
}

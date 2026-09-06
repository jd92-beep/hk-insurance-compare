import type { Product } from "../types/insurance";
import type { FeatureFilterTag, FeatureMatchResult, FeatureMatchMode } from "./feature-filters";

export interface ComparableLimit { value: number; scope: string; currency: "HKD" }
/** Fail closed: ranges, mixed benefits and conditional caps are not comparable scalar limits. */
export function parseComparableLimit(raw?: string): ComparableLimit | null {
  if (!raw) return null;
  const text = raw.normalize("NFKC").trim();
  if (/USD|US\$|RMB|CNY|EUR|無上限|全數|全額|實報實銷|自負|墊底|共同保險|%|以較|另加|不保|不受保|不適用/i.test(text)) return null;
  const money = [...text.matchAll(/(?:HK\$|HKD|港幣|港元)\s*(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?\s*(萬|億)?/gi)];
  if (money.length !== 1) return null;
  const m = money[0];
  const rest = text.slice(0, m.index) + text.slice(m.index! + m[0].length);
  if (/\d|[–—~～]|\b(?:or|up to)\b|或|至/i.test(rest)) return null;
  const value = Number(m[1].replaceAll(",", "") + (m[2] ?? "")) * (m[3] === "億" ? 100_000_000 : m[3] === "萬" ? 10_000 : 1);
  if (!Number.isFinite(value) || value <= 0) return null;
  const scopes = [
    [/每日|每天|[/／]日|per day|daily/i, "day"],
    [/每年|每保單年度|年度|per year|annual/i, "year"],
    [/終身|lifetime/i, "lifetime"],
    [/每次旅程|每旅程|per trip|per journey/i, "trip"],
    [/每宗|每次事故|per incident|per occurrence/i, "incident"],
    [/每次診症|每次門診|per visit/i, "visit"],
  ] as const;
  const periods = scopes.filter(([pattern]) => pattern.test(rest)).map(([, scope]) => scope);
  if (periods.length > 1) return null;
  const person = /每人|per person/i.test(rest) ? ":person" : "";
  // Reject unexplained prose: it may encode a sublimit, rider or eligibility condition.
  let remaining = rest;
  for (const [pattern] of scopes) remaining = remaining.replace(new RegExp(pattern.source, "gi"), "");
  remaining = remaining.replace(/每人|per person|上限|最高|限額|保障額|賠償額|maximum|limit|[\s()（）:：,，。/／]/gi, "");
  if (remaining) return null;
  return { value, scope: `${periods[0] ?? "unspecified"}${person}`, currency: "HKD" };
}

export type EvidenceStatus = "mentioned" | "conditional" | "excluded" | "unknown";
export interface FeatureEvidence { status: EvidenceStatus; text?: string; keyword?: string; sourceUrl?: string }
const NARROW: Record<string, string[]> = {
  "full-cover": ["全數賠償", "全額賠償", "零自負額", "full cover", "zero deductible"],
  "rental-car": ["租車", "租賃車輛", "rental car", "rental vehicle"],
  "trip-cancel-cfar": ["任何原因取消", "因任何不可預見私事取消", "cancel for any reason", "cfar"],
};
const NEGATIVE = /不受保|不保障|不保(?:障)?|不涵蓋|不包括|不賠|不提供|不適用|未有保障|除外|not covered|not included|not available|no cover|excluded|excludes/i;

/** A mention is a search result, NOT a verified coverage or suitability assertion. */
export function assessFeature(product: Product, tag: FeatureFilterTag): FeatureEvidence {
  const keywords = (NARROW[tag.id] ?? tag.keywords).filter(k => k.trim());
  const exclusions = (product.exclusions ?? []).filter(text => keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase())));
  const rows = [
    ...(product.coverage ?? []).map(row => ({ text: `${row.item}：${row.limit}`, sourceUrl: row.source_url })),
    ...(product.key_terms ?? []).map(text => ({ text, sourceUrl: undefined })),
  ];
  let negative: FeatureEvidence | undefined;
  let positive: FeatureEvidence | undefined;
  for (const row of rows) {
    for (const kw of keywords) {
      const index = row.text.toLowerCase().indexOf(kw.toLowerCase());
      if (index < 0) continue;
      const context = row.text.slice(Math.max(0, index - 24), index + kw.length + 55);
      if (NEGATIVE.test(context)) { negative = { status: "excluded", text: row.text, keyword: kw }; continue; }
      positive ??= { status: "mentioned", text: row.text, keyword: kw, sourceUrl: row.sourceUrl };
    }
  }
  if (positive && (negative || exclusions.length)) return { ...positive, status: "conditional", text: `${positive.text}；需核對：${negative?.text ?? exclusions[0]}` };
  return positive ?? negative ?? (exclusions.length ? { status: "excluded", text: exclusions[0] } : { status: "unknown" });
}

/** Remove claims that the legacy keywords cannot establish. */
export function safeFeatureTags(tags: FeatureFilterTag[]): FeatureFilterTag[] {
  const labels: Record<string, string> = {
    "full-cover": "全數賠償／零自負額相關條款",
    "trip-cancel-cfar": "任何原因取消（CFAR）相關條款",
    "emergency-evac": "緊急醫療運送／遺體送返",
    "flight-delay": "航班延誤（起賠時數需核對）",
    "senior-friendly": "長者受保（年齡及限額需核對）",
    "sports-cover": "運動保障（活動限制需核對）",
    "revisit-chinese-med": "回港覆診／中醫相關條款",
  };
  return tags.map(tag => ({ ...tag, label: labels[tag.id] ?? tag.label, keywords: NARROW[tag.id] ?? tag.keywords }));
}

export interface NeedsMatch extends FeatureMatchResult { evidence: { tag: FeatureFilterTag; assessment: FeatureEvidence }[] }
export function rankByNeeds(products: Product[], tags: FeatureFilterTag[], selected: string[], mode: FeatureMatchMode = "smart") {
  const selectedIds = new Set(selected);
  const chosen = tags.filter(tag => selectedIds.has(tag.id));
  const results = products.map(product => {
    const evidence = chosen.map(tag => ({ tag, assessment: assessFeature(product, tag) }));
    const matched = evidence.filter(e => e.assessment.status === "mentioned");
    const ratio = chosen.length ? matched.length / chosen.length : 0;
    const match: NeedsMatch = {
      score: Math.round(ratio * 100), matchRatio: ratio, matchedCount: matched.length, totalSelected: chosen.length,
      matchedTags: matched.map(e => e.tag), missingTags: evidence.filter(e => e.assessment.status !== "mentioned").map(e => e.tag),
      matchedKeywords: matched.map(e => e.assessment.keyword ?? ""), evidence,
    };
    return { product, match };
  }).sort((a, b) => b.match.matchedCount - a.match.matchedCount);
  const exact = chosen.length ? results.filter(row => row.match.matchedCount === chosen.length) : results;
  return {
    results: mode === "strict" && exact.length ? exact : results,
    exactMatchCount: exact.length, totalSelected: chosen.length,
    fallbackTriggered: chosen.length > 0 && exact.length === 0 && mode === "strict",
  };
}

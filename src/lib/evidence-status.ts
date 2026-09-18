import type { CoverageItem, Product } from "../types/insurance";

export type CoverageEvidenceStatus =
  | "complete"
  | "partial"
  | "missing-source"
  | "missing-quote"
  | "missing-page"
  | "missing";

export interface CoverageEvidenceFlags {
  hasSource: boolean;
  hasQuote: boolean;
  hasPage: boolean;
  hasDocument: boolean;
}

export function coverageEvidenceFlags(row: CoverageItem): CoverageEvidenceFlags {
  return {
    hasSource: Boolean(typeof row.source_url === "string" && row.source_url.trim()),
    hasQuote: Boolean(typeof row.quote === "string" && row.quote.trim()),
    hasPage: typeof row.page === "number" && Number.isSafeInteger(row.page) && row.page > 0,
    hasDocument: Boolean(typeof row.document_name === "string" && row.document_name.trim()),
  };
}

/** Mechanical field presence only — never suitability, currency, or underwriting proof. */
export function coverageEvidenceStatus(row: CoverageItem): CoverageEvidenceStatus {
  const flags = coverageEvidenceFlags(row);
  if (flags.hasSource && flags.hasQuote && flags.hasPage) return "complete";
  if (!flags.hasSource && !flags.hasQuote && !flags.hasPage) return "missing";
  if (!flags.hasSource) return "missing-source";
  if (!flags.hasQuote) return "missing-quote";
  return "partial";
}

export interface ProductEvidenceSummary {
  total: number;
  complete: number;
  partial: number;
  missing: number;
  missingSource: number;
  missingQuote: number;
  missingPage: number;
  /** Share of coverage rows with source + quote + page fields present (0–1). */
  completeRatio: number;
  freshnessLabel: string;
}

export function productEvidenceSummary(product: Product): ProductEvidenceSummary {
  const rows = product.coverage ?? [];
  let complete = 0, partial = 0, missing = 0, missingSource = 0, missingQuote = 0, missingPage = 0;
  for (const row of rows) {
    const status = coverageEvidenceStatus(row);
    const flags = coverageEvidenceFlags(row);
    if (status === "complete") complete += 1;
    else if (status === "missing") missing += 1;
    else partial += 1;
    if (!flags.hasSource && status !== "complete") missingSource += 1;
    if (!flags.hasQuote && status !== "complete") missingQuote += 1;
    if (!flags.hasPage && status !== "complete") missingPage += 1;
  }
  return {
    total: rows.length,
    complete,
    partial,
    missing,
    missingSource,
    missingQuote,
    missingPage,
    completeRatio: rows.length ? complete / rows.length : 0,
    freshnessLabel: "內容最新性：未核實",
  };
}

export const EVIDENCE_STATUS_LABEL: Record<CoverageEvidenceStatus, string> = {
  complete: "來源欄位較齊（未等於已核實）",
  partial: "來源欄位不完整",
  "missing-source": "未提供來源",
  "missing-quote": "未提供摘錄",
  "missing-page": "未提供頁碼",
  missing: "來源欄位缺失",
};

/**
 * Compact neutral chip copy for compare surfaces.
 * Reports mechanical field presence only — never verification, suitability, or currency.
 */
export function evidenceChipLabel(summary: { complete: number; total: number }): string {
  if (summary.total <= 0) return "來源欄位：未提供 · 最新性未核實";
  return `來源欄位：${summary.complete}/${summary.total} 較齊 · 最新性未核實`;
}

/** True when selected products span more than one insurance category. */
export function spansMultipleCategories(products: ReadonlyArray<{ category: string }>): boolean {
  return new Set(products.map((p) => p.category)).size > 1;
}

/** True when any selected product lists more than one plan tier in the site snapshot. */
export function hasMultiplePlanTiers(
  products: ReadonlyArray<{ plan_tiers?: ReadonlyArray<string> | null }>,
): boolean {
  return products.some((p) => (p.plan_tiers ?? []).length > 1);
}

/** Same honesty bar as comparison-export: cross-category rows are not a shared ranking basis. */
export const CROSS_CATEGORY_COMPARE_NOTICE =
  "所選產品屬不同保險類別，不可按同一保額或保費直接排名；請分開核對保障範圍、計劃層級及條款。";

export const MULTI_TIER_COMPARE_NOTICE =
  "產品可能有多個計劃層級；網站摘要未必對應同一層級，請核對原文。";

/** Footer basis note: glossary link target plus the field-presence ≠ policy-truth reminder. */
export const COMPARE_GLOSSARY_NOTE =
  "術語請對照投保指南・詞彙。來源欄位較齊唔等於保單內容已核實或適合投保；一切以官方最新條款為準。";

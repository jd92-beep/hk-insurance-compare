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

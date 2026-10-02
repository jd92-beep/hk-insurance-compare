import type { Product } from "@/types/insurance";
import { isReferenceOnlyProduct } from "./product-availability.ts";

/**
 * Annual-premium spectrum per category, read strictly from each product's `premium_range` snapshot text.
 * Only amounts explicitly stated per year (or per month, ×12) count. Sums insured, deductibles, per-day / per-trip
 * prices and multi-year terms are ignored; products without a published premium (premium_available !== true) or
 * whose text has no such amount stay unplaced — nothing is
 * estimated. Examples in the text use different ages, sums insured and deductibles, so this is an order-of-magnitude
 * view, not a quote.
 */

export interface AnnualRange {
  min: number;
  max: number;
  /** some amounts were monthly figures ×12 */
  monthly: boolean;
}

type Period = "year" | "month" | "other";

const MONEY = /(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)(?:\s*(?:–|-|—|~|至)\s*(?:HK\$|HKD|\$)?\s*([\d,]+(?:\.\d+)?))?/g;

/** keyword → period, nearest one before an amount inside its clause wins */
const KEYWORDS: [RegExp, Period][] = [
  [/[2-9]\s*年期?|兩年/g, "other"],
  [/每年|年繳|全年|年費|1\s*年期?|一年/g, "year"],
  [/每月|月繳/g, "month"],
  [/每日|每天|每程|單次|日旅程|天\s*$/g, "other"],
];

function num(s: string): number {
  return parseFloat(s.replace(/,/g, ""));
}

function periodAfter(after: string): Period | null {
  const term = after.match(/^\s*[（(]\s*(\d)\s*年/);
  if (term) return term[1] === "1" && !/[2-9]\s*年/.test(after) ? "year" : "other";
  if (/^\s*(?:起)?\s*(?:\/|每)\s*月/.test(after)) return "month";
  if (/^\s*(?:起)?\s*(?:\/|每)\s*年/.test(after)) return "year";
  if (/^\s*(?:起)?\s*(?:\/|每)\s*(?:日|天|程)/.test(after)) return "other";
  return null;
}

function periodBefore(clause: string): Period | null {
  let best: { at: number; p: Period } | null = null;
  for (const [re, p] of KEYWORDS) {
    for (const m of clause.matchAll(re)) {
      if (!best || m.index! >= best.at) best = { at: m.index!, p };
    }
  }
  return best?.p ?? null;
}

/** annual amounts stated in a premium text (monthly ×12); null when none can be read safely */
export function annualRangeFromText(text: string | null | undefined): AnnualRange | null {
  if (!text) return null;
  const values: number[] = [];
  let monthly = false;
  for (const m of text.matchAll(MONEY)) {
    const start = m.index!;
    const end = start + m[0].length;
    const before = text.slice(Math.max(0, start - 14), start);
    const after = text.slice(end, end + 10);
    // not a premium: sum insured, deductible, "萬" amounts, or a label like "HK$16,000約HK$648/月"
    if (/(?:保額|保障額|自付費|自付額|墊底|免賠額?)\s*$/.test(before)) continue;
    // add-on prices ("額外隨行兒童 HK$730-900") are not the plan premium
    if (/(?:額外|另加|附加)[^；;。、]{0,8}$/.test(before)) continue;
    if (/^\s*(?:萬|保額|保障額|自付|約\s*(?:HK\$|HKD|\$))/.test(after)) continue;
    // clause = text since the last separator (or the previous amount)
    const clauseStart = Math.max(...["；", ";", "。", "、"].map((sep) => text.lastIndexOf(sep, start)));
    const clause = text.slice(clauseStart + 1, start);
    const period = periodAfter(after) ?? periodBefore(clause);
    if (period !== "year" && period !== "month") continue;
    const k = period === "month" ? 12 : 1;
    if (period === "month") monthly = true;
    const a = num(m[1]);
    const b = m[2] ? num(m[2]) : null;
    for (const v of [a, b]) if (v != null && Number.isFinite(v) && v > 0) values.push(Math.round(v * k));
  }
  if (!values.length) return null;
  return { min: Math.min(...values), max: Math.max(...values), monthly };
}

export interface SpectrumEntry {
  product: Product;
  range: AnnualRange;
}

export interface CategorySpectrum {
  categoryId: string;
  entries: SpectrumEntry[];
  /** comparable products whose text has no readable annual amount */
  unplaced: Product[];
  min: number;
  max: number;
}

export function categorySpectrum(categoryId: string, products: Product[]): CategorySpectrum | null {
  const pool = products.filter((p) => p.category === categoryId && p.record_status !== "archived" && !isReferenceOnlyProduct(p));
  const entries: SpectrumEntry[] = [];
  const unplaced: Product[] = [];
  for (const p of pool) {
    const range = p.premium_available === true ? annualRangeFromText(p.premium_range) : null;
    if (range) entries.push({ product: p, range });
    else unplaced.push(p);
  }
  if (!entries.length) return null;
  entries.sort((a, b) => a.range.min - b.range.min || a.range.max - b.range.max);
  return {
    categoryId,
    entries,
    unplaced,
    min: Math.min(...entries.map((e) => e.range.min)),
    max: Math.max(...entries.map((e) => e.range.max)),
  };
}

/** 0..1 position on a log scale (premiums span orders of magnitude) */
export function spectrumPos(v: number, min: number, max: number): number {
  if (max <= min) return 0.5;
  const lo = Math.log(min);
  const hi = Math.log(max);
  return Math.min(1, Math.max(0, (Math.log(v) - lo) / (hi - lo)));
}

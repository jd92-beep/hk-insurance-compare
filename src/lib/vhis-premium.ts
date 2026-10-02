import type { Product } from "@/types/insurance";

/**
 * Premium range for a VHIS *standard plan* row, taken from the site snapshot only when the matched
 * product's premium text states a standard-plan figure in an explicit, comparable form.
 * Anything else (flexi tiers, market quotes, promos, mixed units) returns null → link to the official table.
 */
export interface VhisPremiumRange {
  min: number;
  max: number;
  per: "年" | "月";
  /** e.g. "30歲 · 男／女" */
  basis: string;
  productId: string;
}

const YEARLY = /標準計劃年繳保費（(\d+)歲）：男性約\s?HK\$([\d,]+)／女性約\s?HK\$([\d,]+)/;
const MONTHLY = /標準計劃：(\d+)歲[^；;]*?男性約\s?HK\$([\d,.]+)\/月、女性約\s?HK\$([\d,.]+)\/月/;

const num = (s: string) => Number(s.replace(/,/g, ""));

export function parseStandardPremium(text: string): Omit<VhisPremiumRange, "productId"> | null {
  const y = YEARLY.exec(text);
  const m = y ? null : MONTHLY.exec(text);
  const hit = y ?? m;
  if (!hit) return null;
  const a = num(hit[2]);
  const b = num(hit[3]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { min: Math.min(a, b), max: Math.max(a, b), per: y ? "年" : "月", basis: `${hit[1]}歲 · 男／女` };
}

/** Exact match only: the product record must cite this certification number. */
export function standardPlanPremium(certBase: string, products: Product[]): VhisPremiumRange | null {
  if (!certBase) return null;
  for (const p of products) {
    if (p.category !== "medical" || !p.premium_available) continue;
    if (!JSON.stringify(p).includes(certBase)) continue;
    const r = parseStandardPremium(p.premium_range ?? "");
    if (r) return { ...r, productId: p.id };
  }
  return null;
}

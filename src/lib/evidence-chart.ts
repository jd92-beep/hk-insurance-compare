import type { Product } from "../types/insurance";
import { comparableAmount } from "./comparable-amount.ts";
import type { ComparableAmount } from "./comparable-amount.ts";

export type LimitStatus = "numeric" | "unlimited" | "unscoped" | "unsupported" | "ambiguous" | "missing";
export interface MetricChoice { key: string; label: string; productCount: number }
export interface LimitRow {
  productId: string; productName: string; insurer: string; coverageIndex: number | null;
  raw: string; status: LimitStatus; amount: ComparableAmount | null;
}
export interface LimitGroup { basis: ComparableAmount["basis"]; scopeKey: string; scopeLabel: string; rows: LimitRow[]; maximum: number }
const labelKey = (value: string) => value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();

/** Match exactly named summary fields; never infer equivalent benefits by fuzzy text. */
export function metricChoices(products: Product[]): MetricChoice[] {
  const choices = new Map<string, MetricChoice>();
  for (const product of products) {
    const seen = new Set<string>();
    for (const row of product.coverage ?? []) {
      const key = labelKey(row.item || "");
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const choice = choices.get(key);
      if (choice) choice.productCount++;
      else choices.set(key, { key, label: row.item.trim(), productCount: 1 });
    }
  }
  return [...choices.values()].sort((a, b) => b.productCount - a.productCount || a.label.localeCompare(b.label, "zh-HK"));
}

export function limitRows(products: Product[], metric: string): LimitRow[] {
  const key = labelKey(metric);
  return products.map(product => {
    const matching = (product.coverage ?? []).map((row, index) => ({ row, index })).filter(({ row }) => key && labelKey(row.item || "") === key);
    const base = { productId: product.id, productName: product.product_name_zh || product.product_name, insurer: product.insurer_zh || product.insurer };
    if (!matching.length) return { ...base, coverageIndex: null, raw: "未列出此項摘要", status: "missing", amount: null };
    if (matching.length !== 1) return { ...base, coverageIndex: null, raw: matching.map(({ row }) => row.limit || "未提供限額").join("；"), status: "ambiguous", amount: null };
    const { row, index } = matching[0];
    const raw = row.limit?.trim() || "未提供限額";
    const common = { ...base, coverageIndex: index, raw };
    if (/無上限|不設上限|unlimited/i.test(raw)) return { ...common, status: "unlimited", amount: null };
    const amount = comparableAmount(raw);
    if (!amount) return { ...common, status: "unsupported", amount: null };
    if (amount.basis === "unspecified" || amount.basis === "event") return { ...common, status: "unscoped", amount: null };
    return { ...common, status: "numeric", amount };
  });
}

/** Each panel has one explicit HKD scope. Keep source order; larger is not 'best'. */
export function limitGroups(rows: LimitRow[]): LimitGroup[] {
  const groups = new Map<string, LimitRow[]>();
  for (const row of rows) {
    if (row.status !== "numeric" || !row.amount || !row.amount.scopeKey) continue;
    const list = groups.get(row.amount.scopeKey) ?? [];
    list.push(row); groups.set(row.amount.scopeKey, list);
  }
  return [...groups.entries()].filter(([, members]) => members.length >= 2).map(([scopeKey, members]) => ({
    basis: members[0].amount!.basis, scopeKey, scopeLabel: members[0].amount!.scopeLabel, rows: members, maximum: Math.max(...members.map(row => row.amount!.value)),
  }));
}

export function limitBarPercent(value: number, maximum: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0 || value < 0) return 0;
  return Math.min(100, value / maximum * 100);
}

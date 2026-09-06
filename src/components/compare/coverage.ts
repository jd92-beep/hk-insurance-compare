import { comparableAmount, comparableBest } from "../../lib/comparable-amount.ts";
import type { Product } from "@/types/insurance";

/**
 * 保障項目聯集（compare.md S3 組 2）：
 * 先出現於多數產品嘅項目排前；相同出現次數就按首次出現次序。
 */
export function unionCoverageItems(products: Product[]): string[] {
  const count = new Map<string, number>();
  const firstSeen = new Map<string, number>();
  let order = 0;
  for (const p of products) {
    const seenInProduct = new Set<string>();
    for (const c of p.coverage ?? []) {
      if (!firstSeen.has(c.item)) {
        firstSeen.set(c.item, order);
        order += 1;
      }
      if (!seenInProduct.has(c.item)) {
        seenInProduct.add(c.item);
        count.set(c.item, (count.get(c.item) ?? 0) + 1);
      }
    }
  }
  return [...firstSeen.keys()].sort((a, b) => {
    const diff = (count.get(b) ?? 0) - (count.get(a) ?? 0);
    if (diff !== 0) return diff;
    return (firstSeen.get(a) ?? 0) - (firstSeen.get(b) ?? 0);
  });
}

/** 搵出產品某保障項目嘅 limit 原文（無 → undefined） */
export function coverageLimit(product: Product, item: string): string | undefined {
  return product.coverage?.find((c) => c.item === item)?.limit;
}

/** Unsupported ranges, currencies or ambiguous units deliberately remain unknown. */
export function parseLimitValue(limit: string | undefined): number | null {
  return comparableAmount(limit)?.value ?? null;
}
export function bestValueColumnsFromLimits(limits: (string | undefined)[], label = ""): Set<number> {
  return comparableBest(limits, label);
}
export function bestValueColumns(products: Product[], item: string): Set<number> {
  return bestValueColumnsFromLimits(products.map(p => coverageLimit(p, item)), item);
}

/** 保費公開狀態各欄唔一致 → 該行淡 amber 提示（compare.md S3 組 1 差異高亮） */
export function premiumStatusDiffers(products: Product[]): boolean {
  if (products.length < 2) return false;
  const first = products[0]?.premium_available;
  return products.some((p) => p.premium_available !== first);
}

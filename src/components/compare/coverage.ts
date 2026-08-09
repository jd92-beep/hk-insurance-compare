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

/**
 * 由 limit 原文解析 HK$ 金額上限（例如「HK$600,000–1,500,000」→ 1500000）。
 * 字串無「HK$」→ 無法解析 → null（唔參與最優高亮）。
 */
export function parseLimitValue(limit: string | undefined): number | null {
  if (!limit || !limit.includes("HK$")) return null;
  const matches = limit.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
  const values = matches
    .map((m) => parseFloat(m.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (values.length === 0) return null;
  return Math.max(...values);
}

/**
 * 最優高亮（limits 陣列版）：可解析出 HK$ 上限嘅欄位之中，搵出最高值嘅欄位 index。
 * 要少於 2 個可解析欄位、或者全部數值一樣 → 唔高亮（避免誤導）。
 */
export function bestValueColumnsFromLimits(limits: (string | undefined)[]): Set<number> {
  const values = limits.map((l) => parseLimitValue(l));
  const parseable = values.filter((v): v is number => v !== null);
  if (parseable.length < 2) return new Set();
  const max = Math.max(...parseable);
  const min = Math.min(...parseable);
  if (max === min) return new Set();
  const best = new Set<number>();
  values.forEach((v, i) => {
    if (v === max) best.add(i);
  });
  return best;
}

/**
 * 最優高亮：同一行可解析出 HK$ 上限嘅欄位之中，搵出最高值嘅欄位 index。
 * 要少於 2 個可解析欄位、或者全部數值一樣 → 唔高亮（避免誤導）。
 */
export function bestValueColumns(products: Product[], item: string): Set<number> {
  return bestValueColumnsFromLimits(products.map((p) => coverageLimit(p, item)));
}

/** 保費公開狀態各欄唔一致 → 該行淡 amber 提示（compare.md S3 組 1 差異高亮） */
export function premiumStatusDiffers(products: Product[]): boolean {
  if (products.length < 2) return false;
  const first = products[0]?.premium_available;
  return products.some((p) => p.premium_available !== first);
}

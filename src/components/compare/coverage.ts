import { parseComparableLimit } from "../../lib/comparison-safety.ts";
import type { Product } from "@/types/insurance";

/** 保障項目聯集：多數產品有列出的項目排前，其餘按首次出現次序。 */
export function unionCoverageItems(products: Product[]): string[] {
  const count = new Map<string, number>();
  const firstSeen = new Map<string, number>();
  let order = 0;
  for (const p of products) {
    const seenInProduct = new Set<string>();
    for (const c of p.coverage ?? []) {
      if (!firstSeen.has(c.item)) { firstSeen.set(c.item, order); order += 1; }
      if (!seenInProduct.has(c.item)) {
        seenInProduct.add(c.item); count.set(c.item, (count.get(c.item) ?? 0) + 1);
      }
    }
  }
  return [...firstSeen.keys()].sort((a, b) => {
    const diff = (count.get(b) ?? 0) - (count.get(a) ?? 0);
    return diff || (firstSeen.get(a) ?? 0) - (firstSeen.get(b) ?? 0);
  });
}
export function coverageLimit(product: Product, item: string): string | undefined {
  return product.coverage?.find(c => c.item === item)?.limit;
}
/** Only a single unambiguous HKD amount; never a range or arbitrary maximum digit. */
export function parseLimitValue(limit: string | undefined): number | null {
  return parseComparableLimit(limit)?.value ?? null;
}
/** All columns must have the same explicit period/currency before comparing maxima. */
export function bestValueColumnsFromLimits(limits: (string | undefined)[]): Set<number> {
  const parsed = limits.map(parseComparableLimit);
  if (parsed.length < 2 || parsed.some(value => !value || value.scope.startsWith("unspecified"))) return new Set();
  const first = parsed[0]!;
  if (parsed.some(value => value!.scope !== first.scope || value!.currency !== first.currency)) return new Set();
  const values = parsed.map(value => value!.value);
  const max = Math.max(...values);
  if (max === Math.min(...values)) return new Set();
  return new Set(values.flatMap((value, index) => value === max ? [index] : []));
}
export function bestValueColumns(products: Product[], item: string): Set<number> {
  return bestValueColumnsFromLimits(products.map(p => coverageLimit(p, item)));
}
export function premiumStatusDiffers(products: Product[]): boolean {
  if (products.length < 2) return false;
  const first = products[0]?.premium_available;
  return products.some(p => p.premium_available !== first);
}

import type { Product } from "../types/insurance";
export const AIG_TRAVEL_NOTICE = {
  checkedAt: "2026-09-06",
  source: "https://www.aig.com.hk/personal/travel-insurance",
  text: "AIG 官方指由 2026-01-01 起停止直接、旅行社及航空公司旅保銷售渠道，Travelwise 不可續保；指定代理／經紀仍有其他旅保渠道。此記錄保留作歷史條款參考，唔係現行直接投保選項。",
} as const;
export function purchaseUrl(product: Product): string | undefined {
  if (product.id === "travel-aig") return undefined;
  const candidate = product.official_buy_url || product.promo?.buy_url;
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && !url.username && !url.password && !/\.pdf$/i.test(url.pathname) ? url.href : undefined;
  } catch { return undefined; }
}

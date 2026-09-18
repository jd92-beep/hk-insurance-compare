import type { Product } from "../types/insurance";
import { purchaseUrl } from "./product-availability.ts";
import { calendarDate, hongKongDate, pastOrToday } from "./calendar-date.ts";

export const PREMIUM_SNAPSHOT_DISCLAIMER =
  "保費要按年齡、計劃、保障期及自付費重新報價。本站唔提供即時報價，優惠仍須到官網確認。";
export const PROMO_REFERENCE_LABEL = "優惠未核實，請向保險公司確認";

export interface PriceDisplay {
  originalPrice?: number;
  discountedPrice?: number;
  hasDiscount: boolean;
  isReferencePrice: boolean;
  discountLabel: string;
  disclaimer: string;
  buyLabel: "往官方網站核對" | null;
  buyUrl?: string;
}

/**
 * Snapshot amounts have no verified common quote basis. Do not strike through,
 * annualize or advertise these amounts as payable premiums. A dated campaign
 * may be displayed separately; that does not verify its example price.
 */
export function priceDisplay(product: Product): PriceDisplay {
  const buyUrl = purchaseUrl(product);
  return {
    hasDiscount: false,
    isReferencePrice: true,
    discountLabel: PROMO_REFERENCE_LABEL,
    disclaimer: PREMIUM_SNAPSHOT_DISCLAIMER,
    buyLabel: buyUrl ? "往官方網站核對" : null,
    buyUrl,
  };
}

export interface PromoDisplay {
  present: boolean;
  tag?: string;
  discount?: string;
  code?: string;
  note?: string;
  isReference: boolean;
  badgeLabel: string;
  disclaimer: string;
  sourceUrl?: string;
  validUntil?: string;
  reviewedAt?: string;
}

/** Fail closed when the campaign's dates, source, conditions or review are missing. */
export function promoDisplay(product: Product, now: Date = new Date()): PromoDisplay {
  const none: PromoDisplay = { present: false, isReference: true, badgeLabel: "", disclaimer: PREMIUM_SNAPSHOT_DISCLAIMER };
  const promo = product.promo;
  if (!promo || product.record_status === "archived" || product.record_status === "discontinued" || product.id === "travel-aig") return none;
  const start = calendarDate(promo.valid_from), end = calendarDate(promo.valid_until);
  const reviewed = pastOrToday(promo.reviewed_at, now), today = hongKongDate(now);
  if (!start || !end || !reviewed || start > end || start > today || end < today || reviewed < start || reviewed > end) return none;
  if (Date.parse(today) - Date.parse(reviewed) > 31 * 86400000 || !promo.conditions?.trim()) return none;
  let source: URL;
  try { source = new URL(promo.source_url ?? ""); } catch { return none; }
  if (source.protocol !== "https:" || source.username || source.password) return none;
  return {
    present: true, tag: promo.tag, discount: promo.discount, code: promo.code ?? undefined,
    note: `優惠至 ${end}（香港時間）。${promo.conditions} 檢視日期：${reviewed}；仍以官網最新條款為準。`,
    isReference: true, badgeLabel: promo.tag || "已記錄優惠條件（仍須確認）",
    disclaimer: PREMIUM_SNAPSHOT_DISCLAIMER, sourceUrl: source.href, validUntil: end, reviewedAt: reviewed,
  };
}

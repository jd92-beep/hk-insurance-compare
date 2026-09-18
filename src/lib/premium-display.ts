import type { Product } from "../types/insurance";
import { purchaseUrl } from "./product-availability.ts";

export const PREMIUM_SNAPSHOT_DISCLAIMER =
  "保費與優惠以保險公司官網即時結果為準；本站快照僅供參考，唔係可投保報價。";

export const PROMO_REFERENCE_LABEL = "參考優惠（期限／資格未全面核實）";

export interface PriceDisplay {
  originalPrice?: number;
  discountedPrice?: number;
  hasDiscount: boolean;
  /** True when only snapshot promo prices exist and validity is unknown. */
  isReferencePrice: boolean;
  discountLabel: string;
  disclaimer: string;
  buyLabel: "官網投保" | "官網報價" | null;
  buyUrl?: string;
}

function numericPrice(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/**
 * Single pricing/promo presentation path for cards, tables and compare.
 * Never treat an undated promo as a guaranteed live purchase price.
 */
export function priceDisplay(product: Product): PriceDisplay {
  const originalPrice = numericPrice(product.original_price) ?? numericPrice(product.promo?.original_price);
  const discountedPrice = numericPrice(product.discounted_price) ?? numericPrice(product.promo?.discounted_price);
  const hasDiscount = Boolean(
    originalPrice !== undefined && discountedPrice !== undefined && discountedPrice <= originalPrice,
  );
  const buyUrl = purchaseUrl(product);
  const buyLabel = buyUrl ? (product.premium_available ? "官網投保" : "官網報價") : null;
  return {
    originalPrice,
    discountedPrice,
    hasDiscount,
    isReferencePrice: hasDiscount,
    discountLabel: product.promo?.discount || PROMO_REFERENCE_LABEL,
    disclaimer: PREMIUM_SNAPSHOT_DISCLAIMER,
    buyLabel,
    buyUrl,
  };
}

export interface PromoDisplay {
  present: boolean;
  tag?: string;
  discount?: string;
  code?: string;
  note?: string;
  /** Always true for snapshot promos without a verified validity window. */
  isReference: boolean;
  badgeLabel: string;
  disclaimer: string;
}

export function promoDisplay(product: Product): PromoDisplay {
  const promo = product.promo;
  if (!promo) {
    return { present: false, isReference: true, badgeLabel: "", disclaimer: PREMIUM_SNAPSHOT_DISCLAIMER };
  }
  return {
    present: true,
    tag: promo.tag,
    discount: promo.discount,
    code: promo.code ?? undefined,
    note: promo.note,
    isReference: true,
    badgeLabel: promo.tag || PROMO_REFERENCE_LABEL,
    disclaimer: PREMIUM_SNAPSHOT_DISCLAIMER,
  };
}

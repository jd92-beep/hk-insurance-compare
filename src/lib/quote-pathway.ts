import type { Product } from "../types/insurance";
import { purchaseUrl } from "./product-availability.ts";
import { isReferenceOnlyProduct } from "./product-availability.ts";
import { parsePremiumCurve } from "../components/product/vhis-utils.ts";

/**
 * Live-quote boundary for a static comparison site.
 * We never call insurer quote engines, invent premiums, or estimate personal rates.
 * We surface (1) published snapshot text/tables already in the catalogue and
 * (2) a safe path to the insurer's official quote/check pages.
 */
export const LIVE_QUOTE_BOUNDARY = {
  siteDoesNotQuote: "本站唔提供即時保費試算。",
  snapshotIsNotQuote: "站內保費只係快照，唔係你嘅報價。",
  eligibilityNote: "報價入口唔等於可投保；以保險公司為準。",
} as const;

export const QUOTE_PREP_ITEMS = [
  { id: "age-dob", label: "受保人年齡／出生日期", hint: "" },
  { id: "plan-tier", label: "計劃層級／認可編號", hint: "" },
  { id: "deductible", label: "自付費／墊底費", hint: "" },
  { id: "region-room", label: "地區／病房", hint: "" },
  { id: "smoker", label: "吸煙狀況（如適用）", hint: "" },
  { id: "existing-cover", label: "現有公司醫保／自負額", hint: "" },
] as const;

export type QuotePathwayMode =
  | "published-schedule"
  | "published-age-table"
  | "official-quote-only"
  | "reference-only"
  | "unknown";

export interface QuotePathway {
  mode: QuotePathwayMode;
  /** Short zh-HK headline for cards */
  headline: string;
  /** What the site can show from the snapshot */
  snapshotText: string | null;
  /** True when premium_notes contain a parseable official age table */
  hasAgeTable: boolean;
  ageTableRowCount: number;
  buyUrl?: string;
  buyLabel: string | null;
  notes: string | null;
  disclaimer: string;
}

function hasDigits(text: string | undefined | null): boolean {
  return Boolean(text && /\d/.test(text));
}

/**
 * Classify how a user can obtain money numbers for this record.
 * Fail-closed: no official URL → no buy CTA; reference-only → no quote path claim.
 */
export function quotePathway(product: Product): QuotePathway {
  const notes = product.premium_notes?.trim() || null;
  const snapshotText = product.premium_range?.trim() || null;
  const curve = parsePremiumCurve(product.premium_notes);
  const buyUrl = purchaseUrl(product);
  const reference = isReferenceOnlyProduct(product);

  if (reference) {
    return {
      mode: "reference-only",
      headline: "歷史／停售參考",
      snapshotText,
      hasAgeTable: Boolean(curve),
      ageTableRowCount: curve?.rows.length ?? 0,
      buyUrl: undefined,
      buyLabel: null,
      notes,
      disclaimer: "本站唔提供即時保費試算；報價入口唔等於可投保。",
    };
  }

  if (curve && curve.rows.length > 0) {
    return {
      mode: "published-age-table",
      headline: "官方年齡保費表（快照數據）",
      snapshotText,
      hasAgeTable: true,
      ageTableRowCount: curve.rows.length,
      buyUrl,
      buyLabel: buyUrl ? "往官網核對現行報價" : null,
      notes,
      disclaimer: "站內保費為官方文件快照，非個人報價；本站唔提供即時保費試算。",
    };
  }

  if (product.premium_available && hasDigits(snapshotText)) {
    return {
      mode: "published-schedule",
      headline: "官方參考保費（快照數據）",
      snapshotText,
      hasAgeTable: false,
      ageTableRowCount: 0,
      buyUrl,
      buyLabel: buyUrl ? "往官網即時報價／核對" : null,
      notes,
      disclaimer: "站內保費為官方文件快照，非個人報價；本站唔提供即時保費試算。",
    };
  }

  if (buyUrl) {
    return {
      mode: "official-quote-only",
      headline: "官方即時報價（需官網試算）",
      snapshotText,
      hasAgeTable: false,
      ageTableRowCount: 0,
      buyUrl,
      buyLabel: "往官網即時報價",
      notes,
      disclaimer: "本站唔提供即時保費試算；實際保費以保險公司官網核保為準。",
    };
  }

  return {
    mode: "unknown",
    headline: "暫無安全報價入口",
    snapshotText,
    hasAgeTable: false,
    ageTableRowCount: 0,
    buyUrl: undefined,
    buyLabel: null,
    notes,
    disclaimer: LIVE_QUOTE_BOUNDARY.siteDoesNotQuote,
  };
}

/**
 * Side-by-side published premium *text* for compare — never a numeric ranking.
 * Returns null when any selected product lacks snapshot text or mixes reference-only records.
 */
export function publishedPremiumRows(products: Product[]): {
  productId: string;
  label: string;
  text: string;
  mode: QuotePathwayMode;
}[] | null {
  if (!products.length) return null;
  return products.map((p) => {
    const pathway = quotePathway(p);
    return {
      productId: p.id,
      label: p.product_name_zh || p.product_name,
      text: pathway.snapshotText || "未提供公開保費文字",
      mode: pathway.mode,
    };
  });
}

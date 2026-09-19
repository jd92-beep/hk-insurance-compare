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
  siteDoesNotQuote: "本站唔提供即時保費試算，亦唔會估算你嘅個人保費。",
  snapshotIsNotQuote:
    "站內保費文字／年齡表只係資料快照節錄；真正報價會按年齡、性別、計劃級別、自付費、地區同核保結果重新計算。",
  eligibilityNote:
    "官方報價入口唔等於一定可投保；停售、渠道、健康核保同地區限制仍以保險公司為準。",
} as const;

export const QUOTE_PREP_ITEMS = [
  { id: "age-dob", label: "受保人年齡／出生日期", hint: "多數計劃按投保年齡層計價" },
  { id: "plan-tier", label: "計劃層級／認可編號", hint: "標準 vs 靈活、病房級別會改變保費" },
  { id: "deductible", label: "自付費／墊底費選擇", hint: "自付費愈高，公開保費通常愈低" },
  { id: "region-room", label: "地區／病房需求", hint: "環球／美國、私家房通常更貴" },
  { id: "smoker", label: "吸煙狀況（如適用）", hint: "人壽／危疾／部分醫保會分開計價" },
  { id: "existing-cover", label: "現有公司醫保／自負額", hint: "影響你要比較嘅保障缺口，唔影響我哋報價（我哋唔報價）" },
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
      headline: "歷史／停售參考記錄",
      snapshotText,
      hasAgeTable: Boolean(curve),
      ageTableRowCount: curve?.rows.length ?? 0,
      buyUrl: undefined,
      buyLabel: null,
      notes,
      disclaimer: `${LIVE_QUOTE_BOUNDARY.siteDoesNotQuote} ${LIVE_QUOTE_BOUNDARY.eligibilityNote}`,
    };
  }

  if (curve && curve.rows.length > 0) {
    return {
      mode: "published-age-table",
      headline: "快照有官方年齡保費表（仍非即時報價）",
      snapshotText,
      hasAgeTable: true,
      ageTableRowCount: curve.rows.length,
      buyUrl,
      buyLabel: buyUrl ? "往官網核對現行報價" : null,
      notes,
      disclaimer: `${LIVE_QUOTE_BOUNDARY.snapshotIsNotQuote} ${LIVE_QUOTE_BOUNDARY.siteDoesNotQuote}`,
    };
  }

  if (product.premium_available && hasDigits(snapshotText)) {
    return {
      mode: "published-schedule",
      headline: "快照有公開保費文字（參考，唔係你嘅報價）",
      snapshotText,
      hasAgeTable: false,
      ageTableRowCount: 0,
      buyUrl,
      buyLabel: buyUrl ? "往官網即時報價／核對" : null,
      notes,
      disclaimer: `${LIVE_QUOTE_BOUNDARY.snapshotIsNotQuote} ${LIVE_QUOTE_BOUNDARY.siteDoesNotQuote}`,
    };
  }

  if (buyUrl) {
    return {
      mode: "official-quote-only",
      headline: "保費需保險公司即時報價",
      snapshotText,
      hasAgeTable: false,
      ageTableRowCount: 0,
      buyUrl,
      buyLabel: "往官網即時報價",
      notes,
      disclaimer: `${LIVE_QUOTE_BOUNDARY.siteDoesNotQuote} ${LIVE_QUOTE_BOUNDARY.eligibilityNote}`,
    };
  }

  return {
    mode: "unknown",
    headline: "暫無可安全使用嘅報價入口",
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

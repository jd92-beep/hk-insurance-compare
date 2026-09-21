import type { Product } from "@/types/insurance";
import { parseProductPlanTiers, type PlanTierItem } from "@/components/product/plan-parser";
import { deriveKeyFacts } from "@/components/product/vhis-utils";

export interface FlatProductItem {
  key: string;
  product: Product;
  tier?: PlanTierItem;
  title: string;
  insurer: string;
  insurerZh: string;
  numericPrice: number | null; // null = unknown / quote only
  priceDisplay: string;
  isQuoteOnly: boolean;
}

/**
 * 嘗試由字串中提取金額並按單位（月/日/年）換算為基準年費數值。
 */
function parseAmountFromText(text: string): { amount: number; display: string } | null {
  if (!text) return null;

  // 1. 匹配月繳模式，如「HK$1,504/月」或「約HK$138/月」
  const monthMatch = text.match(/(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|每)\s*月/i);
  if (monthMatch) {
    const val = parseFloat(monthMatch[1].replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      return {
        amount: Math.round(val * 12),
        display: `約 HK$${Math.round(val * 12).toLocaleString()} /年（HK$${val.toLocaleString()}/月）`,
      };
    }
  }

  // 2. 匹配日繳模式，如「HKD 9/日起」或「每日約 HK$28 起」
  const dayMatch = text.match(/(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|每)?\s*日/i);
  if (dayMatch) {
    const val = parseFloat(dayMatch[1].replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      return {
        amount: Math.round(val * 365),
        display: `約 HK$${Math.round(val * 365).toLocaleString()} /年（約HK$${val}/日）`,
      };
    }
  }

  // 3. 匹配年繳模式，如「年繳保費（30歲）：男性約 HK$2,153」
  const yearMatch = text.match(/(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)/i);
  if (yearMatch) {
    const val = parseFloat(yearMatch[1].replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      return {
        amount: Math.round(val),
        display: `約 HK$${Math.round(val).toLocaleString()} /年`,
      };
    }
  }

  return null;
}

/**
 * 萃取單一產品或其子計劃的基準年費。
 */
export function extractItemPrice(product: Product, tier?: PlanTierItem): {
  numericPrice: number | null;
  priceDisplay: string;
  isQuoteOnly: boolean;
} {
  const range = product.premium_range ?? "";

  // 若標註未收錄或必須向公司查詢
  const isExplicitUnknown =
    /未收錄|向保險公司查詢|向宏利索取報價|即時報價|請按產品.*索取報價/i.test(range) &&
    !/(?:HK\$|HKD|\$)\s*\d+/i.test(range);

  if (isExplicitUnknown) {
    return {
      numericPrice: null,
      priceDisplay: "需往官網即時報價",
      isQuoteOnly: true,
    };
  }

  // 若有特定子計劃，嘗試尋找該子計劃名稱對應之專屬金額
  if (tier && range.includes(tier.name)) {
    const tierSlice = range.slice(range.indexOf(tier.name));
    const tierParsed = parseAmountFromText(tierSlice.slice(0, 100));
    if (tierParsed) {
      return {
        numericPrice: tierParsed.amount,
        priceDisplay: tierParsed.display,
        isQuoteOnly: false,
      };
    }
  }

  // 檢查 deriveKeyFacts 中的 premium30
  const facts = deriveKeyFacts(product);
  if (facts.premium30 && facts.premium30.male) {
    const m = parseInt(facts.premium30.male.replace(/,/g, ""), 10);
    if (!isNaN(m) && m > 0) {
      return {
        numericPrice: m,
        priceDisplay: `HK$${m.toLocaleString()} /年（30歲男）`,
        isQuoteOnly: false,
      };
    }
  }

  // 解析整體 range
  const parsed = parseAmountFromText(range);
  if (parsed) {
    return {
      numericPrice: parsed.amount,
      priceDisplay: parsed.display,
      isQuoteOnly: false,
    };
  }

  // 兜底為 quote only
  return {
    numericPrice: null,
    priceDisplay: "需往官網即時報價",
    isQuoteOnly: true,
  };
}

/**
 * 將產品清單平鋪分拆為獨立計劃卡片清單（用於價格排序時展現每一個獨立產品）。
 */
export function flattenProductsForPriceSort(products: Product[]): FlatProductItem[] {
  const items: FlatProductItem[] = [];

  for (const product of products) {
    const tiers = parseProductPlanTiers(product);

    // 如果該產品有多個具名子計劃（例如 AIA 尊耀、標準等，或 AXA 智尊守慧、守慧等）
    if (tiers.length > 1) {
      for (const tier of tiers) {
        const pricing = extractItemPrice(product, tier);
        items.push({
          key: `${product.id}-${tier.id}`,
          product,
          tier,
          title: `${tier.name}${tier.code ? ` (${tier.code})` : ""}`,
          insurer: product.insurer,
          insurerZh: product.insurer_zh,
          numericPrice: pricing.numericPrice,
          priceDisplay: pricing.priceDisplay,
          isQuoteOnly: pricing.isQuoteOnly,
        });
      }
    } else {
      // 單一產品
      const pricing = extractItemPrice(product);
      items.push({
        key: product.id,
        product,
        title: product.product_name_zh || product.product_name,
        insurer: product.insurer,
        insurerZh: product.insurer_zh,
        numericPrice: pricing.numericPrice,
        priceDisplay: pricing.priceDisplay,
        isQuoteOnly: pricing.isQuoteOnly,
      });
    }
  }

  return items;
}

/**
 * 對平鋪後的卡片進行價格排序：
 * - price-asc：有金額從小到大，unknown 排在最後
 * - price-desc：有金額從大到小，unknown 排在最後
 */
export function sortFlatProductsByPrice(
  items: FlatProductItem[],
  direction: "asc" | "desc"
): FlatProductItem[] {
  return [...items].sort((a, b) => {
    // 兩者皆為 unknown
    if (a.numericPrice === null && b.numericPrice === null) {
      return a.insurer.localeCompare(b.insurer);
    }
    // a 為 unknown -> 排後面
    if (a.numericPrice === null) return 1;
    // b 為 unknown -> 排後面
    if (b.numericPrice === null) return -1;

    // 兩者皆有數值
    return direction === "asc"
      ? a.numericPrice - b.numericPrice
      : b.numericPrice - a.numericPrice;
  });
}

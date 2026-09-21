import type { Product } from "../types/insurance";
import { parseProductPlanTiers, type PlanTierItem } from "../components/product/plan-parser.ts";
import { deriveKeyFacts } from "../components/product/vhis-utils.ts";

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

export interface FlattenPriceSortOptions {
  categoryId?: string;
  trip?: "single" | "annual" | "all";
}

/**
 * 檢查旅遊子計劃是否純屬「全年計劃」（不適用於單次旅程）
 */
export function isTravelTierPureAnnual(tier: PlanTierItem): boolean {
  const text = `${tier.name} ${tier.fullName || ""}`;
  const hasAnnual = /全年|annual|每年/i.test(text);
  const hasSingle = /單次|single|只限單次/i.test(text);
  return hasAnnual && !hasSingle;
}

/**
 * 檢查旅遊子計劃是否純屬「單次旅程」（不適用於全年計劃）
 */
export function isTravelTierPureSingle(tier: PlanTierItem): boolean {
  const text = `${tier.name} ${tier.fullName || ""}`;
  const hasSingle = /單次|single|只限單次/i.test(text);
  const hasAnnual = /全年|annual|每年/i.test(text);
  return hasSingle && !hasAnnual;
}

/**
 * 針對旅遊保險單次旅程提取單次/每日基準保費（避免將日費乘以 365 或混淆全年計劃）
 */
export function extractTravelSinglePrice(
  product: Product,
  tier?: PlanTierItem
): {
  numericPrice: number | null;
  priceDisplay: string;
  isQuoteOnly: boolean;
} {
  const range = product.premium_range ?? "";

  const isExplicitUnknown =
    /官網即時報價|保費表載於產品冊子|未提供可核實保費|請按單次／全年.*報價|未收錄/i.test(range) &&
    !/(?:HK\$|HKD|\$)\s*\d+/i.test(range);

  if (isExplicitUnknown) {
    return {
      numericPrice: null,
      priceDisplay: "需往官網即時報價",
      isQuoteOnly: true,
    };
  }

  // 1. 若有特定子計劃，優先檢測該子計劃專屬的單次保費
  if (tier) {
    const tierName = tier.name;
    // Blue Cross: 尊尚 HK$462, 智選 HK$248
    if (product.id === "travel-blue-cross") {
      if (/尊尚/.test(tierName)) {
        return {
          numericPrice: 462,
          priceDisplay: "單次（7日）：約 HK$462",
          isQuoteOnly: false,
        };
      }
      if (/智選/.test(tierName)) {
        return {
          numericPrice: 248,
          priceDisplay: "單次（7日）：約 HK$248",
          isQuoteOnly: false,
        };
      }
    }
    // Zurich: 簡易1日 HK$120, 優越1日 HK$248
    if (product.id === "travel-zurich") {
      if (/簡易|Breezy/i.test(tierName)) {
        return {
          numericPrice: 120,
          priceDisplay: "單次：約 HK$120 起",
          isQuoteOnly: false,
        };
      }
      if (/優越|Supreme/i.test(tierName)) {
        return {
          numericPrice: 248,
          priceDisplay: "單次：約 HK$248 起",
          isQuoteOnly: false,
        };
      }
    }
    // bolttech: 經濟 HK$86, 高級 HK$128, 優越 HK$144
    if (product.id === "travel-bolttech") {
      if (/經濟/.test(tierName)) {
        return {
          numericPrice: 86,
          priceDisplay: "單次：約 HK$86 起",
          isQuoteOnly: false,
        };
      }
      if (/高級/.test(tierName)) {
        return {
          numericPrice: 128,
          priceDisplay: "單次：約 HK$128 起",
          isQuoteOnly: false,
        };
      }
      if (/優越/.test(tierName)) {
        return {
          numericPrice: 144,
          priceDisplay: "單次：約 HK$144 起",
          isQuoteOnly: false,
        };
      }
    }
  }

  // 2. 具體已知產品專屬基準（具有多層級複雜定價之產品）
  if (product.id === "travel-zurich") {
    return {
      numericPrice: 120,
      priceDisplay: "單次：約 HK$120 起",
      isQuoteOnly: false,
    };
  }
  if (product.id === "travel-blue-cross") {
    return {
      numericPrice: 248,
      priceDisplay: "單次（7日）：約 HK$248 起",
      isQuoteOnly: false,
    };
  }
  if (product.id === "travel-bolttech") {
    return {
      numericPrice: 86,
      priceDisplay: "單次：約 HK$86 起",
      isQuoteOnly: false,
    };
  }

  // 3. 每日費用模式：如「單次旅程每日約 HK$50–HK$95 起」或「每日約 HK$28 起」或「HKD 9/日起」
  // 注意：單次每日直接使用每日金額作為基準數值（例如 HK$50/日），絕不乘以 365！
  const dailyMatch =
    range.match(/每日(?:約)?\s*(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)/i) ||
    range.match(/(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|每)\s*日/i);
  if (dailyMatch) {
    const val = parseFloat(dailyMatch[1].replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      return {
        numericPrice: val,
        priceDisplay: `單次：約 HK$${val}/日起`,
        isQuoteOnly: false,
      };
    }
  }

  // 4. 固定單次/每程費用模式：如「單次旅程保費低至 HK$40 起」或「單次旅程每程約 HK$131–HK$187 起」
  const singleTripMatch = range.match(
    /單次(?:旅程)?(?:保費)?(?:低至|每程約|約)?\s*(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)/i
  );
  if (singleTripMatch) {
    const val = parseFloat(singleTripMatch[1].replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      const isPerTrip = /每程/.test(range);
      return {
        numericPrice: val,
        priceDisplay: isPerTrip ? `單次：約 HK$${val}/程起` : `單次 HK$${val} 起`,
        isQuoteOnly: false,
      };
    }
  }

  // 5. 固定天數單次模式：如「單次旅程 5 天 HK$104 起」
  const daysMatch = range.match(
    /單次旅程\s*(\d+)\s*天\s*(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)/i
  );
  if (daysMatch) {
    const val = parseFloat(daysMatch[2].replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      return {
        numericPrice: val,
        priceDisplay: `單次（${daysMatch[1]}天）：約 HK$${val} 起`,
        isQuoteOnly: false,
      };
    }
  }

  return {
    numericPrice: null,
    priceDisplay: "需往官網即時報價",
    isQuoteOnly: true,
  };
}

/**
 * 針對旅遊保險全年計劃提取年繳保費（排除純單次旅程金額）
 */
export function extractTravelAnnualPrice(
  product: Product,
  tier?: PlanTierItem
): {
  numericPrice: number | null;
  priceDisplay: string;
  isQuoteOnly: boolean;
} {
  const range = product.premium_range ?? "";

  const isExplicitUnknown =
    /官網即時報價|保費表載於產品冊子|未提供可核實保費|請按單次／全年.*報價|未收錄/i.test(range) &&
    !/(?:HK\$|HKD|\$)\s*\d+/i.test(range);

  if (isExplicitUnknown) {
    return {
      numericPrice: null,
      priceDisplay: "需往官網即時報價",
      isQuoteOnly: true,
    };
  }

  // 1. 若該子計劃純屬單次（如 Zurich 簡易計劃只限單次），則不應有全年報價
  if (tier && isTravelTierPureSingle(tier)) {
    return {
      numericPrice: null,
      priceDisplay: "只限單次旅程",
      isQuoteOnly: true,
    };
  }

  // 2. Zurich 特殊子計劃全年價格
  if (tier && product.id === "travel-zurich") {
    if (/綜合|Elite/i.test(tier.name)) {
      return {
        numericPrice: 2580,
        priceDisplay: "全年：約 HK$2,580 /年",
        isQuoteOnly: false,
      };
    }
    if (/優越|Supreme/i.test(tier.name)) {
      return {
        numericPrice: 3180,
        priceDisplay: "全年：約 HK$3,180 /年",
        isQuoteOnly: false,
      };
    }
  }

  // 3. 全年計劃年費匹配：如「全年計劃每年約 HK$1,600–HK$2,400」、「全年計劃每年約 HK$1,380 起」、「全年多次 HK$1,200 起」
  const annualMatch = range.match(
    /(?:全年(?:計劃|旅程|多次)?(?:每年)?(?:約)?|全年：(?:綜合)?)\s*(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)/i
  );
  if (annualMatch) {
    const val = parseFloat(annualMatch[1].replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      return {
        numericPrice: Math.round(val),
        priceDisplay: `全年：約 HK$${Math.round(val).toLocaleString()} /年`,
        isQuoteOnly: false,
      };
    }
  }

  // 4. Zurich 全年兜底
  if (product.id === "travel-zurich") {
    return {
      numericPrice: 2580,
      priceDisplay: "全年：約 HK$2,580 /年",
      isQuoteOnly: false,
    };
  }

  // 其餘未註明年費或僅含單次價格之產品歸入即時報價
  return {
    numericPrice: null,
    priceDisplay: "需往官網即時報價",
    isQuoteOnly: true,
  };
}

/**
 * 將產品清單平鋪分拆為獨立計劃卡片清單（用於價格排序時展現每一個獨立產品）。
 * 支援 categoryId === 'travel' 及 trip ('single' | 'annual' | 'all') 精確提取與子計劃篩選。
 */
export function flattenProductsForPriceSort(
  products: Product[],
  options?: FlattenPriceSortOptions
): FlatProductItem[] {
  const items: FlatProductItem[] = [];
  const isTravel = options?.categoryId === "travel";
  const trip = options?.trip ?? "all";

  for (const product of products) {
    const productIsTravel =
      isTravel || product.category === "travel";
    let tiers = parseProductPlanTiers(product);

    // 如果是旅遊保險且有單次/全年篩選，過濾不適用的子計劃
    if (productIsTravel) {
      if (trip === "single") {
        tiers = tiers.filter((t) => !isTravelTierPureAnnual(t));
      } else if (trip === "annual") {
        tiers = tiers.filter((t) => !isTravelTierPureSingle(t));
      }
    }

    const getPricing = (tier?: PlanTierItem) => {
      if (productIsTravel && trip === "single") {
        return extractTravelSinglePrice(product, tier);
      }
      if (productIsTravel && trip === "annual") {
        return extractTravelAnnualPrice(product, tier);
      }
      return extractItemPrice(product, tier);
    };

    // 如果該產品有多個具名子計劃（例如 AIA 尊耀、標準等，或 AXA 智尊守慧、守慧等）
    if (tiers.length > 1) {
      for (const tier of tiers) {
        const pricing = getPricing(tier);
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
    } else if (tiers.length === 1) {
      // 剩餘 1 個子計劃
      const tier = tiers[0];
      const pricing = getPricing(tier);
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
    } else {
      // 單一產品（無子計劃或全部子計劃被過濾時兜底）
      const pricing = getPricing();
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

import type { Product } from "@/types/insurance";

export interface CardSellingPoint {
  label: string;
  text: string;
}

export interface CardPlanTiers {
  tiers: string[];
  totalTierCount: number;
  vhisCode?: string | null;
  deductibles?: string | null;
  multiple: boolean;
}

export interface CompactPremiumInfo {
  text: string;
  isQuoteOnly: boolean;
  subtext?: string;
}

function cleanText(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/（[^）]*整理[^）]*）/g, "")
    .replace(/（[^）]*來源[^）]*）/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 提取精簡且具視覺衝擊力的官方核心賣點（Selling Points），
 * 避免大段冗長文字，每項控制在清晰易讀的標籤與重點摘要。
 */
export function deriveCardSellingPoints(product: Product): CardSellingPoint[] {
  const points: CardSellingPoint[] = [];
  const cov = product.coverage || [];
  const terms = product.key_terms || [];
  const cat = product.category;

  // 1. 保額 / 每年限額 / 身故賠償 / 醫療費用
  const maxLimit = cov.find((c) =>
    /每年保障限額|終身保障限額|保額|醫療費用|身故賠償|家居財物/i.test(c.item)
  );
  if (maxLimit && maxLimit.limit && !/未提供|未收錄/i.test(maxLimit.limit)) {
    let text = cleanText(maxLimit.limit);
    if (text.includes("；")) {
      const parts = text.split("；").map((s) => s.trim()).filter(Boolean);
      text = parts[parts.length - 1]; // 取最高或靈活層級
    }
    if (text.length > 38) text = text.slice(0, 36) + "…";
    const label = maxLimit.item.includes("每年")
      ? "每年保額"
      : maxLimit.item.includes("身故")
        ? "身故賠償"
        : maxLimit.item.includes("海外") || maxLimit.item.includes("醫療")
          ? "醫療保障"
          : "保障上限";
    points.push({ label, text });
  }

  // 2. 病房及手術 / 業餘運動 / 全球救援 / 嚴重危疾 / 第三者責任
  const feature = cov.find((c) =>
    /病房|手術|緊急醫療|業餘及休閒運動|嚴重危疾|公眾責任|第三者/i.test(c.item)
  );
  if (feature && feature.limit && !/未提供|未收錄/i.test(feature.limit)) {
    let text = cleanText(feature.limit);
    if (text.length > 40) text = text.slice(0, 38) + "…";
    const label = feature.item.includes("病房")
      ? "病房手術"
      : feature.item.includes("運動")
        ? "休閒運動"
        : feature.item.includes("緊急")
          ? "全球救援"
          : feature.item.includes("危疾")
            ? "嚴重危疾"
            : "核心保障";
    points.push({ label, text });
  }

  // 3. 關鍵條款亮點（全數賠償、不設自付額、保證續保、免驗身、雙倍賠償）
  const highlightTerm = terms.find((t) =>
    /全數賠償|不設自付|不設終身|免驗身|免體檢|保證.*續保|多重賠償|深切治療|實報實銷|未知的投保前/i.test(t)
  );
  if (highlightTerm) {
    let text = cleanText(highlightTerm);
    if (text.length > 40) text = text.slice(0, 38) + "…";
    points.push({ label: "條款亮點", text });
  }

  // 4. 自願醫保特有賣點（扣稅）
  if (cat === "medical" && points.length < 3) {
    points.push({
      label: "稅務扣除",
      text: "合資格自願醫保保費每年可扣稅最高 HK$8,000",
    });
  }

  // 5. 旅遊保特有亮點補全
  if (cat === "travel" && points.length < 3) {
    const delay = cov.find((c) => /延誤|行李|阻礙/i.test(c.item));
    if (delay && delay.limit && !/未提供|未收錄/i.test(delay.limit)) {
      points.push({
        label: "行程保障",
        text: cleanText(delay.limit).slice(0, 36),
      });
    }
  }

  // 兜底補充，確保至少有 3 項精彩賣點
  for (const c of cov) {
    if (points.length >= 3) break;
    if (c.item && c.limit && !/未提供|未收錄|依細項上限/i.test(c.limit)) {
      let text = cleanText(c.limit);
      if (text.length > 38) text = text.slice(0, 36) + "…";
      const label = c.item.slice(0, 5);
      if (!points.some((p) => p.label === label)) {
        points.push({ label, text });
      }
    }
  }

  return points.slice(0, 3);
}

/**
 * 提取計劃層級（Plan Tiers）與 VHIS 認可編號
 */
export function deriveCardPlanTiers(product: Product): CardPlanTiers {
  const rawTiers = product.plan_tiers || [];
  const cleanTiers: string[] = [];
  let vhisCode: string | null = null;

  for (const t of rawTiers) {
    if (!t) continue;
    // 檢測 VHIS 認可編號
    const vhisMatch = t.match(/([SF]\d{5}(?:-\d{2}-\d{3}-\d{2})?)/i);
    if (vhisMatch && !vhisCode) {
      vhisCode = vhisMatch[1];
    }
    // 過濾純總結行
    if (/自願醫保認可產品全覽|認可名單/i.test(t)) continue;

    let name = t
      .replace(/（只供現有保單續保）/g, "（續保）")
      .replace(/自願醫保靈活計劃（([^）]+)）/g, "$1")
      .replace(/自願醫保標準計劃/g, "標準計劃")
      .trim();

    if (name.length > 22) {
      name = name.split(/[：:;；]/)[0].trim();
    }
    if (name && !cleanTiers.includes(name)) {
      cleanTiers.push(name);
    }
  }

  // 嘗試從 coverage 中獲取自付費選項
  let deductibles: string | null = null;
  const dedCov = (product.coverage || []).find((c) =>
    /自付費|自負額|墊底費/i.test(c.item)
  );
  if (dedCov && dedCov.limit && !/未提供|未收錄/i.test(dedCov.limit)) {
    const numbers = dedCov.limit.match(/(?:HK\$|HKD|\$)\s*[\d,]+(?:萬)?/gi);
    if (numbers && numbers.length > 1) {
      deductibles = [...new Set(numbers)].slice(0, 4).join(" · ");
    }
  }

  return {
    tiers: cleanTiers.slice(0, 4),
    totalTierCount: cleanTiers.length,
    vhisCode,
    deductibles,
    multiple: cleanTiers.length > 1,
  };
}

/**
 * 提取卡片首屏極簡參考保費（單行展示，不顯示繁瑣長段文字）
 */
export function deriveCompactPremium(product: Product): CompactPremiumInfo {
  const range = product.premium_range || "";
  if (!product.premium_available || !range.trim()) {
    return { text: "需往官網即時報價", isQuoteOnly: true, subtext: "官網為準" };
  }

  // 旅遊保險優先匹配日費
  if (product.category === "travel") {
    const dayMatch = range.match(
      /(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|每)?\s*日/i
    );
    if (dayMatch) {
      return {
        text: `單次每日約 HK$${dayMatch[1]} 起`,
        isQuoteOnly: false,
        subtext: "官方標準",
      };
    }
  }

  // 匹配月費
  const monthMatch = range.match(
    /(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|每)\s*月/i
  );
  if (monthMatch) {
    return {
      text: `每月約 HK$${monthMatch[1]} 起`,
      isQuoteOnly: false,
      subtext: "官方標準",
    };
  }

  // 匹配日費
  const dayMatch = range.match(
    /(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|每)?\s*日/i
  );
  if (dayMatch) {
    return {
      text: `每日約 HK$${dayMatch[1]} 起`,
      isQuoteOnly: false,
      subtext: "官方標準",
    };
  }

  // 匹配年費
  const yearMatch = range.match(
    /(?:每年|年繳|每年約)?\s*(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)/i
  );
  if (yearMatch) {
    return {
      text: `每年約 HK$${yearMatch[1]} 起`,
      isQuoteOnly: false,
      subtext: "官方標準",
    };
  }

  return { text: "官方即時報價", isQuoteOnly: true, subtext: "官網為準" };
}

import type { Category, Insurer, Product } from "@/types/insurance";

export interface CategoryMeta {
  id: string;
  /** 類別色（hex） */
  color: string;
  /** icon 路徑（public/） */
  icon: string;
  /** 一句痛點描述 */
  tagline: string;
}

export const CATEGORY_ORDER = [
  "home",
  "travel",
  "life",
  "critical-illness",
  "accident",
  "medical",
  "motor",
  "domestic-helper",
  "pet",
] as const;

export const CATEGORY_META: Record<string, CategoryMeta> = {
  home: {
    id: "home",
    color: "#B5533C",
    icon: "/cat-home.svg",
    tagline: "火險唔等於家居保——財物、責任、樓齡限制逐間睇。",
  },
  travel: {
    id: "travel",
    color: "#2E6FDB",
    icon: "/cat-travel.svg",
    tagline: "單次定全年？醫療額、行程取消、高危活動保唔保？",
  },
  life: {
    id: "life",
    color: "#5B4FA6",
    icon: "/cat-life.svg",
    tagline: "定期壽險邊間平？保費、吸煙界定、續保條款比清楚。",
  },
  "critical-illness": {
    id: "critical-illness",
    color: "#C8102E",
    icon: "/cat-critical-illness.svg",
    tagline: "三大危疾定義、多重賠償、等候期，條款差好遠。",
  },
  accident: {
    id: "accident",
    color: "#D98E04",
    icon: "/cat-accident.svg",
    tagline: "意外醫療、永久傷殘賠償比例，邊份保障全？",
  },
  medical: {
    id: "medical",
    color: "#0E7C66",
    icon: "/cat-medical.svg",
    tagline: "自願醫保標準計劃 vs 靈活計劃，自付費點揀？",
  },
  motor: {
    id: "motor",
    color: "#3C4A63",
    icon: "/cat-motor.svg",
    tagline: "三保定全保？NCD、墊底費、維修限制逐間問。",
  },
  "domestic-helper": {
    id: "domestic-helper",
    color: "#7A4FB5",
    icon: "/cat-domestic-helper.svg",
    tagline: "法定要求之外，醫療同遣散費保障邊間足？",
  },
  pet: {
    id: "pet",
    color: "#E0662B",
    icon: "/cat-pet.svg",
    tagline: "獸醫費用賠幾多？先天性疾病保唔保？",
  },
};

export function categoryColor(id: string): string {
  return CATEGORY_META[id]?.color ?? "#181D2E";
}

export function categoryName(categories: Category[], id: string): string {
  return categories.find((c) => c.id === id)?.name_zh ?? id;
}

/** 由產品列表衍生保險公司名錄（按產品數降序） */
export function deriveInsurers(products: Product[]): Insurer[] {
  const map = new Map<string, Insurer>();
  for (const p of products) {
    const key = p.insurer;
    const existing = map.get(key);
    if (existing) {
      existing.productCount += 1;
      if (p.premium_available) existing.premiumCount += 1;
      if (!existing.categories.includes(p.category)) existing.categories.push(p.category);
    } else {
      map.set(key, {
        name: p.insurer,
        name_zh: p.insurer_zh,
        productCount: 1,
        premiumCount: p.premium_available ? 1 : 0,
        categories: [p.category],
      });
    }
  }
  return [...map.values()].sort((a, b) => b.productCount - a.productCount);
}

/** 由 premium_range 原文抽出 HK$ 金額（用嚟放尺規光譜，非精確報價） */
export function parsePremiumAmounts(premiumRange: string): number[] {
  const matches = premiumRange.match(/HK\$[\d,]+(?:\.\d+)?/g) ?? [];
  return matches
    .map((m) => parseFloat(m.replace(/HK\$|,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export interface PremiumSpectrum {
  min: number;
  max: number;
}

/** 全類別保費光譜（對數尺規用），掃晒類別內有公開金額嘅產品 */
export function categorySpectrum(products: Product[]): PremiumSpectrum | null {
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    if (!p.premium_available) continue;
    for (const n of parsePremiumAmounts(p.premium_range)) {
      if (n < min) min = n;
      if (n > max) max = n;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (min === max) max = min * 2;
  return { min, max };
}

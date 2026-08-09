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

/** 保費單位（由金額前後文推斷） */
export type PremiumUnit = "year" | "month" | "day" | null;

export interface PremiumEntry {
  amount: number;
  unit: PremiumUnit;
}

/** 非保費金額（保額／自付費等）唔入得 sort key／尺規 */
const EXCLUDE_BEFORE = /(保額|保障額|自付費|墊底費)[^。；;，、]{0,4}$/;

const UNIT_WORDS: [RegExp, Exclude<PremiumUnit, null>][] = [
  [/每月|月繳|按月/g, "month"],
  [/每日|日繳|按日/g, "day"],
  [/每年|年繳|按年/g, "year"],
];

/** 由金額前後文推斷繳費單位：緊接嘅「/月、/年、/日」優先，再睇同子句前面嘅「每月/月繳/每年/年繳/每日」，最後睇範圍後段共用嘅「/月」尾綴 */
function detectUnit(text: string, start: number, end: number): PremiumUnit {
  const immediate = text.slice(end, end + 8).match(/^\s*[\/／]\s*(月|年|日)/);
  if (immediate) return immediate[1] === "月" ? "month" : immediate[1] === "年" ? "year" : "day";
  // 同子句（。；（）為界）入面最近嘅單位詞，例如「每月HK$14.31、HK$15.93」後段都係月繳
  const clauseBefore = text.slice(Math.max(0, start - 48), start).split(/[。；;（）]/).pop() ?? "";
  let best: { idx: number; unit: Exclude<PremiumUnit, null> } | null = null;
  for (const [re, unit] of UNIT_WORDS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(clauseBefore)) !== null) {
      if (!best || m.index > best.idx) best = { idx: m.index, unit };
    }
  }
  if (best && clauseBefore.length - best.idx <= 44) return best.unit;
  // 範圍寫法「HK$183–226/月」：/月 係成個範圍嘅共用尾綴
  const clauseAfter = text.slice(end, end + 24).split(/[。；;（）]/)[0] ?? "";
  const shared = clauseAfter.match(/[\/／]\s*(月|年|日)/);
  if (shared) return shared[1] === "月" ? "month" : shared[1] === "年" ? "year" : "day";
  return null;
}

/**
 * 由 premium_range 原文抽出金額＋單位（HK$/HKD 前綴；「HK$336–2,980」「HK$86/128」
 * 呢類省略前綴嘅後段都會攞埋）。原文一個字都唔會改——呢啲解析淨係用嚟排序／尺規。
 */
export function parsePremiumEntries(premiumRange: string): PremiumEntry[] {
  const entries: PremiumEntry[] = [];
  const re = /(?:HK\$|HKD)\s*([\d,]+(?:\.\d+)?)|(?<=[–—\-\/])\s*([\d,]{2,}(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(premiumRange)) !== null) {
    const raw = m[1] ?? m[2];
    const start = m.index;
    const end = m.index + m[0].length;
    // 保額（HK$100萬）、折扣率（30–40%）唔係保費
    if (/^[\s]*萬/.test(premiumRange.slice(end, end + 3))) continue;
    if (/^[\s]*[%％]/.test(premiumRange.slice(end, end + 3))) continue;
    if (EXCLUDE_BEFORE.test(premiumRange.slice(Math.max(0, start - 16), start))) continue;
    const amount = parseFloat(raw.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) continue;
    entries.push({ amount, unit: detectUnit(premiumRange, start, end) });
  }
  return entries;
}

/** 由 premium_range 原文抽出金額（用嚟放尺規光譜，非精確報價） */
export function parsePremiumAmounts(premiumRange: string): number[] {
  return parsePremiumEntries(premiumRange).map((e) => e.amount);
}

/** 年繳化：月繳 ×12、日繳 ×365，無單位照原值（例如單次旅程價） */
export function annualizedAmount(entry: PremiumEntry): number {
  if (entry.unit === "month") return entry.amount * 12;
  if (entry.unit === "day") return entry.amount * 365;
  return entry.amount;
}

/** 保費排序 key：全部金額年繳化後取最低（跨單位直接比會誤導） */
export function premiumSortKey(premiumRange: string): number {
  const entries = parsePremiumEntries(premiumRange);
  if (entries.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...entries.map(annualizedAmount));
}

/**
 * 展示用最低金額嘅單位提示：最低價係月繳／日繳時，
 * 保費欄大數字旁要註明「按月繳計」之類，免得同年繳價混淆。
 */
export function premiumUnitHint(premiumRange: string): string | null {
  const entries = parsePremiumEntries(premiumRange);
  if (entries.length === 0) return null;
  const minEntry = entries.reduce((a, b) => (b.amount < a.amount ? b : a));
  if (minEntry.unit === "month") return "按月繳計";
  if (minEntry.unit === "day") return "按日繳計";
  return null;
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

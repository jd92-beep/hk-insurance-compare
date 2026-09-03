import type { Product } from "@/types/insurance";
import { categoryColor } from "@/lib/categories";

/**
 * 全類別通用量化指標與圖表架構引擎（Universal Metrics & Chart Architect Engine）
 *
 * 支援全站 11 大類別（自願醫保、高端醫療、Top-up、旅遊、家居、危疾、意外、人壽、汽車、家傭、寵物）
 * 核心功能：
 * 1. 文本條款智慧解析（Regex + Scope-Aware + 中文大數轉換：萬/億/千分位）
 * 2. 旗艦條款處理（「全數賠償 / 無上限 / 100%實報實銷」特製 Badge 與歸一化繪圖值）
 * 3. 各類別核心量化指標定義矩陣（2–4 個高價值比較指標）
 * 4. 圖表數據轉換與排序（由高至低 / 由低至高 / 點擊跳轉產品連結）
 */

export type MetricUnitType = "currency" | "percentage" | "age" | "count" | "terms";

export type MetricScope = "annual" | "lifetime" | "daily" | "general";

export interface MetricDefinition {
  /** 唯一標識符，例如 'annual-limit' */
  id: string;
  /** 指標顯示名稱，例如 '每年保障限額' */
  label: string;
  /** 簡短說明，輔助 Tooltip 或 UI 標題 */
  description: string;
  /** 數值單位類型 */
  unitType: MetricUnitType;
  /** 單位後綴，例如 'HK$'、'%'、'歲'、'種' */
  unitSuffix: string;
  /** 所屬類別 ID */
  category: string;
  /** 提取範疇限定（避免年間/終身/每日條款混淆） */
  scope?: MetricScope;
  /** 是否為該類別預設圖表指標 */
  isDefault?: boolean;
  /** 排序推薦方向：'desc'（數值越大越好，例如保額）或 'asc'（數值越小越好） */
  preferDirection: "asc" | "desc";
  /** 匹配 coverage item 或標題的關鍵字列表（按優先次序命中） */
  keywords: string[];
  /** 自定義提取邏輯（針對跨字段或複合邏輯） */
  customExtractor?: (product: Product, metric: MetricDefinition) => ParsedMetricValue | null;
}

export interface ParsedMetricValue {
  /** 排序與繪圖用數值（數值越大代表保障額或比例越高） */
  numericValue: number;
  /** 官方原始文字片段 */
  rawText: string;
  /** 格式化後的展示文字，例如 'HK$40,000,000'、'85%'、'無上限'、'全數賠償' */
  displayValue: string;
  /** 命中之 coverage 項目名稱 */
  matchedItem?: string;
  /** 是否為無上限旗艦條款 */
  isUnlimited?: boolean;
  /** 是否為全數賠償 / 實報實銷 */
  isFullCover?: boolean;
  /** 特殊 Badge 標籤文字，例如 '全數賠償'、'無上限'、'自選升級' */
  badge?: string;
  /** 區間原數值（若有） */
  range?: { min: number; max: number };
}

export interface ProductMetricResult {
  product: Product;
  metric: MetricDefinition;
  value: ParsedMetricValue | null;
}

export interface ChartDataPoint {
  /** 產品 ID */
  id: string;
  /** 產品中文名 */
  name: string;
  /** 保險公司拉丁名 */
  insurer: string;
  /** 保險公司中文名 */
  insurerZh: string;
  /** 類別 ID */
  category: string;
  /** 主題色（來自 categoryColor） */
  color: string;
  /** 數值（排序用真實數值） */
  numericValue: number;
  /** 視覺圖表數值（若為無上限/全數賠償，會歸一化為合理長度，避免圖表破版） */
  visualValue: number;
  /** 格式化顯示文字，例如 'HK$40,000,000' */
  displayValue: string;
  /** 原始文本 */
  rawText: string;
  /** 特殊標籤 */
  badge?: string;
  /** 是否為旗艦條款（無上限/全數賠償） */
  isFlagship: boolean;
  /** 點擊後跳轉之產品詳情 URL */
  url: string;
  /** 命中之保障項目名 */
  matchedItem?: string;
}

export interface PrepareChartOptions {
  /** 排序順序，預設為 metric.preferDirection（大多為 'desc' 由高至低） */
  sortOrder?: "desc" | "asc" | "none";
  /** 是否過濾掉沒有該指標數據的產品，預設為 true */
  filterEmpty?: boolean;
  /** 最多展示幾筆數據（空則展示全部） */
  limit?: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 數值解析工具函數（Numerical Parsing Engine）
 * ──────────────────────────────────────────────────────────────────────────── */

/** 清理數字中的逗號與空格 */
export function cleanNumber(s: string): number {
  return parseFloat(s.replace(/[, \s]/g, ""));
}

/**
 * 貨幣數值解析（支援 HK$、萬、億、千分位、全數賠償、終身無上限）
 */
export function parseCurrency(
  text: string,
  scope: MetricScope = "general"
): ParsedMetricValue | null {
  if (!text) return null;

  // 1. 終身範疇專屬匹配
  if (scope === "lifetime") {
    if (
      /終身(?:保障)?(?:限額|最高)?(?:為)?\s*(?:無上限|不設上限|不設終身保障限額)|終身無上限|不設終身保障限額/i.test(
        text
      )
    ) {
      return {
        numericValue: 999_999_999,
        displayValue: "終身無上限",
        rawText: text,
        isUnlimited: true,
        badge: "無上限",
      };
    }
    if (/^(?:不設上限|無上限|Unlimited)$/i.test(text.trim())) {
      return {
        numericValue: 999_999_999,
        displayValue: "無上限",
        rawText: text,
        isUnlimited: true,
        badge: "無上限",
      };
    }
    const lifetimeMatch = text.match(
      /終身(?:保障)?(?:限額|最高)?(?:為)?\s*(?:HK\$|HKD)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/
    );
    if (lifetimeMatch) {
      const val = cleanNumber(lifetimeMatch[1]);
      const unit = lifetimeMatch[2];
      const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
      const finalVal = val * mult;
      return {
        numericValue: finalVal,
        displayValue: `HK$${val.toLocaleString()}${unit ?? ""}`,
        rawText: text,
        badge: "終身限額",
      };
    }
  }

  // 2. 年間範疇專屬匹配（避免被「終身無上限」攔截年間數字）
  if (scope === "annual") {
    // 若明確為年間無上限（例如信諾白金版）
    if (
      /(?:白金版|每年|每保單年度|年度)?\s*無上限/.test(text) &&
      !text.includes("終身")
    ) {
      return {
        numericValue: 999_999_999,
        displayValue: "無上限",
        rawText: text,
        isUnlimited: true,
        badge: "無上限",
      };
    }

    // 優先檢查文本一開頭即為 HK$ 數字（如 AIA 標準計劃 limit: "HK$420,000；病房及膳食每日HK$750..."）
    const leadingMatch = text.match(/^\s*(?:HK\$|HKD)\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/);
    if (leadingMatch) {
      const val = cleanNumber(leadingMatch[1]);
      const unit = leadingMatch[2];
      const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
      const finalVal = val * mult;
      return {
        numericValue: finalVal,
        displayValue: `HK$${val.toLocaleString()}${unit ?? ""}`,
        rawText: text,
      };
    }

    // 抓取「每保單年度 / 每年 / 最高 / 年度保額」緊跟的金額
    const annualMatch = text.match(
      /(?:每保單年度|每年|年度保額|最高保障|每年保障限額|最高|高達每保單年度|高達每年|高達)\s*(?:HK\$|HKD)\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/
    );
    if (annualMatch) {
      const val = cleanNumber(annualMatch[1]);
      const unit = annualMatch[2];
      const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
      const finalVal = val * mult;
      return {
        numericValue: finalVal,
        displayValue: `HK$${val.toLocaleString()}${unit ?? ""}`,
        rawText: text,
      };
    }
  }

  // 3. 每日範疇專屬匹配（病房及膳食、深切治療等）
  if (scope === "daily") {
    if (/全數賠償|全額賠償|100%實報實銷|實報實銷/i.test(text)) {
      return {
        numericValue: 999_999_999,
        displayValue: "全數賠償",
        rawText: text,
        isFullCover: true,
        badge: "全數賠償",
      };
    }
    const dailyMatch = text.match(
      /(?:每日|房租膳食每日|每病房每日|每日本地|住院每日)\s*(?:HK\$|HKD)\s*([\d,]+)|(?:HK\$|HKD)\s*([\d,]+)\s*[/／]\s*(?:日|天)/
    );
    if (dailyMatch) {
      const numStr = dailyMatch[1] ?? dailyMatch[2];
      const val = cleanNumber(numStr);
      return {
        numericValue: val,
        displayValue: `HK$${val.toLocaleString()}/日`,
        rawText: text,
        badge: "每日上限",
      };
    }
  }

  // 4. 純文字旗艦條款（無上限 / 全數賠償）
  if (
    /^(?:不設上限|無上限|Unlimited)$/i.test(text.trim()) ||
    /終身保障無上限|終身無上限/.test(text)
  ) {
    return {
      numericValue: 999_999_999,
      displayValue: "無上限",
      rawText: text,
      isUnlimited: true,
      badge: "無上限",
    };
  }

  const isFullCover = /全數賠償|全額賠償|100%實報實銷|實報實銷|Full Cover/i.test(
    text
  );

  // 5. 中文大數匹配：萬 / 億（例如 HK$4,000萬、HK$1.5億、3,300萬）
  const candidates: { val: number; disp: string }[] = [];
  const wanMatches = Array.from(
    text.matchAll(/(?:HK\$|HKD)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)/g)
  );
  for (const m of wanMatches) {
    const num = cleanNumber(m[1]);
    const unit = m[2];
    const mult = unit === "億" ? 100_000_000 : 10_000;
    candidates.push({
      val: num * mult,
      disp: `HK$${num.toLocaleString()}${unit}`,
    });
  }

  // 6. 標準千分位貨幣格式（例如 HK$40,000,000、HK$420,000）
  const currMatches = Array.from(
    text.matchAll(/(?:HK\$|HKD|\$)\s*([\d,]+(?:\.\d+)?)/g)
  );
  for (const m of currMatches) {
    const val = cleanNumber(m[1]);
    const after = text.slice(m.index! + m[0].length, m.index! + m[0].length + 4);
    if (/[萬億]/.test(after)) continue;
    if (val > 0) {
      candidates.push({
        val,
        disp: `HK$${val.toLocaleString()}`,
      });
    }
  }

  // 7. 若有候選金額，取最高者（代表該方案頂級上限）
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.val - a.val);
    const best = candidates[0];
    return {
      numericValue: best.val,
      displayValue: best.disp,
      rawText: text,
      badge: isFullCover ? "全數賠償" : undefined,
    };
  }

  // 8. 若無明確數字但有全數賠償
  if (isFullCover) {
    return {
      numericValue: 999_999_999,
      displayValue: "全數賠償",
      rawText: text,
      isFullCover: true,
      badge: "全數賠償",
    };
  }

  return null;
}

/**
 * 百分比數值解析（支援 80% 至 85%、100%、650%、全數賠償）
 */
export function parsePercentage(
  text: string,
  preferMax: boolean = true
): ParsedMetricValue | null {
  if (!text) return null;

  const pctMatches = Array.from(text.matchAll(/(\d+(?:\.\d+)?)\s*%/g));
  if (pctMatches.length > 0) {
    const nums = pctMatches.map((m) => parseFloat(m[1]));
    const val = preferMax ? Math.max(...nums) : Math.min(...nums);
    return {
      numericValue: val,
      displayValue: `${Number.isInteger(val) ? val : val.toFixed(1)}%`,
      rawText: text,
      badge: `${val}%`,
    };
  }

  if (/全數賠償|全額賠償|100%實報實銷|實報實銷/i.test(text)) {
    return {
      numericValue: 100,
      displayValue: "100%",
      rawText: text,
      isFullCover: true,
      badge: "全數賠償",
    };
  }

  return null;
}

/**
 * 年齡或年數解析（例如「保障至 100 歲」、「保證續保至 85 歲」、「最長 30 年」）
 */
export function parseAgeOrYears(text: string): ParsedMetricValue | null {
  if (!text) return null;

  const ageMatch = text.match(/(?:至|至受保人|續保至|直至)?\s*(\d{2,3})\s*歲/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    return {
      numericValue: age,
      displayValue: `${age} 歲`,
      rawText: text,
      badge: `至 ${age} 歲`,
    };
  }

  if (/終身|終生/i.test(text)) {
    return {
      numericValue: 100,
      displayValue: "終身 (100歲)",
      rawText: text,
      badge: "終身保障",
    };
  }

  const yearMatch = text.match(/最長\s*(\d+)\s*年|保障期\s*(\d+)\s*年/);
  if (yearMatch) {
    const yr = parseInt(yearMatch[1] ?? yearMatch[2], 10);
    return {
      numericValue: yr,
      displayValue: `${yr} 年`,
      rawText: text,
      badge: `${yr} 年期`,
    };
  }

  return null;
}

/**
 * 數量解析（例如「涵蓋 197 種疾病」、「58 種危疾」）
 */
export function parseCount(text: string): ParsedMetricValue | null {
  if (!text) return null;

  const countMatch = text.match(
    /涵蓋\s*(\d+)\s*種|(\d+)\s*種(?:危疾|疾病|嚴重疾病|常見危疾)/
  );
  if (countMatch) {
    const count = parseInt(countMatch[1] ?? countMatch[2], 10);
    return {
      numericValue: count,
      displayValue: `${count} 種`,
      rawText: text,
      badge: `${count} 種`,
    };
  }

  return null;
}

/**
 * 通用條目解析入口
 */
export function parseGenericMetric(
  text: string,
  metric: MetricDefinition
): ParsedMetricValue | null {
  switch (metric.unitType) {
    case "currency":
      return parseCurrency(text, metric.scope ?? "general");
    case "percentage":
      return parsePercentage(text);
    case "age":
      return parseAgeOrYears(text);
    case "count":
      return parseCount(text);
    default:
      return parseCurrency(text, metric.scope ?? "general");
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 全站 11 大類別指標矩陣定義（Category Metrics Definition Matrix）
 * ──────────────────────────────────────────────────────────────────────────── */

export const CATEGORY_METRICS_MAP: Record<string, MetricDefinition[]> = {
  // 1. 自願醫保（Medical - 28 份產品）
  medical: [
    {
      id: "annual-limit",
      label: "每年保障限額",
      description: "每年最高可索償的醫療保障金額（標準計劃劃一 HK$42萬，靈活計劃可達 HK$4,000萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "medical",
      scope: "annual",
      isDefault: true,
      preferDirection: "desc",
      keywords: ["每年保障限額", "年度保額", "最高保障", "年度限額", "保障限額"],
    },
    {
      id: "room-board",
      label: "每日病房及膳食上限",
      description: "住院期間每日病房與膳食賠償額度（標準計劃 HK$750/日，靈活計劃多數全數賠償）",
      unitType: "currency",
      unitSuffix: "HKD/日",
      category: "medical",
      scope: "daily",
      preferDirection: "desc",
      keywords: ["病房及膳食", "病房膳食", "病房每日"],
    },
    {
      id: "icu-limit",
      label: "深切治療每日上限",
      description: "入住深切治療部（ICU）每日最高津貼或實報實銷上限",
      unitType: "currency",
      unitSuffix: "HKD/日",
      category: "medical",
      scope: "daily",
      preferDirection: "desc",
      keywords: ["深切治療", "重症監護"],
    },
  ],

  // 2. 高端醫療（High-End Medical - 8 份產品）
  "high-end-medical": [
    {
      id: "annual-limit",
      label: "每年保障限額",
      description: "每年最高賠償限額（高達 HK$1,560萬 至 HK$4,500萬，頂級方案不設上限）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "high-end-medical",
      scope: "annual",
      isDefault: true,
      preferDirection: "desc",
      keywords: ["每年保障限額", "每年及終身保障限額", "年度保額", "年度限額", "保障限額"],
    },
    {
      id: "lifetime-limit",
      label: "終身保障限額",
      description: "受保人終身累計最高賠償額（HK$3,500萬 至 終身無上限）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "high-end-medical",
      scope: "lifetime",
      preferDirection: "desc",
      keywords: ["終身保障限額", "每年及終身保障限額", "每年保障限額", "終身保額", "終身最高", "終身限額"],
    },
    {
      id: "hospital-surgical",
      label: "主要醫療/住院手術費用",
      description: "外科手術費、麻醉師費、手術室開支賠償機制（頂級醫保全數賠償，無細項上限）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "high-end-medical",
      scope: "general",
      preferDirection: "desc",
      keywords: ["主要醫療費用", "住院及手術", "住院醫療", "外科手術"],
    },
  ],

  // 3. Top-up 醫保（Top-Up Medical - 7 份產品）
  "top-up-medical": [
    {
      id: "smm-ratio",
      label: "超額賠償比率 (SMM)",
      description: "填補公司團體醫保不足之超額醫療差額賠償百分比（通常為 80% 至 100% 實報實銷）",
      unitType: "percentage",
      unitSuffix: "%",
      category: "top-up-medical",
      isDefault: true,
      preferDirection: "desc",
      keywords: [
        "超額醫療費用賠償率",
        "超額醫療",
        "SMM",
        "差額賠償",
        "賠償比率",
        "Shortfall",
        "公司醫保 Shortfall 填補",
        "意外醫療及門診實報實銷",
      ],
      customExtractor: (product) => {
        // 優先搜尋 SMM 賠償率
        for (const c of product.coverage ?? []) {
          if (
            c.item.includes("超額") ||
            c.item.includes("SMM") ||
            c.item.includes("Shortfall") ||
            c.item.includes("實報實銷")
          ) {
            const parsed = parsePercentage(c.limit);
            if (parsed) return { ...parsed, matchedItem: c.item };
          }
        }
        return null;
      },
    },
    {
      id: "annual-limit",
      label: "每年最高賠償限額",
      description: "每年最高超額填補賠償金額（HK$25萬 至 HK$2,000萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "top-up-medical",
      scope: "annual",
      preferDirection: "desc",
      keywords: [
        "每年最高賠償限額",
        "每年最高",
        "年度最高",
        "超額醫療費用保障",
        "額外醫療保障",
        "每年保障限額",
        "意外醫療及門診實報實銷",
      ],
    },
  ],

  // 4. 旅遊保險（Travel - 9 份產品）
  travel: [
    {
      id: "medical-limit",
      label: "海外醫療費用上限",
      description: "外遊期間因意外或突發疾病所需之門診及住院費用（高達 HK$50萬 至 HK$150萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "travel",
      scope: "general",
      isDefault: true,
      preferDirection: "desc",
      keywords: ["醫療費用", "海外醫療", "醫療及相關", "海外醫療及相關費用", "海外醫療及額外費用"],
    },
    {
      id: "cancellation-limit",
      label: "取消行程賠償上限",
      description: "因惡劣天氣、外遊警示或重病導致取消或縮短旅程之損失賠償",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "travel",
      scope: "general",
      preferDirection: "desc",
      keywords: ["取消旅程", "取消行程", "取消或縮短行程", "取消或縮短旅程", "提早結束", "任何原因取消"],
    },
    {
      id: "baggage-limit",
      label: "行李及個人財物保障",
      description: "行李遺失、損毀、手機與電腦被盜之賠償總額（高達 HK$1萬 至 HK$3萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "travel",
      scope: "general",
      preferDirection: "desc",
      keywords: ["行李及個人物品", "行李及個人財物", "個人行李及財物", "行李保障", "行李"],
    },
    {
      id: "liability-limit",
      label: "個人法律責任上限",
      description: "海外不慎造成第三者人身傷亡或財物損失之法律抗辯與賠償額",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "travel",
      scope: "general",
      preferDirection: "desc",
      keywords: ["個人責任", "法律責任", "個人法律責任"],
    },
  ],

  // 5. 家居保險（Home - 12 份產品）
  home: [
    {
      id: "contents-limit",
      label: "家居財物總保障額",
      description: "因火災、颱風、水浸、爆竊等造成之室內傢俬電器財物損失賠償（HK$60萬 至 HK$150萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "home",
      scope: "general",
      isDefault: true,
      preferDirection: "desc",
      keywords: ["家居財物總保障額", "家居財物", "家居物品", "室外家居財物"],
      customExtractor: (product) => {
        for (const c of product.coverage ?? []) {
          if (c.item.includes("家居財物") || c.item.includes("家居物品")) {
            const parsed = parseCurrency(c.limit, "general");
            if (parsed) return { ...parsed, matchedItem: c.item };
          }
        }
        // 若純自選，取其附加意外或第三者責任
        return null;
      },
    },
    {
      id: "liability-limit",
      label: "第三者法律責任保障額",
      description: "鋁窗墮下、爆水喉浸濕鄰居等第三者法律賠償（高達 HK$500萬 至 HK$2,000萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "home",
      scope: "general",
      preferDirection: "desc",
      keywords: ["法律責任", "公眾/第三者責任", "公眾責任", "家居第三者責任", "第三者責任", "第三者"],
    },
    {
      id: "accommodation-limit",
      label: "臨時住宿及租金損失",
      description: "因住所遭受損毀暫不適宜居住時之替代住所酒店費用或業主租金損失",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "home",
      scope: "general",
      preferDirection: "desc",
      keywords: ["臨時住宿", "臨時居所", "臨時住所", "租金損失"],
    },
  ],

  // 6. 危疾保險（Critical Illness - 10 份產品）
  "critical-illness": [
    {
      id: "severe-ci-ratio",
      label: "嚴重危疾賠償比例",
      description: "確診癌症、中風或心臟病等嚴重疾病之首筆賠付比例（市場基準為 100% 投保額）",
      unitType: "percentage",
      unitSuffix: "%",
      category: "critical-illness",
      isDefault: true,
      preferDirection: "desc",
      keywords: ["嚴重危疾", "嚴重疾病", "主要危疾", "危疾保障", "3-in-1"],
    },
    {
      id: "multi-claim-ratio",
      label: "多重危疾賠償最高總比例",
      description: "涵蓋癌症復發、擴散及多次嚴重疾病之最高累計賠償比率（高達 500% 至 1000%）",
      unitType: "percentage",
      unitSuffix: "%",
      category: "critical-illness",
      preferDirection: "desc",
      keywords: ["多重危疾", "多重", "持續賠償", "延伸嚴重疾病", "三大危疾多重", "額外癌症"],
    },
    {
      id: "early-ci-ratio",
      label: "早期危疾賠償比例",
      description: "原位癌、早期惡性腫瘤或通波仔手術之預先賠償百分比（通常為 20% 至 50%）",
      unitType: "percentage",
      unitSuffix: "%",
      category: "critical-illness",
      preferDirection: "desc",
      keywords: ["早期危疾", "早期嚴重疾病", "特別疾病", "非嚴重疾病"],
    },
    {
      id: "disease-count",
      label: "受保疾病總數量",
      description: "計劃涵蓋之嚴重危疾、早期疾病及兒童疾病總種類（38 種 至 197 種）",
      unitType: "count",
      unitSuffix: "種",
      category: "critical-illness",
      preferDirection: "desc",
      keywords: ["嚴重危疾", "嚴重疾病", "危疾保障", "特別疾病"],
      customExtractor: (product) => {
        for (const c of product.coverage ?? []) {
          const combined = `${c.item} ${c.limit}`;
          const res = parseCount(combined);
          if (res) return { ...res, matchedItem: c.item };
        }
        return null;
      },
    },
  ],

  // 7. 意外保險（Accident - 10 份產品）
  accident: [
    {
      id: "death-disability-limit",
      label: "意外身故及傷殘保額",
      description: "因意外導致身故、斷肢或永久完全傷殘之一筆過最高賠償（HK$50萬 至 HK$200萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "accident",
      scope: "general",
      isDefault: true,
      preferDirection: "desc",
      keywords: [
        "意外身故及斷肢",
        "意外身故及傷殘",
        "意外身故及永久傷殘",
        "意外身故",
        "人身意外",
        "死亡及永久傷殘",
      ],
    },
    {
      id: "medical-limit",
      label: "意外醫療費用上限",
      description: "因意外求醫之西醫門診、住院、物理治療及中醫跌打實報實銷上限",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "accident",
      scope: "general",
      preferDirection: "desc",
      keywords: ["意外醫療費用", "意外醫療", "醫療費用"],
    },
    {
      id: "double-indemnity-limit",
      label: "公共交通雙倍賠償額",
      description: "搭乘巴士、港鐵、渡輪等持牌公共交通工具意外身故之額外翻倍賠償（高達 HK$400萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "accident",
      scope: "general",
      preferDirection: "desc",
      keywords: ["雙倍賠償", "三倍賠償"],
    },
  ],

  // 8. 人壽保險（Life - 12 份產品）
  life: [
    {
      id: "max-cover-age",
      label: "最高保障續保年齡",
      description: "保證續保之最高年齡上限（定期壽險多數可續保至 75歲 至 100歲 終身）",
      unitType: "age",
      unitSuffix: "歲",
      category: "life",
      isDefault: true,
      preferDirection: "desc",
      keywords: ["保障期", "保險保障期", "保障年期", "保障期/續保", "保證續保", "身故賠償"],
      customExtractor: (product) => {
        // 若名稱含終身
        if (product.product_name_zh.includes("終身") || product.product_name.includes("Whole Life")) {
          return {
            numericValue: 100,
            displayValue: "終身 (100歲)",
            rawText: "終身人壽計劃",
            badge: "終身保障",
          };
        }
        for (const c of product.coverage ?? []) {
          const res = parseAgeOrYears(c.limit);
          if (res) return { ...res, matchedItem: c.item };
        }
        return null;
      },
    },
    {
      id: "max-sum-assured",
      label: "身故保額上限/典型保額",
      description: "計劃提供之最高投保額或免體檢投保上限（HK$100萬 至 HK$2,000萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "life",
      scope: "general",
      preferDirection: "desc",
      keywords: ["最高保額", "投保額", "保額範圍", "身故賠償", "身故保障", "身故權益", "最低保額"],
    },
    {
      id: "death-benefit-ratio",
      label: "身故賠付比例",
      description: "身故時賠償相等於投保額之百分比（純定期壽險劃一為 100% 保額）",
      unitType: "percentage",
      unitSuffix: "%",
      category: "life",
      preferDirection: "desc",
      keywords: ["身故賠償", "身故保障", "身故權益"],
    },
  ],

  // 9. 汽車保險（Motor - 9 份產品）
  motor: [
    {
      id: "tp-property-damage",
      label: "第三者財產損毀責任上限",
      description: "撞毀他人名貴車輛或公共設施之法律賠償上限（通常為 HK$200萬 至 HK$500萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "motor",
      scope: "general",
      isDefault: true,
      preferDirection: "desc",
      keywords: [
        "第三者財產損毀",
        "第三者財物損失",
        "第三者財物損壞",
        "第三者財物損毀",
        "第三者責任 - 財物損失",
      ],
    },
    {
      id: "tp-death-injury",
      label: "第三者人身傷亡責任上限",
      description: "香港法定最高第三者人身傷亡責任賠償額（市場全體統一為 HK$100,000,000）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "motor",
      scope: "general",
      preferDirection: "desc",
      keywords: [
        "第三者死亡或身體受傷",
        "第三者人身傷亡",
        "第三者身體受傷或死亡",
        "第三者責任 - 身體受傷",
      ],
    },
    {
      id: "windscreen-cover",
      label: "擋風玻璃意外損毀保障",
      description: "擋風玻璃或天窗碎裂更換費用賠償（HK$3,000 至 HK$10,000，且免自負額及不影響 NCD）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "motor",
      scope: "general",
      preferDirection: "desc",
      keywords: ["擋風玻璃", "擋風玻璃／天窗損毀保障", "前擋風玻璃保障"],
    },
  ],

  // 10. 家傭保險（Domestic Helper - 7 份產品）
  "domestic-helper": [
    {
      id: "hospital-surgical-limit",
      label: "家傭住院及手術費用上限",
      description: "工人姐姐住院、手術及麻醉費用年度總賠償限額（HK$25,000 至 HK$80,000/年）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "domestic-helper",
      scope: "general",
      isDefault: true,
      preferDirection: "desc",
      keywords: [
        "住院及手術費用",
        "住院及手術保障",
        "住院醫療",
        "外科手術及住院費用",
        "入住醫院費用",
        "手術及住院費用",
      ],
    },
    {
      id: "outpatient-limit",
      label: "家傭門診費用上限",
      description: "家傭日常感冒、傷風看西醫或中醫跌打之年度總津貼（HK$3,000 至 HK$4,000/年）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "domestic-helper",
      scope: "general",
      preferDirection: "desc",
      keywords: [
        "門診費用",
        "門診保障",
        "門診醫療",
        "家傭門診醫療費用",
        "診療費用",
      ],
    },
    {
      id: "fidelity-limit",
      label: "家傭誠信保障上限",
      description: "防範家傭不誠實行為、偷竊金錢財物或盜用長途電話之損失賠償（HK$3,000 至 HK$10,000）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "domestic-helper",
      scope: "general",
      preferDirection: "desc",
      keywords: [
        "家傭誠信保障",
        "家傭忠誠責任保障",
        "家傭忠誠保障",
        "忠誠保障",
        "家傭不誠實行為保障",
      ],
    },
    {
      id: "dental-limit",
      label: "家傭牙科費用上限",
      description: "家傭口腔手術、補牙、拔牙等牙科護理費用年度上限（HK$1,500 至 HK$2,500/年）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "domestic-helper",
      scope: "general",
      preferDirection: "desc",
      keywords: ["牙科費用", "牙科保障", "牙科醫療", "牙醫費用", "牙齒護理費用"],
    },
  ],

  // 11. 寵物保險（Pet - 4 份產品）
  pet: [
    {
      id: "annual-medical-limit",
      label: "年度獸醫門診及手術限額",
      description: "毛孩每年獸醫診金、X光檢驗、處方藥及手術醫療最高賠償額（HK$60,000 至 HK$100,000）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "pet",
      scope: "general",
      isDefault: true,
      preferDirection: "desc",
      keywords: [
        "醫療保障每年最高賠償額",
        "年度醫療保障",
        "醫療保障（獸醫診金",
        "手術+化療+身故費用合計每年最高賠償額",
        "門診及手術費用",
      ],
    },
    {
      id: "third-party-liability",
      label: "第三者法律責任保障上限",
      description: "寵物外出咬傷路人或損壞他人財物時之訴訟與賠償保障（HK$100萬 至 HK$275萬）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "pet",
      scope: "general",
      preferDirection: "desc",
      keywords: ["第三者責任保障", "第三者法律責任"],
    },
    {
      id: "chemo-limit",
      label: "化療及癌症保障上限",
      description: "寵物不幸罹患惡性腫瘤時之化療專項費用或一次性現金賠償（HK$10,000 至 HK$15,000）",
      unitType: "currency",
      unitSuffix: "HKD",
      category: "pet",
      scope: "general",
      preferDirection: "desc",
      keywords: ["化療保障", "癌症一次性現金保障"],
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 輔助查詢與提取函數（Helper & Query Functions）
 * ──────────────────────────────────────────────────────────────────────────── */

/** 獲取某個類別的所有可供比較的指標列表 */
export function getCategoryMetrics(categoryId: string): MetricDefinition[] {
  return CATEGORY_METRICS_MAP[categoryId] ?? [];
}

/** 獲取某個類別的預設指標（若無則回傳第一個） */
export function getDefaultMetric(
  categoryId: string
): MetricDefinition | undefined {
  const list = getCategoryMetrics(categoryId);
  return list.find((m) => m.isDefault) ?? list[0];
}

/** 獲取全站所有類別的指標清單 */
export function getAllMetrics(): MetricDefinition[] {
  return Object.values(CATEGORY_METRICS_MAP).flat();
}

/** 根據指標 ID 與類別 ID 尋找指標定義 */
export function findMetric(
  categoryId: string,
  metricId: string
): MetricDefinition | undefined {
  const list = getCategoryMetrics(categoryId);
  return list.find((m) => m.id === metricId);
}

/**
 * 從一份產品中提取特定指標的量化數值
 */
export function extractProductMetric(
  product: Product,
  metric: MetricDefinition
): ParsedMetricValue | null {
  // 1. 若指標具備自定義提取邏輯，優先調用
  if (metric.customExtractor) {
    const customRes = metric.customExtractor(product, metric);
    if (customRes) return customRes;
  }

  // 2. 遍歷 coverage 條目進行關鍵字比對
  for (const c of product.coverage ?? []) {
    const isMatched = metric.keywords.some((kw) => c.item.includes(kw));
    if (isMatched) {
      const parsed = parseGenericMetric(c.limit, metric);
      if (parsed) {
        return {
          ...parsed,
          matchedItem: c.item,
        };
      }
    }
  }

  return null;
}

/**
 * 為圖表準備標準化數據集（Bar Chart / Pie Chart 直接消費）
 * 包含：由高至低排序、歸一化視覺柱狀寬度、注入連結跳轉 URL、標記全數賠償 Badge
 */
export function prepareChartData(
  products: Product[],
  metric: MetricDefinition,
  options: PrepareChartOptions = {}
): ChartDataPoint[] {
  const {
    sortOrder = metric.preferDirection,
    filterEmpty = true,
    limit,
  } = options;

  // 1. 批次解析指標數值
  const results: {
    product: Product;
    parsed: ParsedMetricValue | null;
  }[] = [];

  for (const p of products) {
    const parsed = extractProductMetric(p, metric);
    if (parsed || !filterEmpty) {
      results.push({ product: p, parsed });
    }
  }

  // 2. 計算分類中的真實有限數值最大值（用於為「無上限 / 全數賠償」計算合理的視覺 Bar 比例）
  let trueMax = 0;
  for (const r of results) {
    if (
      r.parsed &&
      !r.parsed.isUnlimited &&
      !r.parsed.isFullCover &&
      r.parsed.numericValue < 900_000_000
    ) {
      if (r.parsed.numericValue > trueMax) {
        trueMax = r.parsed.numericValue;
      }
    }
  }
  if (trueMax === 0) trueMax = 100; // Fallback
  const visualCeiling = trueMax * 1.25;

  // 3. 構造 ChartDataPoint
  const points: ChartDataPoint[] = results.map(({ product, parsed }) => {
    const isFlagship = Boolean(parsed?.isUnlimited || parsed?.isFullCover);
    const numericValue = parsed?.numericValue ?? 0;
    // 視覺數值：若是旗艦條款，給予 visualCeiling，保證在柱狀圖置頂且條狀滿格，同時不壓扁其他柱
    const visualValue = isFlagship ? visualCeiling : numericValue;

    return {
      id: product.id,
      name: product.product_name_zh || product.product_name,
      insurer: product.insurer,
      insurerZh: product.insurer_zh,
      category: product.category,
      color: categoryColor(product.category),
      numericValue,
      visualValue,
      displayValue: parsed?.displayValue ?? "未提供",
      rawText: parsed?.rawText ?? "",
      badge: parsed?.badge,
      isFlagship,
      url: `/product/${product.id}`,
      matchedItem: parsed?.matchedItem,
    };
  });

  // 4. 排序處理
  if (sortOrder === "desc") {
    points.sort((a, b) => {
      // 旗艦條款始終排在最前列
      if (a.isFlagship && !b.isFlagship) return -1;
      if (!a.isFlagship && b.isFlagship) return 1;
      return b.numericValue - a.numericValue;
    });
  } else if (sortOrder === "asc") {
    points.sort((a, b) => a.numericValue - b.numericValue);
  }

  // 5. 限制條數（若有指定 limit）
  if (typeof limit === "number" && limit > 0) {
    return points.slice(0, limit);
  }

  return points;
}

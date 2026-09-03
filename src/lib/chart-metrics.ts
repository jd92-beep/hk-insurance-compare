import type { Product } from "@/types/insurance";
import { categoryColor } from "@/lib/categories";

/**
 * 全類別通用量化指標與圖表架構引擎（Universal Metrics & Chart Architect Engine）
 *
 * 支援全站 11 大類別（自願醫保、高端醫療、Top-up、旅遊、家居、危疾、意外、人壽、汽車、家傭、寵物）
 * 每個類別擴展至 15 至 20+ 個核心量化指標（全站共 181 項指標），支援多維度排序、圖表可視化與特點篩選。
 */

export type MetricUnitType = "currency" | "percentage" | "age" | "count" | "terms";

export type MetricScope = "annual" | "lifetime" | "daily" | "general";

export type MetricGroup =
  | "core"          // 核心限額（每年/終身/保額等）
  | "hospital"      // 住院手術及設施（病房、手術、麻醉、ICU、陪床等）
  | "outpatient"    // 門診及檢查（門診護理、成像檢測、物理治療、急症門診等）
  | "special"       // 專項特色保障（癌症、洗腎、全額賠償、免找數、多重賠償等）
  | "protection"    // 責任身故傷殘（第三者責任、身故賠償、意外傷殘、醫療疏忽等）
  | "lifestyle";    // 生活應急援助（行李、取消行程、更換門鎖、臨時住宿等）

export const METRIC_GROUP_LABELS: Record<string, string> = {
  all: "全部指標",
  core: "⭐ 核心限額",
  hospital: "🏥 住院手術",
  outpatient: "🔬 門診檢查",
  special: "🛡️ 專項特色",
  protection: "⚖️ 責任身故",
  lifestyle: "🎒 生活應急",
};

export interface MetricDefinition {
  id: string;
  label: string;
  description: string;
  unitType: MetricUnitType;
  unitSuffix: string;
  category: string;
  group?: MetricGroup;
  scope?: MetricScope;
  isDefault?: boolean;
  preferDirection: "asc" | "desc";
  keywords: string[];
  customExtractor?: (product: Product, metric: MetricDefinition) => ParsedMetricValue | null;
}

export interface ParsedMetricValue {
  numericValue: number;
  rawText: string;
  displayValue: string;
  matchedItem?: string;
  isUnlimited?: boolean;
  isFullCover?: boolean;
  badge?: string;
  range?: { min: number; max: number };
}

export interface ChartDataPoint {
  id: string;
  name: string;
  insurer: string;
  insurerZh: string;
  category: string;
  color: string;
  numericValue: number;
  visualValue: number;
  displayValue: string;
  rawText: string;
  badge?: string;
  isFlagship: boolean;
  url: string;
  matchedItem?: string;
}

export interface PrepareChartOptions {
  sortOrder?: "asc" | "desc";
  filterEmpty?: boolean;
  limit?: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 數值與正則解析引擎（Parsing Helpers）
 * ──────────────────────────────────────────────────────────────────────────── */

export function cleanNumber(text: string): number {
  return parseFloat(text.replace(/[, \s]/g, ""));
}

export function parseCurrency(
  text: string,
  scope: MetricScope = "general"
): ParsedMetricValue | null {
  if (!text) return null;
  text = String(text);

  // 1. 終身範疇
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
        badge: "終身無上限",
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
    const match = text.match(
      /終身(?:保障)?(?:限額|最高)?(?:為)?\s*(?:HK\$|HKD|港幣|港元|\$)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/
    );
    if (match) {
      const num = cleanNumber(match[1]);
      const unit = match[2];
      const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
      const val = num * mult;
      return {
        numericValue: val,
        displayValue: `HK$${num.toLocaleString()}${unit ?? ""}`,
        rawText: text,
        badge: `終身 HK$${num}${unit ?? ""}`,
      };
    }
  }

  // 2. 年間範疇
  if (scope === "annual") {
    if (/(?:白金版|每年|每保單年度|年度)?\s*無上限/.test(text) && !text.includes("終身")) {
      return {
        numericValue: 999_999_999,
        displayValue: "無上限",
        rawText: text,
        isUnlimited: true,
        badge: "無上限",
      };
    }
    const strictPrefix = text.match(
      /^\s*(?:HK\$|HKD|港幣|港元|\$)\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/
    );
    if (strictPrefix) {
      const num = cleanNumber(strictPrefix[1]);
      const unit = strictPrefix[2];
      const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
      const val = num * mult;
      return {
        numericValue: val,
        displayValue: `HK$${num.toLocaleString()}${unit ?? ""}`,
        rawText: text,
      };
    }
    const annualMatch = text.match(
      /(?:每保單年度|每年|年度保額|最高保障|每年保障限額|最高|高達每保單年度|高達每年|高達)\s*(?:HK\$|HKD|港幣|港元|\$)\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/
    );
    if (annualMatch) {
      const num = cleanNumber(annualMatch[1]);
      const unit = annualMatch[2];
      const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
      const val = num * mult;
      return {
        numericValue: val,
        displayValue: `HK$${num.toLocaleString()}${unit ?? ""}`,
        rawText: text,
      };
    }
  }

  // 3. 每日範疇
  if (scope === "daily") {
    if (/全數賠償|全額賠償|全額支付|100%實報實銷|實報實銷|不設細項賠償限額/i.test(text)) {
      return {
        numericValue: 999_999_999,
        displayValue: "全數賠償",
        rawText: text,
        isFullCover: true,
        badge: "全數賠償",
      };
    }
    const dailyMatch = text.match(
      /(?:每日|每天|每日每次|房租膳食每日|每病房每日|每日本地|住院每日|每天最高|每日最高)\s*(?:HK\$|HKD|港幣|港元|\$)\s*([\d,]+)|(?:HK\$|HKD|港幣|港元|\$)\s*([\d,]+)\s*[/／]\s*(?:日|天)/
    );
    if (dailyMatch) {
      const numStr = dailyMatch[1] ?? dailyMatch[2];
      const val = cleanNumber(numStr);
      return {
        numericValue: val,
        displayValue: `HK$${val.toLocaleString()}/日`,
        rawText: text,
        badge: `每日 HK$${val.toLocaleString()}`,
      };
    }
  }

  // 4. 全數賠償與無上限
  const isFullCover = /全數賠償|全額賠償|全額支付|100%實報實銷|實報實銷|不設細項賠償限額|不設分項限額|Full Cover/i.test(
    text
  );
  if (/^(?:不設上限|無上限|Unlimited)$/i.test(text.trim())) {
    return {
      numericValue: 999_999_999,
      displayValue: "無上限",
      rawText: text,
      isUnlimited: true,
      badge: "無上限",
    };
  }

  // 5. 一般金錢數值
  const candidates: { val: number; str: string }[] = [];
  const largeMatches = text.matchAll(
    /(?:HK\$|HKD|港幣|港元|\$)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)/g
  );
  for (const m of largeMatches) {
    const num = cleanNumber(m[1]);
    const unit = m[2];
    const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
    candidates.push({ val: num * mult, str: `HK$${num.toLocaleString()}${unit}` });
  }

  const exactMatches = text.matchAll(
    /(?:HK\$|HKD|港幣|港元|\$)\s*([\d,]+(?:\.\d+)?)/g
  );
  for (const m of exactMatches) {
    const val = cleanNumber(m[1]);
    const after = text.slice(m.index! + m[0].length, m.index! + m[0].length + 4);
    if (/[萬億]/.test(after)) continue;
    if (val > 0) {
      candidates.push({ val, str: `HK$${val.toLocaleString()}` });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.val - a.val);
    return {
      numericValue: candidates[0].val,
      displayValue: candidates[0].str,
      rawText: text,
      isFullCover,
      badge: isFullCover ? "全數賠償" : undefined,
    };
  }

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
  const yearMatch = text.match(/最長\s*(\d+)\s*年|保障期\s*(\d+)\s*年|(\d+)\s*年期/);
  if (yearMatch) {
    const yr = parseInt(yearMatch[1] ?? yearMatch[2] ?? yearMatch[3], 10);
    return {
      numericValue: yr,
      displayValue: `${yr} 年`,
      rawText: text,
      badge: `${yr} 年期`,
    };
  }
  return null;
}

export function parseCount(text: string): ParsedMetricValue | null {
  if (!text) return null;
  const countMatch = text.match(/涵蓋\s*(\d+)\s*種|(\d+)\s*種(?:危疾|疾病|嚴重疾病|常見危疾)/);
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

export function parseGenericMetric(
  text: string,
  metric: MetricDefinition
): ParsedMetricValue | null {
  switch (metric.unitType) {
    case "currency": {
      const parsed = parseCurrency(text, metric.scope ?? "general");
      if (parsed) return parsed;
      // 若金額字段中含有全數賠償、全額填補、100%實報實銷等文字
      if (/全數賠償|全額|100%|實報實銷|不設細項上限/i.test(text)) {
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
    case "percentage":
      return parsePercentage(text);
    case "age":
      return parseAgeOrYears(text);
    case "count":
      return parseCount(text);
    case "terms": {
      if (!text) return null;
      const isFull = /全數賠償|全額|100%|免核保|保證|直付|免找數/i.test(text);
      return {
        numericValue: isFull ? 100 : 50,
        displayValue: text.length > 24 ? `${text.slice(0, 22)}…` : text,
        rawText: text,
        badge: isFull ? "旗艦條款" : "專項權益",
      };
    }
    default:
      return parseCurrency(text, metric.scope ?? "general");
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 全站 11 大類別指標矩陣定義（Category Metrics Definition Matrix）
 * ──────────────────────────────────────────────────────────────────────────── */

export const CATEGORY_METRICS_MAP: Record<string, MetricDefinition[]> = {
  "medical": [
    {
      "id": "annual-limit",
      "label": "每年保障限額",
      "description": "每年最高可索償的醫療保障金額（標準計劃劃一 HK$42萬，靈活計劃可達 HK$4,000萬）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "core",
      "scope": "annual",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "每年保障限額",
        "年度保額",
        "最高保障",
        "年度限額",
        "保障限額"
      ]
    },
    {
      "id": "lifetime-limit",
      "label": "終身保障限額",
      "description": "受保人終身累計最高賠償額度（標準計劃劃一不設限額，靈活計劃高達 HK$8,000萬）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "core",
      "scope": "lifetime",
      "preferDirection": "desc",
      "keywords": [
        "終身保障限額",
        "終身保額",
        "終身最高",
        "終身限額"
      ]
    },
    {
      "id": "room-board",
      "label": "每日病房及膳食",
      "description": "住院期間每日病房與膳食賠償額度（標準計劃 HK$750/日，靈活計劃多數全數賠償）",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "病房及膳食",
        "病房膳食",
        "病房每日"
      ]
    },
    {
      "id": "misc-charges",
      "label": "雜項開支每年上限",
      "description": "住院期間處方藥物、敷料、病理檢驗等雜費（標準計劃每年 HK$14,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "雜項開支",
        "住院雜費",
        "醫療雜費"
      ]
    },
    {
      "id": "doctor-visit",
      "label": "主診醫生巡房費（每日）",
      "description": "主診醫生每日巡房診治費用（標準計劃每日 HK$750）",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "主診醫生巡房費",
        "巡房費",
        "醫生巡房"
      ]
    },
    {
      "id": "specialist-fee",
      "label": "專科醫生費（每年）",
      "description": "主診醫生書面轉介之專科醫生會診費（標準計劃每年 HK$4,300）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "專科醫生費",
        "專科醫生巡房",
        "專科會診"
      ]
    },
    {
      "id": "surgeon-fee",
      "label": "外科醫生手術費",
      "description": "外科手術費用（標準計劃按手術級別分小型至複雜 HK$5,000 至 HK$50,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "外科醫生費",
        "手術費",
        "主要醫療費用"
      ]
    },
    {
      "id": "anaesthetist-fee",
      "label": "麻醉科醫生費",
      "description": "手術麻醉科醫生專門收費（標準計劃劃一為外科醫生費之 35%）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "麻醉科醫生費",
        "麻醉師費",
        "麻醉費"
      ]
    },
    {
      "id": "operating-theatre",
      "label": "手術室費",
      "description": "手術室租用及設備使用開支（標準計劃劃一為外科醫生費之 35%）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "手術室費",
        "手術室開支"
      ]
    },
    {
      "id": "icu-limit",
      "label": "深切治療每日上限 (ICU)",
      "description": "入住深切治療部（ICU）每日最高津貼（標準計劃每日 HK$3,500，靈活計劃全數賠償）",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "深切治療",
        "加護病房",
        "重症監護"
      ]
    },
    {
      "id": "diagnostic-imaging",
      "label": "訂明診斷成像檢測 (CT/MRI)",
      "description": "電腦斷層掃描 CT、磁力共振 MRI、正電子掃描 PET（標準計劃每年 HK$20,000 設 30% 自負額）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "訂明診斷成像檢測",
        "先進診斷成像",
        "MRI",
        "CT",
        "PET"
      ]
    },
    {
      "id": "cancer-treatment",
      "label": "訂明非手術癌症治療",
      "description": "放射性治療、化療、標靶治療、免疫治療及荷爾蒙治療（標準計劃每年 HK$80,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "訂明非手術癌症治療",
        "癌症治療",
        "化療",
        "標靶治療",
        "非手術癌症"
      ]
    },
    {
      "id": "outpatient-care",
      "label": "出入院前後門診護理",
      "description": "住院或日間手術前後之門診諮詢及跟進（標準計劃每次 HK$580，每年 HK$3,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "出院前及入院前門診護理",
        "入院前或出院後",
        "出入院前後門診"
      ]
    },
    {
      "id": "psychiatric-treatment",
      "label": "精神科治療每年上限",
      "description": "香港境內私家醫院專科精神科住院治療費用（標準計劃每年 HK$30,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "精神科治療",
        "精神科"
      ]
    },
    {
      "id": "dialysis-treatment",
      "label": "門診透析（洗腎費用）",
      "description": "慢性腎衰竭常規門診血液透析或腹膜透析費用（靈活計劃每年高達 HK$86,000 至全數賠償）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "門診透析",
        "洗腎費用",
        "洗腎"
      ]
    },
    {
      "id": "emergency-outpatient",
      "label": "意外急症門診治療",
      "description": "因意外受傷於醫院急症室或門診診所接受緊急救治費用（每年 HK$10,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "意外急診門診治療",
        "意外受傷急症門診",
        "意外急診"
      ]
    },
    {
      "id": "day-surgery",
      "label": "日間手術保障",
      "description": "免住院之小型日間內窺鏡或切除手術保障及專項現金津貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "日間手術",
        "日間手術現金津貼"
      ]
    },
    {
      "id": "companion-bed",
      "label": "親屬陪床費（每日）",
      "description": "受保人或幼童家長陪同住院之額外床位每日津貼（每日 HK$600 至全數賠償）",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "陪床費",
        "親屬陪床",
        "家長陪床"
      ]
    },
    {
      "id": "compassionate-death",
      "label": "恩恤身故賠償",
      "description": "受保人不幸身故時向受益人發放之恩恤津貼（劃一每份保單 HK$10,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "medical",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "恩恤身故賠償",
        "身故賠償",
        "恩恤賠償"
      ]
    },
    {
      "id": "renewal-age",
      "label": "保證續保年齡",
      "description": "政府法定自願醫保劃一保證續保至 100 歲，不因健康狀況調高保費或加設不保事項",
      "unitType": "age",
      "unitSuffix": "歲",
      "category": "medical",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "保證續保年齡",
        "保證續保至",
        "續保年齡"
      ]
    }
  ],
  "high-end-medical": [
    {
      "id": "annual-limit",
      "label": "每年保障限額",
      "description": "每年最高賠償限額（高達 HK$2,000萬 至 HK$4,500萬，頂級方案不設上限）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "core",
      "scope": "annual",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "每年保障限額",
        "每年及終身保障限額",
        "年度保額",
        "年度限額",
        "保障限額"
      ]
    },
    {
      "id": "lifetime-limit",
      "label": "終身保障限額",
      "description": "受保人終身累計最高賠償額（HK$3,500萬 至 終身無上限）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "core",
      "scope": "lifetime",
      "preferDirection": "desc",
      "keywords": [
        "終身保障限額",
        "每年及終身保障限額",
        "每年保障限額",
        "終身保額",
        "終身最高",
        "終身限額"
      ]
    },
    {
      "id": "hospital-surgical",
      "label": "住院及外科手術費用",
      "description": "外科手術費、麻醉師費、手術室開支全數賠償，不設細項限制",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "主要醫療費用",
        "住院及手術",
        "住院醫療",
        "外科手術"
      ]
    },
    {
      "id": "room-board",
      "label": "病房及膳食全額賠償",
      "description": "入住指定地域標準私家單人房之住宿及膳食開支全額實報實銷",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "病房及膳食",
        "標準私家房",
        "病房每日"
      ]
    },
    {
      "id": "cashless-billing",
      "label": "全球出院免找數直付",
      "description": "覆蓋全球逾百萬間醫療機構與港澳私家醫院，出院免找數直付",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "high-end-medical",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "全球出院免找數直付",
        "出院免找數",
        "醫療網絡直付"
      ]
    },
    {
      "id": "cancer-treatment",
      "label": "癌症標靶及質子治療",
      "description": "先進癌症標靶治療、免疫療法、質子治療及荷爾蒙治療全數賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "訂明癌症藥物及非手術治療",
        "癌症治療",
        "非手術癌症",
        "標靶治療"
      ]
    },
    {
      "id": "diagnostic-imaging",
      "label": "先進診斷造影 (CT/MRI)",
      "description": "住院或門診接受 CT、MRI、PET 掃描費用實報實銷，0% 共同保險",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "先進診斷成像檢測",
        "診斷成像",
        "MRI",
        "CT"
      ]
    },
    {
      "id": "emergency-evacuation",
      "label": "全球緊急醫療專機運送",
      "description": "24小時國際緊急救援，專機運送至最適當醫療中心及遺體運返全額賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "緊急醫療運送及遺體運返",
        "緊急醫療運送",
        "國際救援"
      ]
    },
    {
      "id": "outpatient-care",
      "label": "出院後護理及物理治療",
      "description": "出院後長達 180 至 365 天之專科門診、居家護理、針灸及物理治療",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "出院後護理及物理治療",
        "出院後護理",
        "出院後門診"
      ]
    },
    {
      "id": "dialysis-treatment",
      "label": "門診洗腎透析全數賠償",
      "description": "因慢性腎衰竭於日間中心接受血液透析或腹膜透析費用全數賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "門診透析",
        "洗腎費用",
        "洗腎"
      ]
    },
    {
      "id": "psychiatric-treatment",
      "label": "精神科治療保障",
      "description": "專科精神科醫生住院診治與心理諮詢保障（全數賠償或高達 HK$50,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "精神科治療保障",
        "精神科治療",
        "精神科"
      ]
    },
    {
      "id": "reconstruction-surgery",
      "label": "重建手術及義肢假體",
      "description": "因意外或乳癌切除後之自體或假體重建手術費用全數賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "重建手術保障",
        "重建手術",
        "義肢"
      ]
    },
    {
      "id": "day-surgery",
      "label": "門診手術及日間護理",
      "description": "門診或日間手術中心進行小型外科手術全數賠償，免住院亦獲保障",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "門診手術及日間護理",
        "日間手術",
        "門診手術"
      ]
    },
    {
      "id": "companion-bed",
      "label": "家屬陪床費全數賠償",
      "description": "受保人住院期間親屬同行陪床床位開支全數報銷或每日高額補貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "陪床費",
        "親屬陪床",
        "家長陪床"
      ]
    },
    {
      "id": "conversion-right",
      "label": "免核保保證轉保權限",
      "description": "於指定年齡（如50/55/60/65歲）可免體檢免核保調減自負額或轉保",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "high-end-medical",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "保證轉保",
        "免核保轉保",
        "轉保權限"
      ]
    },
    {
      "id": "smm-limit",
      "label": "額外醫療總限額 (SMM)",
      "description": "額外醫療補充保障總限額（HK$100,000 至 HK$300,000 或無上限）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "core",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "額外醫療總限額",
        "SMM 限額"
      ]
    },
    {
      "id": "smm-ratio",
      "label": "SMM 超額賠償比率",
      "description": "超出基本分項限額之醫療費用補貼比率（通常為 80% 至 100% 實報實銷）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "high-end-medical",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "SMM 超額賠償比率",
        "超額賠償比率"
      ]
    },
    {
      "id": "deductible-options",
      "label": "自付費門檻多檔彈性",
      "description": "自選自付費（墊底費）檔次（HK$0 至 HK$80,000），配合公司醫保大幅降保費",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "high-end-medical",
      "group": "core",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "自付費（墊底費）選項",
        "自負額",
        "自付費"
      ]
    },
    {
      "id": "second-medical-opinion",
      "label": "環球頂尖第二醫療意見",
      "description": "由哈佛、約翰霍普金斯等全球權威醫療專科專家提供獨立診斷覆核",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "high-end-medical",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "專屬健康管家與全球第二醫療意見",
        "第二醫療意見",
        "健康管家"
      ]
    },
    {
      "id": "coverage-region",
      "label": "保障地域範圍",
      "description": "靈活選擇亞洲、全球除美或全球通用醫療保障網絡",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "high-end-medical",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "保障地域",
        "地域覆蓋",
        "全球保障"
      ]
    }
  ],
  "top-up-medical": [
    {
      "id": "smm-ratio",
      "label": "SMM 超額賠償比率",
      "description": "填補公司團體醫保不足之超額醫療差額賠償百分比（通常為 80% 至 100% 實報實銷）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "top-up-medical",
      "group": "core",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "SMM 超額醫療差額賠償比率",
        "SMM 超額賠償比率",
        "超額賠償比率"
      ]
    },
    {
      "id": "smm-annual-limit",
      "label": "每年最高賠償限額",
      "description": "每年額外醫療保障賠償總額（高達 HK$150,000 至 HK$1,000,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "core",
      "scope": "annual",
      "preferDirection": "desc",
      "keywords": [
        "每年最高賠償限額",
        "每年保障限額",
        "年度限額"
      ]
    },
    {
      "id": "smm-total-limit",
      "label": "額外醫療總限額",
      "description": "額外醫療（SMM）總限額（HK$100,000 至 HK$500,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "core",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "額外醫療總限額",
        "附加醫療總限額"
      ]
    },
    {
      "id": "shortfall-cover",
      "label": "公司醫保 Shortfall 填補",
      "description": "無縫填補公司醫療保險超額自付差額，實報實銷差額費用",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "top-up-medical",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "公司醫保 Shortfall 填補",
        "Shortfall 填補",
        "差額填補"
      ]
    },
    {
      "id": "excess-hospital-surgical",
      "label": "主要醫療手術差額補償",
      "description": "外科手術費、麻醉費及手術室費超出公司醫保上限之差額補償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "主要醫療及外科手術差額補償",
        "外科手術差額",
        "手術差額"
      ]
    },
    {
      "id": "excess-room-board",
      "label": "病房膳食差額補償（每日）",
      "description": "每日住院病房與膳食超出僱主保單上限之差額補償（每日 HK$500 至 HK$1,200）",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "top-up-medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "病房及膳食差額補償",
        "病房差額",
        "病房膳食"
      ]
    },
    {
      "id": "excess-doctor-misc",
      "label": "醫生巡房及雜項補償",
      "description": "專科醫生巡房費及各項合資格住院雜費之差額賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "專科醫生巡房費及雜項補償",
        "醫生巡房差額",
        "雜項差額"
      ]
    },
    {
      "id": "smm-cancer-drugs",
      "label": "癌症藥物及標靶治療補充",
      "description": "額外補充癌症標靶藥物、化療及荷爾蒙治療開支（每年高達 HK$200,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "訂明癌症藥物及治療補充",
        "癌症藥物補充",
        "癌症標靶補充"
      ]
    },
    {
      "id": "outpatient-imaging",
      "label": "先進診斷造影差額保障",
      "description": "CT、MRI、PET 掃描超出公司醫保上限之差額補償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "先進診斷成像檢測",
        "造影差額",
        "MRI",
        "CT"
      ]
    },
    {
      "id": "post-hospital-physio",
      "label": "出院後專科覆診及物理治療",
      "description": "出院後專科門診諮詢及物理治療超額補償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "出院後專科覆診及物理治療",
        "出院後覆診",
        "物理治療差額"
      ]
    },
    {
      "id": "emergency-evacuation",
      "label": "緊急醫療運送及支援",
      "description": "24小時緊急醫療運送及送返支援服務",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "緊急醫療運送",
        "醫療運送"
      ]
    },
    {
      "id": "day-surgery-topup",
      "label": "門診手術及日間護理補償",
      "description": "日間手術或小型門診手術差額補償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "門診手術及日間護理",
        "日間手術差額"
      ]
    },
    {
      "id": "companion-bed-topup",
      "label": "親屬陪床津貼補償",
      "description": "住院親屬額外陪床每日津貼差額",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "top-up-medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "陪床費 / 親屬陪床津貼",
        "陪床津貼"
      ]
    },
    {
      "id": "conversion-right",
      "label": "離職或退休保證轉保權",
      "description": "離職或退休時免重新體檢、免核保保證轉保至個人終身醫保",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "top-up-medical",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "離職或退休保證轉保權",
        "保證轉保權",
        "離職轉保"
      ]
    },
    {
      "id": "renewal-age",
      "label": "保證續保年齡上限",
      "description": "最高可保證續保至 80 至 85 歲",
      "unitType": "age",
      "unitSuffix": "歲",
      "category": "top-up-medical",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "保證續保年齡",
        "續保年齡"
      ]
    },
    {
      "id": "hospital-cash",
      "label": "意外住院現金津貼（每日）",
      "description": "因意外住院每日定額現金補償（每日 HK$500 至 HK$1,000）",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "top-up-medical",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "意外住院現金津貼",
        "住院現金津貼"
      ]
    },
    {
      "id": "chiro-bonesetter",
      "label": "門診中醫及跌打治療補償",
      "description": "中醫內科、骨傷及跌打治療門診費用差額賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "top-up-medical",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "門診中醫及跌打治療補償",
        "跌打治療",
        "中醫門診"
      ]
    },
    {
      "id": "no-underwriting",
      "label": "免核保加入條件",
      "description": "受保於有效公司團體醫保者，投保時免體檢免繁瑣核保程序",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "top-up-medical",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "免核保加入條件",
        "免核保",
        "免體檢"
      ]
    }
  ],
  "travel": [
    {
      "id": "medical-expenses",
      "label": "海外醫療費用上限",
      "description": "旅行途中因意外或突發疾病於當地醫院門診及住院治療費用（最高 HK$1,000,000 至 HK$1,500,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "core",
      "scope": "general",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "醫療費用",
        "海外醫療",
        "醫療及相關費用"
      ]
    },
    {
      "id": "baggage-loss",
      "label": "行李及個人財物保障",
      "description": "個人行李物品、衣物及隨身裝備失竊或意外損壞賠償（最高 HK$20,000 至 HK$30,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "行李及個人財物",
        "個人行李",
        "行李損毀"
      ]
    },
    {
      "id": "trip-cancellation",
      "label": "取消行程賠償上限",
      "description": "出發前因患重病、天災或目的地黑色暴雨罷工導致取消旅程之訂金損失（最高 HK$25,000 至 HK$50,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "取消行程",
        "旅程取消",
        "取消旅程"
      ]
    },
    {
      "id": "personal-liability",
      "label": "個人第三者法律責任",
      "description": "海外疏忽引致第三者身體受傷或財物受損之法律抗辯及賠償上限（高達 HK$2,000,000 至 HK$5,000,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "個人法律責任",
        "第三者責任",
        "個人責任"
      ]
    },
    {
      "id": "trip-delay",
      "label": "行程延誤現金津貼",
      "description": "航班延誤超過指定時數（通常每滿 5-6 小時）之現金津貼或額外住宿交通費用",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "旅程延誤",
        "行程延誤",
        "出發延誤"
      ]
    },
    {
      "id": "baggage-delay",
      "label": "行李延誤緊急津貼",
      "description": "抵達海外目的地後行李延誤超過 6-8 小時購買應急衣物及梳洗用品之補貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "行李延誤",
        "行李延遲"
      ]
    },
    {
      "id": "emergency-evacuation",
      "label": "緊急醫療運送及送返",
      "description": "24小時國際救援組織安排專機或民航運送至最適當醫院或返港（多數計劃全額無上限賠償）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "緊急醫療運送",
        "遺體送返",
        "緊急運送"
      ]
    },
    {
      "id": "accidental-death",
      "label": "意外身故及永久傷殘",
      "description": "旅行途中遭遇意外導致身故或永久喪失工作能力之一次性賠償（HK$500,000 至 HK$1,500,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "人身意外",
        "意外身故",
        "意外傷殘"
      ]
    },
    {
      "id": "rental-car-excess",
      "label": "自駕遊租車自負額",
      "description": "海外自駕遊租車發生碰撞或被盜時，賠償保險保單之墊底費（HK$3,000 至 HK$10,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "租車自負額",
        "自駕遊租車",
        "租車保障"
      ]
    },
    {
      "id": "high-risk-sports",
      "label": "業餘高危運動保障",
      "description": "涵蓋滑雪、水肺潛水（深度通常30米內）、滑翔傘、熱氣球、笨豬跳等業餘活動受傷保障",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "travel",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "業餘運動",
        "滑雪及潛水",
        "高危運動"
      ]
    },
    {
      "id": "electronic-devices",
      "label": "手提電話及電腦保障",
      "description": "智能手機、手提電腦、平板電腦意外損壞或失竊獨立賠償限額（HK$2,000 至 HK$5,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "手提電話",
        "手提電腦",
        "流動電子產品"
      ]
    },
    {
      "id": "money-passport",
      "label": "現金及旅行證件遺失",
      "description": "現金被扒竊及重辦護照機票所需之額外交通與住宿補償（HK$2,000 至 HK$5,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "現金損失",
        "旅行證件",
        "個人金錢"
      ]
    },
    {
      "id": "home-burglary",
      "label": "離港期間家居防盜",
      "description": "全家出門旅遊期間，香港住宅住所遭破門爆竊之財物損失賠償（HK$10,000 至 HK$30,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "家居防盜",
        "旅遊期間家居盜竊",
        "家居保障"
      ]
    },
    {
      "id": "pet-boarding",
      "label": "寵物寄養延遲津貼",
      "description": "因行程延誤導致返港推遲，需支付寵物酒店或寄養機構之額外費用補償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "寵物寄養",
        "寵物住宿"
      ]
    },
    {
      "id": "overseas-compassionate-visit",
      "label": "親屬海外探病費用",
      "description": "受保人於海外住院超過指定天數，安排直系親屬前往探病之來回機票及住宿賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "親屬探訪",
        "海外探病",
        "探訪津貼"
      ]
    },
    {
      "id": "credit-card-protection",
      "label": "信用卡被盜用保障",
      "description": "旅行期間信用卡失竊後未經授權簽賬款項之賠償保障（HK$5,000 至 HK$15,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "travel",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "信用卡保障",
        "信用卡被盜用",
        "未經授權簽賬"
      ]
    }
  ],
  "home": [
    {
      "id": "contents-sum-insured",
      "label": "家居財物總保障額",
      "description": "家庭傢俬、電器、室內裝修及日常用品遭火災、颱風、水浸損毀之最高賠償總額（每年高達 HK$50萬 至 HK$200萬）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "core",
      "scope": "general",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "家居財物",
        "財物保障",
        "家居物品"
      ]
    },
    {
      "id": "personal-liability",
      "label": "第三者法律責任上限",
      "description": "業主或租客因單位鋁窗墮下、冷氣機滴水或爆水喉引致第三者傷亡財損之法律責任（全港普遍提供 HK$500萬 至 HK$2,000萬）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "第三者責任",
        "公眾責任",
        "法律責任"
      ]
    },
    {
      "id": "alternative-accommodation",
      "label": "臨時住宿及租金損失",
      "description": "因火災或嚴重水浸導致住宅無法居住時，屋主或租客入住酒店之開支補貼（每月高達 HK$20,000 至 HK$100,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "臨時住宿",
        "臨時居住",
        "租金損失"
      ]
    },
    {
      "id": "frozen-food",
      "label": "雪櫃冷藏食物損壞",
      "description": "公用電網停電或雪櫃電路故障導致冷藏生鮮食物變質損壞之賠償（HK$2,000 至 HK$5,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "冷藏食物",
        "雪櫃食物",
        "冷凍食品"
      ]
    },
    {
      "id": "lock-replacement",
      "label": "更換門鎖及鎖匙保障",
      "description": "大門鑰匙遺失或住宅遭破門爆竊後，聘請鎖匠更換全新門鎖費用（HK$2,000 至 HK$4,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "更換門鎖",
        "門鎖更換",
        "更換門鎖及鎖匙"
      ]
    },
    {
      "id": "window-glass",
      "label": "窗戶及固定玻璃破裂",
      "description": "颱風或意外導致住宅固定鋁窗、露台落地玻璃或浴室鏡面爆裂更換開支",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "窗戶及固定玻璃",
        "固定玻璃",
        "窗戶玻璃"
      ]
    },
    {
      "id": "pipe-burst",
      "label": "喉管爆裂水浸財物損毀",
      "description": "食水或排污喉管突然爆裂，室內嚴重積水損毀地板與傢俬之專項賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "水浸",
        "喉管爆裂",
        "爆水喉"
      ]
    },
    {
      "id": "electrical-appliances",
      "label": "家居主要電器損壞",
      "description": "因電壓突波或意外導致冷氣機、電視機、洗衣機損壞之維修及重置賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "家庭電器",
        "家用電器",
        "電器損壞"
      ]
    },
    {
      "id": "worldwide-belongings",
      "label": "全球個人隨身財物",
      "description": "受保人及同住家人攜帶手錶、珠寶首飾及筆記型電腦外出失竊之全球性保障",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "全球個人財物",
        "隨身財物",
        "個人隨身財物"
      ]
    },
    {
      "id": "helper-property",
      "label": "家傭個人財物保障",
      "description": "同住家庭傭工因住宅意外或爆竊導致個人財物受損之撫恤賠償（HK$5,000 至 HK$10,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "家傭財物",
        "家庭傭工財物"
      ]
    },
    {
      "id": "valuable-items",
      "label": "貴重物品/珠寶單一限額",
      "description": "單件名貴手錶、鑽戒、黃金首飾或藝術品未經個別申報之最高賠償上限",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "貴重物品",
        "貴重財物",
        "珠寶首飾"
      ]
    },
    {
      "id": "interior-decoration",
      "label": "家居室內裝修期間保障",
      "description": "住宅進行不超過指定金額之小型翻新裝修工程期間，自動享有工程損壞及責任保障",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "home",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "裝修期間",
        "室內裝修",
        "家居裝修"
      ]
    },
    {
      "id": "trauma-cleaning",
      "label": "意外身故善後清理費用",
      "description": "住宅不幸發生致命意外或暴力案件後，專業清潔公司進行現場復原消毒之專項津貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "清理費用",
        "現場清理",
        "善後清理"
      ]
    },
    {
      "id": "credit-card-fraud",
      "label": "信用卡盜用損失保障",
      "description": "身份證明文件或信用卡於住宅內被盜用造成之金錢損失補償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "信用卡盜用",
        "信用卡損失"
      ]
    },
    {
      "id": "identity-theft",
      "label": "身份被盜用法律開支",
      "description": "個人資料遭不法分子冒用進行詐騙或借貸時，聘請律師處理糾紛之法律訴訟援助",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "身份盜用",
        "個人身份防護"
      ]
    },
    {
      "id": "debris-removal",
      "label": "殘餘物清理費用上限",
      "description": "火災水浸後清除及搬運被燒毀傢俬殘渣瓦礫之清理開支（HK$10,000 至 HK$30,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "home",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "清理殘餘物",
        "殘餘物清理",
        "清理費用"
      ]
    }
  ],
  "critical-illness": [
    {
      "id": "severe-ci-benefit",
      "label": "嚴重危疾保障比例",
      "description": "首次確診癌症、急性心肌梗塞、中風等嚴重危疾之保額賠償百分比（通常為 100% 保額）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "critical-illness",
      "group": "core",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "嚴重危疾",
        "主要危疾",
        "嚴重疾病"
      ]
    },
    {
      "id": "early-ci-benefit",
      "label": "早期危疾及原位癌",
      "description": "原位癌、早期甲狀腺癌或微創心臟搭橋手術之預先賠償百分比（通常為 20% 至 25%）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "critical-illness",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "早期危疾",
        "原位癌",
        "早期疾病"
      ]
    },
    {
      "id": "multiple-cancer",
      "label": "癌症多次賠償總額比例",
      "description": "癌症復發、轉移、持續存在或新發癌症之多次賠償總百分比（高達保額的 300% 至 600%）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "critical-illness",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "多重癌症",
        "多次癌症",
        "癌症多重賠償"
      ]
    },
    {
      "id": "disease-count",
      "label": "涵蓋受保疾病總數",
      "description": "保單所涵蓋的嚴重疾病、早期危疾、原位癌及兒童嚴重疾病之項目總數（多達 100 至 197 種）",
      "unitType": "count",
      "unitSuffix": "種",
      "category": "critical-illness",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "受保疾病",
        "疾病總數",
        "涵蓋疾病"
      ]
    },
    {
      "id": "heart-stroke-multiple",
      "label": "心臟病及中風多次賠償",
      "description": "心臟病突發或腦中風再次發作之額外多次索償總百分比（高達 200% 至 300%）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "critical-illness",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "心臟病多次",
        "中風多次",
        "心臟病及中風多重"
      ]
    },
    {
      "id": "benign-tumor",
      "label": "良性腫瘤切除手術賠償",
      "description": "經手術切除良性腫瘤（如乳房纖維瘤、子宮肌瘤等）之額外特別津貼（最高 5% 至 15% 保額）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "critical-illness",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "良性腫瘤",
        "良性病變"
      ]
    },
    {
      "id": "icu-stay-benefit",
      "label": "深切治療住院預先賠償",
      "description": "因任何未知突發疾病或嚴重意外入住深切治療部（ICU）達指定天數即可提前獲賠保額 20%",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "critical-illness",
      "group": "hospital",
      "preferDirection": "desc",
      "keywords": [
        "深切治療保障",
        "ICU 住院",
        "深切治療預先賠償"
      ]
    },
    {
      "id": "childhood-illness",
      "label": "兒童特有疾病保障",
      "description": "專為未成年人設有自閉症、專注力不足、嚴重哮喘及川崎病等專項額外賠償",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "critical-illness",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "兒童疾病",
        "兒童特有危疾",
        "兒童保障"
      ]
    },
    {
      "id": "premium-waiver",
      "label": "確診後豁免後續保費",
      "description": "受保人首次確診嚴重危疾後，免除往後所有未到期保費，保障依然終身有效",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "critical-illness",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "豁免保費",
        "保費豁免",
        "保費免除"
      ]
    },
    {
      "id": "carcinoma-in-situ",
      "label": "原位癌特別津貼",
      "description": "針對乳房、子宮頸、大腸或前列腺原位癌之即時單獨現金賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "critical-illness",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "原位癌保障",
        "原位癌特別保障"
      ]
    },
    {
      "id": "loss-of-independence",
      "label": "失去獨立生活能力年金",
      "description": "因危疾導致日常六大活動不能自理時，每月發放持續護理年金（長達 60 個月）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "critical-illness",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "失去獨立生活能力",
        "生活年金",
        "日常活動不能自理"
      ]
    },
    {
      "id": "death-benefit",
      "label": "人壽身故賠償",
      "description": "受保人不幸身故時發放之保證身故賠償金額",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "critical-illness",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "身故賠償",
        "人壽身故",
        "身故保障"
      ]
    },
    {
      "id": "dementia-care",
      "label": "認知障礙及帕金森專項",
      "description": "確診嚴重阿茲海默症或嚴重帕金森症之額外每月照料現金津貼",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "critical-illness",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "認知障礙",
        "阿茲海默症",
        "帕金森"
      ]
    },
    {
      "id": "lifestyle-rehab",
      "label": "危疾復康及生活支援",
      "description": "心理諮詢、專業營養師跟進、居家無障礙改裝津貼及中醫調理補貼",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "critical-illness",
      "group": "lifestyle",
      "preferDirection": "desc",
      "keywords": [
        "復康支援",
        "生活支援",
        "復康服務"
      ]
    },
    {
      "id": "coverage-age",
      "label": "最高保障年齡",
      "description": "保單承保之最高年齡上限（多數計劃保障至 100 歲或終身）",
      "unitType": "age",
      "unitSuffix": "歲",
      "category": "critical-illness",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "最高保障年齡",
        "保障至",
        "保證至"
      ]
    },
    {
      "id": "total-claim-payout",
      "label": "終身總賠償百分比",
      "description": "多重危疾及持續癌症疊加索償之終身最高總賠償額度（高達保額的 600% 至 900%）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "critical-illness",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "總賠償百分比",
        "最高總賠償",
        "累計賠償上限"
      ]
    }
  ],
  "accident": [
    {
      "id": "accidental-death",
      "label": "意外身故及永久傷殘",
      "description": "遭遇突發意外不幸身故或雙目失明、失去雙肢之全額賠償上限（HK$500,000 至 HK$3,000,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "core",
      "scope": "general",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "意外身故",
        "意外身故及永久傷殘",
        "意外傷殘"
      ]
    },
    {
      "id": "medical-reimbursement",
      "label": "意外醫療費用實報實銷",
      "description": "因意外受傷在門診、急症室或住院治療之西醫及化驗費用實報實銷（每次事故 HK$10,000 至 HK$100,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "意外醫療",
        "醫療費用",
        "意外醫療費用"
      ]
    },
    {
      "id": "public-transport-double",
      "label": "公共交通工具雙倍賠償",
      "description": "乘搭港鐵、巴士、渡輪或民航機時遇意外身故傷殘，賠償額倍增為 200% 至 300%",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "accident",
      "group": "protection",
      "preferDirection": "desc",
      "keywords": [
        "公共交通",
        "雙倍賠償",
        "公共交通雙倍"
      ]
    },
    {
      "id": "bone-fracture",
      "label": "骨折及脫臼額外津貼",
      "description": "運動扭傷或摔倒導致閉合性/開放性骨折與關節脫臼之一次性手術津貼（HK$5,000 至 HK$30,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "骨折",
        "脫臼",
        "骨折津貼"
      ]
    },
    {
      "id": "bonesetter-physio",
      "label": "跌打及物理治療門診",
      "description": "註冊中醫骨傷科、跌打敷藥或註冊物理治療師門診每次限額及年度上限（每年 HK$3,000 至 HK$8,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "跌打",
        "物理治療",
        "中醫跌打"
      ]
    },
    {
      "id": "weekly-indemnity",
      "label": "暫時完全傷殘每週津貼",
      "description": "因工傷或意外導致暫時完全無法上班工作，每週發放薪金補償津貼（每週高達 HK$2,000 至 HK$8,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "每週津貼",
        "暫時完全傷殘",
        "傷殘津貼"
      ]
    },
    {
      "id": "burn-benefit",
      "label": "三級燒傷額外賠償",
      "description": "遭遇火災或化學灼傷導致身體表面面積達 5% 以上三級燒傷之額外賠償（高達 HK$100,000 至 HK$500,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "燒傷",
        "三級燒傷",
        "嚴重燒傷"
      ]
    },
    {
      "id": "hospital-cash",
      "label": "意外住院每日現金津貼",
      "description": "因意外需入住醫院治療，每日額外領取定額住院現金（每日 HK$500 至 HK$1,500）",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "accident",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "住院現金",
        "意外住院津貼",
        "住院津貼"
      ]
    },
    {
      "id": "rehabilitation-care",
      "label": "嚴重意外復康護理津貼",
      "description": "出院後聘請私人看護、職業治療及購買拐杖輪椅等康復器具之補助上限",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "復康護理",
        "康復器材",
        "復康費用"
      ]
    },
    {
      "id": "emergency-evacuation",
      "label": "緊急醫療運送及救援",
      "description": "意外發生時出動專用救護直升機或國際緊急運送之全額費用支援",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "緊急運送",
        "醫療運送",
        "救援服務"
      ]
    },
    {
      "id": "funeral-expenses",
      "label": "意外身故善後及殯葬費",
      "description": "遇意外不幸身故時即時發放予家屬處理後事之殯儀補貼（HK$10,000 至 HK$50,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "殯葬費用",
        "善後費用",
        "後事補貼"
      ]
    },
    {
      "id": "home-modification",
      "label": "家居改裝及輪椅設備費",
      "description": "嚴重意外傷殘後為適應日常生活，改裝洗手間無障礙設施及加裝斜坡之改裝津貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "家居改裝",
        "無障礙設施",
        "輪椅改裝"
      ]
    },
    {
      "id": "facial-disfigurement",
      "label": "面部損傷整容手術費用",
      "description": "面部或頭部受傷後進行疤痕修復或面部整容手術之醫療補償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "面部整容",
        "整容手術",
        "面部損傷"
      ]
    },
    {
      "id": "sports-injury",
      "label": "業餘運動受傷額外保障",
      "description": "週末踢足球、跑步、行山或騎單車受傷之醫療自負額豁免與額外治療補貼",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "accident",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "業餘運動",
        "運動受傷",
        "運動保障"
      ]
    },
    {
      "id": "children-education",
      "label": "子女教育特別津貼",
      "description": "家庭經濟支柱因意外身故傷殘，按年發放供養未成年子女升學讀書之專案教育金",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "accident",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "子女教育",
        "教育津貼",
        "子女就學金"
      ]
    }
  ],
  "life": [
    {
      "id": "death-benefit",
      "label": "身故保額上限",
      "description": "受保人因病或意外身故時，向指定受益人發放之一次性保證免稅人壽賠償金額",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "life",
      "group": "core",
      "scope": "general",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "身故保額",
        "身故賠償",
        "人壽保額"
      ]
    },
    {
      "id": "max-renewal-age",
      "label": "最高續保年齡",
      "description": "定期人壽保單保證每年續保之最高年齡上限（多數可續約至 85 歲、100 歲或終身）",
      "unitType": "age",
      "unitSuffix": "歲",
      "category": "life",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "最高續保年齡",
        "保證續保至",
        "續保至"
      ]
    },
    {
      "id": "max-issue-age",
      "label": "最高投保年齡",
      "description": "允許首次投保人壽保險之年齡上限（通常為 65 至 75 歲）",
      "unitType": "age",
      "unitSuffix": "歲",
      "category": "life",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "最高投保年齡",
        "投保年齡上限",
        "投保年齡"
      ]
    },
    {
      "id": "terminal-illness",
      "label": "末期疾病提前給付",
      "description": "不幸確診預期壽命不足 12 個月之末期疾病時，即時提前領取 100% 身故保額作為醫療或生活費",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "life",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "末期疾病",
        "末期絕症",
        "提前給付"
      ]
    },
    {
      "id": "accidental-death-extra",
      "label": "意外身故額外倍數賠償",
      "description": "遭遇交通意外或突發事故身故時，向家屬額外加碼發放 100% 至 200% 身故保額",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "life",
      "group": "protection",
      "preferDirection": "desc",
      "keywords": [
        "意外身故額外",
        "雙倍身故",
        "意外身故倍數"
      ]
    },
    {
      "id": "premium-waiver",
      "label": "傷殘豁免保費保障",
      "description": "若受保人因意外或疾病導致永久完全傷殘，保險公司豁免往後所有未繳保費，壽險保障不變",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "豁免保費",
        "傷殘保費豁免",
        "保費豁免"
      ]
    },
    {
      "id": "policy-term-years",
      "label": "保單年期選擇",
      "description": "靈活自選定期保障年期（如 10 年期、20 年期、30 年期或直達指定歲數）",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "保單年期",
        "保障年期",
        "定期年期"
      ]
    },
    {
      "id": "compassionate-cash",
      "label": "即時恩恤慰問金",
      "description": "於正式索償審批前，24-48小時內向家屬先行發放應急恩恤金（HK$20,000 至 HK$100,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "life",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "恩恤金",
        "即時恩恤",
        "應急金"
      ]
    },
    {
      "id": "conversion-option",
      "label": "免核保轉換終身壽險權",
      "description": "於定期人壽合約期內，可毋須重新提供健康證明及驗身，轉換為終身儲蓄人壽保單",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "免核保轉換",
        "轉換權",
        "轉換終身壽險"
      ]
    },
    {
      "id": "unemployment-grace",
      "label": "失業保費延繳寬限期",
      "description": "受保人面臨非自願性失業時，保費寬限期由常規 30 天大幅延長至 180 至 365 天",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "lifestyle",
      "preferDirection": "desc",
      "keywords": [
        "失業保障",
        "保費延繳",
        "寬限期"
      ]
    },
    {
      "id": "living-benefit",
      "label": "生活扶助年金給付",
      "description": "身故賠償金可選擇由受益人一次性提取，或按月按年分期領取作為生活年金",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "lifestyle",
      "preferDirection": "desc",
      "keywords": [
        "分期領取",
        "生活扶助",
        "年金領取"
      ]
    },
    {
      "id": "second-generation",
      "label": "延續次代受保人權益",
      "description": "允許更改或指定第二受保人，將保單價值及保障無限次代代相傳",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "更改受保人",
        "次代受保人",
        "無限次更改"
      ]
    },
    {
      "id": "suicide-exclusion-years",
      "label": "自殺免責年期",
      "description": "保單生效滿指定年期（通常為 1 年）後，自殺身故亦可獲得合資格身故賠償",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "protection",
      "preferDirection": "desc",
      "keywords": [
        "自殺條款",
        "自殺免責"
      ]
    },
    {
      "id": "guaranteed-cash-value",
      "label": "保證現金價值累積",
      "description": "終身人壽合約內具備之保證退保現金額度",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "現金價值",
        "保證現金價值",
        "退保價值"
      ]
    },
    {
      "id": "free-look-period",
      "label": "冷靜期日數",
      "description": "香港保監局規定之簽發保單後無條件全額退還保費思考期（法定劃一 21 天）",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "life",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "冷靜期",
        "21天冷靜期"
      ]
    }
  ],
  "motor": [
    {
      "id": "third-party-property",
      "label": "第三者財產損毀責任",
      "description": "駕駛時疏忽導致他人車輛、公物、護欄或店舖損毀之法律責任最高賠償額（普遍提供 HK$2,000,000 至 HK$5,000,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "motor",
      "group": "core",
      "scope": "general",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "第三者財產損毀",
        "第三者財產",
        "財產損毀責任"
      ]
    },
    {
      "id": "third-party-injury",
      "label": "第三者人身傷亡責任法定上限",
      "description": "香港法例規定私家車第三者身體受傷或死亡之強制法定法律責任保障（全港劃一法定上限為 HK$100,000,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "motor",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "第三者死亡或身體受傷",
        "第三者人身傷亡",
        "人身傷亡責任"
      ]
    },
    {
      "id": "own-damage-coverage",
      "label": "自身車輛全保損毀保障",
      "description": "全保（Comprehensive）涵蓋自身車輛碰撞、翻側、撞石或意外墜崖之維修重置賠償（以車輛市價賠償）",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "motor",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "車輛損毀",
        "自身車輛",
        "全保車身保障"
      ]
    },
    {
      "id": "windscreen-cover",
      "label": "擋風玻璃獨立免自負額",
      "description": "車頭擋風玻璃或車窗碎裂更換賠償，不影響翌年無索償折扣(NCD)且免扣墊底費（HK$3,000 至 HK$8,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "motor",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "擋風玻璃",
        "車窗玻璃",
        "擋風玻璃破損"
      ]
    },
    {
      "id": "towing-service",
      "label": "24小時緊急拖車及路援",
      "description": "半路拋錨、爆胎、電池無電或水滾時，免費安排緊急拖車至就近車房或充電站（每次高達 HK$1,000 至 HK$3,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "motor",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "緊急拖車",
        "路面支援",
        "24小時拖車"
      ]
    },
    {
      "id": "ncd-protection",
      "label": "無索償折扣 (NCD) 保障",
      "description": "累積至 60% 最高 NCD 之車主，發生一次非致命事故索償後，翌年續約時仍可保留 60% 優惠不被扣減",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "motor",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "NCD保障",
        "無索償折扣保障",
        "無索償折扣"
      ]
    },
    {
      "id": "new-car-replacement",
      "label": "新車全毀以新換舊條款",
      "description": "出廠首 12 個月內新車若遭盜竊或損毀維修費超過市價 50%，直接賠償同型號同款式全新車一部",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "motor",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "以新換舊",
        "新車賠償",
        "全新車賠償"
      ]
    },
    {
      "id": "rental-car-allowance",
      "label": "修車期間代步車/租車津貼",
      "description": "遇意外車輛送廠大修期間，每日補貼租車或乘搭的士開支（每日 HK$200 至 HK$800，最高 14 天）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "motor",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "代步車",
        "租車津貼",
        "維修期代步"
      ]
    },
    {
      "id": "personal-accident-driver",
      "label": "司機個人意外身故傷殘",
      "description": "登記司機或指名合法駕駛者於交通意外中不幸身故或殘廢之專項撫恤賠償（HK$100,000 至 HK$500,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "motor",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "司機個人意外",
        "司機意外",
        "司機保障"
      ]
    },
    {
      "id": "medical-expenses-motor",
      "label": "交通意外醫療費用津貼",
      "description": "車禍後車上司機及同行乘客接受急救、西醫及骨傷科治療之實報實銷津貼（HK$3,000 至 HK$10,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "motor",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "醫療費用",
        "乘客醫療",
        "交通意外醫療"
      ]
    },
    {
      "id": "fire-theft",
      "label": "汽車火災及失竊獨立保障",
      "description": "停泊露天停車場或街道遭遇汽車被縱火焚毀、引擎過熱著火或全車遭盜竊之市價全額理賠",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "motor",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "盜竊",
        "火災及盜竊",
        "失竊"
      ]
    },
    {
      "id": "flood-typhoon",
      "label": "天然災害水浸及颱風保障",
      "description": "世紀暴雨、黑雨山泥傾瀉、海水倒灌地下停車場或十號風球塌樹壓毀車頂之全保天災理賠",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "motor",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "水浸",
        "颱風",
        "天災保障"
      ]
    },
    {
      "id": "uninsured-motorist",
      "label": "無保險第三者碰撞保障",
      "description": "遭未購買保險之第三方車輛或逃逸司機撞毀，車主自身墊底費獲全額豁免，並享有車身全保修復",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "motor",
      "group": "protection",
      "preferDirection": "desc",
      "keywords": [
        "無保險第三者",
        "逃逸司機保障"
      ]
    },
    {
      "id": "lock-key-motor",
      "label": "汽車門鎖及防盜鑰匙更換",
      "description": "智能遙控汽車鑰匙遺失或車門鎖遭破壞時，原廠更換整套防盜鎖系統之費用賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "motor",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "汽車門鎖",
        "防盜鑰匙",
        "車匙更換"
      ]
    },
    {
      "id": "passenger-liability",
      "label": "乘客及同行親友責任",
      "description": "同車乘客於上下車途中開門碰撞單車或路人之第三者責任法定抗辯支援",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "motor",
      "group": "protection",
      "preferDirection": "desc",
      "keywords": [
        "乘客責任",
        "同行乘客保障"
      ]
    }
  ],
  "domestic-helper": [
    {
      "id": "hospital-surgical",
      "label": "家傭住院及手術費用",
      "description": "工人姐姐因疾病或意外入住香港醫院之病房、手術費及重症護理開支（每年 HK$25,000 至 HK$80,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "hospital",
      "scope": "general",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "住院及手術費用",
        "住院及手術",
        "醫療費用"
      ]
    },
    {
      "id": "outpatient-expenses",
      "label": "門診醫療網絡及津貼",
      "description": "家傭日常頭暈感冒前往網絡指定西醫或普通門診每次看診補貼（每年高達 HK$3,000 至 HK$6,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "門診費用",
        "網絡門診",
        "普通科門診"
      ]
    },
    {
      "id": "fidelity-protection",
      "label": "誠信保障/家傭欺詐盜竊",
      "description": "外傭在僱主家中發生盜竊、挪用公款或詐騙行為時，補償僱主之金錢損失（HK$5,000 至 HK$20,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "誠信保障",
        "欺詐盜竊",
        "家傭誠信"
      ]
    },
    {
      "id": "replacement-helper",
      "label": "重新聘請及解僱替換津貼",
      "description": "家傭因重病喪失工作能力、擅自離職逃跑或經醫生證實懷孕解約，重新透過中介公司物色新女傭之手續費津貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "重新聘請",
        "聘請傭工費用",
        "更換傭工"
      ]
    },
    {
      "id": "dental-expenses",
      "label": "口腔及牙科護理費用",
      "description": "家傭牙痛拔牙、補牙及口腔緊急止痛醫療開支（每年 HK$1,500 至 HK$3,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "牙科費用",
        "牙科治療",
        "口腔護理"
      ]
    },
    {
      "id": "personal-liability",
      "label": "家傭引致之第三者責任",
      "description": "家傭在工作期間疏忽導致街外第三者受傷或財物損壞，依法由僱主承擔之法律責任賠償（HK$100,000 至 HK$200,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "個人法律責任",
        "第三者責任",
        "家傭責任"
      ]
    },
    {
      "id": "repatriation-expenses",
      "label": "因病遣返及遺體送返",
      "description": "傭工不幸身故或經註冊醫生證實永久不適合繼續任職，安排航班機票將其送返印尼或菲律賓原居地之專項開支",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "遣返費用",
        "運送費用",
        "遺體送返"
      ]
    },
    {
      "id": "critical-illness-helper",
      "label": "家傭罹患重大癌症津貼",
      "description": "工人姐姐不幸在港確診心臟病、中風或癌症等嚴重重症，發放額外一次性重大疾病醫療補貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "重大疾病",
        "癌症津貼",
        "嚴重疾病"
      ]
    },
    {
      "id": "bonesetter-helper",
      "label": "中醫骨傷及跌打門診",
      "description": "外傭做家務扭傷手腳腰背，前往香港註冊中醫跌打敷藥或推拿之費用津貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "中醫治療",
        "跌打費用",
        "骨傷科"
      ]
    },
    {
      "id": "temporary-maid",
      "label": "傭工住院期間臨時兼職",
      "description": "家傭需入住公立或私家醫院期間，僱主自掏腰包聘請鐘點家務助理之每日代工工資津貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "臨時家庭傭工",
        "兼職代工津貼",
        "臨時傭工"
      ]
    },
    {
      "id": "personal-accident-helper",
      "label": "家傭休假期間個人意外",
      "description": "外傭於星期日放假外出期間遭遇交通意外身故或殘廢之專項意外撫恤賠償",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "個人意外",
        "休假意外",
        "休假期間保障"
      ]
    },
    {
      "id": "loan-protection",
      "label": "家傭未清還借貸追討責任",
      "description": "家傭向香港財務公司借錢後失聯，僱主聘請律師處理財務公司討債騷擾之法律抗辯援助",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "財務借貸",
        "非法貸款追討",
        "未清還貸款"
      ]
    },
    {
      "id": "service-interruption",
      "label": "突然失蹤或違約離職賠償",
      "description": "家傭無故曠工失蹤或未滿合約違約私自跳槽，補貼僱主支付予入境處及中介之行政開銷",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "擅自離職",
        "中途跳槽",
        "服務中斷"
      ]
    },
    {
      "id": "trauma-counseling",
      "label": "僱主及家庭心理輔導津貼",
      "description": "家傭若不幸在僱主家中輕生或發生暴力事故，安排專業心理學家向同住兒童及家屬進行心理輔導之開銷",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "domestic-helper",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "心理輔導",
        "創傷輔導",
        "心理諮詢"
      ]
    },
    {
      "id": "cash-allowance-hospital",
      "label": "家傭公立醫院住院津貼",
      "description": "家傭入住香港醫管局轄下公立醫院時，每日發放定額現金住院補助（每日 HK$200 至 HK$500）",
      "unitType": "currency",
      "unitSuffix": "HKD/日",
      "category": "domestic-helper",
      "group": "hospital",
      "scope": "daily",
      "preferDirection": "desc",
      "keywords": [
        "住院現金津貼",
        "公立醫院津貼",
        "每日住院津貼"
      ]
    }
  ],
  "pet": [
    {
      "id": "annual-medical-limit",
      "label": "每年獸醫醫療總限額",
      "description": "貓貓狗狗全年在香港註冊獸醫診所求醫門診、處方藥、住院及手術最高報銷限額（每年高達 HK$25,000 至 HK$70,000）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "core",
      "scope": "annual",
      "isDefault": true,
      "preferDirection": "desc",
      "keywords": [
        "醫療費用總額",
        "每年醫療限額",
        "獸醫費用",
        "醫療保障"
      ]
    },
    {
      "id": "vet-consultation",
      "label": "獸醫門診及藥物費用",
      "description": "日常皮膚病、腸胃炎、打針吃藥之普通獸醫門診診金每次賠償上限及全年次數限制",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "獸醫門診",
        "門診費用",
        "診症費用"
      ]
    },
    {
      "id": "surgery-anesthesia",
      "label": "外科手術及麻醉費用",
      "description": "吞食異物開腹手術、骨折接駁、腫瘤割除及全身氣體麻醉等大型手術費用專項實報實銷",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "hospital",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "手術及麻醉",
        "外科手術",
        "手術費用"
      ]
    },
    {
      "id": "third-party-liability",
      "label": "寵物第三者侵權法律責任",
      "description": "狗隻外出散步追咬途人、咬傷同類或抓毀鄰居名貴物品時，依法由主人承擔之法律賠償責任（全港提供 HK$100萬 至 HK$300萬）",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "protection",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "第三者責任保障",
        "第三者法律責任",
        "侵權責任"
      ]
    },
    {
      "id": "cancer-chemotherapy",
      "label": "寵物癌症化療及免疫治療",
      "description": "毛孩不幸罹患淋巴瘤或肥大細胞瘤等惡性腫瘤時之化療注射、靶向藥物與一次性抗癌慰問金",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "化療保障",
        "癌症一次性現金保障",
        "癌症治療"
      ]
    },
    {
      "id": "diagnostic-xray-ultrasound",
      "label": "血液及X光/超聲波檢測",
      "description": "因排尿困難或器官病變接受血液生化檢查、X光透視及腹部超聲波等先進造影檢查開銷",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "outpatient",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "診斷檢測",
        "X光及超聲波",
        "化驗及影像"
      ]
    },
    {
      "id": "physio-acupuncture",
      "label": "針灸及水療復康治療",
      "description": "老年犬關節退化、椎間盤突出接受獸醫針灸、中藥調理及復康水療池行走訓練開銷補貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "針灸及水療",
        "中醫調理",
        "物理復康"
      ]
    },
    {
      "id": "holiday-cancellation-pet",
      "label": "因寵物重病取消旅遊行程",
      "description": "出發前 7 天內寵物罹患生死攸關重病須緊急開刀導致主人放棄出國機票酒店之訂金損失",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "假日行程取消",
        "取消旅程",
        "行程取消"
      ]
    },
    {
      "id": "advertising-search",
      "label": "走失登報及懸賞尋寵費用",
      "description": "寵物因驚慌走失或遭偷竊，主人刊登社交媒體尋寵廣告、印刷街頭尋狗傳單之開支津貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "廣告費用",
        "尋找被盜竊或走失寵物",
        "尋寵廣告"
      ]
    },
    {
      "id": "emergency-boarding",
      "label": "主人住院期間寵物寄養費",
      "description": "獨居主人不幸染病需住院超過指定天數，毛孩安排入住持牌寵物酒店之每日寄宿託兒津貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "lifestyle",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "緊急寄養",
        "寵物住宿津貼",
        "寄養費用"
      ]
    },
    {
      "id": "funeral-cremation",
      "label": "寵物身故善後火化及悼念",
      "description": "毛孩壽終正寢或安樂死後，安排善後獨立善終火化、寵物骨灰盅及紀念儀式之撫恤補助",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "善終服務",
        "火化費用",
        "喪葬津貼"
      ]
    },
    {
      "id": "hereditary-disease",
      "label": "先天及遺傳性疾病保障",
      "description": "特定品種犬貓（如摺耳貓骨骼畸形、鬥牛犬呼吸道綜合症）常見遺傳病的特例承保待遇",
      "unitType": "terms",
      "unitSuffix": "",
      "category": "pet",
      "group": "special",
      "preferDirection": "desc",
      "keywords": [
        "先天性疾病",
        "遺傳病保障",
        "品種特有病"
      ]
    },
    {
      "id": "dental-treatment-pet",
      "label": "寵物牙科及拔牙手術",
      "description": "牙結石嚴重導致牙周病或口腔腫瘤時，進行超聲波洗牙與全麻拔牙手術之專項補貼",
      "unitType": "currency",
      "unitSuffix": "HKD",
      "category": "pet",
      "group": "special",
      "scope": "general",
      "preferDirection": "desc",
      "keywords": [
        "牙科治療",
        "拔牙費用",
        "牙齒護理"
      ]
    },
    {
      "id": "reimbursement-ratio",
      "label": "醫療實報實銷賠償比率",
      "description": "保單對各項合資格醫療開支之索償賠付百分比（通常為 70% 至 90%）",
      "unitType": "percentage",
      "unitSuffix": "%",
      "category": "pet",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "賠償百分比",
        "賠償比率",
        "共同保險"
      ]
    },
    {
      "id": "entry-age-limit",
      "label": "首次投保最高年齡",
      "description": "貓狗首次投保之年齡上限（多數計劃要求 8 週大至 8-9 歲以內）",
      "unitType": "age",
      "unitSuffix": "歲",
      "category": "pet",
      "group": "core",
      "preferDirection": "desc",
      "keywords": [
        "首次投保年齡",
        "投保年齡上限",
        "投保年齡"
      ]
    }
  ]
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

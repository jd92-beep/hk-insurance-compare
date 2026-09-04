import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  Award,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  Layers,
  PieChart,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  METRIC_GROUP_LABELS,
  getCategoryMetrics,
  getDefaultMetric,
  prepareChartData,
  type MetricUnitType,
  type ChartDataPoint,
} from "@/lib/chart-metrics";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/insurance";
import {
  getCategoryFeatureTags,
  filterAndRankProductsByFeatures,
  type FeatureMatchMode,
} from "@/lib/feature-filters";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export interface UniversalComparisonChartProps {
  /** 當前分類下的產品列表 */
  products: Product[];
  /** 類別 ID（例如 'medical', 'high-end-medical', 'travel' 等） */
  categoryId: string;
  /** 類別中文名 */
  categoryName: string;
  /** 類別主題色 */
  color?: string;
  /** 額外外層樣式 */
  className?: string;
  /** 外部聯動特點選取清單 */
  selectedFeatures?: string[];
  /** 外部特點切換回調 */
  onSelectedFeaturesChange?: (features: string[]) => void;
  /** 匹配模式（smart: 智能匹配推薦，strict: 嚴格全中） */
  matchMode?: FeatureMatchMode;
  /** 匹配模式切換回調 */
  onMatchModeChange?: (mode: FeatureMatchMode) => void;
}

/** 產品保單整體封頂限額（每年／終身／海外醫療） */
interface ProductCapInfo {
  annualCap: string;
  lifetimeCap: string;
  shortBadge: string;
  isFullCover: boolean;
}

/** 動態自適應市場梯隊結構（Dynamic Adaptive Insurance Tier） */
export interface DynamicTier {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  color: string;
  borderColor: string;
  bgColor: string;
  headerBg: string;
  textColor: string;
  iconType: "flagship" | "high" | "mid" | "low" | "standard";
  count: number;
  percentage: number;
  rangeDisplay: string;
  avgDisplay?: string;
  advantage: string;
  targetAudience: string;
  insurers: { insurer: string; insurerZh: string }[];
  items: ChartDataPoint[];
}

/** 智能格式化指標數值為香港繁體習慣表達 */
function formatMetricValue(
  val: number,
  unitType?: MetricUnitType,
  unitSuffix?: string
): string {
  if (unitType === "currency") {
    if (val >= 100_000_000) {
      const v = val / 100_000_000;
      return `HK$${Number.isInteger(v) ? v : v.toFixed(1)}億`;
    }
    if (val >= 10_000) {
      const v = val / 10_000;
      return `HK$${Number.isInteger(v) ? v : v.toFixed(1)}萬`;
    }
    return `HK$${Math.round(val).toLocaleString()}`;
  }
  if (unitType === "percentage") {
    return `${Math.round(val)}%`;
  }
  if (unitType === "age") {
    return `${Math.round(val)} 歲`;
  }
  return `${Math.round(val)} ${unitSuffix ?? ""}`.trim();
}

/** 智能提取產品的保單整體封頂上限（每年總額、終身限額、海外醫療等） */
function extractProductCapInfo(product: Product, categoryId: string): ProductCapInfo {
  const coverages = product.coverage ?? [];
  let annualLimitRaw = "";
  let lifetimeLimitRaw = "";
  let overseasMedicalRaw = "";

  for (const c of coverages) {
    const item = c.item || "";
    const limit = c.limit || "";
    if (/每年保障限額|年度保額|每年限額|每年最高|最高保障/i.test(item)) {
      if (!annualLimitRaw) annualLimitRaw = limit;
    }
    if (/終身保障限額|終身保額|終身最高|終身限額/i.test(item)) {
      if (!lifetimeLimitRaw) lifetimeLimitRaw = limit;
    }
    if (/海外醫療|緊急醫療費用|醫療費用及支援/i.test(item)) {
      if (!overseasMedicalRaw) overseasMedicalRaw = limit;
    }
  }

  // 1. 旅遊保險專項
  if (categoryId === "travel") {
    let medShort = "";
    if (overseasMedicalRaw) {
      const match = overseasMedicalRaw.match(/(?:HK\$|HKD|\$)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/);
      if (match) {
        medShort = `海外醫療上限 HK$${match[1]}${match[2] || ""}`;
      }
    }
    return {
      annualCap: overseasMedicalRaw || "按計劃等級賠償",
      lifetimeCap: "不設終身保障限額（以每次旅程為單位）",
      shortBadge: medShort || "受制於海外醫療總額",
      isFullCover: true,
    };
  }

  // 2. 醫療 / 高端醫療 / Top-up 醫療：提取最高方案額度
  let topAnnual = "";
  if (annualLimitRaw) {
    if (/無上限|不設上限/i.test(annualLimitRaw) && !/終身/i.test(annualLimitRaw)) {
      topAnnual = "每年無上限";
    } else {
      const matches = Array.from(
        annualLimitRaw.matchAll(/(?:HK\$|HKD|\$)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/g)
      );
      let maxVal = 0;
      let maxStr = "";
      for (const m of matches) {
        const num = parseFloat(m[1].replace(/,/g, ""));
        const unit = m[2];
        const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
        const total = num * mult;
        if (total > maxVal) {
          maxVal = total;
          maxStr = unit ? `每年高達 HK$${num}${unit}` : `每年高達 HK$${num.toLocaleString()}`;
        }
      }
      topAnnual = maxStr;
    }
  }

  let topLifetime = "";
  if (lifetimeLimitRaw) {
    if (/無上限|不設終身保障限額|不設上限/i.test(lifetimeLimitRaw)) {
      topLifetime = "終身無上限";
    } else {
      const matches = Array.from(
        lifetimeLimitRaw.matchAll(/(?:HK\$|HKD|\$)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/g)
      );
      let maxVal = 0;
      let maxStr = "";
      for (const m of matches) {
        const num = parseFloat(m[1].replace(/,/g, ""));
        const unit = m[2];
        const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
        const total = num * mult;
        if (total > maxVal) {
          maxVal = total;
          maxStr = unit ? `終身高達 HK$${num}${unit}` : `終身高達 HK$${num.toLocaleString()}`;
        }
      }
      topLifetime = maxStr;
    }
  }

  const shortBadge = topAnnual
    ? `年度上限：${topAnnual.replace("每年高達 ", "HK$")}`
    : topLifetime
      ? `終身限額：${topLifetime.replace("終身高達 ", "HK$")}`
      : "受制於年度總額";

  return {
    annualCap: annualLimitRaw || topAnnual || "按保單每保單年度最高總額",
    lifetimeCap: lifetimeLimitRaw || topLifetime || "不設終身保障限額",
    shortBadge,
    isFullCover: true,
  };
}

export default function UniversalComparisonChart({
  products,
  categoryId,
  categoryName,
  color = "#181D2E",
  className,
  selectedFeatures: extSelectedFeatures,
  onSelectedFeaturesChange,
  matchMode: extMatchMode,
  onMatchModeChange,
}: UniversalComparisonChartProps) {
  const navigate = useNavigate();

  // 1. 取得該類別定義的所有量化指標（15 至 20+ 個）
  const availableMetrics = useMemo(
    () => getCategoryMetrics(categoryId),
    [categoryId]
  );
  const defaultMetric = useMemo(
    () => getDefaultMetric(categoryId),
    [categoryId]
  );

  // 2. 當前選中之指標
  const [selectedMetricId, setSelectedMetricId] = useState<string>(
    defaultMetric?.id ?? availableMetrics[0]?.id ?? ""
  );

  const currentMetric = useMemo(() => {
    return (
      availableMetrics.find((m) => m.id === selectedMetricId) ??
      defaultMetric ??
      availableMetrics[0]
    );
  }, [availableMetrics, selectedMetricId, defaultMetric]);

  // 3. 分組標籤頁：全部 + 核心/住院/門診/專項/責任/生活
  const [activeGroup, setActiveGroup] = useState<string>("all");

  // 計算每個分組包含多少指標
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: availableMetrics.length };
    for (const m of availableMetrics) {
      const g = m.group ?? "core";
      counts[g] = (counts[g] ?? 0) + 1;
    }
    return counts;
  }, [availableMetrics]);

  // 4. 指標關鍵字即時搜尋
  const [metricSearch, setMetricSearch] = useState<string>("");

  // 根據 activeGroup 與 metricSearch 過濾後的指標列表
  const displayedMetrics = useMemo(() => {
    return availableMetrics.filter((m) => {
      const matchGroup = activeGroup === "all" || (m.group ?? "core") === activeGroup;
      if (!matchGroup) return false;
      if (!metricSearch.trim()) return true;
      const q = metricSearch.toLowerCase();
      return (
        m.label.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [availableMetrics, activeGroup, metricSearch]);

  // 5. 圖表視圖切換：長條圖排行榜 (bar) 或 梯隊分佈圖 (pie)
  const [viewMode, setViewMode] = useState<"bar" | "pie">("bar");

  // 梯隊內產品清單展開/折疊狀態（key: tier.id）
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({});
  const toggleTierExpanded = (tierId: string) => {
    setExpandedTiers((prev) => ({ ...prev, [tierId]: !prev[tierId] }));
  };

  // 6. 排序方向：'desc'（最高保障優先）或 'asc'
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  // 7. 取得當前類別專屬特點 Tags
  const currentFeatureTags = useMemo(
    () => getCategoryFeatureTags(categoryId),
    [categoryId]
  );

  // 7. 特點多選過濾 Tags（支援外部雙向綁定）
  const [internalSelectedFeatures, setInternalSelectedFeatures] = useState<string[]>([]);
  const selectedFeatures = extSelectedFeatures ?? internalSelectedFeatures;
  const setSelectedFeatures = (updater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof updater === "function" ? updater(selectedFeatures) : updater;
    if (onSelectedFeaturesChange) {
      onSelectedFeaturesChange(next);
    } else {
      setInternalSelectedFeatures(next);
    }
  };

  const [internalMatchMode, setInternalMatchMode] = useState<FeatureMatchMode>("smart");
  const matchMode = extMatchMode ?? internalMatchMode;
  const setMatchMode = (mode: FeatureMatchMode) => {
    if (onMatchModeChange) {
      onMatchModeChange(mode);
    } else {
      setInternalMatchMode(mode);
    }
  };

  const validSelectedFeatures = useMemo(() => {
    const validIds = new Set(currentFeatureTags.map((t) => t.id));
    return selectedFeatures.filter((id) => validIds.has(id));
  }, [currentFeatureTags, selectedFeatures]);

  // 8. 保險公司過濾
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>([]);

  // 9. 圖表展開 / 折疊開關
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 10. 全數賠償（Full Cover）說明展開狀態與卡片 Tooltip 懸浮狀態
  const [showFullCoverGuide, setShowFullCoverGuide] = useState<boolean>(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // 11. 預計算每份產品之整體保障封頂限額（每年／終身／海外醫療上限）
  const productCapsMap = useMemo(() => {
    const map = new Map<string, ProductCapInfo>();
    for (const p of products) {
      map.set(p.id, extractProductCapInfo(p, categoryId));
    }
    return map;
  }, [products, categoryId]);

  // 該類別所有保險公司清單
  const insurerList = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (!map.has(p.insurer)) {
        map.set(p.insurer, p.insurer_zh);
      }
    }
    return Array.from(map.entries()).map(([insurer, insurerZh]) => ({
      insurer,
      insurerZh,
    }));
  }, [products]);

  // 12. 套用特點過濾與智能匹配排名（Smart Match 永不落空，命中越多排越前）
  const featureRankResult = useMemo(() => {
    const insurerFiltered =
      selectedInsurers.length > 0
        ? products.filter((p) => selectedInsurers.includes(p.insurer))
        : products;

    return filterAndRankProductsByFeatures(
      insurerFiltered,
      validSelectedFeatures,
      categoryId,
      matchMode
    );
  }, [products, selectedInsurers, validSelectedFeatures, categoryId, matchMode]);

  const filteredProducts = useMemo(() => {
    return featureRankResult.results.map((r) => r.product);
  }, [featureRankResult]);

  // 11. 使用 chart-metrics 引擎準備圖表數據點
  const chartPoints = useMemo(() => {
    if (!currentMetric) return [];
    return prepareChartData(filteredProducts, currentMetric, {
      sortOrder: sortDirection,
      filterEmpty: true,
    });
  }, [filteredProducts, currentMetric, sortDirection]);

  // 12. 計算市場平均值與圖表最大值
  const { maxVisualValue, benchmarkAverage, benchmarkDisplay } = useMemo(() => {
    if (chartPoints.length === 0) {
      return { maxVisualValue: 1, benchmarkAverage: null, benchmarkDisplay: null };
    }

    const maxVisual = Math.max(...chartPoints.map((p) => p.visualValue), 1);

    const validNumeric = chartPoints
      .filter((p) => !p.isFlagship && p.numericValue > 0 && p.numericValue < 900_000_000)
      .map((p) => p.numericValue);

    if (validNumeric.length === 0) {
      return { maxVisualValue: maxVisual, benchmarkAverage: null, benchmarkDisplay: null };
    }

    const avg = validNumeric.reduce((a, b) => a + b, 0) / validNumeric.length;
    let disp = "";
    if (currentMetric?.unitType === "currency") {
      disp = `HK$${Math.round(avg).toLocaleString()}`;
    } else if (currentMetric?.unitType === "percentage") {
      disp = `${Math.round(avg)}%`;
    } else if (currentMetric?.unitType === "age") {
      disp = `${Math.round(avg)} 歲`;
    } else {
      disp = `${Math.round(avg)} ${currentMetric?.unitSuffix ?? ""}`;
    }

    return {
      maxVisualValue: maxVisual,
      benchmarkAverage: avg,
      benchmarkDisplay: disp,
    };
  }, [chartPoints, currentMetric]);

  // 平均值在進度條中的百分比位置
  const benchmarkPercent = useMemo(() => {
    if (!benchmarkAverage || !maxVisualValue) return null;
    const pct = (benchmarkAverage / maxVisualValue) * 100;
    return Math.min(Math.max(pct, 5), 95);
  }, [benchmarkAverage, maxVisualValue]);

  // 13. 是否屬於醫療類別或圖表數據包含「全數賠償」
  const isMedicalCategory = ["medical", "high-end-medical", "top-up-medical"].includes(categoryId);
  const hasFullCoverPoints = useMemo(() => {
    return chartPoints.some(
      (p) =>
        p.isFlagship ||
        p.displayValue.includes("全數賠償") ||
        p.displayValue.includes("全額") ||
        p.badge?.includes("全數賠償")
    );
  }, [chartPoints]);

  // 14. 梯隊分佈數據（動態自適應多維梯隊引擎）
  const distributionTiers = useMemo<DynamicTier[]>(() => {
    if (chartPoints.length === 0 || !currentMetric) return [];
    const totalCount = chartPoints.length;

    // A. 提取頂級旗艦組（全數賠償 / 無細項上限 / 無上限）
    const flagshipItems = chartPoints.filter(
      (p) =>
        p.isFlagship ||
        p.displayValue.includes("全數賠償") ||
        p.displayValue.includes("全額") ||
        p.displayValue.includes("無上限") ||
        p.badge?.includes("全數賠償") ||
        p.badge?.includes("無上限")
    );

    // B. 提取具備具體數值的常規組，依數值降序排列（最高在前）
    const numericItems = chartPoints
      .filter(
        (p) =>
          !flagshipItems.includes(p) &&
          p.numericValue > 0 &&
          p.numericValue < 900_000_000
      )
      .sort((a, b) => b.numericValue - a.numericValue);

    const tiers: DynamicTier[] = [];

    // Helper: 提取保險公司去重名單
    const getInsurers = (items: ChartDataPoint[]) => {
      const map = new Map<string, string>();
      for (const item of items) {
        if (!map.has(item.insurer)) {
          map.set(item.insurer, item.insurerZh);
        }
      }
      return Array.from(map.entries()).map(([insurer, insurerZh]) => ({
        insurer,
        insurerZh,
      }));
    };

    // Helper: 計算數值區間與均值
    const getRangeAndAvg = (items: ChartDataPoint[]) => {
      const vals = items.map((i) => i.numericValue);
      if (vals.length === 0) return { rangeDisplay: "受制於年度/終身總額" };
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const minStr = formatMetricValue(min, currentMetric.unitType, currentMetric.unitSuffix);
      const maxStr = formatMetricValue(max, currentMetric.unitType, currentMetric.unitSuffix);
      const avgStr = formatMetricValue(avg, currentMetric.unitType, currentMetric.unitSuffix);
      return {
        rangeDisplay: min === max ? minStr : `${minStr} – ${maxStr}`,
        avgDisplay: min === max ? undefined : `均值約 ${avgStr}`,
      };
    };

    // 1. 若有旗艦計劃，放入頂級旗艦梯隊
    if (flagshipItems.length > 0) {
      const pct = (flagshipItems.length / totalCount) * 100;
      tiers.push({
        id: "tier-flagship",
        name: "頂級旗艦梯隊",
        badge: "⭐ 全數賠償 / 無細項上限",
        tagline: "突破常規分項細項限額約束，由保險公司 100% 實報實銷合資格開支",
        color: "#D97706",
        borderColor: "border-amber-300 dark:border-amber-700/60",
        bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
        headerBg: "bg-amber-100/70 dark:bg-amber-900/40",
        textColor: "text-amber-950 dark:text-amber-200",
        iconType: "flagship",
        count: flagshipItems.length,
        percentage: Number(pct.toFixed(1)),
        rangeDisplay: "全數賠償（受制於保單年度/終身總額）",
        avgDisplay: undefined,
        advantage: "零自付額外爆單風險，無分項細額壓力，通常尊享私家病房、免找數或全球頂級救援",
        targetAudience: "追求最高規格保障、預算充裕家庭、高淨值人士或重視零煩惱醫療體驗者",
        insurers: getInsurers(flagshipItems),
        items: flagshipItems,
      });
    }

    // 2. 處理數值梯隊
    const uniqueVals = Array.from(
      new Set(numericItems.map((p) => p.numericValue))
    ).sort((a, b) => a - b);

    if (uniqueVals.length === 1) {
      // 情況 A：全市場唯一一致數值
      const pct = (numericItems.length / totalCount) * 100;
      const { rangeDisplay } = getRangeAndAvg(numericItems);
      tiers.push({
        id: "tier-standard",
        name: "市場標準基準梯隊",
        badge: "⚖️ 全市場標準劃一",
        tagline: `參照計劃於此指標均劃一提供一致標準的保障額度（${rangeDisplay}）`,
        color: "#2563EB",
        borderColor: "border-blue-300 dark:border-blue-700/60",
        bgColor: "bg-blue-50/40 dark:bg-blue-950/20",
        headerBg: "bg-blue-100/70 dark:bg-blue-900/40",
        textColor: "text-blue-950 dark:text-blue-200",
        iconType: "standard",
        count: numericItems.length,
        percentage: Number(pct.toFixed(1)),
        rangeDisplay: `全市場劃一為 ${rangeDisplay}`,
        avgDisplay: undefined,
        advantage: "各家保障額度睇齊香港法定或頂尖市場規範，條款透明規範",
        targetAudience: "各類投保人士（此指標額度劃一，建議重點對比保費費率、自負額與增值服務）",
        insurers: getInsurers(numericItems),
        items: numericItems,
      });
    } else if (uniqueVals.length === 2) {
      // 情況 B：市場兩極分化（2 檔）
      const highItems = numericItems.filter((p) => p.numericValue === uniqueVals[1]);
      const lowItems = numericItems.filter((p) => p.numericValue === uniqueVals[0]);

      if (highItems.length > 0) {
        const pct = (highItems.length / totalCount) * 100;
        const { rangeDisplay, avgDisplay } = getRangeAndAvg(highItems);
        tiers.push({
          id: "tier-high",
          name: "高額充足梯隊",
          badge: "🚀 充裕升級保障",
          tagline: "保障額顯著高於市場基礎檔次，提供更寬鬆從容的索償緩衝空間",
          color: "#2563EB",
          borderColor: "border-blue-300 dark:border-blue-700/60",
          bgColor: "bg-blue-50/40 dark:bg-blue-950/20",
          headerBg: "bg-blue-100/70 dark:bg-blue-900/40",
          textColor: "text-blue-950 dark:text-blue-200",
          iconType: "high",
          count: highItems.length,
          percentage: Number(pct.toFixed(1)),
          rangeDisplay,
          avgDisplay,
          advantage: "應對突發嚴重事故時儲備更充足，大幅降低因限額不足而需自行貼錢的機會",
          targetAudience: "家庭主要經濟支柱、經常出行或重視高規格防護之投保人",
          insurers: getInsurers(highItems),
          items: highItems,
        });
      }

      if (lowItems.length > 0) {
        const pct = (lowItems.length / totalCount) * 100;
        const { rangeDisplay, avgDisplay } = getRangeAndAvg(lowItems);
        tiers.push({
          id: "tier-low",
          name: "實惠經濟梯隊",
          badge: "🌱 基礎入門基層",
          tagline: "提供滿足基本日常應急的門檻保障，保費門檻最為親民實惠",
          color: "#64748B",
          borderColor: "border-slate-300 dark:border-slate-700/60",
          bgColor: "bg-slate-50/40 dark:bg-slate-900/20",
          headerBg: "bg-slate-100/70 dark:bg-slate-800/40",
          textColor: "text-slate-900 dark:text-slate-200",
          iconType: "low",
          count: lowItems.length,
          percentage: Number(pct.toFixed(1)),
          rangeDisplay,
          avgDisplay,
          advantage: "用最精打細算的保費開支獲得核心基礎風險防護，性價比極高",
          targetAudience: "預算有限的剛起步年輕人、打工仔或用作既有保單的輕量補充",
          insurers: getInsurers(lowItems),
          items: lowItems,
        });
      }
    } else if (uniqueVals.length >= 3) {
      // 情況 C：市場多檔階梯（>= 3 檔，自適應分位數三梯隊）
      const p33 = numericItems[Math.floor(numericItems.length * 0.33)].numericValue;
      const p67 = numericItems[Math.floor(numericItems.length * 0.67)].numericValue;

      let highGroup = numericItems.filter((p) => p.numericValue >= p33);
      let midGroup = numericItems.filter(
        (p) => p.numericValue < p33 && p.numericValue >= p67
      );
      let lowGroup = numericItems.filter((p) => p.numericValue < p67);

      if (highGroup.length === 0 || midGroup.length === 0 || lowGroup.length === 0) {
        const uLen = uniqueVals.length;
        const uCut1 = uniqueVals[Math.floor(uLen / 3)];
        const uCut2 = uniqueVals[Math.floor((uLen * 2) / 3)];
        lowGroup = numericItems.filter((p) => p.numericValue < uCut1);
        midGroup = numericItems.filter(
          (p) => p.numericValue >= uCut1 && p.numericValue < uCut2
        );
        highGroup = numericItems.filter((p) => p.numericValue >= uCut2);
      }

      const groups = [
        {
          id: "tier-high",
          name: "高保額無憂梯隊",
          badge: "💎 充裕高額旗艦",
          tagline: "額度處於市場前列，為重大事故及高額支出提供堅實充裕的資金後盾",
          color: "#2563EB",
          borderColor: "border-blue-300 dark:border-blue-700/60",
          bgColor: "bg-blue-50/40 dark:bg-blue-950/20",
          headerBg: "bg-blue-100/70 dark:bg-blue-900/40",
          textColor: "text-blue-950 dark:text-blue-200",
          iconType: "high" as const,
          items: highGroup,
          advantage: "應對超高額突發索償從容不迫，防範巨額醫療或財物損失風險",
          targetAudience: "高收入家庭、經常外遊公幹或追求頂格防護的家庭決策者",
        },
        {
          id: "tier-mid",
          name: "主流性價比梯隊",
          badge: "⚖️ 市場中堅主流",
          tagline: "香港市場最主流平衡配置水平，兼顧賠償充裕度與合理保費支出",
          color: "#059669",
          borderColor: "border-emerald-300 dark:border-emerald-700/60",
          bgColor: "bg-emerald-50/40 dark:bg-emerald-950/20",
          headerBg: "bg-emerald-100/70 dark:bg-emerald-900/40",
          textColor: "text-emerald-950 dark:text-emerald-200",
          iconType: "mid" as const,
          items: midGroup,
          advantage: "足以覆蓋 80% 以上日常常見索償場景，保費親民適中，綜合性價比最高",
          targetAudience: "普遍香港家庭、一般打工仔、重視性價比與實用性的精明投保者",
        },
        {
          id: "tier-low",
          name: "輕量經濟入門梯隊",
          badge: "🌱 基礎經濟型",
          tagline: "滿足基本應急或法定規定的入門級限額，著重降低投保門檻",
          color: "#64748B",
          borderColor: "border-slate-300 dark:border-slate-700/60",
          bgColor: "bg-slate-50/40 dark:bg-slate-900/20",
          headerBg: "bg-slate-100/70 dark:bg-slate-800/40",
          textColor: "text-slate-900 dark:text-slate-200",
          iconType: "low" as const,
          items: lowGroup,
          advantage: "以最經濟實惠的預算獲得核心風險保障，減輕每年保費負擔",
          targetAudience: "預算有限剛起步青年、短期臨時過渡或已有主力保單只需少許補貼人士",
        },
      ];

      for (const g of groups) {
        if (g.items.length > 0) {
          const pct = (g.items.length / totalCount) * 100;
          const { rangeDisplay, avgDisplay } = getRangeAndAvg(g.items);
          tiers.push({
            id: g.id,
            name: g.name,
            badge: g.badge,
            tagline: g.tagline,
            color: g.color,
            borderColor: g.borderColor,
            bgColor: g.bgColor,
            headerBg: g.headerBg,
            textColor: g.textColor,
            iconType: g.iconType,
            count: g.items.length,
            percentage: Number(pct.toFixed(1)),
            rangeDisplay,
            avgDisplay,
            advantage: g.advantage,
            targetAudience: g.targetAudience,
            insurers: getInsurers(g.items),
            items: g.items,
          });
        }
      }
    }

    return tiers;
  }, [chartPoints, currentMetric]);

  // 切換特點選中狀態
  const toggleFeature = (tagId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // 切換保險公司選中狀態
  const toggleInsurer = (insurer: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(insurer) ? prev.filter((i) => i !== insurer) : [...prev, insurer]
    );
  };

  // 重設所有篩選
  const resetFilters = () => {
    setSelectedFeatures([]);
    setSelectedInsurers([]);
    setSortDirection("desc");
    setMetricSearch("");
  };

  const hasAnyFilterActive =
    selectedFeatures.length > 0 || selectedInsurers.length > 0;

  if (!currentMetric || availableMetrics.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-paper shadow-card transition-all duration-300",
        className
      )}
      style={{
        boxShadow:
          "0 4px 20px -2px rgba(24, 29, 46, 0.05), 0 1px 3px 0 rgba(24, 29, 46, 0.03)",
      }}
    >
      {/* ── 頂部抬頭與折疊控制 ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-paper shadow-sm"
            style={{ backgroundColor: color }}
          >
            {viewMode === "bar" ? <BarChart3 size={20} /> : <PieChart size={20} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-[17px] font-bold text-ink sm:text-[18px]">
                {categoryName}保障限額分析
              </h3>
              <span className="rounded-full bg-paper-2 px-2.5 py-0.5 font-grotesk text-[11px] font-semibold text-ink-soft">
                共 {availableMetrics.length} 項指標比較
              </span>
              <span className="rounded-full bg-jade/10 px-2.5 py-0.5 font-grotesk text-[11px] font-semibold text-jade">
                {chartPoints.length} 份計劃參照
              </span>
            </div>
            <p className="mt-0.5 text-small text-ink-soft">
              {currentMetric.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {/* 圖表類型切換 */}
          <div className="flex items-center rounded-lg border border-line bg-paper-2/60 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("bar")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all",
                viewMode === "bar"
                  ? "bg-paper text-ink shadow-xs"
                  : "text-ink-soft hover:text-ink"
              )}
              title="長條圖排名視圖"
            >
              <BarChart3 size={13} />
              <span>排行榜</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pie")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all",
                viewMode === "pie"
                  ? "bg-paper text-ink shadow-xs"
                  : "text-ink-soft hover:text-ink"
              )}
              title="梯隊分佈視圖"
            >
              <PieChart size={13} />
              <span>梯隊分佈</span>
            </button>
          </div>

          {hasAnyFilterActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-paper-2 hover:text-ink"
            >
              <RotateCcw size={14} />
              <span>重設</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-small font-medium text-ink-soft shadow-xs transition-colors hover:bg-paper-2 hover:text-ink"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "收起圖表" : "展開圖表"}</span>
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ── 展開內容區 ────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            {/* 控制面板：指標分組 Tab + 快速搜尋 + 指標膠囊選取 */}
            <div className="border-b border-line/60 bg-paper-2/40 px-5 py-4 sm:px-6">
              {/* 1. 分組標籤頁與即時搜尋欄 */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* 分組 Tabs */}
                <div className="flex flex-wrap items-center gap-1">
                  {(
                    ["all", "core", "hospital", "outpatient", "special", "protection", "lifestyle"] as const
                  )
                    .filter((g) => (groupCounts[g] ?? 0) > 0)
                    .map((g) => {
                      const isActive = activeGroup === g;
                      const label = METRIC_GROUP_LABELS[g] ?? g;
                      const count = groupCounts[g] ?? 0;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setActiveGroup(g)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-medium transition-all",
                            isActive
                              ? "bg-ink font-bold text-paper shadow-xs"
                              : "bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink border border-line/60"
                          )}
                        >
                          <span>{label}</span>
                          <span
                            className={cn(
                              "font-grotesk text-[10px]",
                              isActive ? "text-paper/80" : "text-ink-faint"
                            )}
                          >
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                </div>

                {/* 右側：指標搜尋欄 + 排序切換 */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
                    />
                    <input
                      type="text"
                      value={metricSearch}
                      onChange={(e) => setMetricSearch(e.target.value)}
                      placeholder="快速搜尋 15-20 項指標..."
                      className="w-full rounded-lg border border-line bg-paper py-1 pl-7 pr-7 text-[12px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-hidden"
                    />
                    {metricSearch && (
                      <button
                        type="button"
                        onClick={() => setMetricSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {viewMode === "bar" && (
                    <button
                      type="button"
                      onClick={() =>
                        setSortDirection((d) => (d === "desc" ? "asc" : "desc"))
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-1 text-[12px] font-medium text-ink shadow-xs transition-colors hover:bg-paper-2"
                    >
                      <ArrowUpDown size={12} className="text-ink-soft" />
                      <span>{sortDirection === "desc" ? "高至低 ▾" : "低至高 ▴"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. 指標選取 Pills 清單（支援 15–20 個細分指標） */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 flex items-center gap-1 text-[12px] font-semibold text-ink-soft">
                  <Filter size={12} />
                  <span>比較指標：</span>
                </span>
                {displayedMetrics.map((metric) => {
                  const isActive = metric.id === currentMetric.id;
                  return (
                    <button
                      key={metric.id}
                      type="button"
                      onClick={() => setSelectedMetricId(metric.id)}
                      className={cn(
                        "relative rounded-full px-3 py-1 text-[12px] font-medium transition-all",
                        isActive
                          ? "text-paper shadow-xs font-bold"
                          : "bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink border border-line/80"
                      )}
                      style={{
                        backgroundColor: isActive ? color : undefined,
                      }}
                    >
                      <span>{metric.label}</span>
                      {metric.isDefault && !isActive && (
                        <span className="ml-1 text-[10px] text-amber">★</span>
                      )}
                    </button>
                  );
                })}
                {displayedMetrics.length === 0 && (
                  <span className="text-[12px] text-ink-faint">
                    未有符合「{metricSearch}」的指標項目。
                  </span>
                )}
              </div>

              {/* 3. 特點多選過濾 Chips（類別專屬特點篩選） */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-line/40">
                <div className="flex flex-wrap items-center gap-1.5 mr-1">
                  <span className="text-[12px] font-semibold text-ink-soft">
                    {categoryName}重視保障篩選：
                  </span>
                  {validSelectedFeatures.length > 1 && (
                    <div className="inline-flex items-center rounded-full bg-paper-3 p-0.5 text-[10.5px]">
                      <button
                        type="button"
                        onClick={() => setMatchMode("smart")}
                        className={cn(
                          "rounded-full px-2 py-0.5 font-medium transition-all",
                          matchMode === "smart"
                            ? "bg-jade text-paper font-bold shadow-xs"
                            : "text-ink-soft hover:text-ink"
                        )}
                        title="智能匹配：符合最多重視項目優先推薦，永不落空"
                      >
                        ✨ 智能推薦
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchMode("strict")}
                        className={cn(
                          "rounded-full px-2 py-0.5 font-medium transition-all",
                          matchMode === "strict"
                            ? "bg-ink text-paper font-bold shadow-xs"
                            : "text-ink-soft hover:text-ink"
                        )}
                        title="嚴格全中：要求同時滿足所有選定特點"
                      >
                        🎯 嚴格全中 (AND)
                      </button>
                    </div>
                  )}
                </div>
                {currentFeatureTags.map((tag) => {
                  const isSelected = validSelectedFeatures.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleFeature(tag.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all",
                        isSelected
                          ? "bg-jade text-paper font-bold shadow-xs"
                          : "bg-paper text-ink-soft border border-line/60 hover:border-jade/50 hover:text-jade"
                      )}
                    >
                      {isSelected && <Check size={11} />}
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
                {validSelectedFeatures.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedFeatures([])}
                    className="ml-1 text-[11px] font-semibold text-red hover:underline"
                  >
                    清除特點過濾 ({validSelectedFeatures.length})
                  </button>
                )}
              </div>

              {/* 4. 保險公司過濾 Chips */}
              {insurerList.length > 1 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-line/40">
                  <span className="text-[12px] text-ink-faint mr-1">公司篩選：</span>
                  {insurerList.map(({ insurer, insurerZh }) => {
                    const isSelected = selectedInsurers.includes(insurer);
                    return (
                      <button
                        key={insurer}
                        type="button"
                        onClick={() => toggleInsurer(insurer)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-all",
                          isSelected
                            ? "bg-ink font-bold text-paper"
                            : "bg-paper text-ink-soft border border-line/60 hover:border-ink-soft/40"
                        )}
                      >
                        {isSelected && <Check size={11} />}
                        <span>{insurerZh}</span>
                      </button>
                    );
                  })}
                  {selectedInsurers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedInsurers([])}
                      className="ml-1 text-[11px] text-red hover:underline"
                    >
                      清除公司篩選
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── 圖表主體展示區 ────────────────────────────────────── */}
            <div className="p-5 sm:p-6">
              {/* ── 全數賠償（Full Cover）權威定義提示卡片 ── */}
              {(hasFullCoverPoints || isMedicalCategory) && (
                <div className="mb-4 rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-paper p-3.5 sm:p-4 text-ink shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-paper font-bold text-[12px] shadow-xs">
                        <Sparkles size={13} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-sans text-[13px] font-bold text-amber-950">
                            指標若顯示「全數賠償」代表什麼？有冇金額上限？
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-grotesk text-[10px] font-bold text-amber-800">
                            全數賠償 ≠ 無上限
                          </span>
                        </div>
                        <p className="text-[12px] text-ink-soft leading-relaxed">
                          <strong>「全數賠償」（Full Cover）</strong>代表該保障細項（如外科手術、病房膳食或癌症標靶藥物）<strong>不設個別細項獨立分項上限</strong>，由保險公司 100% 實報實銷合資格開支。
                          <strong>但請注意：賠償額並非毫無封頂</strong>，每次索償仍受制於整份保單的<strong>「每保單年度保障總額」</strong>（靈活/高端醫保每年最高可達 HK$1,000萬至 HK$4,000萬）或<strong>「終身限額」</strong>。下方長條圖中已在各「全數賠償」計劃旁標明其對應之年度封頂上限。
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFullCoverGuide(!showFullCoverGuide)}
                      className="shrink-0 text-[11px] font-semibold text-amber-800 hover:text-amber-950 hover:underline pt-0.5"
                    >
                      {showFullCoverGuide ? "收起條款對照 ▴" : "了解更多對照 ▾"}
                    </button>
                  </div>

                  {showFullCoverGuide && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-ink-soft">
                      <div className="rounded-lg bg-paper/80 p-2.5 border border-amber-200/50">
                        <span className="font-bold text-ink">1. 無分項細項限制</span>
                        <p className="mt-1">
                          傳統標準自願醫保就各細項設嚴格上限（如手術費最多 HK$50,000、雜費 HK$14,000）；全數賠償計劃撤銷此等分項限制。
                        </p>
                      </div>
                      <div className="rounded-lg bg-paper/80 p-2.5 border border-amber-200/50">
                        <span className="font-bold text-ink">2. 受制於每年總額封頂</span>
                        <p className="mt-1">
                          全數賠償之各項累計索償總額，必須在該保單每年最高限額之內（例如每年最高 HK$1,200萬），超出年度限額的部分須自行承擔。
                        </p>
                      </div>
                      <div className="rounded-lg bg-paper/80 p-2.5 border border-amber-200/50">
                        <span className="font-bold text-ink">3. 自負額（Deductible）扣除</span>
                        <p className="mt-1">
                          若選購設有自負額（如 HK$16,000 或 HK$50,000）之方案，須先扣除自負額後，其餘合資格醫療費用方可享 100% 全數賠償。
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 智能推薦 / 寬鬆 Fallback 提示卡 */}
              {featureRankResult.fallbackTriggered && (
                <div className="mb-4 rounded-xl border border-amber-300/80 bg-amber-50/90 dark:bg-amber-950/40 p-3.5 text-amber-900 dark:text-amber-200 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-small">
                    <Sparkles size={15} className="text-amber-600 shrink-0" />
                    <span>未有單一計劃同時 100% 具備所有 {validSelectedFeatures.length} 項條件</span>
                  </div>
                  <p className="mt-1 text-[12px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    已為你自動切換為<strong>【智能推薦模式】</strong>，按符合項目數量由多至小為你置頂排序，助你挑選最貼近心水需求的優質保險！
                  </p>
                </div>
              )}

              {/* 市場基準線提示卡 */}
              {benchmarkDisplay && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-paper-2/70 px-4 py-2 text-small text-ink-soft">
                  <div className="flex items-center gap-1.5">
                    <Info size={14} className="text-jade" />
                    <span>
                      已匹配計劃之市場平均水平：
                      <strong className="ml-1 font-grotesk text-ink">
                        {benchmarkDisplay}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[12px] text-ink-faint">
                    已依「{currentMetric.label}」量化排序，點擊計劃卡片跳轉詳情頁
                  </span>
                </div>
              )}

              {chartPoints.length === 0 ? (
                <div className="py-12 text-center text-ink-soft">
                  <p className="text-small">
                    此篩選條件下未有匹配到「{currentMetric.label}」的合資格計劃。
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 text-small font-bold text-jade hover:underline"
                  >
                    重設過濾條件
                  </button>
                </div>
              ) : viewMode === "bar" ? (
                /* ── 長條圖視圖 ─────────────────────────────────── */
                <div className="relative flex flex-col gap-3">
                  {/* 市場平均虛線 */}
                  {benchmarkPercent !== null && (
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 hidden w-px border-r-2 border-dashed border-jade/50 md:block z-10"
                      style={{
                        left: `calc(230px + (100% - 380px) * ${
                          benchmarkPercent / 100
                        })`,
                      }}
                    >
                      <span className="absolute -top-3 -translate-x-1/2 whitespace-nowrap rounded bg-jade px-1.5 py-0.5 font-grotesk text-[10px] font-bold text-paper shadow-xs">
                        均值 {benchmarkDisplay}
                      </span>
                    </div>
                  )}

                  {chartPoints.map((item, index) => {
                    const barPercent = Math.max(
                      4,
                      Math.min(100, (item.visualValue / maxVisualValue) * 100)
                    );

                    const rank = index + 1;
                    const isTop1 = rank === 1;
                    const isTop2 = rank === 2;
                    const isTop3 = rank === 3;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: EASE_OUT_EXPO,
                          delay: index < 10 ? index * 0.03 : 0,
                        }}
                        onClick={() => navigate(item.url)}
                        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 rounded-xl border border-line/60 bg-paper p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-line hover:bg-paper-2/40 hover:shadow-xs cursor-pointer"
                      >
                        {/* 左側：名次 + 保險公司 + 產品名稱 */}
                        <div className="flex items-center gap-3 sm:w-[230px] lg:w-[270px] shrink-0">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-grotesk font-bold transition-transform group-hover:scale-105",
                              isTop1
                                ? "bg-amber-100 text-amber-900 ring-1 ring-amber-400/60 font-black shadow-xs"
                                : isTop2
                                  ? "bg-slate-100 text-slate-800 ring-1 ring-slate-300"
                                  : isTop3
                                    ? "bg-orange-100 text-orange-900 ring-1 ring-orange-300"
                                    : "bg-paper-2 text-ink-faint"
                            )}
                          >
                            {isTop1 ? "🥇" : isTop2 ? "🥈" : isTop3 ? "🥉" : rank}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-semibold text-ink-faint">
                              {item.insurerZh}
                            </p>
                            <h4 className="truncate font-sans text-[14px] font-bold text-ink transition-colors group-hover:text-jade">
                              {item.name}
                            </h4>
                          </div>
                        </div>

                        {/* 中間：進度柱 */}
                        <div className="relative flex-1 py-1">
                          <div className="h-5 w-full overflow-hidden rounded-full bg-paper-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barPercent}%` }}
                              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                              className="h-full rounded-full relative flex items-center justify-end pr-2"
                              style={{
                                background: item.isFlagship
                                  ? `linear-gradient(90deg, ${color} 0%, #D97706 100%)`
                                  : `linear-gradient(90deg, ${color}CC 0%, ${color} 100%)`,
                              }}
                            >
                              {item.isFlagship && (
                                <Sparkles
                                  size={12}
                                  className="text-amber-200 animate-pulse"
                                />
                              )}
                            </motion.div>
                          </div>
                        </div>

                        {/* 右側：金額標籤 + 全數賠償年度上限提示 + 徽章 + 跳轉箭頭 */}
                        {(() => {
                          const isFullCoverItem =
                            item.isFlagship ||
                            item.displayValue.includes("全數賠償") ||
                            item.displayValue.includes("全額") ||
                            Boolean(item.badge?.includes("全數賠償"));
                          const capInfo = productCapsMap.get(item.id);
                          const isTooltipOpen = activeTooltipId === item.id;

                          return (
                            <div className="relative flex items-center justify-end gap-2.5 shrink-0 sm:min-w-[170px] text-right">
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "font-grotesk font-black text-[15px] sm:text-[16px]",
                                      item.isFlagship
                                        ? "text-amber-700 dark:text-amber-400"
                                        : "text-ink"
                                    )}
                                  >
                                    {item.displayValue}
                                  </span>

                                  {isFullCoverItem && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTooltipId(isTooltipOpen ? null : item.id);
                                      }}
                                      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                                      title="點擊查看全數賠償定義與年度限額"
                                    >
                                      <Info size={11} />
                                    </button>
                                  )}
                                </div>

                                {/* 若為全數賠償，清楚顯示其受制之每年保障總額 */}
                                {isFullCoverItem && capInfo && (
                                  <span className="mt-0.5 inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-200/60">
                                    <span>{capInfo.shortBadge}</span>
                                  </span>
                                )}

                                {/* 常規既有徽章 */}
                                {!isFullCoverItem && item.badge && (
                                  <span className="mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-paper-2 text-ink-soft">
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              {/* 全數賠償專屬 Tooltip Popover */}
                              <AnimatePresence>
                                {isTooltipOpen && capInfo && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-2 z-40 w-72 sm:w-80 rounded-xl border border-amber-300 bg-paper p-3.5 shadow-xl text-left"
                                  >
                                    <div className="flex items-center justify-between border-b border-line/60 pb-2 mb-2">
                                      <div className="flex items-center gap-1.5 font-sans text-[12px] font-bold text-amber-900">
                                        <Sparkles size={13} className="text-amber-600" />
                                        <span>「全數賠償」定義與封頂限制</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setActiveTooltipId(null)}
                                        className="rounded p-0.5 text-ink-faint hover:bg-paper-2 hover:text-ink"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>

                                    <p className="text-[11px] text-ink leading-relaxed">
                                      此保障細項<strong>不設各項獨立分項上限</strong>，由保險公司 100% 實報實銷合資格醫療開支。
                                    </p>

                                    <div className="mt-2 rounded-lg bg-amber-50/90 p-2 border border-amber-200/60 space-y-1 text-[11px]">
                                      <div>
                                        <span className="font-semibold text-amber-950">每保單年度上限：</span>
                                        <span className="text-amber-900 font-grotesk font-bold ml-1">
                                          {capInfo.annualCap}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-semibold text-amber-950">終身保障總額：</span>
                                        <span className="text-amber-900 font-grotesk font-bold ml-1">
                                          {capInfo.lifetimeCap}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="mt-2 text-[10px] text-ink-faint leading-normal">
                                      * 索償總額受制於保單整體每年度保障額或終身限額，並非毫無封頂。如自選自負額（Deductible），須扣除自負額後方獲 100% 實報實銷。
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-2 text-ink-faint transition-all group-hover:bg-ink group-hover:text-paper group-hover:translate-x-0.5">
                                <ArrowRight size={13} />
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* ── 梯隊分佈視圖（動態自適應市場梯隊與決策短鏈） ───────────── */
                <div className="space-y-5">
                  {/* 1. 頂部全景市場梯隊格局分佈條 (Panoramic Tier Bar) */}
                  <div className="rounded-xl border border-line/80 bg-paper-2/40 p-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-ink">
                        <Layers size={15} className="text-jade shrink-0" />
                        <span>全景市場梯隊格局分佈（{currentMetric.label}）</span>
                      </div>
                      <span className="font-grotesk text-[11px] font-semibold text-ink-soft">
                        共 {chartPoints.length} 款有效計劃參照 · 劃分為 {distributionTiers.length} 個市場梯隊
                      </span>
                    </div>

                    {/* 橫向堆疊色彩條 */}
                    <div className="flex h-6 w-full overflow-hidden rounded-lg bg-paper-2 p-0.5 gap-0.5 shadow-inner">
                      {distributionTiers.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            width: `${Math.max(t.percentage, 8)}%`,
                            backgroundColor: t.color,
                          }}
                          className="h-full rounded-sm flex items-center justify-center text-paper font-grotesk text-[10.5px] font-bold transition-all hover:opacity-90 px-1 overflow-hidden select-none"
                          title={`${t.name}：${t.count} 份 (${t.percentage}%)`}
                        >
                          <span className="truncate">{t.badge.split(" ")[0]} {t.percentage}%</span>
                        </div>
                      ))}
                    </div>

                    {/* 梯隊圖例與市場一句話診斷 */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-line/40 text-[11px] text-ink-soft">
                      <div className="flex flex-wrap items-center gap-3">
                        {distributionTiers.map((t) => (
                          <div key={t.id} className="flex items-center gap-1.5">
                            <div
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="font-semibold text-ink">{t.name}</span>
                            <span className="font-grotesk text-ink-faint">
                              ({t.count} 份 · {t.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-ink-faint italic text-[10.5px]">
                        💡 提示：點擊各梯隊內代表計劃可直接對照官方保單條款
                      </div>
                    </div>
                  </div>

                  {/* 2. 梯隊深度卡片矩陣 (Deep Tier Cards Grid) */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {distributionTiers.map((tier) => {
                      const isExpanded = Boolean(expandedTiers[tier.id]);
                      const hasMoreThanFour = tier.items.length > 4;
                      const displayedItems = hasMoreThanFour && !isExpanded
                        ? tier.items.slice(0, 3)
                        : tier.items;

                      const TierIcon =
                        tier.iconType === "flagship"
                          ? Sparkles
                          : tier.iconType === "high"
                            ? Award
                            : tier.iconType === "mid"
                              ? ShieldCheck
                              : tier.iconType === "low"
                                ? Zap
                                : Layers;

                      return (
                        <div
                          key={tier.id}
                          className={cn(
                            "flex flex-col justify-between rounded-xl border p-4.5 transition-all duration-200 shadow-xs",
                            tier.borderColor,
                            tier.bgColor
                          )}
                        >
                          <div>
                            {/* 卡片頭部：標題、徽章與佔比 */}
                            <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3">
                              <div className="flex items-start gap-2.5">
                                <div
                                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-paper shadow-xs"
                                  style={{ backgroundColor: tier.color }}
                                >
                                  <TierIcon size={16} />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <h4 className="font-sans text-[15px] font-bold text-ink">
                                      {tier.name}
                                    </h4>
                                    <span
                                      className="rounded-full px-2 py-0.5 font-sans text-[10px] font-bold"
                                      style={{
                                        backgroundColor: `${tier.color}1A`,
                                        color: tier.color,
                                      }}
                                    >
                                      {tier.badge}
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-[11.5px] text-ink-soft leading-snug">
                                    {tier.tagline}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="inline-flex rounded-full bg-paper px-2 py-0.5 font-grotesk text-[11px] font-bold text-ink shadow-2xs border border-line/60">
                                  {tier.count} 份 ({tier.percentage}%)
                                </span>
                              </div>
                            </div>

                            {/* 數值指標區間與均值橫幅 (Range & Avg Banner) */}
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-paper/90 px-3 py-2 border border-line/60 text-[11.5px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-ink-soft">保障區間：</span>
                                <strong className="font-grotesk text-ink text-[12.5px]">
                                  {tier.rangeDisplay}
                                </strong>
                              </div>
                              {tier.avgDisplay && (
                                <span className="font-grotesk text-[11px] font-semibold text-jade bg-jade/10 px-2 py-0.5 rounded-full">
                                  {tier.avgDisplay}
                                </span>
                              )}
                            </div>

                            {/* Short-Chain 決策短鏈 (Core Advantage & Target Audience) */}
                            <div className="mt-2.5 space-y-1.5 rounded-lg bg-paper/70 p-2.5 border border-line/50 text-[11.5px]">
                              <div className="flex items-start gap-1.5">
                                <Zap size={13} className="shrink-0 mt-0.5 text-amber-600" />
                                <div className="leading-relaxed">
                                  <strong className="text-ink">核心優勢：</strong>
                                  <span className="text-ink-soft">{tier.advantage}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <Users size={13} className="shrink-0 mt-0.5 text-blue-600" />
                                <div className="leading-relaxed">
                                  <strong className="text-ink">適合人群：</strong>
                                  <span className="text-ink-soft">{tier.targetAudience}</span>
                                </div>
                              </div>
                            </div>

                            {/* 涵蓋保險公司 Chips */}
                            {tier.insurers.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap items-center gap-1">
                                <span className="text-[11px] font-semibold text-ink-faint mr-0.5">
                                  涵蓋保司 ({tier.insurers.length})：
                                </span>
                                {tier.insurers.map((ins) => (
                                  <span
                                    key={ins.insurer}
                                    className="inline-flex items-center rounded bg-paper px-1.5 py-0.5 text-[10.5px] font-medium text-ink-soft border border-line/50"
                                  >
                                    {ins.insurerZh}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 代表產品列表 */}
                            <div className="mt-3 space-y-1">
                              <span className="text-[11px] font-bold text-ink-faint">
                                代表性計劃對照（點擊開啟官方條款）：
                              </span>
                              <div className="mt-1 flex flex-col gap-1">
                                {displayedItems.map((p) => {
                                  const pCap = productCapsMap.get(p.id);
                                  const isPFullCover =
                                    p.isFlagship ||
                                    p.displayValue.includes("全數賠償") ||
                                    p.displayValue.includes("全額");

                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => navigate(p.url)}
                                      className="group/item flex items-center justify-between rounded-lg bg-paper/80 p-2 text-left text-small text-ink transition-all hover:bg-paper hover:shadow-xs border border-line/40 hover:border-line"
                                    >
                                      <div className="min-w-0 flex-1 pr-2">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <span className="shrink-0 rounded bg-paper-2 px-1.5 py-0.5 font-grotesk text-[10.5px] font-semibold text-ink-soft">
                                            {p.insurerZh}
                                          </span>
                                          <span className="truncate font-sans font-medium text-[13px] text-ink group-hover/item:text-jade transition-colors">
                                            {p.name}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0 text-right">
                                        <div className="flex flex-col items-end">
                                          <span className="font-grotesk font-bold text-[13px] text-ink">
                                            {p.displayValue}
                                          </span>
                                          {isPFullCover && pCap && (
                                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                                              {pCap.shortBadge}
                                            </span>
                                          )}
                                        </div>
                                        <ArrowRight
                                          size={13}
                                          className="text-ink-faint transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-ink"
                                        />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* 展開/收起更多產品按鈕 */}
                          {hasMoreThanFour && (
                            <button
                              type="button"
                              onClick={() => toggleTierExpanded(tier.id)}
                              className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-line/60 bg-paper py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-paper-2 hover:text-ink transition-colors"
                            >
                              <span>
                                {isExpanded
                                  ? "收起部分計劃 ▴"
                                  : `展開其餘 ${tier.items.length - 3} 款計劃 ▾（共 ${tier.items.length} 份）`}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

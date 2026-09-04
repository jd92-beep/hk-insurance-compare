import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  PieChart,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  METRIC_GROUP_LABELS,
  getCategoryMetrics,
  getDefaultMetric,
  prepareChartData,
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

  // 14. 梯隊分佈數據（Pie Chart Breakdown）
  const distributionTiers = useMemo(() => {
    if (chartPoints.length === 0) return [];
    const flagship = chartPoints.filter((p) => p.isFlagship);
    const tierHigh = chartPoints.filter(
      (p) => !p.isFlagship && p.numericValue >= 5_000_000
    );
    const tierMid = chartPoints.filter(
      (p) => !p.isFlagship && p.numericValue >= 500_000 && p.numericValue < 5_000_000
    );
    const tierBase = chartPoints.filter(
      (p) => !p.isFlagship && p.numericValue < 500_000
    );

    const tiers = [
      {
        name: "頂級旗艦（全數賠償 / 無細項上限）",
        subNote: "不設分項上限，受制於保單年度總額",
        count: flagship.length,
        color: "#D97706",
        items: flagship,
      },
      {
        name: "高額保障（HK$500萬以上）",
        subNote: "高額分項限額或高保額常規方案",
        count: tierHigh.length,
        color: "#2563EB",
        items: tierHigh,
      },
      {
        name: "中級保障（HK$50萬 - HK$500萬）",
        subNote: "中產或標準以上進階保障",
        count: tierMid.length,
        color: "#059669",
        items: tierMid,
      },
      {
        name: "入門/常規（HK$50萬以下）",
        subNote: "標準自願醫保或入門基層限額",
        count: tierBase.length,
        color: "#64748B",
        items: tierBase,
      },
    ].filter((t) => t.count > 0);

    return tiers;
  }, [chartPoints]);

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
                /* ── 梯隊分佈視圖（Pie/Distribution View） ───────────── */
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {distributionTiers.map((tier) => {
                    const pct = ((tier.count / chartPoints.length) * 100).toFixed(1);
                    return (
                      <div
                        key={tier.name}
                        className="rounded-xl border border-line/70 bg-paper p-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-line/50 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3.5 w-3.5 rounded-full"
                              style={{ backgroundColor: tier.color }}
                            />
                            <div>
                              <h4 className="font-sans text-[14px] font-bold text-ink">
                                {tier.name}
                              </h4>
                              {tier.subNote && (
                                <p className="text-[11px] text-ink-faint">
                                  {tier.subNote}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-grotesk text-[13px] font-black text-ink">
                            {tier.count} 份 ({pct}%)
                          </span>
                        </div>
                        <div className="mt-3 flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {tier.items.map((p) => {
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
                                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-small text-ink transition-colors hover:bg-paper-2"
                              >
                                <span className="truncate pr-2 font-medium">
                                  <span className="font-bold text-ink-soft mr-1">
                                    [{p.insurerZh}]
                                  </span>
                                  {p.name}
                                </span>
                                <div className="flex flex-col items-end shrink-0 text-right">
                                  <span className="font-grotesk font-bold text-ink">
                                    {p.displayValue}
                                  </span>
                                  {isPFullCover && pCap && (
                                    <span className="text-[10px] font-semibold text-amber-700">
                                      {pCap.shortBadge}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

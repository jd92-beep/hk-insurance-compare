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
}

/** 常用特點多選過濾標籤定義 */
interface FeatureFilterTag {
  id: string;
  label: string;
  keywords: string[];
}

const UNIVERSAL_FEATURE_TAGS: FeatureFilterTag[] = [
  {
    id: "full-cover",
    label: "全數賠償",
    keywords: ["全數賠償", "全額賠償", "全額支付", "100%實報實銷", "不設細項"],
  },
  {
    id: "cashless",
    label: "出院免找數",
    keywords: ["免找數", "直付", "醫療網絡直付", "預先批核免找數"],
  },
  {
    id: "renewal",
    label: "保證續保",
    keywords: ["保證續保", "續保至 100", "保證續保至"],
  },
  {
    id: "no-sublimit",
    label: "無細項上限",
    keywords: ["不設細項", "無細項", "全額賠償", "全數賠償"],
  },
  {
    id: "day-surgery",
    label: "日間手術保障",
    keywords: ["日間手術", "門診手術", "日間醫療"],
  },
  {
    id: "advanced-imaging",
    label: "先進造影(CT/MRI)",
    keywords: ["CT", "MRI", "PET", "診斷成像", "訂明診斷成像"],
  },
  {
    id: "cancer-treatment",
    label: "癌症標靶/非手術",
    keywords: ["標靶", "化療", "非手術癌症", "癌症藥物", "免疫治療"],
  },
  {
    id: "dialysis",
    label: "門診洗腎",
    keywords: ["洗腎", "透析", "血液透析", "腹膜透析"],
  },
  {
    id: "psychiatric",
    label: "精神科治療",
    keywords: ["精神科", "精神科治療"],
  },
  {
    id: "emergency-evac",
    label: "緊急醫療運送",
    keywords: ["緊急醫療運送", "緊急運送", "專機運送", "救援服務"],
  },
  {
    id: "companion-bed",
    label: "親屬陪床費",
    keywords: ["陪床", "親屬陪床", "家長陪床"],
  },
  {
    id: "shortfall",
    label: "公司醫保銜接 (SMM)",
    keywords: ["Shortfall", "差額補償", "差額填補", "SMM", "附加醫療"],
  },
  {
    id: "conversion",
    label: "免核保轉保權",
    keywords: ["保證轉保", "免核保轉保", "免核保", "轉保權"],
  },
  {
    id: "bonesetter-chiro",
    label: "中醫跌打骨傷",
    keywords: ["跌打", "中醫", "骨傷", "針灸"],
  },
  {
    id: "third-party",
    label: "第三者責任高額",
    keywords: ["第三者", "法律責任", "第三者責任"],
  },
  {
    id: "multiple-cancer",
    label: "癌症多次賠償",
    keywords: ["多重癌症", "多次癌症", "多重賠償", "持續賠償"],
  },
];

export default function UniversalComparisonChart({
  products,
  categoryId,
  categoryName,
  color = "#181D2E",
  className,
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

  // 7. 特點多選過濾 Tags
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // 8. 保險公司過濾
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>([]);

  // 9. 圖表展開 / 折疊開關
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

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

  // 10. 套用特點過濾與保險公司過濾後的產品列表
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 公司篩選
      if (selectedInsurers.length > 0 && !selectedInsurers.includes(p.insurer)) {
        return false;
      }
      // 特點多選篩選
      if (selectedFeatures.length > 0) {
        const coverages = p.coverage ?? [];
        const hasAllFeatures = selectedFeatures.every((fId) => {
          const tag = UNIVERSAL_FEATURE_TAGS.find((t) => t.id === fId);
          if (!tag) return true;
          return coverages.some((c) =>
            tag.keywords.some(
              (kw) => c.item.includes(kw) || (c.limit && c.limit.includes(kw))
            )
          );
        });
        if (!hasAllFeatures) return false;
      }
      return true;
    });
  }, [products, selectedInsurers, selectedFeatures]);

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

  // 13. 梯隊分佈數據（Pie Chart Breakdown）
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
        name: "頂級旗艦（全數賠償 / 無上限）",
        count: flagship.length,
        color: "#D97706",
        items: flagship,
      },
      {
        name: "高額保障（HK$500萬以上）",
        count: tierHigh.length,
        color: "#2563EB",
        items: tierHigh,
      },
      {
        name: "中級保障（HK$50萬 - HK$500萬）",
        count: tierMid.length,
        color: "#059669",
        items: tierMid,
      },
      {
        name: "入門/常規（HK$50萬以下）",
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

              {/* 3. 特點多選過濾 Chips（16+ 特點篩選） */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-line/40">
                <span className="mr-1 text-[12px] font-semibold text-ink-soft">
                  條款特點多選過濾：
                </span>
                {UNIVERSAL_FEATURE_TAGS.map((tag) => {
                  const isSelected = selectedFeatures.includes(tag.id);
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
                {selectedFeatures.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedFeatures([])}
                    className="ml-1 text-[11px] font-semibold text-red hover:underline"
                  >
                    清除特點過濾 ({selectedFeatures.length})
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

                        {/* 右側：金額標籤 + 徽章 + 跳轉箭頭 */}
                        <div className="flex items-center justify-end gap-2.5 shrink-0 sm:min-w-[140px] text-right">
                          <div className="flex flex-col items-end">
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
                            {item.badge && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider",
                                  item.isFlagship
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                    : "bg-paper-2 text-ink-soft"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-2 text-ink-faint transition-all group-hover:bg-ink group-hover:text-paper group-hover:translate-x-0.5">
                            <ArrowRight size={13} />
                          </div>
                        </div>
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
                            <h4 className="font-sans text-[14px] font-bold text-ink">
                              {tier.name}
                            </h4>
                          </div>
                          <span className="font-grotesk text-[13px] font-black text-ink">
                            {tier.count} 份 ({pct}%)
                          </span>
                        </div>
                        <div className="mt-3 flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {tier.items.map((p) => (
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
                              <span className="font-grotesk font-bold text-ink shrink-0">
                                {p.displayValue}
                              </span>
                            </button>
                          ))}
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

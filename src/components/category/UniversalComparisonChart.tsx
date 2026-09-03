import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
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

export default function UniversalComparisonChart({
  products,
  categoryId,
  categoryName,
  color = "#181D2E",
  className,
}: UniversalComparisonChartProps) {
  const navigate = useNavigate();

  // 1. 取得該類別定義的所有量化指標
  const availableMetrics = useMemo(
    () => getCategoryMetrics(categoryId),
    [categoryId]
  );
  const defaultMetric = useMemo(
    () => getDefaultMetric(categoryId),
    [categoryId]
  );

  // 2. 當前選中之指標（預設取首選指標）
  const [selectedMetricId, setSelectedMetricId] = useState<string>(
    defaultMetric?.id ?? availableMetrics[0]?.id ?? ""
  );

  // 當 categoryId 改變時，自動重置回預設指標
  const currentMetric = useMemo(() => {
    return (
      availableMetrics.find((m) => m.id === selectedMetricId) ??
      defaultMetric ??
      availableMetrics[0]
    );
  }, [availableMetrics, selectedMetricId, defaultMetric]);

  // 3. 排序方向：'desc'（最高保障優先）或 'asc'
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  // 4. 保險公司過濾
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>([]);

  // 5. 圖表展開 / 折疊開關
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

  // 6. 套用保險公司過濾後的產品列表
  const filteredProducts = useMemo(() => {
    if (selectedInsurers.length === 0) return products;
    return products.filter((p) => selectedInsurers.includes(p.insurer));
  }, [products, selectedInsurers]);

  // 7. 使用 chart-metrics 引擎準備圖表數據點
  const chartPoints = useMemo(() => {
    if (!currentMetric) return [];
    return prepareChartData(filteredProducts, currentMetric, {
      sortOrder: sortDirection,
      filterEmpty: true,
    });
  }, [filteredProducts, currentMetric, sortDirection]);

  // 8. 計算市場平均值與圖表最大值
  const { maxVisualValue, benchmarkAverage, benchmarkDisplay } = useMemo(() => {
    if (chartPoints.length === 0) {
      return { maxVisualValue: 1, benchmarkAverage: null, benchmarkDisplay: null };
    }

    const maxVisual = Math.max(...chartPoints.map((p) => p.visualValue), 1);

    // 計算非旗艦（有限非零）數值的算術平均值作為基準線
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

  // 切換保險公司選中狀態
  const toggleInsurer = (insurer: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(insurer) ? prev.filter((i) => i !== insurer) : [...prev, insurer]
    );
  };

  // 重設所有篩選
  const resetFilters = () => {
    setSelectedInsurers([]);
    setSortDirection("desc");
  };

  // 若該類別沒有配置任何量化指標，靜默回傳
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
        boxShadow: "0 4px 20px -2px rgba(24, 29, 46, 0.05), 0 1px 3px 0 rgba(24, 29, 46, 0.03)",
      }}
    >
      {/* ── 頂部抬頭與折疊控制 ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-paper shadow-sm"
            style={{ backgroundColor: color }}
          >
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans text-[17px] font-bold text-ink sm:text-[18px]">
                {categoryName}保障限額排行榜
              </h3>
              <span className="rounded-full bg-paper-2 px-2.5 py-0.5 font-grotesk text-[11px] font-semibold text-ink-soft">
                {chartPoints.length} 份計劃參照
              </span>
            </div>
            <p className="mt-0.5 text-small text-ink-soft">
              {currentMetric.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedInsurers.length > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-paper-2 hover:text-ink"
            >
              <RotateCcw size={14} />
              <span>重設篩選</span>
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
            {/* 控制面板：指標膠囊選取 + 排序切換 + 保險公司快速篩選 */}
            <div className="border-b border-line/60 bg-paper-2/40 px-5 py-3.5 sm:px-6">
              <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
                {/* 指標選取 Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[13px] font-medium text-ink-soft">
                    比較指標：
                  </span>
                  {availableMetrics.map((metric) => {
                    const isActive = metric.id === currentMetric.id;
                    return (
                      <button
                        key={metric.id}
                        type="button"
                        onClick={() => setSelectedMetricId(metric.id)}
                        className={cn(
                          "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all",
                          isActive
                            ? "text-paper shadow-xs"
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
                </div>

                {/* 排序方向切換按鈕 */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection((d) => (d === "desc" ? "asc" : "desc"))
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1 text-[13px] font-medium text-ink shadow-xs transition-colors hover:bg-paper-2"
                  >
                    <ArrowUpDown size={13} className="text-ink-soft" />
                    <span>
                      {sortDirection === "desc"
                        ? "最高保障優先 ▾"
                        : "最低保障優先 ▴"}
                    </span>
                  </button>
                </div>
              </div>

              {/* 保險公司過濾 Chips */}
              {insurerList.length > 1 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-line/40">
                  <span className="text-[12px] text-ink-faint mr-1">公司篩選：</span>
                  {insurerList.map(({ insurer, insurerZh }) => {
                    const isSelected = selectedInsurers.includes(insurer);
                    return (
                      <button
                        key={insurer}
                        type="button"
                        onClick={() => toggleInsurer(insurer)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] transition-all",
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

            {/* ── 長條圖列表（Ranked Horizontal Bar List） ─────────── */}
            <div className="p-5 sm:p-6">
              {/* 市場基準線提示卡 */}
              {benchmarkDisplay && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-paper-2/70 px-4 py-2 text-small text-ink-soft">
                  <div className="flex items-center gap-1.5">
                    <Info size={14} className="text-jade" />
                    <span>
                      該類別已披露額度計劃之市場平均水平約為：
                      <strong className="ml-1 text-ink font-grotesk">{benchmarkDisplay}</strong>
                    </span>
                  </div>
                  <span className="text-[12px] text-ink-faint hidden sm:inline">
                    點擊任何計劃直接跳轉詳情頁
                  </span>
                </div>
              )}

              {chartPoints.length === 0 ? (
                <div className="py-12 text-center text-ink-soft">
                  <p className="text-small">此篩選條件下未有匹配到該指標的量化條款。</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 text-small font-bold text-jade hover:underline"
                  >
                    重設過濾條件
                  </button>
                </div>
              ) : (
                <div className="relative flex flex-col gap-3">
                  {/* 市場平均虛線（在長條圖區間上打孔） */}
                  {benchmarkPercent !== null && (
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 hidden w-px border-r-2 border-dashed border-jade/50 md:block z-10"
                      style={{
                        left: `calc(190px + (100% - 340px) * ${benchmarkPercent / 100})`,
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

                    // 前三名名次獎牌
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
                        {/* 左側：排名 + 公司 + 產品名稱 */}
                        <div className="flex items-center gap-3 sm:w-[220px] lg:w-[260px] shrink-0">
                          {/* 排名 Badge */}
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

                        {/* 中間：橫向長條圖柱（Progress Bar） */}
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
                              {/* 旗艦微光 */}
                              {item.isFlagship && (
                                <Sparkles
                                  size={12}
                                  className="text-amber-200 animate-pulse"
                                />
                              )}
                            </motion.div>
                          </div>
                        </div>

                        {/* 右側：金額標籤 + Badge + 箭頭 */}
                        <div className="flex items-center justify-end gap-2.5 shrink-0 sm:min-w-[140px] text-right">
                          <div className="flex flex-col items-end">
                            <span
                              className={cn(
                                "font-grotesk font-black text-[15px] sm:text-[16px]",
                                item.isFlagship ? "text-amber-700 dark:text-amber-400" : "text-ink"
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

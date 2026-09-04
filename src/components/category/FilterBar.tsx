import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  CircleDollarSign,
  Filter,
  Globe,
  LayoutGrid,
  Plane,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Table2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SortKey = "default" | "premium" | "insurer" | "coverage";
export type ViewMode = "table" | "cards";
export type TravelTripType = "all" | "single" | "annual";
export type TravelRegion = "all" | "asia" | "worldwide" | "gba";
export type PriceRangeKey = "all" | "under100" | "100to250" | "250to500" | "over500";

export interface InsurerOption {
  name: string;
  name_zh: string;
}

const SORT_LABELS: Record<Exclude<SortKey, "premium">, string> = {
  default: "預設推薦",
  insurer: "公司名 A–Z",
  coverage: "保障項目數量",
};

/** 保費排序 label 跟埋方向（升序/降序即時反映） */
function premiumSortLabel(dir: "asc" | "desc"): string {
  return dir === "asc" ? "保費由低至高（實付折後價先）" : "保費由高至低（實付折後價先）";
}

const PRICE_RANGE_PRESETS: { id: PriceRangeKey; label: string; sub?: string }[] = [
  { id: "all", label: "全部保費" },
  { id: "under100", label: "平霸抵玩", sub: "≤ HK$100" },
  { id: "100to250", label: "主流實用", sub: "HK$100 – $250" },
  { id: "250to500", label: "高額保障", sub: "HK$250 – $500" },
  { id: "over500", label: "尊尚旗艦", sub: "> HK$500" },
];

/**
 * 類別詳情頁篩選工具列（Expandable 收合架構）
 * 1. 預設收起（Collapsed），向下滾動不使用 sticky，絕不霸佔視窗！
 * 2. 支援一鍵展開與收起。
 * 3. 整合【按價錢篩選 (Price Filter)】、【保險公司】、【旅遊維度】、【排序】與【視圖切換】。
 */
export default function FilterBar({
  insurers,
  selectedInsurers,
  onToggleInsurer,
  onClearInsurers,
  onlyPremium,
  onTogglePremium,
  sort,
  premiumDir,
  onSortChange,
  view,
  onViewChange,
  showViewToggle,
  shown,
  total,
  onReset,
  hasActiveFilters,
  isTravel = false,
  travelTripType = "all",
  onTravelTripTypeChange,
  travelRegion = "all",
  onTravelRegionChange,
  onlyPromo = false,
  onTogglePromo,
  priceRange = "all",
  onPriceRangeChange,
  activeFeatureCount = 0,
}: {
  insurers: InsurerOption[];
  selectedInsurers: string[];
  onToggleInsurer: (name: string) => void;
  onClearInsurers: () => void;
  onlyPremium: boolean;
  onTogglePremium: () => void;
  sort: SortKey;
  premiumDir: "asc" | "desc";
  onSortChange: (s: SortKey) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  showViewToggle: boolean;
  shown: number;
  total: number;
  onReset: () => void;
  hasActiveFilters: boolean;
  isTravel?: boolean;
  travelTripType?: TravelTripType;
  onTravelTripTypeChange?: (v: TravelTripType) => void;
  travelRegion?: TravelRegion;
  onTravelRegionChange?: (v: TravelRegion) => void;
  onlyPromo?: boolean;
  onTogglePromo?: () => void;
  priceRange?: PriceRangeKey;
  onPriceRangeChange?: (p: PriceRangeKey) => void;
  activeFeatureCount?: number;
}) {
  // 核心需求：預設設為「收起 (Collapsed)」！向下滾動不釘死在螢幕上
  const [isOpen, setIsOpen] = useState(false);

  // 精確統計當前啟動之所有過濾條件總數
  const activeConditionsCount = (
    selectedInsurers.length +
    (onlyPremium ? 1 : 0) +
    (sort !== "default" ? 1 : 0) +
    (isTravel && travelTripType !== "all" ? 1 : 0) +
    (isTravel && travelRegion !== "all" ? 1 : 0) +
    (isTravel && onlyPromo ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    activeFeatureCount
  );

  const isFilterActive = hasActiveFilters || activeConditionsCount > 0;
  const currentPricePreset = PRICE_RANGE_PRESETS.find((p) => p.id === priceRange);

  return (
    <div
      className="relative z-20 border-b bg-paper/95 backdrop-blur-md transition-all duration-300 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] [box-shadow:0_1px_0_var(--line),0_4px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.35)]"
      style={{ borderColor: "var(--line)" }}
    >
      {/* 頂部極細微光層（景深分離） */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-jade/20 to-transparent opacity-70"
        aria-hidden="true"
      />

      {/* ── 1. 常駐 Compact 欄位（無論展開或收起皆常駐，且非 sticky，隨頁面正常捲動） ── */}
      <div className="site-container relative z-10 flex flex-wrap items-center justify-between gap-3 py-3">
        {/* 左側：結果統計 + 已選條件徽章與活躍條件摘要 */}
        <div className="flex flex-wrap items-center gap-2 text-small">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-ink-soft shrink-0" />
            <span className="font-medium text-ink">
              篩選及排序
            </span>
            <span className="text-ink-faint">
              (顯示 <strong className="font-grotesk font-bold text-ink">{shown}</strong> / {total} 份)
            </span>
          </div>

          {/* 活躍條件 Badge */}
          {activeConditionsCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-jade/10 px-2.5 py-0.5 font-grotesk text-[12px] font-bold text-jade">
              已套用 {activeConditionsCount} 項條件
            </span>
          )}

          {/* 快速顯示目前選取的價格或公司標籤 */}
          {priceRange !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11.5px] font-bold text-amber-800 dark:text-amber-300">
              💰 {currentPricePreset?.label} ({currentPricePreset?.sub})
            </span>
          )}

          {selectedInsurers.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11.5px] font-bold text-sky-800 dark:text-sky-300">
              🏢 {selectedInsurers.length} 間公司
            </span>
          )}
        </div>

        {/* 右側：展開/收起 按鈕 + 視圖切換 + 重設 */}
        <div className="flex items-center gap-2">
          {/* 視圖切換（表格 / 卡片） */}
          {showViewToggle && (
            <div
              className="flex shrink-0 items-center rounded-full bg-paper-3 p-0.5"
              role="group"
              aria-label="視圖切換"
            >
              {(
                [
                  { key: "table", label: "表格", icon: Table2 },
                  { key: "cards", label: "卡片", icon: LayoutGrid },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onViewChange(key)}
                  aria-pressed={view === key}
                  className={cn(
                    "inline-flex min-h-[36px] sm:min-h-[28px] items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold transition-all duration-300",
                    view === key ? "bg-ink text-paper shadow-xs" : "text-ink-soft hover:text-ink",
                  )}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {isFilterActive && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-[44px] sm:min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-ink-soft hover:text-red hover:bg-red/10 active:scale-95 transition-all"
              aria-label="重設全部篩選條件"
            >
              <RotateCcw size={12} className="text-red" />
              <span className="hidden sm:inline">重設全部</span>
            </button>
          )}

          {/* 展開 / 收起 核心切換按鈕 */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className={cn(
              "inline-flex min-h-[44px] sm:min-h-[34px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-small font-bold transition-all duration-200 active:scale-95 shadow-xs border",
              isOpen
                ? "border-ink bg-ink text-paper"
                : "border-line-strong bg-paper hover:bg-paper-2 text-ink"
            )}
          >
            <Filter size={13} className={isOpen ? "text-paper" : "text-ink-soft"} />
            <span>{isOpen ? "收起篩選器" : "展開篩選器"}</span>
            <ChevronDown
              size={14}
              className={cn("transition-transform duration-300", isOpen && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {/* ── 2. 可展開收起的完整篩選面板（預設收起） ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden border-t bg-paper-2/50 shadow-inner"
            style={{ borderColor: "var(--line)" }}
          >
            {/* 實體米紙微紋理底層 */}
            <div
              className="pointer-events-none absolute inset-0 z-0 select-none opacity-[0.025] mix-blend-multiply dark:mix-blend-screen"
              style={{
                backgroundImage: "url('/images/textures/mesh-paper-texture.webp')",
                backgroundSize: "320px",
                backgroundRepeat: "repeat",
              }}
              aria-hidden="true"
            />

            <div className="site-container relative z-10 flex flex-col gap-4 py-4.5">
              {/* [區塊 A] 價錢預算篩選 (Price Filter) */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-ink-soft shrink-0 pr-1">
                  <CircleDollarSign size={14} className="text-amber-600" />
                  按價錢篩選：
                </span>
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="價錢篩選">
                  {PRICE_RANGE_PRESETS.map((preset) => {
                    const active = priceRange === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onPriceRangeChange?.(preset.id)}
                        aria-pressed={active}
                        className={cn(
                          "chip min-h-[44px] sm:min-h-[32px] px-3 py-1 text-[12px] font-bold transition-all duration-200 active:scale-95 border",
                          active
                            ? "border-amber-500 bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/30"
                            : "border-line bg-paper text-ink-soft hover:text-ink hover:border-line-strong"
                        )}
                      >
                        <span>{preset.label}</span>
                        {preset.sub && (
                          <span className={cn("text-[11px] font-mono", active ? "text-amber-100" : "text-ink-faint")}>
                            {preset.sub}
                          </span>
                        )}
                        {active && <Check size={12} className="ml-0.5" />}
                      </button>
                    );
                  })}
                  <span className="text-[11px] text-ink-faint ml-1">
                    （以官方即時折後實付價為準）
                  </span>
                </div>
              </div>

              {/* [區塊 B] 旅遊保險專屬維度（旅程類型 + 地區 + 優惠） */}
              {isTravel && (
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line/60 bg-paper p-3">
                  {/* 旅程類型 */}
                  <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="旅程類型篩選">
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-ink-soft pr-1">
                      <Plane size={13} className="text-sky-600" />
                      旅程類型：
                    </span>
                    <FilterChip active={travelTripType === "all"} onClick={() => onTravelTripTypeChange?.("all")}>
                      全部
                    </FilterChip>
                    <FilterChip active={travelTripType === "single"} onClick={() => onTravelTripTypeChange?.("single")}>
                      單次旅程
                    </FilterChip>
                    <FilterChip active={travelTripType === "annual"} onClick={() => onTravelTripTypeChange?.("annual")}>
                      全年多次 (Annual)
                    </FilterChip>
                  </div>

                  <span className="hidden sm:block h-5 w-px shrink-0 bg-line" aria-hidden="true" />

                  {/* 覆蓋地區 */}
                  <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="覆蓋地區篩選">
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-ink-soft pr-1">
                      <Globe size={13} className="text-indigo-600" />
                      保障地區：
                    </span>
                    <FilterChip active={travelRegion === "all"} onClick={() => onTravelRegionChange?.("all")}>
                      全部地區
                    </FilterChip>
                    <FilterChip active={travelRegion === "asia"} onClick={() => onTravelRegionChange?.("asia")}>
                      亞洲短途
                    </FilterChip>
                    <FilterChip active={travelRegion === "worldwide"} onClick={() => onTravelRegionChange?.("worldwide")}>
                      全球通用
                    </FilterChip>
                    <FilterChip active={travelRegion === "gba"} onClick={() => onTravelRegionChange?.("gba")}>
                      大灣區
                    </FilterChip>
                  </div>

                  <span className="hidden sm:block h-5 w-px shrink-0 bg-line" aria-hidden="true" />

                  {/* 即時折扣開關 */}
                  <button
                    type="button"
                    onClick={onTogglePromo}
                    aria-pressed={onlyPromo}
                    className={cn(
                      "chip shrink-0 border font-bold transition-all duration-300 active:scale-[0.94]",
                      onlyPromo
                        ? "border-amber-500 bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/30"
                        : "border-line bg-paper text-ink-soft hover:border-amber-300 hover:text-ink",
                    )}
                  >
                    <Sparkles size={13} className={cn(onlyPromo ? "animate-pulse text-white" : "text-amber-500")} />
                    <span>只睇有折扣／優惠碼</span>
                    {onlyPromo && <Check size={13} />}
                  </button>
                </div>
              )}

              {/* [區塊 C] 保險公司多選 Chips */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-bold text-ink-soft">
                    按保險公司多選篩選：
                  </span>
                  {selectedInsurers.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearInsurers}
                      className="text-[11.5px] text-red hover:underline"
                    >
                      清空已選公司 ({selectedInsurers.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="保險公司篩選">
                  <FilterChip
                    active={selectedInsurers.length === 0}
                    onClick={onClearInsurers}
                  >
                    全部公司 ({insurers.length})
                  </FilterChip>
                  {insurers.map((ins) => (
                    <FilterChip
                      key={ins.name}
                      active={selectedInsurers.includes(ins.name)}
                      onClick={() => onToggleInsurer(ins.name)}
                    >
                      <span className="font-grotesk">{ins.name}</span>
                      <span>{ins.name_zh}</span>
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* [區塊 D] 附加過濾與排序控制項 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/60">
                <div className="flex flex-wrap items-center gap-3">
                  {/* 只睇有公開保費 */}
                  <button
                    type="button"
                    onClick={onTogglePremium}
                    aria-pressed={onlyPremium}
                    className={cn(
                      "chip shrink-0 border font-bold transition-all duration-300 active:scale-[0.94]",
                      "min-h-[44px] sm:min-h-[34px] px-3.5 py-1.5 sm:py-1",
                      onlyPremium
                        ? "border-jade bg-jade text-paper shadow-xs"
                        : "border-line bg-paper text-ink-soft hover:text-ink",
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", onlyPremium ? "bg-paper" : "bg-jade")}
                      aria-hidden="true"
                    />
                    只睇有公開保費
                    {onlyPremium && <Check size={13} />}
                  </button>

                  {/* 排序下拉選單 */}
                  <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                    <span>排序方式：</span>
                    <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
                      <SelectTrigger
                        className="h-[44px] sm:h-[34px] w-[220px] shrink-0 rounded-full border-line bg-paper px-3.5 text-small font-medium text-ink-soft shadow-none hover:text-ink focus:ring-red/40"
                        aria-label="排序方式"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default" className="text-small">
                          {SORT_LABELS.default}
                        </SelectItem>
                        <SelectItem value="premium" className="text-small">
                          {premiumSortLabel(premiumDir)}
                        </SelectItem>
                        <SelectItem value="insurer" className="text-small">
                          {SORT_LABELS.insurer}
                        </SelectItem>
                        <SelectItem value="coverage" className="text-small">
                          {SORT_LABELS.coverage}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 底部收起按鈕快捷列 */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-[12px] font-semibold text-ink-soft hover:text-ink underline decoration-dotted"
                >
                  ▲ 收起篩選工具
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "chip shrink-0 gap-1.5 whitespace-nowrap font-bold transition-all duration-300 active:scale-[0.94] border",
        "min-h-[44px] sm:min-h-[32px] px-3.5 py-2 sm:py-1",
        active
          ? "border-ink bg-ink text-paper shadow-xs"
          : "border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

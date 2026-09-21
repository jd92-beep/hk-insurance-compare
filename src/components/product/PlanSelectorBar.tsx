import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import type { PlanTierItem } from "@/components/product/plan-parser";
import { cn } from "@/lib/utils";

export interface PlanSelectorBarProps {
  /** 子計劃清單 */
  tiers: PlanTierItem[];
  /** 目前選中的子計劃 ID（null 或 undefined 代表「全部計劃對比」） */
  selectedTierId?: string | null;
  /** 切換選中計劃時觸發的回調 */
  onSelectTier: (tierId: string | null) => void;
  /** 外層自訂樣式類名 */
  className?: string;
  /** 產品名稱（可選） */
  productName?: string;
}

/**
 * 提取子計劃精簡 Tab 顯示標籤（Smart Short Label）
 * 剝離冗餘泛稱詞（如「自願醫保」、「醫療保障」、「靈活計劃」），保持 Tab 簡潔優雅。
 */
function formatTierShortName(tier: PlanTierItem): string {
  let name = tier.name.trim();

  // 若已經有括號編號區隔（例如「靈活計劃 (F00027)」），保留核心
  if (name.match(/^靈活計劃\s*\([SF]\d{5}\)$/)) {
    return name.replace(/^靈活計劃/, "靈活");
  }

  // 剝離常見冗餘前綴與後綴
  name = name
    .replace(/^自願醫保/, "")
    .replace(/^AXA安盛|^AIA友邦|^富衛|^保誠|^宏利|^永明|^信諾/, "")
    .replace(/醫療保障計劃|醫療保障|醫療計劃|自願醫療保險計劃/, "")
    .replace(/靈活計劃$/, "")
    .replace(/標準計劃$/, "標準")
    .trim();

  // 若清理後為空或過短，安全回退
  if (!name || name.length < 2) {
    name = tier.name;
  }

  return name;
}

/**
 * 計劃切換控制器（PlanSelectorBar）
 *
 * 專為多層級保險產品設計：
 * - 智能精簡 Tab 標籤（Smart Short Labels），消滅冗餘長字串
 * - 橫向滑動容器 + 左右紙墨平滑漸層遮罩（Fade Mask）+ 快速捲動箭頭
 * - 提供直觀的 Segmented Control：全部計劃對比 vs 獨立計劃專注視圖
 * - 支援官方認可編號 Chip（S00013 / F00074）、房型與高端標籤
 * - 嚴格遵循 paper/ink/jade/amber 設計系統
 */
export default function PlanSelectorBar({
  tiers,
  selectedTierId,
  onSelectTier,
  className,
}: PlanSelectorBarProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // 監聽並計算橫向滾動溢出狀態
  const updateScrollState = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [tiers, updateScrollState]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const offset = direction === "left" ? -220 : 220;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!tiers || tiers.length === 0) return null;

  const normalizedSelectedId = selectedTierId?.trim().toLowerCase() || null;
  const activeTier = normalizedSelectedId
    ? tiers.find(
        (t) =>
          t.id.toLowerCase() === normalizedSelectedId ||
          (Boolean(t.code) && t.code!.toLowerCase() === normalizedSelectedId)
      )
    : null;
  const isAllSelected = !activeTier;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {/* ── 標籤頂部說明 ── */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">
            選擇計劃規格（Plan Tier）
          </span>
          <span className="rounded-full bg-paper-3 px-2 py-0.5 font-grotesk text-[11px] font-semibold text-ink-soft">
            共 {tiers.length} 個子計劃
          </span>
        </div>
        {activeTier && (
          <button
            type="button"
            onClick={() => onSelectTier(null)}
            className="text-[12px] font-medium text-jade hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <span>查看全部對比</span>
            <ChevronRight size={13} className="shrink-0" />
          </button>
        )}
      </div>

      {/* ── Segmented Control 滾動容器（含漸層 Mask 與滑動箭頭） ── */}
      <div className="relative group/bar">
        {/* 左側平滑漸層與滾動按鈕 */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 pl-1 bg-gradient-to-r from-paper-2 via-paper-2/90 to-transparent rounded-l-[12px] pointer-events-none">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="向左滾動計劃"
              className="pointer-events-auto h-7 w-7 rounded-full border bg-paper/95 shadow-sm text-ink-soft hover:text-ink hover:bg-paper flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
              style={{ borderColor: "var(--line)" }}
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        )}

        {/* 右側平滑漸層與滾動按鈕 */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 pr-1 bg-gradient-to-l from-paper-2 via-paper-2/90 to-transparent rounded-r-[12px] pointer-events-none">
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="向右滾動計劃"
              className="pointer-events-auto h-7 w-7 rounded-full border bg-paper/95 shadow-sm text-ink-soft hover:text-ink hover:bg-paper flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
              style={{ borderColor: "var(--line)" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* 滾動軌道本體 */}
        <div
          ref={scrollContainerRef}
          role="tablist"
          aria-label="保險計劃規格切換"
          className="flex items-center gap-1.5 overflow-x-auto rounded-[12px] border bg-paper-2/90 p-1.5 shadow-inner-soft scrollbar-none scroll-smooth"
          style={{ borderColor: "var(--line)" }}
        >
          {/* 1. 全部計劃對比 Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={isAllSelected}
            onClick={() => onSelectTier(null)}
            className={cn(
              "group relative inline-flex shrink-0 items-center gap-1.5 rounded-[8px] px-3.5 py-2 text-[13px] font-bold transition-all duration-200 cursor-pointer",
              isAllSelected
                ? "bg-paper text-ink shadow-card border"
                : "text-ink-soft hover:bg-paper-3/60 hover:text-ink"
            )}
            style={isAllSelected ? { borderColor: "var(--line-strong)" } : undefined}
          >
            <Layers
              size={15}
              className={cn(
                "shrink-0 transition-colors",
                isAllSelected ? "text-jade" : "text-ink-faint group-hover:text-ink-soft"
              )}
            />
            <span>全部計劃對比</span>
            <span className="text-[11px] opacity-60 font-sans font-normal">(All Plans)</span>
            {isAllSelected && (
              <motion.span
                layoutId="plan-active-indicator"
                className="absolute -bottom-1 left-3 right-3 h-[2px] rounded-full bg-jade"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>

          {/* 2. 各獨立子計劃 Tab */}
          {tiers.map((t) => {
            const isSelected = activeTier?.id === t.id;
            const shortName = formatTierShortName(t);

            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectTier(t.id)}
                className={cn(
                  "group relative inline-flex shrink-0 items-center gap-1.5 rounded-[8px] px-3 py-2 text-[13px] font-bold transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-paper text-ink shadow-card border"
                    : "text-ink-soft hover:bg-paper-3/60 hover:text-ink"
                )}
                style={isSelected ? { borderColor: "var(--line-strong)" } : undefined}
                title={`${t.fullName}${t.code ? ` (${t.code})` : ""}`}
              >
                <span>{shortName}</span>

                {/* 認可編號 Chip */}
                {t.code && (
                  <span
                    className={cn(
                      "font-grotesk text-[11px] tracking-wide rounded px-1.5 py-0.5 font-medium transition-colors",
                      isSelected
                        ? "bg-jade-wash text-jade font-bold"
                        : "bg-paper-3 text-ink-faint group-hover:text-ink-soft"
                    )}
                  >
                    {t.code}
                  </span>
                )}

                {/* 房型或微標籤 */}
                {t.badges && t.badges.length > 0 && !t.code && (
                  <span className="text-[11px] font-normal text-ink-faint">
                    ({t.badges[0]})
                  </span>
                )}

                {isSelected && (
                  <motion.span
                    layoutId="plan-active-indicator"
                    className="absolute -bottom-1 left-3 right-3 h-[2px] rounded-full bg-jade"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

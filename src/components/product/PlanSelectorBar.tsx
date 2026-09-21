import { motion } from "framer-motion";
import { Check, ChevronRight, Layers } from "lucide-react";
import type { PlanTierItem } from "@/components/product/plan-parser";
import CertCodeChip, { RenewalOnlyBadge } from "@/components/product/CertCodeChip";
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
 * 計劃切換控制器（PlanSelectorBar）
 *
 * 專為多層級保險產品（如 AIA 自願醫保、Bowtie、Bupa 等）設計：
 * - 提供直觀的 Segmented Control：全部計劃對比 vs 獨立計劃專注視圖
 * - 支援認可編號 chip（S00013 / F00074）、房型與高端標籤
 * - 支援橫向滾動與無障礙鍵盤導航
 * - 嚴格遵循 paper/ink/jade/amber 設計系統
 */
export default function PlanSelectorBar({
  tiers,
  selectedTierId,
  onSelectTier,
  className,
}: PlanSelectorBarProps) {
  if (!tiers || tiers.length === 0) return null;

  const activeTier = tiers.find(
    (t) => t.id === selectedTierId || t.code?.toLowerCase() === selectedTierId?.toLowerCase()
  );
  const isAllSelected = !activeTier;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* ── 標籤控制條 ── */}
      <div className="flex flex-col gap-2">
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

        {/* ── Segmented Control 滾動列 ── */}
        <div
          role="tablist"
          aria-label="保險計劃規格切換"
          className="flex items-center gap-1.5 overflow-x-auto rounded-[12px] border bg-paper-2/90 p-1.5 shadow-inner-soft scrollbar-none"
          style={{ borderColor: "var(--line)" }}
        >
          {/* 1. 全部計劃對比 Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={isAllSelected}
            onClick={() => onSelectTier(null)}
            className={cn(
              "group relative inline-flex shrink-0 items-center gap-2 rounded-[8px] px-3.5 py-2 text-[13px] font-bold transition-all duration-200 cursor-pointer",
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
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectTier(t.id)}
                className={cn(
                  "group relative inline-flex shrink-0 items-center gap-2 rounded-[8px] px-3.5 py-2 text-[13px] font-bold transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-paper text-ink shadow-card border"
                    : "text-ink-soft hover:bg-paper-3/60 hover:text-ink"
                )}
                style={isSelected ? { borderColor: "var(--line-strong)" } : undefined}
                title={t.fullName}
              >
                <span>{t.name}</span>

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

                {/* 亮點微標記（如房型或高端） */}
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

      {/* ── 專注視圖卡片（Focused Plan Banner） ── */}
      {activeTier && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[10px] border bg-paper p-4 shadow-card"
          style={{ borderColor: "var(--line)" }}
        >
          {/* 左側翡翠綠強調飾條 */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[4px]"
            style={{ background: "var(--jade)" }}
          />

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1.5 pl-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-jade">
                  <Check size={14} className="stroke-[2.5]" />
                  <span>已切換至專注視圖</span>
                </span>
                <span className="font-sans text-[16px] font-bold text-ink">
                  {activeTier.name}
                </span>
                {activeTier.code && <CertCodeChip code={activeTier.code} />}
                {activeTier.renewalOnly && <RenewalOnlyBadge />}
              </div>

              {/* 房型與專屬屬性 */}
              <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-ink-soft">
                {activeTier.roomType && (
                  <span className="rounded bg-paper-2 px-2 py-0.5 font-medium">
                    房型級別：{activeTier.roomType}
                  </span>
                )}
                {activeTier.badges
                  ?.filter((b) => b !== activeTier.roomType)
                  .map((badge) => (
                    <span
                      key={badge}
                      className="rounded bg-jade-wash px-2 py-0.5 font-medium text-jade"
                    >
                      {badge}
                    </span>
                  ))}
                <span className="text-ink-faint">
                  · 下方保障項目已聚焦此計劃獨立限額與條款
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectTier(null)}
              className="self-start rounded-[6px] border bg-paper-2 px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-paper-3 hover:text-ink sm:self-center shrink-0 cursor-pointer"
              style={{ borderColor: "var(--line)" }}
            >
              返回全部計劃對比 ↩
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

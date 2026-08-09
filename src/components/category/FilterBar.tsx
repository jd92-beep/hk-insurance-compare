import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, LayoutGrid, RotateCcw, Table2 } from "lucide-react";
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

export interface InsurerOption {
  name: string;
  name_zh: string;
}

const SORT_LABELS: Record<Exclude<SortKey, "premium">, string> = {
  default: "預設排序",
  insurer: "公司名 A–Z",
  coverage: "保障項目數量",
};

/** 保費排序 label 跟埋方向（升序/降序即時反映） */
function premiumSortLabel(dir: "asc" | "desc"): string {
  return dir === "asc" ? "保費由低至高（有公開保費先）" : "保費由高至低（有公開保費先）";
}

/**
 * 類別詳情頁 sticky 篩選工具列（category.md S2）
 * 保險公司 chips（多選）＋ 保費開關 ＋ 排序 ＋ 表格⇄卡片 ＋ 結果數／重設
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
}) {
  return (
    <motion.div
      className="sticky top-[72px] z-40 border-b bg-paper"
      style={{ borderColor: "var(--line)" }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <div className="relative">
        <div className="site-container flex items-center gap-3 overflow-x-auto py-3.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* 保險公司 chips */}
        <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="保險公司篩選">
          <FilterChip
            active={selectedInsurers.length === 0}
            onClick={onClearInsurers}
          >
            全部
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

        <span className="h-6 w-px shrink-0" style={{ background: "var(--line-strong)" }} aria-hidden="true" />

        {/* 保費開關 */}
        <button
          type="button"
          onClick={onTogglePremium}
          aria-pressed={onlyPremium}
          className={cn(
            "chip shrink-0 border font-bold transition-all duration-300 active:scale-[0.94]",
            onlyPremium
              ? "border-jade bg-jade text-paper"
              : "border-transparent bg-paper-3 text-ink-soft hover:text-ink",
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", onlyPremium ? "bg-paper" : "bg-jade")}
            aria-hidden="true"
          />
          只睇有公開保費
          {onlyPremium && <Check size={13} />}
        </button>

        {/* 排序 */}
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
          <SelectTrigger
            className="h-[34px] w-[236px] shrink-0 rounded-full border-transparent bg-paper-3 px-3 text-small font-medium text-ink-soft shadow-none hover:text-ink focus:ring-red/40"
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

        {/* 視圖切換 */}
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
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-small font-bold transition-all duration-300",
                  view === key ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* 結果數 + 重設 */}
        <div className="ml-auto flex shrink-0 items-center gap-3 pl-2 text-small">
          <span className="whitespace-nowrap text-ink-faint">
            顯示 <span className="font-grotesk font-bold text-ink">{shown}</span> /{" "}
            <span className="font-grotesk">{total}</span> 份
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 whitespace-nowrap text-ink-faint transition-colors hover:text-red"
            >
              <RotateCcw size={12} />
              重設
            </button>
          )}
        </div>
      </div>
        {/* 右緣漸隱：提示 pills 行可以橫向滑動（夠闊先睇得清楚） */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper via-paper/85 to-transparent"
          aria-hidden="true"
        />
      </div>
    </motion.div>
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
        "chip shrink-0 gap-1.5 whitespace-nowrap font-bold transition-all duration-300 active:scale-[0.94]",
        active ? "bg-ink text-paper" : "bg-paper-3 text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

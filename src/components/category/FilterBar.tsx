import { useId, useState, type ReactNode } from "react";
import { Check, ChevronDown, Filter, LayoutGrid, RotateCcw, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortKey = "default" | "fit-score" | "insurer-az";
export type ViewMode = "table" | "cards";
export type TravelTripType = "all" | "single" | "annual";
export type TravelRegion = "all" | "asia" | "worldwide" | "gba";
export interface InsurerOption { name: string; name_zh: string; }

/** No price bands or price ranking: the catalogue has no common verified quote basis. */
export default function FilterBar({
  insurers, selectedInsurers, onToggleInsurer, onClearInsurers, onlyPremium, onTogglePremium,
  sort, onSortChange, view, onViewChange, showViewToggle, shown, total, onReset, hasActiveFilters,
  isTravel = false, travelTripType = "all", onTravelTripTypeChange, travelRegion = "all", onTravelRegionChange,
  onlyPromo = false, onTogglePromo, activeFeatureCount = 0, includeHistorical = false, onToggleHistorical,
}: {
  insurers: InsurerOption[]; selectedInsurers: string[]; onToggleInsurer: (name: string) => void; onClearInsurers: () => void;
  onlyPremium: boolean; onTogglePremium: () => void; sort: SortKey; onSortChange: (value: SortKey) => void;
  view: ViewMode; onViewChange: (value: ViewMode) => void; showViewToggle: boolean;
  shown: number; total: number; onReset: () => void; hasActiveFilters: boolean;
  isTravel?: boolean; travelTripType?: TravelTripType; onTravelTripTypeChange?: (value: TravelTripType) => void;
  travelRegion?: TravelRegion; onTravelRegionChange?: (value: TravelRegion) => void;
  onlyPromo?: boolean; onTogglePromo?: () => void; activeFeatureCount?: number;
  includeHistorical?: boolean; onToggleHistorical?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const active = selectedInsurers.length + Number(onlyPremium) + Number(onlyPromo) + Number(includeHistorical)
    + Number(travelTripType !== "all") + Number(travelRegion !== "all") + activeFeatureCount;
  return <div className="border-y border-line bg-paper">
    <div className="site-container flex flex-wrap items-center justify-between gap-3 py-4">
      <p className="text-base text-ink" aria-live="polite" aria-atomic="true">
        顯示 <strong className="font-grotesk">{shown}</strong> / {total} 項資料
        {active > 0 && <span className="ml-2 text-sm text-ink-soft">已選 {active} 個條件</span>}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {showViewToggle && <div className="flex rounded-xl border border-line p-1" role="group" aria-label="視圖切換">
          {([{ value: "table", label: "表格", Icon: Table2 }, { value: "cards", label: "卡片", Icon: LayoutGrid }] as const).map(({ value, label, Icon }) => <button key={value} type="button" aria-pressed={view === value} onClick={() => onViewChange(value)} className={cn("inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold", view === value ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2")}><Icon size={16} aria-hidden="true" />{label}</button>)}
        </div>}
        <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setIsOpen((open) => !open)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong px-4 text-base font-semibold text-ink hover:bg-paper-2"><Filter size={16} aria-hidden="true" />{isOpen ? "收起篩選器" : "展開篩選器"}<ChevronDown size={16} className={isOpen ? "rotate-180" : ""} aria-hidden="true" /></button>
        {hasActiveFilters && <button type="button" onClick={onReset} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red hover:bg-red-wash" aria-label="重設全部篩選條件"><RotateCcw size={16} aria-hidden="true" />重設</button>}
      </div>
    </div>
    <div id={panelId} hidden={!isOpen} className="border-t border-line bg-paper-2/40">
      <div className="site-container flex flex-col gap-5 py-5">
        <p className="rounded-xl border border-amber/20 bg-amber/5 p-3 text-sm leading-relaxed text-ink-soft">本站唔提供即時報價，所以唔按價錢排高低。請先揀保障條件，再用同一年齡、計劃及保障期向公司報價。</p>
        {isTravel && <div className="grid gap-5 fold:grid-cols-2">
          <fieldset><legend className="mb-2 text-base font-bold text-ink">你要單次定全年旅保？</legend><div className="flex flex-wrap gap-2">
            {([{ id: "all", label: "全部" }, { id: "single", label: "單次旅程" }, { id: "annual", label: "全年多次" }] as const).map(({ id, label }) => <FilterChip key={id} active={travelTripType === id} onClick={() => onTravelTripTypeChange?.(id)}>{label}</FilterChip>)}
          </div></fieldset>
          <fieldset><legend className="mb-2 text-base font-bold text-ink">保障地區</legend><div className="flex flex-wrap gap-2">
            {([{ id: "all", label: "全部" }, { id: "asia", label: "亞洲" }, { id: "worldwide", label: "全球（須核對限制）" }, { id: "gba", label: "大灣區" }] as const).map(({ id, label }) => <FilterChip key={id} active={travelRegion === id} onClick={() => onTravelRegionChange?.(id)}>{label}</FilterChip>)}
          </div><p className="mt-2 text-sm text-ink-soft">選定地區後，資料未註明地區的產品不會當作符合。</p></fieldset>
        </div>}
        <fieldset><legend className="mb-2 text-base font-bold text-ink">保險公司／產品品牌（可揀多間）</legend>
          <div className="flex flex-wrap gap-2"><FilterChip active={!selectedInsurers.length} onClick={onClearInsurers}>全部</FilterChip>{insurers.map((insurer) => <FilterChip key={insurer.name} active={selectedInsurers.includes(insurer.name)} onClick={() => onToggleInsurer(insurer.name)}>{insurer.name_zh || insurer.name}</FilterChip>)}</div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink"><input type="checkbox" checked={onlyPremium} onChange={onTogglePremium} className="h-5 w-5 accent-[var(--jade)]" />只顯示有參考保費資料</label>
          {isTravel && <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink"><input type="checkbox" checked={onlyPromo} onChange={onTogglePromo} className="h-5 w-5 accent-[var(--jade)]" />只顯示有已記錄期限的優惠</label>}
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink"><input type="checkbox" checked={includeHistorical} onChange={onToggleHistorical} className="h-5 w-5 accent-[var(--jade)]" />包括停售／歷史資料</label>
          <label className="flex min-h-11 flex-wrap items-center gap-2 text-sm font-semibold text-ink">排列方式
            <select value={sort} onChange={(event) => onSortChange(event.target.value as SortKey)} className="min-h-11 max-w-full rounded-lg border border-line-strong bg-paper px-3 text-sm text-ink">
              <option value="default">預設（按所選摘要條件）</option>
              <option value="fit-score" disabled={!activeFeatureCount}>摘要符合項目由多至少</option>
              <option value="insurer-az">公司英文名稱 A–Z</option>
            </select>
          </label>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">篩選只對照本站摘要，唔代表適合你、保證受保或理賠結果。</p>
      </div>
    </div>
  </div>;
}
function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={cn("inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors", active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink")}>{active && <Check size={14} aria-hidden="true" />}{children}</button>;
}

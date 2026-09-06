import { useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import type { Product } from "@/types/insurance";
import { limitBarPercent, limitGroups, limitRows, metricChoices } from "@/lib/evidence-chart";
import { evidenceEntries, evidenceHref } from "@/lib/pdf-evidence";
import EvidenceRows from "./EvidenceRows";

const format = new Intl.NumberFormat("zh-HK", { maximumFractionDigits: 2 });

/** Accept existing chart props without changing the category route's data selection. */
export default function EvidenceComparisonPanel({ products }: { products: Product[]; [key: string]: unknown }) {
  const [requested, setRequested] = useState("");
  const choices = useMemo(() => metricChoices(products), [products]);
  const selected = choices.find(choice => choice.key === requested) ?? choices[0];
  const rows = useMemo(() => selected ? limitRows(products, selected.key) : [], [products, selected]);
  const groups = useMemo(() => limitGroups(rows), [rows]);
  const hrefs = useMemo(() => new Map(products.map(product => [product.id, new Map(evidenceEntries(product).filter(entry => entry.kind === "coverage").map(entry => [entry.index, evidenceHref(product.id, entry)]))])), [products]);
  if (!choices.length) return <section className="site-container py-8" aria-label="保障數值對照"><p className="rounded-xl border bg-paper-2 p-5 text-sm text-ink-soft">此類別暫未有可對照的保障摘要；唔會用零值代替缺失資料。</p></section>;
  return <section className="border-b border-line bg-paper py-10 md:py-14" aria-labelledby="evidence-chart-title" data-evidence-chart>
    <div className="site-container">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-2xl"><p className="eyebrow text-jade">LIMITS, WITH CONTEXT</p><h2 id="evidence-chart-title" className="mt-3 font-serif text-2xl font-bold md:text-3xl">數字背後，要有同一把尺。</h2><p className="mt-3 text-sm leading-relaxed text-ink-soft">只將同名保障、明示港元及相同計算單位分組展示。無上限、未提供、不同級別或有條件的摘要保留原文，唔會硬換成數字排名。</p></div>
        <div className="w-full min-w-0 md:max-w-sm"><label htmlFor="evidence-metric" className="mb-2 block text-sm font-semibold">選擇保障項目</label><select id="evidence-metric" value={selected?.key ?? ""} onChange={event => setRequested(event.target.value)} className="min-h-12 w-full min-w-0 rounded-xl border border-jade/20 bg-paper px-3 text-sm">{choices.map(choice => <option value={choice.key} key={choice.key}>{choice.label} · {choice.productCount} 款有摘要</option>)}</select></div>
      </div>
      <p className="my-5 rounded-xl border border-amber/20 bg-amber/5 p-4 text-sm leading-relaxed" role="note">柱形長度只代表摘要金額，唔代表更適合、理賠機會或「最佳保障」。病房、地區、保障級別、自負額與例外仍須逐款對齊；自負額越大亦唔代表越好。</p>
      <div aria-live="polite" className="text-sm text-ink-soft">{rows.filter(row => row.status === "numeric").length} 款有明示金額及單位；{rows.filter(row => row.status === "unlimited").length} 款以「無上限」文字列示。未提供或未能可靠解析的資料亦保留喺下方。</div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">{groups.map(group => <figure key={group.scopeKey} className="min-w-0 rounded-2xl border border-jade/15 p-5 md:p-6" data-limit-scope={group.basis}>
        <figcaption className="mb-5 flex flex-wrap items-baseline justify-between gap-2"><strong className="font-serif text-lg">{group.scopeLabel} · HKD</strong><span className="text-xs text-ink-faint">依產品原有次序，不作最佳排名</span></figcaption>
        <div className="space-y-4">{group.rows.map(row => <div key={row.productId} className="min-w-0"><div className="mb-1 flex items-start justify-between gap-4 text-sm"><span className="min-w-0 break-words">{row.insurer} · {row.productName}</span><span className="shrink-0 font-grotesk tabular-nums">HK${format.format(row.amount!.value)}</span></div><div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-jade/10"><div className="h-full rounded-full bg-jade/70 motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${limitBarPercent(row.amount!.value, group.maximum)}%` }} /></div></div>)}</div>
      </figure>)}</div>
      {groups.length === 0 && <p className="mt-6 flex items-start gap-3 rounded-xl bg-paper-2 p-5 text-sm leading-relaxed"><FileSearch className="shrink-0 text-jade" size={20} />未有至少兩款可按同一明示單位繪製的摘要。先對照下方網站摘要，再開啟來源核對；唔會用假設數字製造圖表。</p>}
      <EvidenceRows key={`${selected?.key}:${products.map(product => product.id).join(",")}`} rows={rows} links={hrefs} title={selected?.label ?? "保障"} />
    </div>
  </section>;
}

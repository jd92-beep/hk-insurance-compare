import { useId, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import type { LimitRow, LimitStatus } from "@/lib/evidence-chart";
import { EVIDENCE_PREVIEW_LIMIT, presentationRows } from "@/lib/evidence-presentation";

const STATUS: Record<LimitStatus, string> = {
  numeric: "有明示金額與計算單位",
  unlimited: "摘要寫明無上限；仍需核對限制",
  unscoped: "計算口徑未能可靠對齊",
  unsupported: "有條件／區間或未能可靠解析",
  ambiguous: "同名項目有多條記錄，未代選級別",
  missing: "未列出摘要，不代表不保",
};
type Links = ReadonlyMap<string, ReadonlyMap<number, string>>;
function sourceHref(row: LimitRow, links: Links): string {
  return (row.coverageIndex === null ? undefined : links.get(row.productId)?.get(row.coverageIndex))
    ?? `/documents?product=${encodeURIComponent(row.productId)}`;
}

/** Mobile reads vertically; desktop retains a semantic table. No insurance data is hidden permanently. */
export default function EvidenceRows({ rows, links, title }: { rows: LimitRow[]; links: Links; title: string }) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();
  const visible = presentationRows(rows, expanded);
  return <div className="mt-8" data-evidence-preview>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-serif text-lg font-bold text-ink">{title} · 網站摘要</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft" role="status">顯示 {visible.length} / {rows.length} 款，按產品原有次序，唔係推薦排名。</p>
      </div>
      {rows.length > EVIDENCE_PREVIEW_LIMIT && <button type="button" className="btn-ghost min-h-11 shrink-0 text-sm" aria-expanded={expanded} aria-controls={regionId} onClick={() => setExpanded(value => !value)}>
        {expanded ? "收起至六款概覽" : `顯示全部 ${rows.length} 款`}
        {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>}
    </div>
    <div id={regionId}>
      <ol className="space-y-3 md:hidden" aria-label={`${title}產品摘要卡片`}>
        {visible.map((row, index) => <li key={row.productId} className="min-w-0 rounded-2xl border border-jade/15 bg-paper p-5" data-evidence-card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold tracking-wide text-jade">{row.insurer}</span>
            <span className="font-grotesk text-xs tabular-nums text-ink-faint" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <p className="break-words text-sm font-semibold leading-relaxed text-ink">{row.productName}</p>
          <dl className="mt-4 space-y-3 text-sm leading-relaxed">
            <div className="rounded-xl bg-paper-2 p-3"><dt className="mb-1 text-xs text-ink-faint">網站保障摘要</dt><dd className="break-words font-medium text-ink">{row.raw}</dd></div>
            <div><dt className="text-xs text-ink-faint">比較狀態</dt><dd className="mt-1 text-ink-soft">{STATUS[row.status]}</dd>{row.amount && <dd className="mt-1 text-xs text-ink-soft">{row.amount.scopeLabel}</dd>}</div>
          </dl>
          <Link to={sourceHref(row, links)} className="mt-4 inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-jade/20 px-4 text-sm font-semibold text-jade hover:bg-jade/5 focus-visible:outline-2 focus-visible:outline-jade" aria-label={`核對 ${row.insurer} ${row.productName} 的來源`}>核對來源原文<ArrowUpRight size={16} aria-hidden="true" /></Link>
        </li>)}
      </ol>
      <div className="hidden min-w-0 overflow-x-auto rounded-xl border md:block" data-lenis-prevent>
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">{title}：{visible.length} / {rows.length} 款產品摘要與核對入口</caption>
          <thead className="bg-paper-2"><tr className="border-b"><th scope="col" className="w-[28%] p-4">產品</th><th scope="col" className="w-[30%] p-4">原有摘要</th><th scope="col" className="w-[28%] p-4">比較狀態</th><th scope="col" className="p-4">來源</th></tr></thead>
          <tbody>{visible.map(row => <tr key={row.productId} className="border-b last:border-b-0">
            <th scope="row" className="break-words p-4 align-top font-normal"><span className="mb-1 block font-semibold">{row.insurer}</span>{row.productName}</th>
            <td className="break-words p-4 align-top leading-relaxed">{row.raw}</td>
            <td className="break-words p-4 align-top leading-relaxed text-ink-soft">{STATUS[row.status]}{row.amount && <span className="mt-1 block text-xs">{row.amount.scopeLabel}</span>}</td>
            <td className="p-4 align-top"><Link className="inline-flex min-h-11 items-center gap-1 font-semibold text-jade underline" to={sourceHref(row, links)} aria-label={`核對 ${row.insurer} ${row.productName} 的來源`}>核對<ArrowUpRight size={14} className="shrink-0" aria-hidden="true" /></Link></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

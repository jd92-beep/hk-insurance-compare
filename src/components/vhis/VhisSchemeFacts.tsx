import { ExternalLink } from "lucide-react";
import { VHIS_SCHEME_FACTS } from "@/lib/vhis-facts";

/** UI labels only — scheme facts stay educational, not advice or quotes. */
const SHORT_SCHEME_FACTS = [
  {
    id: "standard",
    title: "標準計劃",
    body: "政府劃一基本保障；公司間框架接近，保費服務仍可能唔同。",
  },
  {
    id: "flexi",
    title: "靈活計劃",
    body: "可有更高限額／更廣保障；計劃差異大，唔好用名稱當同等。",
  },
  {
    id: "compare",
    title: "格價前先分清",
    body: "對齊自付費、病房、限額同不保事項；勿跨類別按金額排名。",
  },
];

const SHORT_TAX_LINES = [
  "合資格保費可申請扣減，每名受保人有年度上限。",
  "有認可編號唔等於保費一定合資格；以 IRD 最新規則為準。",
];

/** Educational scheme panel — not advice, quotes, or plan rankings. */
export default function VhisSchemeFacts({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-labelledby="vhis-scheme-facts-title"
      className="rounded-card border border-line bg-paper-2 p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-jade">VHIS FACTS · 制度重點</p>
          <h2 id="vhis-scheme-facts-title" className="mt-2 font-serif text-2xl font-bold text-ink">
            標準 vs 靈活：格價前先分清
          </h2>
        </div>
        <a
          href={VHIS_SCHEME_FACTS.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-jade underline"
        >
          官方 VHIS 網站
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
        制度重點整理 · 非投保建議／非報價 · 以官方最新公佈為準。
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 fold:grid-cols-2 fold-wide:grid-cols-3">
        {SHORT_SCHEME_FACTS.map((item) => (
          <article key={item.id} className="rounded-xl border border-line bg-paper p-4">
            <h3 className="text-base font-bold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </article>
        ))}
      </div>
      {!compact && (
        <div className="mt-5 rounded-xl border border-amber/30 bg-amber/5 p-4">
          <h3 className="text-base font-bold text-ink">稅務扣減 · 非報税建議</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-soft">
            {SHORT_TAX_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-faint">上限同資格以 IRD / vhis.gov.hk 為準。</p>
          <a
            href={VHIS_SCHEME_FACTS.irdTaxUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-jade underline"
          >
            稅務局常見問題
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}

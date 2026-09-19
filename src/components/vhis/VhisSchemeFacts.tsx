import { ExternalLink } from "lucide-react";
import { VHIS_SCHEME_FACTS } from "@/lib/vhis-facts";

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
            標準計劃 vs 靈活計劃，先分清先格價
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
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">{VHIS_SCHEME_FACTS.disclaimer}</p>
      <div className={`mt-5 grid grid-cols-1 gap-4 fold:grid-cols-3`}>
        {VHIS_SCHEME_FACTS.standardVsFlexi.map((item) => (
          <article key={item.id} className="rounded-xl border border-line bg-paper p-4">
            <h3 className="text-base font-bold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </article>
        ))}
      </div>
      {!compact && (
        <div className="mt-5 rounded-xl border border-amber/30 bg-amber/5 p-4">
          <h3 className="text-base font-bold text-ink">稅務扣減（制度事實，唔係報税建議）</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-soft">
            {VHIS_SCHEME_FACTS.taxDeduction.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-faint">{VHIS_SCHEME_FACTS.taxCapNote}</p>
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

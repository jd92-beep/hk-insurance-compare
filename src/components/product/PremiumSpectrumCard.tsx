import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/types/insurance";
import { useProducts } from "@/providers/InsuranceDataProvider";
import { categorySpectrum, spectrumPos, type AnnualRange } from "@/lib/premium-spectrum";
import { SketchFrame } from "@/components/fx/Sketch";
import { cn } from "@/lib/utils";

const fmt = (n: number) => `HK$${n.toLocaleString("en-US")}`;
const rangeText = (r: AnnualRange) => (r.min === r.max ? fmt(r.min) : `${fmt(r.min)} – ${fmt(r.max).replace("HK$", "")}`);

/** a bar on the shared log scale; single amounts become a dot */
function Bar({ r, min, max, className, style }: { r: AnnualRange; min: number; max: number; className?: string; style?: React.CSSProperties }) {
  const a = spectrumPos(r.min, min, max) * 100;
  const b = spectrumPos(r.max, min, max) * 100;
  // single amounts / very short ranges: a 10px dot centred on the value
  const dot = b - a < 2;
  return (
    <span
      className={cn("absolute top-1/2 -translate-y-1/2", className)}
      style={{ left: dot ? `calc(${(a + b) / 2}% - 5px)` : `${a}%`, width: dot ? 10 : `${b - a}%`, ...style }}
    />
  );
}

/**
 * 保費光譜：this plan's stated annual premium against every comparable plan in the same category, on one
 * hand-drawn log scale. Read strictly from the snapshot premium text (see premium-spectrum.ts) — no estimates.
 */
export default function PremiumSpectrumCard({ product, color, catName }: { product: Product; color: string; catName: string }) {
  const all = useProducts();
  const spec = useMemo(() => categorySpectrum(product.category, all), [product.category, all]);
  const [open, setOpen] = useState(false);
  // fewer than three published premiums is not a spectrum
  if (!spec || spec.entries.length < 3) return null;
  const mine = spec.entries.find((e) => e.product.id === product.id);
  const rank = mine ? spec.entries.indexOf(mine) + 1 : 0;
  const mid = Math.round(Math.sqrt(spec.min * spec.max));
  const basis = product.category === "travel" ? "全年計劃年費" : "年費";

  return (
    <section
      aria-labelledby="spectrum-title"
      className="depth-surface card-accent sketch-card relative mt-6 overflow-hidden border bg-paper p-6"
      style={{ "--accent": color } as React.CSSProperties}
    >
      <SketchFrame color={color} />
      <p className="font-hand text-[20px] font-bold leading-none" style={{ color }}>
        premium spectrum ✎
      </p>
      <h2 id="spectrum-title" className="mt-1 font-serif text-[17px] font-bold text-ink">
        同類{catName}{basis}光譜
      </h2>

      {mine ? (
        <p className="mt-3 text-small text-ink-soft">
          呢份計劃
          <span className="mx-1 font-grotesk text-[18px] font-bold text-ink">{rangeText(mine.range)}</span>
          / 年
          <span className="block text-[12px] text-ink-faint">
            同類 {spec.entries.length} 份按起步價由低至高，排第 {rank}
            {mine.range.monthly && "；部分為月繳 ×12 換算"}
          </span>
        </p>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed px-3 py-2 text-small text-ink-soft" style={{ borderColor: `${color}66` }}>
          {product.category === "travel" ? "呢份計劃未有公開全年計劃年費（只有單次旅程價或需報價），所以唔放入光譜。" : "呢份計劃嘅公開保費文字未有可歸納嘅年費，所以唔放入光譜。"}
        </p>
      )}

      {/* hand-drawn track */}
      <div className="relative mt-5 h-10" role="img" aria-label={`同類${basis}由 ${fmt(spec.min)} 至 ${fmt(spec.max)}${mine ? `；呢份 ${rangeText(mine.range)}` : ""}`}>
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0.5 10.4 C20 9.4 40 11 60 10 S90 9.6 99.5 10.3" fill="none" stroke="#2E2A45" strokeOpacity=".55" strokeWidth="1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M1 11.6 C30 11 70 12.2 99 11.2" fill="none" stroke="#2E2A45" strokeOpacity=".2" strokeWidth="1" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {[0.5, 50, 99.5].map((x) => (
            <path key={x} d={`M${x} 5 L${x + 0.3} 15.5`} stroke="#2E2A45" strokeOpacity=".5" strokeWidth="1.3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {spec.entries.map((e) =>
          e === mine ? null : <Bar key={e.product.id} r={e.range} min={spec.min} max={spec.max} className="h-1.5 rounded-full bg-ink/15" />,
        )}
        {mine && (
          <Bar
            r={mine.range}
            min={spec.min}
            max={spec.max}
            className="h-4 rounded-[8px_5px_9px_4px] opacity-80 mix-blend-multiply shadow-[0_2px_0_rgba(0,0,0,.12)]"
            style={{ background: color }}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between font-grotesk text-[11px] font-bold text-ink-faint">
        <span>{fmt(spec.min)}</span>
        <span>{fmt(mid)}</span>
        <span>{fmt(spec.max)}</span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 inline-flex items-center gap-1 text-small font-bold text-ink-soft underline decoration-dashed underline-offset-4 hover:text-ink"
      >
        睇同類 {spec.entries.length} 份排位
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ol className="mt-3 flex flex-col gap-1.5">
          {spec.entries.map((e) => {
            const me = e === mine;
            return (
              <li key={e.product.id}>
                <Link
                  to={`/product/${e.product.id}`}
                  className={cn("grid grid-cols-[6.5rem_1fr] items-center gap-2 rounded-md px-1 py-0.5 text-[12px] hover:bg-paper-2", me && "font-bold")}
                  title={`${e.product.insurer_zh}：${rangeText(e.range)} / 年`}
                  aria-current={me ? "true" : undefined}
                >
                  <span className={cn("truncate", me ? "text-ink" : "text-ink-soft")}>{e.product.insurer_zh || e.product.insurer}</span>
                  <span className="relative h-3">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-ink/15" />
                    <Bar r={e.range} min={spec.min} max={spec.max} className="h-2 rounded-full" style={{ background: me ? color : "rgba(46,42,69,.3)" }} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-4 border-t-2 border-dashed pt-3 text-[11px] leading-relaxed text-ink-faint" style={{ borderColor: `${color}33` }}>
        由各產品保費快照文字整理：只計明確寫明每年（或每月 ×12）嘅金額，唔計保額、自付費、每日／單次價。各示例嘅年齡、保額同自付費唔同，只作量級參考，唔係報價。
        {spec.unplaced.length > 0 && ` 另有 ${spec.unplaced.length} 份未有可歸納年費，未放入。`}
      </p>
    </section>
  );
}

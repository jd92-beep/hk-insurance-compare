import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FileText, Shuffle } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "@/types/insurance";
import { useCategories, useProducts } from "@/providers/InsuranceDataProvider";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { presetsFor } from "@/lib/compare-presets";
import { resolveCoverage } from "@/components/compare/canonical-benefits";
import TiltCard from "@/components/fx/TiltCard";
import { Scribble, SketchFrame } from "@/components/fx/Sketch";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * /compare with nothing selected: a sketchbook of ready-made comparisons — pick a category, preview
 * three products from different insurers side by side, then open the full comparison in one click.
 */
export default function CompareStarter({ onStart }: { onStart: (ids: string[]) => void }) {
  const categories = useCategories();
  const all = useProducts();
  const ordered = useMemo(
    () =>
      [...categories].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a.id as (typeof CATEGORY_ORDER)[number]) - CATEGORY_ORDER.indexOf(b.id as (typeof CATEGORY_ORDER)[number]),
      ),
    [categories],
  );
  const [catId, setCatId] = useState("travel");
  const [setIdx, setSetIdx] = useState(0);
  const sets = useMemo(() => presetsFor(catId, all), [catId, all]);
  const preset = sets[Math.min(setIdx, sets.length - 1)];
  const products = useMemo(
    () => (preset ? preset.ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)) : []),
    [preset, all],
  );
  const coverage = useMemo(() => (products.length ? resolveCoverage(products).matched.slice(0, 2) : []), [products]);
  const color = CATEGORY_META[catId]?.color ?? "#2E2A45";
  const catName = categories.find((c) => c.id === catId)?.name_zh ?? "";

  const pick = (id: string) => {
    setCatId(id);
    setSetIdx(0);
  };

  return (
    <section className="site-container py-12 md:py-16" aria-labelledby="starter-title">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="font-hand text-[26px] font-bold" style={{ color }}>
          comparison starter kit ✎
        </p>
        <h1 id="starter-title" className="display-2 relative inline-block text-ink">
          揀個類別，三份並排即刻睇
          <Scribble className="absolute -bottom-2 left-0 h-3.5 w-full" color={color} />
        </h1>
        <p className="mt-5 text-ink-soft">每個保險類別都預備咗幾組示範比較，每組三間唔同公司。睇啱就一撳開始，亦可以之後自己加減產品。</p>
      </div>

      {/* category tabs */}
      <div className="-mx-4 mt-9 flex gap-2.5 overflow-x-auto px-4 pb-3 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0" role="tablist" aria-label="保險類別">
        {ordered.map((c) => {
          const meta = CATEGORY_META[c.id];
          const active = c.id === catId;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => pick(c.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-2 py-1.5 pl-1.5 pr-3.5 text-[14px] font-bold transition-all duration-200 hover:-translate-y-0.5",
                active ? "text-white" : "bg-white text-ink",
              )}
              style={{
                borderColor: meta?.color,
                background: active ? meta?.color : undefined,
                boxShadow: `0 1px 0 ${meta?.color}55, 0 2px 0 ${meta?.color}66, 0 3px 0 ${meta?.color}77, 0 8px 12px -8px rgba(40,30,20,.35)`,
              }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: active ? "rgba(255,255,255,.25)" : `${meta?.color}1F` }}>
                <span
                  className="cat-icon h-4 w-4"
                  style={{ color: active ? "#fff" : meta?.color, WebkitMaskImage: `url(${meta?.icon})`, maskImage: `url(${meta?.icon})` }}
                  aria-hidden="true"
                />
              </span>
              {c.name_zh}
            </button>
          );
        })}
      </div>

      {/* sketchbook board */}
      <div
        className="relative mx-auto mt-10 max-w-[1120px] p-1 md:p-2"
      >
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-md px-2.5 py-1 font-serif text-[14px] font-bold text-white" style={{ background: color, rotate: "-2deg" }}>
              {catName}
            </span>
            {preset && (
              <span className="chip border-2 border-dashed font-bold text-ink-soft" style={{ borderColor: `${color}66` }}>
                {preset.basis === "editorial" ? "編輯精選組合" : "資料最齊三間"}
              </span>
            )}
          </div>
          {sets.length > 1 && (
            <div className="flex items-center gap-2 text-small font-bold text-ink-soft">
              <button
                type="button"
                onClick={() => setSetIdx((i) => (i - 1 + sets.length) % sets.length)}
                className="rounded-full border-2 border-ink/40 bg-white p-1.5 hover:bg-amber-wash"
                aria-label="上一組"
              >
                <ArrowLeft size={14} />
              </button>
              <span className="font-grotesk">
                第 {Math.min(setIdx, sets.length - 1) + 1} / {sets.length} 組
              </span>
              <button
                type="button"
                onClick={() => setSetIdx((i) => (i + 1) % sets.length)}
                className="inline-flex items-center gap-1 rounded-full border-2 border-ink/40 bg-white px-3 py-1 hover:bg-amber-wash"
              >
                <Shuffle size={13} /> 換一組
              </button>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <p className="py-16 text-center text-ink-soft">呢個類別暫時未有足夠可比較嘅產品。</p>
        ) : (
          <div className="relative mt-6 grid grid-cols-1 items-stretch gap-7 md:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {products.map((p, i) => (
                <motion.div
                  key={`${catId}-${p.id}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: EASE } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="h-full"
                >
                  <TiltCard className="h-full rounded-[22px]" sketch={color}>
                    <article
                      className="depth-surface card-accent sketch-card relative flex h-full flex-col border p-5"
                      style={{ "--accent": color } as React.CSSProperties}
                    >
                      <SketchFrame color={color} />
                      <span className="font-hand text-[22px] font-bold leading-none" style={{ color }} aria-hidden="true">
                        #{i + 1}
                      </span>
                      <p className="text-xs font-semibold text-ink-soft">
                        {p.insurer_zh} <span className="font-grotesk">{p.insurer}</span>
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-serif text-[18px] font-bold leading-snug text-ink">{p.product_name_zh || p.product_name}</h3>
                      <dl className="mt-4 flex flex-1 flex-col gap-3 text-[13px]">
                        <div>
                          <dt className="text-[11px] font-bold text-ink-faint">保費</dt>
                          <dd className="mt-0.5 line-clamp-2 font-bold text-ink">{p.premium_available ? p.premium_range : "官網報價／未公開"}</dd>
                        </div>
                        {coverage.map((row) => (
                          <div key={row.key}>
                            <dt className="text-[11px] font-bold text-ink-faint">{row.label}</dt>
                            <dd className="mt-0.5 line-clamp-2 text-ink">{row.limits[i] ?? <span className="text-ink-faint">未有摘要</span>}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-4 flex items-center gap-1.5 border-t-2 border-dashed pt-3 text-[12px] text-ink-soft" style={{ borderColor: `${color}44` }}>
                        <FileText size={13} style={{ color }} /> {p.documents_found?.length ?? 0} 份官方文件
                        <Link to={`/product/${p.id}`} className="ml-auto font-bold hover:underline" style={{ color }}>
                          詳情 →
                        </Link>
                      </p>
                    </article>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {products.length > 0 && (
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <button type="button" onClick={() => onStart(products.map((p) => p.id))} className="btn-primary group">
              開始呢個比較
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <Link to={`/category/${catId}`} className="btn-ghost">
              睇全部{catName}
            </Link>
          </div>
        )}
        <p className="relative mx-auto mt-6 max-w-[46em] text-center text-[12px] leading-relaxed text-ink-faint">
          揀選方法：有編輯精選組合嘅類別用精選；其餘按本站資料完整度（有冇公開保費、保障摘要同官方文件數量）揀，每間公司一份。
          本站冇銷量數據，呢啲唔係人氣排名或推薦；保障同保費以官方文件為準。
        </p>
      </div>

      <p className="mt-8 text-center text-small text-ink-soft">
        想自己揀？去
        <Link to="/categories" className="mx-1 font-bold text-red hover:underline">
          保險類別
        </Link>
        撳「+ 加入比較」，最多 3 份並排。
      </p>
    </section>
  );
}

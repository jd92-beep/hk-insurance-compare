import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useProducts } from "@/providers/InsuranceDataProvider";
import { isReferenceOnlyProduct } from "@/lib/product-availability";
import { canonicalBenefitsFor } from "@/components/compare/canonical-benefits";
import type { Product } from "@/types/insurance";
import TiltCard from "@/components/fx/TiltCard";
import { HandArrow } from "@/components/fx/Sketch";
import { Parallax, Sticker } from "@/components/fx/Depth";
import { PlaneArt, ShieldArt } from "@/components/fx/StickerArt";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Prefer a non-reference, non-archived product from the same category. */
function pickFeatured(travel: Product[]): Product[] {
  const active = travel.filter((p) => !isReferenceOnlyProduct(p) && p.record_status !== "archived");
  const pool = active.length >= 2 ? active : travel.filter((p) => !isReferenceOnlyProduct(p));
  // Stable order: more coverage rows first, then id for determinism (not a quality rank).
  return [...pool]
    .sort((a, b) => (b.coverage?.length ?? 0) - (a.coverage?.length ?? 0) || a.id.localeCompare(b.id))
    .slice(0, 3);
}

function coverageByKeywords(p: Product, keywords: string[]): string {
  for (const kw of keywords) {
    const hit = (p.coverage ?? []).find((c) => c.item.includes(kw));
    if (hit) return hit.limit;
  }
  return "未提供";
}

/** S5 精選比較預覽 —示範用，唔係推薦。 */
export default function FeaturedCompare() {
  const travel = useProducts("travel");
  const navigate = useNavigate();
  const featured = pickFeatured(travel);
  const benefits = canonicalBenefitsFor("travel");
  const cancelKw = benefits.find((b) => b.id === "cancellation")?.keywords ?? ["取消旅程"];
  const medicalKw = benefits.find((b) => b.id === "medical")?.keywords ?? ["醫療"];

  const rows: { label: string; render: (p: Product) => string }[] = [
    { label: "保費（快照）", render: (p) => (p.premium_available ? p.premium_range : "官網報價／未公開") },
    { label: "醫療摘要", render: (p) => coverageByKeywords(p, medicalKw) },
    { label: "取消旅程", render: (p) => coverageByKeywords(p, cancelKw) },
    { label: "文件數", render: (p) => `${p.documents_found?.length ?? 0} 份` },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="site-container grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.p variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }} className="mb-2 font-hand text-[26px] font-bold text-jade">
            side by side ✓
          </motion.p>
          <motion.h2 variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }} className="display-2 text-ink">
            唔使逐個官網格價，<br /><span className="marker">一個表睇晒</span>。
          </motion.h2>
          <motion.p variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }} className="mt-5 max-w-[38em] text-ink-soft">
            旅遊保險示範：並排保費欄位、保障摘要同文件數。示範唔係推薦；條款以原文為準。
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }}>
            <HandArrow className="mt-4 hidden h-16 w-28 rotate-[-10deg] text-ink-soft lg:block" />
            <Link to="/category/travel" className="btn-primary group mt-4">
              比較全部旅遊保險
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          <div className="relative">
          <Parallax speed={0.6} className="pointer-events-none absolute -left-8 -top-10 z-30 w-24 md:w-28">
            <Sticker tilt={-14}><PlaneArt className="h-auto w-full" /></Sticker>
          </Parallax>
          <Parallax speed={0.35} className="pointer-events-none absolute -bottom-8 -right-4 z-30 w-16 md:w-20">
            <Sticker tilt={10}><ShieldArt className="h-auto w-full" /></Sticker>
          </Parallax>
          <TiltCard className="rounded-[28px]" max={9}>
            {/* clipboard: warm board + metal clip + paper sheet */}
            <div className="relative rounded-[28px] p-3 pt-9 shadow-lift md:p-4 md:pt-10" style={{ background: "linear-gradient(160deg,#D9A066,#B97A45)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.35), 0 1px 0 #A86E3C, 0 2px 0 #A06838, 0 3px 0 #986234, 0 4px 0 #905C30, 0 5px 0 #88562C, 0 6px 0 #805028, 0 7px 0 #784A24, 0 30px 50px -20px rgba(120,80,30,.6)" }}>
            <div className="absolute left-1/2 top-2 z-10 h-10 w-36 -translate-x-1/2 rounded-xl border-2 border-[#8C8C96] shadow-md" style={{ background: "linear-gradient(180deg,#F2F2F5,#B9B9C3)" }} aria-hidden="true">
              <span className="absolute left-1/2 top-2 h-3 w-12 -translate-x-1/2 rounded-full bg-[#8C8C96]/60" />
            </div>
            <div className="depth-card overflow-hidden rounded-[18px] border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-left fold:min-w-[560px]">
                  <caption className="sr-only">旅遊保險示範比較（非推薦）</caption>
                  <thead>
                    <tr className="border-b-2 bg-paper-2/70" style={{ borderColor: "var(--line-strong)" }}>
                      <th scope="col" className="px-4 py-3 text-small text-ink-faint">項目</th>
                      {featured.map((p) => (
                        <th key={p.id} scope="col" className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/product/${p.id}`)}
                            className="text-left font-serif text-[16px] font-bold text-ink underline-offset-2 hover:text-red hover:underline"
                          >
                            {p.insurer_zh}
                            <span className="mt-0.5 block text-small font-medium text-ink-soft">{p.product_name_zh || p.product_name}</span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <motion.tr
                        key={row.label}
                        className="border-b border-dashed last:border-0"
                        style={{ borderColor: "var(--line-strong)", backgroundImage: "linear-gradient(90deg, rgba(255,211,107,.45), rgba(255,211,107,.15))", backgroundRepeat: "no-repeat" }}
                        initial={{ backgroundSize: "0% 100%" }}
                        whileInView={{ backgroundSize: ["0% 100%", "100% 100%", "0% 100%"] }}
                        viewport={{ once: true, margin: "-15% 0px" }}
                        transition={{ duration: 1.4, delay: 0.5 + rows.indexOf(row) * 0.25, ease: "easeInOut" }}
                      >
                        <th scope="row" className="px-4 py-3 text-small font-medium text-ink-soft">{row.label}</th>
                        {featured.map((p) => (
                          <td key={p.id} className="px-4 py-3 text-small text-ink">{row.render(p)}</td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-dashed bg-amber-wash/60 px-4 py-3 text-xs text-ink-soft" style={{ borderColor: "var(--line-strong)" }}>
                示範 · 非推薦 · 勿跨類別按金額排名
              </p>
            </div>
            </div>
          </TiltCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

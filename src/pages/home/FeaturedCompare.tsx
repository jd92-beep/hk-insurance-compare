import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useProducts } from "@/providers/InsuranceDataProvider";
import { isReferenceOnlyProduct } from "@/lib/product-availability";
import { canonicalBenefitsFor } from "@/components/compare/canonical-benefits";
import type { Product } from "@/types/insurance";
import TiltCard from "@/components/fx/TiltCard";

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
  return "未提供（唔等於沒有保障）";
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
    { label: "保費欄位（快照）", render: (p) => (p.premium_available ? p.premium_range : "官網即時報價／未公開") },
    { label: "醫療相關摘要", render: (p) => coverageByKeywords(p, medicalKw) },
    { label: "取消旅程相關摘要", render: (p) => coverageByKeywords(p, cancelKw) },
    { label: "官方文件數", render: (p) => `${p.documents_found?.length ?? 0} 份` },
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
          <motion.p variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }} className="eyebrow mb-4 text-ink-faint">
            FEATURED COMPARISON
          </motion.p>
          <motion.h2 variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }} className="display-2 text-ink">
            唔使逐個官網格價，<br />一個表睇晒。
          </motion.h2>
          <motion.p variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }} className="mt-5 max-w-[38em] text-ink-soft">
            以旅遊保險為例——同類產品並排，睇保費欄位、保障摘要同文件數。呢個係操作示範，唔係推薦或核保結果；完整條款請打開原文。
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }}>
            <Link to="/category/travel" className="group mt-7 inline-flex items-center gap-1.5 font-bold text-red">
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
          <TiltCard className="rounded-card" max={4}>
            <div className="overflow-hidden rounded-card border bg-paper shadow-card" style={{ borderColor: "var(--line)" }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <caption className="sr-only">旅遊保險示範比較（非推薦）</caption>
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                      <th scope="col" className="px-4 py-3 text-small text-ink-faint">項目</th>
                      {featured.map((p) => (
                        <th key={p.id} scope="col" className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/product/${p.id}`)}
                            className="text-left font-bold text-ink underline-offset-2 hover:text-red hover:underline"
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
                      <tr key={row.label} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                        <th scope="row" className="px-4 py-3 text-small font-medium text-ink-soft">{row.label}</th>
                        {featured.map((p) => (
                          <td key={p.id} className="px-4 py-3 text-small text-ink">{row.render(p)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t bg-paper-2 px-4 py-3 text-xs text-ink-soft" style={{ borderColor: "var(--line)" }}>
                摘要對照唔等於計劃層級一致或保障可直接比較；唔同類別／層級產品勿按金額排名。
              </p>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}

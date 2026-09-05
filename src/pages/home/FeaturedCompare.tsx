import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useProducts } from "@/providers/InsuranceDataProvider";
import type { Product } from "@/types/insurance";
import TiltCard from "@/components/fx/TiltCard";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

function findCoverage(p: Product, keyword: string): string {
  const hit = p.coverage.find((c) => c.item.includes(keyword));
  return hit ? hit.limit : "—";
}

const FEATURED_IDS = ["travel-aig", "travel-blue-cross", "travel-axa"];

/** S5 精選比較預覽 —「即刻試睇：旅遊保險」 */
export default function FeaturedCompare() {
  const travel = useProducts("travel");
  const navigate = useNavigate();
  const featured = FEATURED_IDS.map((id) => travel.find((p) => p.id === id)).filter(
    (p): p is Product => Boolean(p),
  );

  // 金額係格價站核心數據：完整顯示，換行都唔准截斷成「HK$3…」
  const rows: { label: string; render: (p: Product) => string }[] = [
    { label: "保費", render: (p) => (p.premium_available ? p.premium_range : "官網即時報價") },
    { label: "醫療保障上限", render: (p) => findCoverage(p, "醫療") },
    { label: "行程取消", render: (p) => findCoverage(p, "取消") },
    { label: "官方文件", render: (p) => `${p.documents_found.length} 份` },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="site-container grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* 左 4 欄 */}
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
            以旅遊保險為例——同類產品並排，保費、醫療保障、行程取消、高危活動逐項對照。
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }}>
            <Link to="/category/travel" className="group mt-7 inline-flex items-center gap-1.5 font-bold text-red">
              比較全部旅遊保險
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* 右 8 欄：迷你比較表 */}
        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          {/* 迷你比較表：3D 傾斜互動（大表面，角度收細到 3°） */}
          <TiltCard className="rounded-card" max={3}>
          <div
            onClick={() => navigate("/category/travel")}
            className="cursor-pointer overflow-hidden rounded-card border bg-paper shadow-card transition-shadow duration-300 hover:shadow-lift"
            style={{ borderColor: "var(--line)" }}
            role="link"
            aria-label="前往旅遊保險比較"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b bg-paper-2" style={{ borderColor: "var(--line)" }}>
                    <th className="px-5 py-3.5 text-small font-bold text-ink-soft">保障項目</th>
                    {featured.map((p) => (
                      <th key={p.id} className="px-5 py-3.5 text-small">
                        <Link
                          to={`/product/${p.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-ink transition-colors hover:text-red"
                        >
                          {p.insurer} {p.insurer_zh}
                        </Link>
                        <span className="line-clamp-2 block max-w-[170px] text-[12px] font-normal leading-[1.5] text-ink-faint">
                          {p.product_name_zh || p.product_name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <motion.tr
                      key={row.label}
                      initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
                      whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
                      viewport={{ once: true, margin: "-10% 0px" }}
                      transition={{ duration: 0.5, delay: 0.2 + ri * 0.06, ease: EASE_OUT_EXPO }}
                      className="border-b transition-colors last:border-b-0 hover:bg-paper-2"
                      style={{ borderColor: "var(--line)", background: ri % 2 === 1 ? "rgba(24,29,46,.025)" : "transparent" }}
                    >
                      <td className="px-5 py-3.5 align-top text-small font-bold text-ink">{row.label}</td>
                      {featured.map((p) => (
                        <td key={p.id} className="whitespace-normal break-words px-5 py-3.5 align-top text-small leading-[1.6] text-ink-soft">
                          {row.render(p)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-paper-2 px-5 py-3 text-small text-ink-faint" style={{ borderColor: "var(--line)" }}>
              <span>以上僅為部分項目，完整比較請入類別頁</span>
              {featured[0]?.source_urls[0] && (
                <a
                  href={featured[0].source_urls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 font-medium text-jade hover:underline"
                >
                  官方來源 <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}

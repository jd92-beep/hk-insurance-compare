import { useMemo } from "react";
import { motion } from "framer-motion";
import { useCategories, useInsuranceData, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * 數據方法三步（about.md S2）：垂直時間線。
 * 數量一律由當前快照衍生，禁止寫死過期統計。
 */
export default function MethodTimeline() {
  const { generatedAt } = useInsuranceData();
  const categories = useCategories();
  const products = useProducts();
  const insurers = useInsurers();

  const steps = useMemo(() => {
    const categoryCount = categories.length || "—";
    const productCount = products.length || "—";
    const insurerCount = insurers.length || "—";
    return [
      {
        title: "第一步：逐間官網搜集",
        body: `逐一瀏覽官網，記錄產品名、計劃層級、保障同賠償上限。快照涵蓋 ${insurerCount} 間公司、${categoryCount} 類；唔代表全市場。`,
      },
      {
        title: "第二步：核對官方文件",
        body: "記錄搵到嘅官方文件（冊子、條款、保費表等）並保留原文連結；產品頁「官方來源」即係出處。欄位齊全唔等於已逐條核實。",
        chips: ["產品冊子", "保單條款", "保費表", "自負額列表", "產品頁"],
      },
      {
        title: "第三步：結構化整理",
        body: `統一欄位先好比較：保費、保障、條款、不保事項、來源。快照共 ${productCount} 份產品・${generatedAt || "未提供"}；快照日期唔係條款現行日期。`,
      },
    ];
  }, [categories.length, products.length, insurers.length, generatedAt]);

  return (
    <section className="pb-24 md:pb-28">
      <div className="site-container">
        <div className="mx-auto max-w-[900px]">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="eyebrow text-ink-faint"
          >
            METHOD · 數據方法
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="h3-style mt-4 text-ink"
          >
            三步，由官網到你眼前。
          </motion.h2>

          <div className="relative mt-12 pl-8 md:pl-10">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
              className="absolute bottom-3 left-[5px] top-3 w-[2px] origin-top"
              style={{ background: "var(--line-strong)" }}
              aria-hidden="true"
            />
            <ol className="flex flex-col gap-12">
              {steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-18% 0px" }}
                    transition={{
                      duration: 0.4,
                      delay: 0.2 + i * 0.2,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="absolute -left-8 top-2 h-3 w-3 rounded-full bg-red md:-left-10"
                    aria-hidden="true"
                  />
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-18% 0px" }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.15, ease: EASE_OUT_EXPO }}
                  >
                    <h3 className="font-serif text-[22px] font-bold leading-[1.3] text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[38em] text-ink-soft">{step.body}</p>
                    {step.chips && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {step.chips.map((chip) => (
                          <span key={chip} className="chip bg-paper-3 text-ink">
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

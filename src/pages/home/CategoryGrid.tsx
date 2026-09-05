import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useCategories } from "@/providers/InsuranceDataProvider";
import { CATEGORY_ORDER, DEFAULT_CATEGORIES } from "@/lib/categories";
import CategoryCard from "@/components/CategoryCard";
import TiltCard from "@/components/fx/TiltCard";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** S3 類別九宮格 —「你想比較邊一類？」 */
export default function CategoryGrid() {
  const categories = useCategories();
  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const sortedCategories = [...displayCategories].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.id as (typeof CATEGORY_ORDER)[number]) -
      CATEGORY_ORDER.indexOf(b.id as (typeof CATEGORY_ORDER)[number])
  );

  return (
    <section id="categories-grid" className="relative z-10 bg-paper py-24 md:py-32">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="mb-12 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="eyebrow mb-4 text-ink-faint">INSURANCE CATEGORIES</p>
            <h2 className="display-2 text-ink">你想比較邊一類？</h2>
            <p className="mt-4 max-w-[38em] text-ink-soft">
              揀一個類別，即刻見到唔同保險公司同類保單嘅保障、價錢同條款分別。
            </p>
          </div>
          <Link
            to="/categories"
            className="group inline-flex items-center gap-1.5 font-bold text-red"
          >
            全部類別
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ staggerChildren: 0.08 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {sortedCategories.map((c) => (
            <motion.div
              key={c.id}
              variants={{
                hidden: { opacity: 0, y: 36 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
              }}
            >
              {/* 3D 傾斜 + 高光掃層（reduced-motion / 觸控自動原樣 render） */}
              <TiltCard className="h-full rounded-card" max={6}>
                <CategoryCard category={c} className="h-full" />
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router";
import { useCategories } from "@/providers/InsuranceDataProvider";
import { CATEGORY_ORDER, DEFAULT_CATEGORIES } from "@/lib/categories";
import CategoryCard from "@/components/CategoryCard";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** S3 類別九宮格 —「你想比較邊一類？」厚紙層疊堆棧 (Stacked Paper Elevation) */
export default function CategoryGrid() {
  const categories = useCategories();
  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const sortedCategories = [...displayCategories].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.id as (typeof CATEGORY_ORDER)[number]) -
      CATEGORY_ORDER.indexOf(b.id as (typeof CATEGORY_ORDER)[number])
  );

  return (
    <section
      id="categories-grid"
      className="relative z-20 -mt-10 overflow-hidden rounded-t-[36px] border-t border-white/90 bg-paper pb-28 pt-20 shadow-[0_-24px_50px_rgba(24,29,46,0.08),0_-6px_16px_rgba(24,29,46,0.03)] md:-mt-14 md:rounded-t-[44px] md:pb-36 md:pt-28"
    >
      {/* ── 背景柔和典雅環境輝光層 ── */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-full max-w-4xl -translate-x-1/2 opacity-25 mix-blend-multiply blur-3xl"
        style={{
          backgroundImage: "radial-gradient(ellipse at center, var(--amber-wash) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* ── 指南典籍精裝頂部拉頁書籤裝飾 ── */}
      <div className="site-container relative">
        <div className="mb-8 flex justify-center md:hidden">
          <div className="h-1.5 w-12 rounded-full bg-ink/15" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="mb-14 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper-2/70 px-3.5 py-1 text-ink-soft shadow-xs backdrop-blur-sm">
              <BookOpen size={14} className="text-red" />
              <p className="eyebrow text-[11px] tracking-wider text-ink-soft">INSURANCE CATEGORIES · 11 大範疇</p>
            </div>
            <h2 className="display-2 font-serif text-ink">你想比較邊一類？</h2>
            <p className="mt-4 max-w-[38em] text-[17px] font-medium leading-relaxed text-ink-soft">
              揀一個類別，即刻見到唔同保險公司同類保單嘅保障、自負額、真實保費與官方條款分別。
            </p>
          </div>
          <Link
            to="/categories"
            className="group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-5 py-2.5 text-[14px] font-bold text-red shadow-xs transition-all duration-300 hover:border-red hover:shadow-sm"
          >
            瀏覽全站 11 大類別
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ staggerChildren: 0.07 }}
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
              <CategoryCard category={c} className="h-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

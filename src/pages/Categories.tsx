import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router";
import Breadcrumbs from "@/components/Breadcrumbs";
import StampBadge from "@/components/StampBadge";
import CategoryIndexCard from "@/components/category/CategoryIndexCard";
import CoverageMatrix from "@/components/category/CoverageMatrix";
import CountUp from "@/components/category/CountUp";
import {
  useCategories,
  useInsuranceData,
  useInsurers,
  useProducts,
} from "@/providers/InsuranceDataProvider";
import { useSearch } from "@/providers/SearchProvider";
import { CATEGORY_ORDER } from "@/lib/categories";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** h1 詞級／字級進場 */
function AnimatedTitle({ text }: { text: string }) {
  const chars = [...text];
  return (
    <h1 className="display-2 text-ink" aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.1 + i * 0.045 }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </h1>
  );
}

/** 大卡網格排位（categories.md S2）：home 跨 7、medical 跨 5、其餘 4，宣傳卡跨 8 */
const GRID_ORDER: { id: string; span: string }[] = [
  { id: "home", span: "lg:col-span-7" },
  { id: "medical", span: "lg:col-span-5" },
  { id: "travel", span: "lg:col-span-4" },
  { id: "life", span: "lg:col-span-4" },
  { id: "critical-illness", span: "lg:col-span-4" },
  { id: "accident", span: "lg:col-span-4" },
  { id: "motor", span: "lg:col-span-4" },
  { id: "domestic-helper", span: "lg:col-span-4" },
  { id: "pet", span: "lg:col-span-4" },
];

/** 類別總覽 `/categories`（design/categories.md S1–S5） */
export default function Categories() {
  const { loading, generatedAt } = useInsuranceData();
  const categories = useCategories();
  const insurers = useInsurers();
  const allProducts = useProducts();
  const search = useSearch();

  const premiumTotal = useMemo(
    () => allProducts.filter((p) => p.premium_available).length,
    [allProducts],
  );
  const medical = categories.find((c) => c.id === "medical");
  const motor = categories.find((c) => c.id === "motor");

  const productsByCat = useMemo(() => {
    const map = new Map<string, typeof allProducts>();
    for (const p of allProducts) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return map;
  }, [allProducts]);

  const insurerCountByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const [cat, list] of productsByCat) {
      map.set(cat, new Set(list.map((p) => p.insurer)).size);
    }
    return map;
  }, [productsByCat]);

  const categoryIndex = useMemo(() => {
    const map = new Map<string, number>();
    CATEGORY_ORDER.forEach((id, i) => map.set(id, i));
    return map;
  }, []);

  return (
    <>
      {/* ── S1 頁首 ─────────────────────────────────────────── */}
      <section className="pb-16 pt-24 max-md:pb-12 max-md:pt-14">
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Breadcrumbs items={[{ label: "首頁", to: "/" }, { label: "保險類別" }]} />
          </motion.div>

          <div className="mt-8 flex items-start justify-between gap-8">
            <div className="min-w-0">
              <motion.p
                className="eyebrow mb-5 text-ink-faint"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              >
                ALL CATEGORIES · 保險類別
              </motion.p>
              <AnimatedTitle text="9 大類別，逐類格價。" />
              <motion.p
                className="mt-6 max-w-[36em] text-ink-soft"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.35 }}
              >
                每個類別入面，我哋將唔同保險公司嘅同類保單並排——價錢範圍、保障項目、賠償上限、主要條款、不保事項，全部來自官方文件。
              </motion.p>
              <motion.p
                className="mt-6 border-t pt-4 text-small text-ink-soft"
                style={{ borderColor: "var(--line)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                共 <span className="font-grotesk font-bold text-ink">{allProducts.length || 85}</span> 份產品
                <span className="mx-2 text-ink-faint">｜</span>
                <span className="font-grotesk font-bold text-ink">{insurers.length || 27}</span> 間保險公司
                <span className="mx-2 text-ink-faint">｜</span>
                資料快照：<span className="font-grotesk font-bold text-ink">{generatedAt}</span>
              </motion.p>
            </div>
            <motion.div
              className="hidden shrink-0 opacity-80 md:block"
              initial={{ scale: 1.6, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 0.8 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1], delay: 0.6 }}
            >
              <StampBadge variant="ink" size={96} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── S2 類別大卡列表 ─────────────────────────────────── */}
      <section className="pb-24 max-md:pb-16">
        <div className="site-container">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[320px] animate-pulse rounded-card bg-paper-2 lg:col-span-4"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
              {GRID_ORDER.map(({ id, span }, i) => {
                const category = categories.find((c) => c.id === id);
                if (!category) return null;
                return (
                  <motion.div
                    key={id}
                    className={span}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-15% 0px" }}
                    transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: (i % 3) * 0.09 }}
                  >
                    <CategoryIndexCard
                      category={category}
                      products={productsByCat.get(id) ?? []}
                      index={categoryIndex.get(id) ?? i}
                      insurerCount={insurerCountByCat.get(id) ?? 0}
                      className="h-full"
                    />
                  </motion.div>
                );
              })}

              {/* 宣傳卡：去比較工具 */}
              <motion.div
                className="lg:col-span-8"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              >
                <Link
                  to="/compare"
                  className="group flex h-full flex-col justify-between gap-6 rounded-card bg-ink p-8 text-paper shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div>
                    <p className="eyebrow mb-4 text-paper/50">COMPARE TOOL</p>
                    <h3 className="font-serif text-[26px] font-bold leading-[1.25] max-md:text-[22px]">
                      心水產品，並排對照
                    </h3>
                    <p className="mt-3 max-w-[32em] text-small text-paper/70">
                      喺任何類別揀最多 3 份產品，一個表睇晒分別。
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-[10px] bg-red px-6 py-3 font-bold text-paper transition-colors duration-300 group-hover:bg-red-deep">
                    去比較工具
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* ── S3 快速統計橫帶 ─────────────────────────────────── */}
      <motion.section
        className="border-y bg-paper-2"
        style={{ borderColor: "var(--line)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="site-container grid grid-cols-2 gap-y-10 py-14 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-stat text-jade">
              <CountUp to={premiumTotal || 46} />
              <span className="text-ink-faint"> / {allProducts.length || 85}</span>
            </p>
            <p className="text-small text-ink-soft">份產品有官方公開保費</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-stat text-jade">
              <CountUp to={medical?.insurers_with_premium ?? 12} duration={1.4} />
              <span className="text-ink-faint"> / {medical?.count ?? 12}</span>
            </p>
            <p className="text-small text-ink-soft">自願醫保全部有保費表</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-stat text-amber">
              <CountUp to={motor?.count ?? 9} duration={1.6} />
            </p>
            <p className="text-small text-ink-soft">類汽車保險產品全部需即時報價</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-grotesk text-[clamp(28px,3.4vw,40px)] font-bold leading-none text-ink">
              {generatedAt}
            </p>
            <p className="text-small text-ink-soft">資料快照日期</p>
          </div>
        </div>
      </motion.section>

      {/* ── S4 類別 × 公司覆蓋矩陣 ──────────────────────────── */}
      <section className="py-24 max-md:py-16">
        <div className="site-container grid grid-cols-1 gap-12 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <p className="eyebrow mb-4 text-ink-faint">COVERAGE MAP</p>
            <h2 className="display-2 text-ink">邊間公司，保邊啲？</h2>
            <p className="mt-5 max-w-[38em] text-ink-soft">
              {insurers.length || 27} 間公司 × 9 個類別嘅覆蓋一覽。點格仔可以直接去該類別嘅產品列表。
            </p>
          </motion.div>
          <motion.div
            className="rounded-card border bg-paper p-6 shadow-card lg:col-span-8"
            style={{ borderColor: "var(--line)" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <CoverageMatrix insurers={insurers} categories={categories} products={allProducts} />
          </motion.div>
        </div>
      </section>

      {/* ── S5 底部 CTA ─────────────────────────────────────── */}
      <motion.section
        className="pb-24 pt-4 text-center max-md:pb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      >
        <div className="site-container flex flex-col items-center gap-7">
          <h3 className="h3-style text-ink">搵到想看嘅類別未？</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button type="button" onClick={search.openSearch} className="btn-primary">
              <Search size={17} />
              ⌘K 搜尋產品
            </button>
            <Link to="/insurers" className="btn-ghost">
              睇保險公司名錄
            </Link>
          </div>
        </div>
      </motion.section>
    </>
  );
}

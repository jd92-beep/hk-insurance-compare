import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Scale, ShieldAlert, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { Link, useParams } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import FilterBar from "@/components/category/FilterBar";
import type { SortKey, ViewMode } from "@/components/category/FilterBar";
import ProductTable from "@/components/category/ProductTable";
import { categoryCopy } from "@/components/category/copy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { CATEGORY_META, categorySpectrum, premiumSortKey } from "@/lib/categories";
import {
  useCategories,
  useInsuranceData,
  useProducts,
} from "@/providers/InsuranceDataProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** h1 詞級／字級進場 */
function AnimatedTitle({ text, className }: { text: string; className?: string }) {
  const chars = [...text];
  return (
    <h1 className={className} aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.15 + i * 0.04 }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </h1>
  );
}

/** 類別詳情（模板）`/category/:categoryId`（design/category.md S1–S6） */
export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { loading, generatedAt } = useInsuranceData();
  const categories = useCategories();
  const directProducts = useProducts(categoryId);
  const allMedicalProducts = useProducts("medical");
  const isMobile = useIsMobile();

  // 若 categoryId 為高端醫療或 Top-up 醫療且尚無專屬獨立產品，智能由自願醫保中提取對應高端／靈活或差額計劃
  const products = useMemo(() => {
    if (directProducts.length > 0) return directProducts;
    if (categoryId === "high-end-medical") {
      const highEndKeywords = ["高端", "尊耀", "尊衛您", "非凡", "Pink", "優越", "尚賓", "晉悅", "智尊守慧", "靈活"];
      return allMedicalProducts.filter((p) => {
        const text = `${p.product_name} ${p.product_name_zh} ${(p.plan_tiers || []).join(" ")}`;
        return highEndKeywords.some((kw) => text.includes(kw));
      });
    }
    if (categoryId === "top-up-medical") {
      const topUpKeywords = ["差額", "SMM", "附加", "自付", "靈活配", "更衛您", "守護"];
      return allMedicalProducts.filter((p) => {
        const text = `${p.product_name} ${p.product_name_zh} ${(p.plan_tiers || []).join(" ")} ${p.premium_notes || ""}`;
        return topUpKeywords.some((kw) => text.includes(kw));
      });
    }
    return directProducts;
  }, [directProducts, categoryId, allMedicalProducts]);

  const [selectedInsurers, setSelectedInsurers] = useState<string[]>([]);
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [sort, setSort] = useState<SortKey>("default");
  const [premiumDir, setPremiumDir] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<ViewMode>("table");

  const rawCategory = categories.find((c) => c.id === categoryId);
  const copy = categoryCopy(categoryId);
  const meta = categoryId ? CATEGORY_META[categoryId] : undefined;
  const category =
    rawCategory ??
    (meta && copy
      ? {
          id: categoryId!,
          name_zh:
            categoryId === "high-end-medical"
              ? "高端醫療"
              : categoryId === "top-up-medical"
                ? "Top-up 醫療"
                : copy.h1.replace("格價", ""),
          count: products.length,
          insurers_with_premium: products.filter((p) => p.premium_available).length,
        }
      : undefined);
  const color = meta?.color ?? "#181D2E";
  const effectiveView: ViewMode = isMobile ? "cards" : view;

  const insurerOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (!map.has(p.insurer)) map.set(p.insurer, p.insurer_zh);
    }
    return [...map.entries()]
      .map(([name, name_zh]) => ({ name, name_zh }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const spectrum = useMemo(() => categorySpectrum(products), [products]);

  // 排序 key 統一年繳化（/月 ×12、/日 ×365），避免月繳價同年繳價直接比大細
  const premiumKey = (p: (typeof products)[number]): number =>
    p.premium_available ? premiumSortKey(p.premium_range) : Number.POSITIVE_INFINITY;

  const filtered = useMemo(() => {
    let list = products;
    if (selectedInsurers.length > 0) {
      list = list.filter((p) => selectedInsurers.includes(p.insurer));
    }
    if (onlyPremium) list = list.filter((p) => p.premium_available);
    const sorted = [...list];
    if (sort === "premium") {
      sorted.sort((a, b) => {
        const ka = premiumKey(a);
        const kb = premiumKey(b);
        // 無公開保費永遠排尾（升序降序都係），先至貼合「有公開保費先」
        const aNone = !Number.isFinite(ka);
        const bNone = !Number.isFinite(kb);
        if (aNone !== bNone) return aNone ? 1 : -1;
        return premiumDir === "asc" ? ka - kb : kb - ka;
      });
    } else if (sort === "insurer") {
      sorted.sort((a, b) => a.insurer.localeCompare(b.insurer) || a.id.localeCompare(b.id));
    } else if (sort === "coverage") {
      sorted.sort((a, b) => (b.coverage?.length ?? 0) - (a.coverage?.length ?? 0));
    }
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selectedInsurers, onlyPremium, sort, premiumDir]);

  const hasActiveFilters = selectedInsurers.length > 0 || onlyPremium || sort !== "default";

  const resetFilters = () => {
    setSelectedInsurers([]);
    setOnlyPremium(false);
    setSort("default");
    setPremiumDir("asc");
  };

  const toggleInsurer = (name: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleSortChange = (s: SortKey) => {
    setSort(s);
    if (s === "premium") setPremiumDir("asc");
  };

  const handleTogglePremiumSort = () => {
    if (sort !== "premium") {
      setSort("premium");
      setPremiumDir("asc");
    } else {
      setPremiumDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  /* ── 未載入 ── */
  if (loading) {
    return (
      <div className="site-container py-24">
        <div className="h-6 w-48 animate-pulse rounded bg-paper-2" />
        <div className="mt-8 h-14 w-2/3 animate-pulse rounded bg-paper-2" />
        <div className="mt-6 h-24 w-full max-w-[38em] animate-pulse rounded bg-paper-2" />
        <div className="mt-16 h-[420px] w-full animate-pulse rounded-card bg-paper-2" />
      </div>
    );
  }

  /* ── 無效類別 ── */
  if (!category || !copy || !meta) {
    return (
      <div className="site-container py-24">
        <EmptyState
          title="搵唔到呢個類別"
          description="呢條網址嘅類別唔存在，返去類別總覽睇晒 9 大類別。"
          resetLabel="去類別總覽"
          onReset={() => {
            window.location.href = "/categories";
          }}
        />
      </div>
    );
  }

  const insurerCount = insurerOptions.length;
  const premiumCount = products.filter((p) => p.premium_available).length;
  const isMotor = category.id === "motor";
  const allHavePremium = premiumCount === products.length && products.length > 0;

  return (
    <>
      <Toaster />

      {/* ── S1 類別頁首 ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* 頂部 6px 類別色條 */}
        <motion.div
          className="h-[6px] w-full origin-left"
          style={{ background: color }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        />
        {/* 水印 icon */}
        <motion.span
          className="cat-icon pointer-events-none absolute -right-6 top-10 h-40 w-40 select-none"
          style={{
            color,
            WebkitMaskImage: `url(${meta.icon})`,
            maskImage: `url(${meta.icon})`,
          }}
          initial={{ opacity: 0, rotate: -16 }}
          animate={{ opacity: 0.06, rotate: -10 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO }}
          aria-hidden="true"
        />

        <div className="site-container pb-14 pt-14 max-md:pb-10 max-md:pt-10">
          <Breadcrumbs
            items={[
              { label: "首頁", to: "/" },
              { label: "保險類別", to: "/categories" },
              { label: category.name_zh },
            ]}
          />

          <div className="mt-9 flex items-center gap-4">
            <span
              className="cat-icon h-11 w-11 shrink-0"
              style={{
                color,
                WebkitMaskImage: `url(${meta.icon})`,
                maskImage: `url(${meta.icon})`,
              }}
              aria-hidden="true"
            />
            <p className="eyebrow" style={{ color }}>
              {copy.english} · {category.name_zh}
            </p>
          </div>

          <AnimatedTitle
            text={copy.h1}
            className="display-2 mt-5 font-black text-ink"
          />
          <motion.p
            className="mt-6 max-w-[38em] text-ink-soft"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.4 }}
          >
            {copy.sub}
          </motion.p>

          {/* 統計 chips */}
          <motion.div
            className="mt-7 flex flex-wrap gap-2.5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.55 } } }}
          >
            {[
              <span key="a">
                <span className="font-grotesk font-bold text-ink">{products.length}</span> 份產品
              </span>,
              <span key="b">
                <span className="font-grotesk font-bold text-jade">{premiumCount}</span>{" "}
                間有公開保費
              </span>,
              <span key="c">
                <span className="font-grotesk font-bold text-ink">{insurerCount}</span> 間保險公司
              </span>,
              <span key="d" className="text-ink-faint">
                快照 <span className="font-grotesk font-bold">{generatedAt}</span>
              </span>,
            ].map((content, i) => (
              <motion.span
                key={i}
                className="chip border bg-paper text-small text-ink-soft"
                style={{ borderColor: "var(--line)" }}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
                }}
              >
                {content}
              </motion.span>
            ))}
            {allHavePremium && category.id === "medical" && (
              <motion.span
                className="chip bg-jade-wash text-small font-bold text-jade"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
                }}
              >
                全部 {premiumCount} 間有官方保費表
              </motion.span>
            )}
          </motion.div>

          {/* 汽車類 amber banner */}
          {isMotor && (
            <motion.div
              className="mt-7 flex items-start gap-3 rounded-[10px] border border-amber/40 bg-amber-wash px-5 py-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.7 }}
            >
              <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber" />
              <p className="text-small text-ink-soft">
                <span className="mr-2 inline-flex chip bg-amber px-2 py-0.5 text-[12px] font-bold text-paper">
                  全部需即時報價
                </span>
                汽車保險一般按車輛及車主資料即時報價，各公司鮮有公開統一保費表——本站如實標示。
              </p>
            </motion.div>
          )}

          {/* 醫療類 jade banner：官方認可產品名單 + 高端／Top-up 導覽 chips */}
          {category.id === "medical" && (
            <>
              <motion.div
                className="mt-7 flex items-start gap-3 rounded-[10px] border border-jade/40 bg-jade-wash px-5 py-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.7 }}
              >
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-jade" />
                <p className="text-small text-ink-soft">
                  想對照官方認可產品？
                  <Link
                    to="/vhis"
                    className="ml-1.5 inline-flex items-center gap-1 font-bold text-jade transition-colors hover:underline"
                  >
                    自願醫保認可產品名單（官方）：33 標準 + 70 靈活計劃
                    <ArrowRight size={13} />
                  </Link>
                </p>
              </motion.div>

              {/* 前往「高端醫療」與「Top-up 醫保」精美導覽晶片橫帶 */}
              <motion.div
                className="mt-3.5 flex flex-wrap items-center gap-2.5 rounded-[10px] border bg-paper-2/70 px-4 py-3 text-small"
                style={{ borderColor: "var(--line)" }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.8 }}
              >
                <span className="font-medium text-ink-soft">按保障定位細看：</span>
                <Link
                  to="/category/high-end-medical"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-sky-600/30 bg-paper px-3.5 py-1 text-small font-bold text-sky-900 shadow-sm transition-all hover:border-sky-600 hover:bg-sky-50 dark:text-sky-300"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>高端醫療專區（全數賠償・私家房）</span>
                  <ArrowRight size={13} className="text-sky-600 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/category/top-up-medical"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-teal-600/30 bg-paper px-3.5 py-1 text-small font-bold text-teal-900 shadow-sm transition-all hover:border-teal-600 hover:bg-teal-50 dark:text-teal-300"
                >
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  <span>Top-up 醫保（打工仔填補 Shortfall）</span>
                  <ArrowRight size={13} className="text-teal-600 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </>
          )}

          {/* 高端醫療專屬藍金色頂部 Banner */}
          {category.id === "high-end-medical" && (
            <motion.div
              className="mt-7 overflow-hidden rounded-[12px] border border-amber-400/40 bg-gradient-to-r from-[#0F2038] via-[#162D4D] to-[#1E3A5F] p-5 text-paper shadow-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.7 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/50">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-amber-400/20 px-2 py-0.5 font-grotesk text-[11px] font-bold tracking-wider text-amber-300 ring-1 ring-amber-400/30">
                        FLAGSHIP MEDICAL
                      </span>
                      <span className="font-serif text-[15px] font-bold text-paper sm:text-[16px]">
                        全數賠償（無細項上限） · 終身千萬保額 · 全球私家房與免找數網絡
                      </span>
                    </div>
                    <p className="mt-1 text-small text-paper/80">
                      專門對照頂級私家病房、環球頂尖名醫結算及高自付費（Deductible）槓桿千萬保額的旗艦計劃。
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 pt-2 sm:pt-0">
                  <Link
                    to="/category/medical"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-small font-medium text-paper transition-all hover:bg-white/20"
                  >
                    ← 自願醫保
                  </Link>
                  <Link
                    to="/category/top-up-medical"
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/20 px-3 py-1.5 text-small font-medium text-amber-200 transition-all hover:bg-amber-400/30"
                  >
                    Top-up 醫保 →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Top-up 醫療專屬頂部 Banner */}
          {category.id === "top-up-medical" && (
            <motion.div
              className="mt-7 overflow-hidden rounded-[12px] border border-sky-500/40 bg-gradient-to-r from-[#0E3554] via-[#13446B] to-[#185382] p-5 text-paper shadow-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.7 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-300 ring-1 ring-sky-400/50">
                    <ShieldAlert size={17} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-sky-400/20 px-2 py-0.5 font-grotesk text-[11px] font-bold tracking-wider text-sky-300 ring-1 ring-sky-400/30">
                        SHORTFALL SHIELD
                      </span>
                      <span className="font-serif text-[15px] font-bold text-paper sm:text-[16px]">
                        打工仔專用 · 填補公司團體醫保 Shortfall · 免核保銜接與離職保證轉保權
                      </span>
                    </div>
                    <p className="mt-1 text-small text-paper/80">
                      專門承保超出公司團體醫療上限的差額開支，並保留離職或退休時免驗身轉保權利。
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 pt-2 sm:pt-0">
                  <Link
                    to="/category/medical"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-small font-medium text-paper transition-all hover:bg-white/20"
                  >
                    ← 自願醫保
                  </Link>
                  <Link
                    to="/category/high-end-medical"
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-400/40 bg-sky-400/20 px-3 py-1.5 text-small font-medium text-sky-200 transition-all hover:bg-sky-400/30"
                  >
                    高端醫療 →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── S2+S3 篩選＋產品列表（同一容器，FilterBar sticky 範圍只限呢段） ── */}
      <div>
        {/* ── S2 篩選工具列 ───────────────────────────────────── */}
        <FilterBar
          insurers={insurerOptions}
          selectedInsurers={selectedInsurers}
          onToggleInsurer={toggleInsurer}
          onClearInsurers={() => setSelectedInsurers([])}
          onlyPremium={onlyPremium}
          onTogglePremium={() => setOnlyPremium((v) => !v)}
          sort={sort}
          premiumDir={premiumDir}
          onSortChange={handleSortChange}
          view={effectiveView}
          onViewChange={setView}
          showViewToggle={!isMobile}
          shown={filtered.length}
          total={products.length}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* ── S3 產品列表 ─────────────────────────────────────── */}
        <section className="py-10 max-md:py-8">
          <div className="site-container">
            {/* 保費公開狀況 summary chip（表格頂一眼睇晒） */}
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              {premiumCount === 0 ? (
                <span className="chip bg-amber-wash font-bold text-amber">
                  呢個類別全部 {products.length} 間公司採用即時報價，冇公開保費表
                </span>
              ) : (
                <span className="chip bg-jade-wash font-bold text-jade">
                  {premiumCount}/{products.length} 間有公開保費
                </span>
              )}
              {premiumCount > 0 && premiumCount < products.length && (
                <span className="chip bg-amber-wash text-amber">
                  其餘 {products.length - premiumCount} 間需官網即時報價
                </span>
              )}
            </div>
            {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <EmptyState
                title="呢個組合搵唔到產品"
                description="試下移除部分篩選條件。"
                onReset={resetFilters}
              />
            </motion.div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {effectiveView === "table" ? (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductTable
                    products={filtered}
                    color={color}
                    coverageKeywords={copy.coverageKeywords}
                    spectrum={spectrum}
                    premiumSortDir={sort === "premium" ? premiumDir : null}
                    onTogglePremiumSort={handleTogglePremiumSort}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="cards"
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {filtered.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: EASE_OUT_EXPO,
                        delay: i < 9 ? i * 0.06 : 0,
                      }}
                    >
                      <ProductCard product={p} className="h-full" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
          </div>
        </section>
      </div>

      {/* ── S4 類別選購重點 ─────────────────────────────────── */}
      <section
        className="border-y bg-paper-2 py-24 max-md:py-16"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="site-container grid grid-cols-1 gap-12 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <p className="eyebrow mb-4 text-ink-faint">HOW TO CHOOSE</p>
            <h2 className="display-2 text-ink">
              揀{category.name_zh.replace("（自願醫保）", "")}，睇呢 4 樣。
            </h2>
            <Link
              to={`/guides#${category.id}`}
              className="group mt-7 inline-flex items-center gap-1.5 font-bold text-red"
            >
              更多揀選技巧
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8">
            {copy.highlights.map((h, i) => (
              <motion.div
                key={h.title}
                className="rounded-card border bg-paper p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                style={{ borderColor: "var(--line)" }}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: i * 0.1 }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-grotesk text-[15px] font-bold text-red">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <motion.span
                    className="h-[2px] w-10 origin-left"
                    style={{ background: color }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-15% 0px" }}
                    transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.2 + i * 0.1 }}
                  />
                </div>
                <h3 className="mt-3 font-sans text-[18px] font-bold text-ink">{h.title}</h3>
                <p className="mt-2 text-small text-ink-soft">{h.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S5 同類常見問題 ─────────────────────────────────── */}
      <section className="py-24 max-md:py-16">
        <div className="site-container">
          <div className="mx-auto max-w-[820px]">
            <motion.div
              className="mb-10 text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            >
              <p className="eyebrow mb-4 text-ink-faint">FAQ</p>
              <h2 className="display-2 text-ink">常見問題</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            >
              <Accordion type="single" collapsible className="w-full">
                {copy.faq.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`faq-${i}`}
                    style={{ borderColor: "var(--line)" }}
                  >
                    <AccordionTrigger className="py-5 text-left font-sans text-[16px] font-bold text-ink hover:no-underline [&>svg]:text-ink-faint">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-small leading-[1.8] text-ink-soft">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-8 text-center">
                <Link
                  to="/guides"
                  className="group inline-flex items-center gap-1.5 font-bold text-red"
                >
                  睇全部指南
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── S6 底部 CTA ─────────────────────────────────────── */}
      <motion.section
        className="pb-24 text-center max-md:pb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      >
        <div className="site-container flex flex-col items-center gap-7">
          <h3 className="h3-style text-ink">加入最多 3 份，並排對照最清楚。</h3>
          <Link to="/compare" className={cn("btn-primary")}>
            <Scale size={17} />
            去比較工具
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>
    </>
  );
}

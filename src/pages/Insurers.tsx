import { safeFragment } from "@/lib/data-integrity";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { Link, useLocation } from "react-router";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmptyState from "@/components/EmptyState";
import InsurerCard from "@/components/insurers/InsurerCard";
import {
  useCategories,
  useInsuranceData,
  useInsurers,
  useProducts,
} from "@/providers/InsuranceDataProvider";
import { CATEGORY_ORDER, categoryColor } from "@/lib/categories";
import {
  INSURER_SORT_NOTE,
  buildInsurerCardModels,
  filterInsurerCardModels,
  filterInsurerCardModelsByCategory,
  sortInsurerCardModels,
} from "@/lib/insurer-catalogue";
import { getLenis } from "@/lib/lenis";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

type SortKey = "coverage" | "name" | "premium";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "coverage", label: "產品數（預設）" },
  { value: "name", label: "公司名 A–Z" },
  { value: "premium", label: "有公開保費優先" },
];

/** 詞級標題進場 */
function SplitWords({ words, className }: { words: string[]; className?: string }) {
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={word}
          className="inline-block max-w-full will-change-transform"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: EASE_OUT_EXPO }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

/** 滾到指定公司卡（Lenis 優先，留 104px 頂部空位避開 sticky 欄） */
function scrollToInsurer(name: string): void {
  const el = document.getElementById(name);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset: -104, duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * 保險公司名錄 `/insurers`（company-first）
 * 卡片以公司為核心；點擊進入 `/insurers/:insurerKey` 睇晒該公司產品（按類別分組）。
 * 保留 `#INSURER` 錨點滾動＋閃框，兼容舊連結／瀏覽器腳本。
 */
export default function Insurers() {
  const { loading, error } = useInsuranceData();
  const insurers = useInsurers();
  const products = useProducts();
  const categories = useCategories();
  const location = useLocation();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("coverage");
  const [query, setQuery] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);
  const [showCategoryChips, setShowCategoryChips] = useState(false);

  const premiumTotal = useMemo(
    () => products.filter((p) => p.premium_available).length,
    [products],
  );

  const cardModels = useMemo(
    () => buildInsurerCardModels(products, insurers),
    [products, insurers],
  );

  const filtered = useMemo(() => {
    let list = filterInsurerCardModelsByCategory(cardModels, categoryFilter);
    list = filterInsurerCardModels(list, query);
    if (sortKey === "name") {
      return [...list].sort((a, b) => a.insurer.name.localeCompare(b.insurer.name));
    }
    if (sortKey === "premium") {
      return [...list].sort(
        (a, b) =>
          b.premiumCount - a.premiumCount ||
          b.totalProducts - a.totalProducts ||
          a.insurer.name.localeCompare(b.insurer.name),
      );
    }
    return sortInsurerCardModels(list);
  }, [cardModels, categoryFilter, sortKey, query]);

  const productsByInsurer = useMemo(() => {
    const map = new Map<string, typeof products>();
    for (const p of products) {
      const list = map.get(p.insurer) ?? [];
      list.push(p);
      map.set(p.insurer, list);
    }
    return map;
  }, [products]);

  // URL hash 錨點（如 /insurers#AXA）→ 滾到對應公司卡 + 紅框閃爍
  useEffect(() => {
    if (insurers.length === 0 || !location.hash) return;
    const hash = safeFragment(location.hash).toLowerCase();
    const target = insurers.find((ins) => ins.name.toLowerCase() === hash);
    if (!target) return;
    setCategoryFilter("all");
    setQuery("");
    const timer = window.setTimeout(() => {
      scrollToInsurer(target.name);
      setFlashId(target.name);
      window.setTimeout(() => setFlashId(null), 1500);
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insurers.length, location.hash]);

  const resetFilters = () => {
    setCategoryFilter("all");
    setSortKey("coverage");
    setQuery("");
  };

  if (loading) {
    return (
      <div className="site-container flex min-h-[60vh] items-center justify-center">
        <p className="text-small text-ink-faint">載入保險公司名錄中…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="site-container flex min-h-[60vh] items-center justify-center">
        <p className="text-small text-red">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* S1 頁首：公司行 mental model — 緊湊，避免 logo 下方大空隙 */}
      <header className="site-container pb-5 pt-[68px]">
        <Breadcrumbs items={[{ label: "首頁", to: "/" }, { label: "保險公司" }]} className="mb-3" />
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-red">
              INSURERS
              <span className="eyebrow-zh ml-3 font-sans text-ink-soft">保險公司</span>
            </p>
            <h1 className="display-2 mt-2 text-ink">
              <SplitWords words={[`${insurers.length} 間保險公司，`, "逐間睇佢哋賣啲乜。"]} />
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: EASE_OUT_EXPO }}
              className="mt-2 max-w-[36em] text-small text-ink-soft"
            >
              點擊公司卡，按類別睇產品。
            </motion.p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border bg-paper text-ink" style={{ borderColor: "var(--line-strong)" }}>
                <span className="font-grotesk font-bold">{insurers.length}</span> 間公司
              </span>
              <span className="chip border bg-paper text-ink" style={{ borderColor: "var(--line-strong)" }}>
                <span className="font-grotesk font-bold">{products.length}</span> 份產品
              </span>
              <span className="chip bg-jade-wash font-bold text-jade">
                <span className="font-grotesk">{premiumTotal}</span> 有保費欄
              </span>
            </div>
            <p className="max-w-[28em] text-[11px] text-ink-faint sm:text-right">{INSURER_SORT_NOTE}</p>
          </div>
        </div>
      </header>

      {/* S2 篩選列：sticky 只保留一行工具列；類別 chips 收埋喺可展開區，唔會成日佔住螢幕 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25, ease: EASE_OUT_EXPO }}
        className="sticky top-16 z-30 border-y bg-paper/90 backdrop-blur-[12px]"
        style={{ borderColor: "var(--line)" }}
        data-testid="insurers-filter-bar"
      >
        <div className="site-container flex flex-wrap items-center gap-2 py-2">
          <label
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[10px] border bg-paper px-2.5 sm:max-w-[220px] sm:flex-none"
            style={{ borderColor: "var(--line-strong)" }}
          >
            <Search size={14} className="shrink-0 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋公司名…"
              className="min-w-0 w-full bg-transparent text-small text-ink outline-none placeholder:text-ink-faint"
              aria-label="搜尋保險公司"
            />
          </label>

          <label className="relative flex items-center">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 max-w-[11.5rem] appearance-none truncate rounded-[10px] border bg-paper pl-2.5 pr-7 text-small font-medium text-ink outline-none"
              style={{ borderColor: "var(--line-strong)" }}
              aria-label="按類別篩選公司"
            >
              <option value="all">全部類別</option>
              {CATEGORY_ORDER.map((catId) => (
                <option key={catId} value={catId}>
                  {categories.find((c) => c.id === catId)?.name_zh ?? catId}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 text-ink-faint" />
          </label>

          <label className="relative flex items-center">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-9 max-w-[12rem] appearance-none truncate rounded-[10px] border bg-paper pl-2.5 pr-7 text-small font-medium text-ink outline-none"
              style={{ borderColor: "var(--line-strong)" }}
              aria-label="排序方式"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 text-ink-faint" />
          </label>

          <p className="ml-auto shrink-0 text-xs text-ink-faint">
            <span className="font-grotesk font-bold text-ink">{filtered.length}</span>
            <span className="mx-0.5">/</span>
            <span className="font-grotesk">{insurers.length}</span>
          </p>

          <button
            type="button"
            onClick={() => setShowCategoryChips((v) => !v)}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-[10px] border px-2.5 text-xs font-semibold text-ink-soft hover:bg-paper-2"
            style={{ borderColor: "var(--line-strong)" }}
            aria-expanded={showCategoryChips}
          >
            類別
            <ChevronDown size={13} className={cn("transition-transform", showCategoryChips && "rotate-180")} />
          </button>
        </div>

        {showCategoryChips && (
          <div className="site-container border-t pb-2 pt-2" style={{ borderColor: "var(--line)" }}>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" role="group" aria-label="按類別篩選公司（標籤）">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  "chip shrink-0 border text-xs transition-colors",
                  categoryFilter === "all"
                    ? "border-ink bg-ink text-paper"
                    : "bg-paper text-ink-soft hover:bg-paper-3",
                )}
                style={categoryFilter === "all" ? undefined : { borderColor: "var(--line-strong)" }}
              >
                全部公司
              </button>
              {CATEGORY_ORDER.map((catId) => {
                const name = categories.find((c) => c.id === catId)?.name_zh ?? catId;
                const active = categoryFilter === catId;
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => setCategoryFilter(active ? "all" : catId)}
                    className={cn(
                      "chip shrink-0 border text-xs transition-colors",
                      active ? "border-ink bg-ink text-paper" : "bg-paper text-ink-soft hover:bg-paper-3",
                    )}
                    style={active ? undefined : { borderColor: "var(--line-strong)" }}
                  >
                    <span
                      className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                      style={{ background: categoryColor(catId) }}
                      aria-hidden="true"
                    />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* S3 公司卡網格 */}
      <section className="site-container py-8" aria-label="保險公司卡片">
        {filtered.length === 0 ? (
          <EmptyState
            title="搵唔到符合條件嘅公司"
            description="試下重設篩選，或用公司名再搜一次。"
            onReset={resetFilters}
            resetLabel="重設篩選"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 fold:grid-cols-2 lg:grid-cols-3">
              {filtered.map((model, i) => (
                <InsurerCard
                  key={model.insurer.name}
                  insurer={model.insurer}
                  products={productsByInsurer.get(model.insurer.name) ?? []}
                  categories={categories}
                  categoryCounts={model.categoryCounts}
                  index={i}
                  flash={flashId === model.insurer.name}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* S4 傳統 vs 虛擬（編輯小欄；連結去公司產品頁） */}
      {/* 底部 CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="site-container flex flex-col items-center gap-4 py-12 text-center"
      >
        <h2 className="h3-style text-ink">揀好公司，不如並排睇產品。</h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/compare" className="btn-primary">
            去比較工具
            <ArrowRight size={17} />
          </Link>
          <Link to="/categories" className="btn-ghost">
            瀏覽類別
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

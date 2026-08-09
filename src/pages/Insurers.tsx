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
import { getLenis } from "@/lib/lenis";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

type SortKey = "count" | "name" | "premium";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "count", label: "產品數由多至少（預設）" },
  { value: "name", label: "公司名 A–Z" },
  { value: "premium", label: "有公開保費優先" },
];

/** S4 編輯小欄嘅公司分組（label → insurer name 錨點） */
const LANDSCAPE: { title: string; body: string; names: [string, string][] }[] = [
  {
    title: "傳統保險公司",
    body: "產品線全，部分保費需經代理或即時報價。",
    names: [
      ["AIA 友邦", "AIA"],
      ["AXA 安盛", "AXA"],
      ["Prudential 保誠", "Prudential"],
      ["Manulife 宏利", "Manulife"],
      ["HSBC Life 滙豐人壽", "HSBC Life"],
    ],
  },
  {
    title: "虛擬／網上保險",
    body: "網上投保為主，保費表普遍公開透明。",
    names: [
      ["Bowtie 保泰", "Bowtie"],
      ["Blue", "Blue"],
      ["ZA Insure 眾安", "ZA Insure"],
      ["OneDegree", "OneDegree"],
      ["Avo 安我", "Avo"],
      ["bolttech 保特", "bolttech"],
    ],
  },
];

/** 詞級標題進場 */
function SplitWords({ words, className }: { words: string[]; className?: string }) {
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={word}
          className="inline-block will-change-transform"
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

/** 保險公司名錄 `/insurers`（design/insurers.md S1–S5） */
export default function Insurers() {
  const { loading, error } = useInsuranceData();
  const insurers = useInsurers();
  const products = useProducts();
  const categories = useCategories();
  const location = useLocation();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [query, setQuery] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);

  const premiumTotal = useMemo(
    () => products.filter((p) => p.premium_available).length,
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = insurers.filter((ins) => {
      if (categoryFilter !== "all" && !ins.categories.includes(categoryFilter)) return false;
      if (q && !ins.name.toLowerCase().includes(q) && !ins.name_zh.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "premium") {
        return b.premiumCount - a.premiumCount || b.productCount - a.productCount;
      }
      return b.productCount - a.productCount;
    });
    return list;
  }, [insurers, categoryFilter, sortKey, query]);

  const productsByInsurer = useMemo(() => {
    const map = new Map<string, typeof products>();
    for (const p of products) {
      const list = map.get(p.insurer) ?? [];
      list.push(p);
      map.set(p.insurer, list);
    }
    return map;
  }, [products]);

  // URL hash 錨點（如 /insurers#AXA，大小寫皆可）→ 滾到對應公司卡 + 紅框閃爍
  useEffect(() => {
    if (insurers.length === 0 || !location.hash) return;
    const hash = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    const target = insurers.find((ins) => ins.name.toLowerCase() === hash);
    if (!target) return;
    // 若目標被篩選隱藏，先重設篩選
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
    setSortKey("count");
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
      {/* S1 頁首 */}
      <header className="site-container pb-14 pt-[88px]">
        <Breadcrumbs items={[{ label: "首頁", to: "/" }, { label: "保險公司" }]} className="mb-5" />
        <p className="eyebrow text-red">
          INSURERS
          <span className="eyebrow-zh ml-3 font-sans text-ink-soft">保險公司</span>
        </p>
        <h1 className="display-2 mt-4 text-ink">
          <SplitWords words={[`${insurers.length} 間保險公司，`, "邊間保邊啲？"]} />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT_EXPO }}
          className="mt-4 max-w-[36em] text-ink-soft"
        >
          由傳統大行到虛擬保險，逐間睇佢哋喺 9 大類別嘅產品覆蓋同保費公開情況。
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: EASE_OUT_EXPO }}
          className="mt-6 flex flex-wrap gap-2.5"
        >
          <span className="chip border bg-paper text-ink" style={{ borderColor: "var(--line-strong)" }}>
            <span className="font-grotesk font-bold">{insurers.length}</span> 間公司
          </span>
          <span className="chip border bg-paper text-ink" style={{ borderColor: "var(--line-strong)" }}>
            <span className="font-grotesk font-bold">{products.length}</span> 份產品
          </span>
          <span className="chip bg-jade-wash font-bold text-jade">
            <span className="font-grotesk">{premiumTotal}</span> 份有公開保費
          </span>
        </motion.div>
      </header>

      {/* S2 篩選列（sticky） */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: EASE_OUT_EXPO }}
        className="sticky top-[72px] z-30 border-y bg-paper/85 backdrop-blur-[12px]"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="site-container flex flex-wrap items-center gap-3 py-3">
          {/* 類別 chips */}
          <div className="flex flex-1 flex-wrap items-center gap-1.5" role="group" aria-label="按類別篩選">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "chip border transition-colors",
                categoryFilter === "all"
                  ? "border-ink bg-ink text-paper"
                  : "bg-paper text-ink-soft hover:bg-paper-3",
              )}
              style={categoryFilter === "all" ? undefined : { borderColor: "var(--line-strong)" }}
            >
              全部
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
                    "chip border transition-colors",
                    active ? "border-ink bg-ink text-paper" : "bg-paper text-ink-soft hover:bg-paper-3",
                  )}
                  style={active ? undefined : { borderColor: "var(--line-strong)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: categoryColor(catId) }}
                    aria-hidden="true"
                  />
                  {name}
                </button>
              );
            })}
          </div>

          {/* 排序 + 搜尋 + 結果數 */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex items-center">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-10 appearance-none rounded-[10px] border bg-paper pl-3.5 pr-9 text-small font-medium text-ink outline-none transition-colors hover:bg-paper-2"
                style={{ borderColor: "var(--line-strong)" }}
                aria-label="排序方式"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 text-ink-faint" />
            </label>
            <label
              className="flex h-10 w-[200px] items-center gap-2 rounded-[10px] border bg-paper px-3"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <Search size={14} className="shrink-0 text-ink-faint" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜尋公司…"
                className="w-full bg-transparent text-small text-ink outline-none placeholder:text-ink-faint"
                aria-label="搜尋保險公司"
              />
            </label>
            <p className="text-small text-ink-faint">
              顯示 <span className="font-grotesk font-bold text-ink">{filtered.length}</span> /{" "}
              <span className="font-grotesk">{insurers.length}</span> 間
            </p>
          </div>
        </div>
      </motion.div>

      {/* S3 公司卡網格 */}
      <section className="site-container py-14">
        {filtered.length === 0 ? (
          <EmptyState
            title="呢個類別暫時冇呢間公司嘅產品"
            description="試下重設篩選，或者睇返全部 27 間保險公司。"
            onReset={resetFilters}
            resetLabel="重設篩選"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ins, i) => (
              <InsurerCard
                key={ins.name}
                insurer={ins}
                products={productsByInsurer.get(ins.name) ?? []}
                categories={categories}
                index={i}
                flash={flashId === ins.name}
              />
            ))}
          </div>
        )}
      </section>

      {/* S4 虛擬保險 vs 傳統保險（編輯小欄） */}
      <section className="border-y bg-paper-2" style={{ borderColor: "var(--line)" }}>
        <div className="site-container grid gap-10 py-24 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            className="lg:col-span-4"
          >
            <p className="eyebrow text-red">LANDSCAPE</p>
            <h2 className="display-2 mt-4 text-ink">傳統大行 vs 虛擬保險。</h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
            {LANDSCAPE.map((group, gi) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, x: gi === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.7, delay: gi * 0.1, ease: EASE_OUT_EXPO }}
                className="flex flex-col gap-4 rounded-card border bg-paper p-7 shadow-card"
                style={{ borderColor: "var(--line)" }}
              >
                <h3 className="h3-style text-ink">{group.title}</h3>
                <p className="text-small text-ink-soft">
                  {group.names
                    .filter(([, key]) => insurers.some((ins) => ins.name === key))
                    .map(([label, key], i, arr) => (
                      <span key={key}>
                        <button
                          type="button"
                          onClick={() => {
                            scrollToInsurer(key);
                            setFlashId(key);
                            window.setTimeout(() => setFlashId(null), 1500);
                          }}
                          className="font-medium text-ink underline decoration-red/40 underline-offset-4 transition-colors hover:text-red hover:decoration-red"
                        >
                          {label}
                        </button>
                        {i < arr.length - 1 ? "、" : ""}
                      </span>
                    ))}
                  {" "}等——{group.body}
                </p>
                <p className="mt-auto text-[12px] text-ink-faint">分類僅為方便理解，並非官方類別。</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* S5 底部 CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="site-container flex flex-col items-center gap-6 py-20 text-center"
      >
        <h2 className="h3-style text-ink">揀好公司，不如並排睇產品。</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
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

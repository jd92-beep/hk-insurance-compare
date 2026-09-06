import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import FilterBar from "@/components/category/FilterBar";
import type { SortKey, ViewMode, TravelTripType, TravelRegion, PriceRangeKey } from "@/components/category/FilterBar";
import ProductTable from "@/components/category/ProductTable";
import UniversalComparisonChart from "@/components/category/UniversalComparisonChart";
import TravelFlagshipBanner from "@/components/category/TravelFlagshipBanner";
import { categoryCopy } from "@/components/category/copy";
import {
  getCategoryFeatureTags,
  getCategoryScenarioPresets,
  filterAndRankProductsByFeatures,
  type FeatureMatchMode,
  type FeatureMatchResult,
  type ScenarioPreset,
} from "@/lib/feature-filters";
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

/** 排序 key 統一年繳化（/月 ×12、/日 ×365），避免月繳價同年繳價直接比大細 */
function getProductPremiumKey(p: { premium_available: boolean; premium_range: string }): number {
  return p.premium_available ? premiumSortKey(p.premium_range) : Number.POSITIVE_INFINITY;
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

  const isTravel = categoryId === "travel";
  const [searchParams] = useSearchParams();
  // 從 URL ?insurer= 預選保險公司（由 InsurerCard 等入口帶入）
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>(() => {
    const v = searchParams.get("insurer");
    return v ? [v] : [];
  });
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [sort, setSort] = useState<SortKey>("default");
  const [premiumDir, setPremiumDir] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<ViewMode>("table");

  // 旅遊保險專屬篩選維度（旅程類型、覆蓋地區、即時折扣）
  const [travelTripType, setTravelTripType] = useState<TravelTripType>("all");
  const [travelRegion, setTravelRegion] = useState<TravelRegion>("all");
  const [onlyPromo, setOnlyPromo] = useState(false);
  // 💰 按價錢篩選（支援折後實付價預算過濾）
  const [priceRange, setPriceRange] = useState<PriceRangeKey>("all");
  // 🎯 智能保障挑選面板展開狀態（需求：預設收起 Collapsed，不佔用垂直空間）
  const [isFeaturePanelOpen, setIsFeaturePanelOpen] = useState(false);
  // 🏷️ 特點標籤漸進式揭示（Progressive Disclosure：預設只展開前 9 項精選）
  const [isExpandedTags, setIsExpandedTags] = useState(false);

  // 🎯 用戶自選重視之保障項目（智能匹配與置頂推薦）
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [featureMatchMode, setFeatureMatchMode] = useState<FeatureMatchMode>("smart");

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

  const categoryFeatureTags = useMemo(
    () => getCategoryFeatureTags(categoryId || ""),
    [categoryId]
  );

  // 1. 先套用基礎條件（公司、有保費、旅遊維度）並送入智能契合度評分引擎
  const rankedFeatureData = useMemo(() => {
    let list = products;
    if (selectedInsurers.length > 0) {
      list = list.filter((p) => selectedInsurers.includes(p.insurer));
    }
    if (onlyPremium) list = list.filter((p) => p.premium_available);

    // 旅遊保險專屬維度過濾
    if (isTravel) {
      if (travelTripType === "single") {
        list = list.filter((p) => p.trip_type === "single" || p.trip_type === "both" || !p.trip_type);
      } else if (travelTripType === "annual") {
        list = list.filter((p) => p.trip_type === "annual" || p.trip_type === "both");
      }

      if (travelRegion === "asia") {
        list = list.filter((p) => (p.destination_scope ? p.destination_scope.includes("asia") : true));
      } else if (travelRegion === "worldwide") {
        list = list.filter((p) => (p.destination_scope ? p.destination_scope.includes("worldwide") : true));
      } else if (travelRegion === "gba") {
        list = list.filter((p) => (p.destination_scope ? p.destination_scope.includes("gba") : false));
      }

      if (onlyPromo) {
        list = list.filter((p) => Boolean(p.promo));
      }
    }

    // 💰 按價錢篩選：以折後實付價 discounted_price 或 original_price 或年繳化保費數字為準
    if (priceRange !== "all") {
      list = list.filter((p) => {
        if (!p.premium_available) return false;
        // 取得產品實付價或折後基準價
        const effPrice =
          p.discounted_price ??
          p.promo?.discounted_price ??
          p.original_price ??
          premiumSortKey(p.premium_range);
        if (!Number.isFinite(effPrice) || effPrice <= 0) return false;
        if (priceRange === "under100") return effPrice <= 100;
        if (priceRange === "100to250") return effPrice >= 100 && effPrice <= 250;
        if (priceRange === "250to500") return effPrice >= 250 && effPrice <= 500;
        if (priceRange === "over500") return effPrice > 500;
        return true;
      });
    }


    return filterAndRankProductsByFeatures(
      list,
      selectedFeatures,
      categoryId || "",
      featureMatchMode
    );
  }, [
    products,
    selectedInsurers,
    onlyPremium,
    isTravel,
    travelTripType,
    travelRegion,
    onlyPromo,
    priceRange,
    selectedFeatures,
    categoryId,
    featureMatchMode,
  ]);

  // 建立產品與 Match 結果快速索引
  const productMatchMap = useMemo(() => {
    const map = new Map<string, FeatureMatchResult>();
    for (const r of rankedFeatureData.results) {
      map.set(r.product.id, r.match);
    }
    return map;
  }, [rankedFeatureData]);

  // 2. 最終排序：支援預設推薦、契合度最高、保費升/降序、最高保額、性價比推薦、公司字母A-Z
  const filtered = useMemo(() => {
    const list = rankedFeatureData.results.map((r) => r.product);
    if (sort === "default") {
      return list;
    }
    const sorted = [...list];

    if (sort === "fit-score") {
      sorted.sort((a, b) => {
        const ma = productMatchMap.get(a.id);
        const mb = productMatchMap.get(b.id);
        const countA = ma?.matchedCount ?? 0;
        const countB = mb?.matchedCount ?? 0;
        if (countA !== countB) return countB - countA;
        const scoreA = ma?.score ?? 0;
        const scoreB = mb?.score ?? 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        const ka = getProductPremiumKey(a);
        const kb = getProductPremiumKey(b);
        return ka - kb;
      });
    } else if (sort === "premium-asc" || (sort === "premium" && premiumDir === "asc")) {
      sorted.sort((a, b) => {
        const ka = getProductPremiumKey(a);
        const kb = getProductPremiumKey(b);
        const aNone = !Number.isFinite(ka);
        const bNone = !Number.isFinite(kb);
        if (aNone !== bNone) return aNone ? 1 : -1;
        return ka - kb;
      });
    } else if (sort === "premium-desc" || (sort === "premium" && premiumDir === "desc")) {
      sorted.sort((a, b) => {
        const ka = getProductPremiumKey(a);
        const kb = getProductPremiumKey(b);
        const aNone = !Number.isFinite(ka);
        const bNone = !Number.isFinite(kb);
        if (aNone !== bNone) return aNone ? 1 : -1;
        return kb - ka;
      });
    } else if (sort === "insurer-az" || sort === "insurer") {
      sorted.sort((a, b) => a.insurer.localeCompare(b.insurer) || a.id.localeCompare(b.id));
    } else if (sort === "coverage") {
      sorted.sort((a, b) => (b.coverage?.length ?? 0) - (a.coverage?.length ?? 0));
    }
    return sorted;
  }, [rankedFeatureData, sort, premiumDir, productMatchMap]);

  // 🔍 特點即時微型搜尋欄輸入字串
  const [featureSearchQuery, setFeatureSearchQuery] = useState("");

  // 切換類別時自動重設所有篩選狀態（避免跨類別殘留條件導致 0 筆結果或空指標）
  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);
  if (prevCategoryId !== categoryId) {
    setPrevCategoryId(categoryId);
    setSelectedInsurers([]);
    setOnlyPremium(false);
    setSort("default");
    setPremiumDir("asc");
    setTravelTripType("all");
    setTravelRegion("all");
    setOnlyPromo(false);
    setPriceRange("all");
    setIsFeaturePanelOpen(false);
    setIsExpandedTags(false);
    setSelectedFeatures([]);
    setFeatureSearchQuery("");
    setFeatureMatchMode("smart");
  }

  // 當前類別之情境 Shortcuts
  const categoryPresets = useMemo(
    () => getCategoryScenarioPresets(categoryId || ""),
    [categoryId]
  );

  // 篩選特點標籤（支援 label、keywords、id 快速匹配）
  const filteredFeatureTags = useMemo(() => {
    if (!featureSearchQuery.trim()) return categoryFeatureTags;
    const q = featureSearchQuery.trim().toLowerCase();
    return categoryFeatureTags.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q)
    );
  }, [categoryFeatureTags, featureSearchQuery]);

  // 漸進式揭示（Progressive Disclosure）：若有搜尋關鍵字或已點擊展開，展示全部；否則預設只展示前 9 個精選
  const VISIBLE_TAG_COUNT = 9;
  const displayedFeatureTags = useMemo(() => {
    if (featureSearchQuery.trim() || isExpandedTags) {
      return filteredFeatureTags;
    }
    return filteredFeatureTags.slice(0, VISIBLE_TAG_COUNT);
  }, [filteredFeatureTags, featureSearchQuery, isExpandedTags]);

  const remainingTagCount = Math.max(0, filteredFeatureTags.length - VISIBLE_TAG_COUNT);

  // 最高契合度統計指標（供動態 Feedback Banner 使用）
  const maxMatchedCount = useMemo(() => {
    if (rankedFeatureData.results.length === 0 || selectedFeatures.length === 0) return 0;
    return Math.max(...rankedFeatureData.results.map((r) => r.match.matchedCount));
  }, [rankedFeatureData, selectedFeatures]);

  const maxScore = useMemo(() => {
    if (rankedFeatureData.results.length === 0 || selectedFeatures.length === 0) return 0;
    return Math.max(...rankedFeatureData.results.map((r) => r.match.score));
  }, [rankedFeatureData, selectedFeatures]);

  const bestMatchProducts = useMemo(() => {
    if (maxMatchedCount === 0) return [];
    return rankedFeatureData.results.filter((r) => r.match.matchedCount === maxMatchedCount);
  }, [rankedFeatureData, maxMatchedCount]);

  // Preset 點擊切換與取消邏輯
  const handleTogglePreset = (preset: ScenarioPreset) => {
    const isAlreadyActive =
      selectedFeatures.length === preset.featureIds.length &&
      preset.featureIds.every((id) => selectedFeatures.includes(id));

    if (isAlreadyActive) {
      // 再次點擊同一個 Preset 一鍵取消
      setSelectedFeatures([]);
    } else {
      // 套用 Preset，並同步點亮相關特點
      setSelectedFeatures([...preset.featureIds]);
    }
  };

  const hasActiveFilters =
    selectedInsurers.length > 0 ||
    onlyPremium ||
    sort !== "default" ||
    priceRange !== "all" ||
    selectedFeatures.length > 0 ||
    Boolean(featureSearchQuery) ||
    (isTravel && (travelTripType !== "all" || travelRegion !== "all" || onlyPromo));

  const resetFilters = () => {
    setSelectedInsurers([]);
    setOnlyPremium(false);
    setSort("default");
    setPremiumDir("asc");
    setSelectedFeatures([]);
    setPriceRange("all");
    setFeatureMatchMode("smart");
    setFeatureSearchQuery("");
    if (isTravel) {
      setTravelTripType("all");
      setTravelRegion("all");
      setOnlyPromo(false);
    }
  };

  const toggleFeature = (tagId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleInsurer = (name: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleSortChange = (s: SortKey) => {
    setSort(s);
    if (s === "premium-asc" || s === "premium") setPremiumDir("asc");
    if (s === "premium-desc") setPremiumDir("desc");
  };

  const handleTogglePremiumSort = () => {
    if (sort === "premium-asc") {
      setSort("premium-desc");
      setPremiumDir("desc");
    } else if (sort === "premium-desc") {
      setSort("premium-asc");
      setPremiumDir("asc");
    } else if (sort === "premium") {
      const nextDir = premiumDir === "asc" ? "desc" : "asc";
      setPremiumDir(nextDir);
      setSort(nextDir === "asc" ? "premium-asc" : "premium-desc");
    } else {
      setSort("premium-asc");
      setPremiumDir("asc");
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

          {/* 旅遊保險專屬旗艦頂部 Banner */}
          {category.id === "travel" && (
            <TravelFlagshipBanner
              productCount={products.length}
              premiumCount={premiumCount}
            />
          )}

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
                        公司醫保差額 · 先核對自負額抵扣與離職後續保安排
                      </span>
                    </div>
                    <p className="mt-1 text-small text-paper/80">
                      不同差額／自負額型計劃的賠償次序及延續保障條件有別；免核保轉保權必須有具體條款支持。
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

      {/* ── S1.5 全類別視覺化保障限額圖表 ──────────────────────── */}
      <section id="chart-section" className="border-b border-line/60 bg-paper-2/30 py-8">
        <div className="site-container">
          <UniversalComparisonChart
            products={products}
            categoryId={category.id}
            categoryName={category.name_zh}
            color={color}
            selectedFeatures={selectedFeatures}
            onSelectedFeaturesChange={setSelectedFeatures}
            matchMode={featureMatchMode}
            onMatchModeChange={setFeatureMatchMode}
          />
        </div>
      </section>

      {/* ── S2 智能保障挑選面板（條款契合度推薦） ───────────────── */}
      {categoryFeatureTags.length > 0 && (
        <section className="border-b border-line/60 bg-paper py-5 max-md:py-4">
          <div className="site-container">
            {/* 🎯 智能偏好挑選面板（用戶自選重視保障與情境 Preset，需求：預設收起 Collapsed，可自由展開） */}
            <div className="rounded-2xl border border-line bg-paper-2/40 p-4 sm:p-5 shadow-xs transition-all">
              {/* 頂部常駐 Header：左側標題與已選狀態，右側展開/收起切換按鈕 */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-sans text-[15px] sm:text-[16px] font-bold text-ink flex items-center gap-1.5">
                    <Sparkles size={16} className="text-jade" />
                    <span>按摘要條件篩選（仍需核對條款）</span>
                  </h3>
                  {selectedFeatures.length > 0 ? (
                    <span className="rounded-full bg-jade/10 px-2.5 py-0.5 font-grotesk text-[11px] font-bold text-jade">
                      已選 {selectedFeatures.length} 項重視條件
                    </span>
                  ) : (
                    <span className="text-[12px] text-ink-faint">
                      (支援 200 款高價值條款與情境一鍵套用)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedFeatures.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedFeatures([])}
                      className="text-[12px] font-semibold text-red hover:underline px-2 py-1"
                    >
                      清空已選
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFeaturePanelOpen((prev) => !prev)}
                    aria-expanded={isFeaturePanelOpen}
                    className={cn(
                      "inline-flex min-h-[44px] sm:min-h-[34px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-small font-bold transition-all duration-200 active:scale-95 shadow-xs border",
                      isFeaturePanelOpen
                        ? "border-jade bg-jade text-paper"
                        : "border-line-strong bg-paper hover:bg-paper-2 text-ink"
                    )}
                  >
                    <Sparkles size={13} className={isFeaturePanelOpen ? "text-paper" : "text-jade"} />
                    <span>{isFeaturePanelOpen ? "收起挑選面板" : "展開挑選面板"}</span>
                    <ChevronDown
                      size={14}
                      className={cn("transition-transform duration-300", isFeaturePanelOpen && "rotate-180")}
                    />
                  </button>
                </div>
              </div>

              {/* 若已選取條款但處於收起狀態，展示直觀的已選條件 Chip 列與最高契合度 */}
              {!isFeaturePanelOpen && selectedFeatures.length > 0 && (
                <div className="mt-3 pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[12px] font-medium text-ink-soft">已選條款：</span>
                    {selectedFeatures.map((fid) => {
                      const tag = categoryFeatureTags.find((t) => t.id === fid);
                      return (
                        <span
                          key={fid}
                          className="inline-flex items-center gap-1 rounded-full bg-jade/10 border border-jade/30 px-2.5 py-0.5 text-[11px] font-bold text-jade"
                        >
                          ✓ {tag?.label || fid}
                        </span>
                      );
                    })}
                  </div>
                  {maxMatchedCount > 0 && (
                    <span className="text-[12px] font-bold text-jade">
                      🎯 最高命中 {maxScore}% ({maxMatchedCount}/{selectedFeatures.length} 項)
                    </span>
                  )}
                </div>
              )}

              {/* 展開時顯示的完整面板內容 */}
              <AnimatePresence>
                {isFeaturePanelOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                    className="overflow-hidden mt-4 pt-4 border-t border-line/60"
                  >
                    {/* 1. 契合度進度指示與置頂反饋動效 (Top Match Feedback Banner) */}
                    <AnimatePresence>
                      {selectedFeatures.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                          className="overflow-hidden pb-4 mb-4 border-b border-line/60"
                        >
                          <div className="rounded-xl border border-jade/30 bg-jade-wash/70 p-3.5 sm:p-4 text-ink flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-jade text-paper shadow-xs">
                                <Sparkles size={16} />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-sans text-[14.5px] sm:text-[15.5px] font-bold text-ink">
                                    為你精選推薦 <span className="font-grotesk font-black text-jade underline decoration-jade/40 underline-offset-4">{bestMatchProducts.length}</span> 款最高契合保險
                                  </span>
                                  <span className="rounded-full bg-jade text-paper px-2.5 py-0.5 font-grotesk text-[11px] font-bold tracking-tight shadow-xs">
                                    最高命中率 {maxScore}% ({maxMatchedCount}/{selectedFeatures.length} 項)
                                  </span>
                                </div>
                                <p className="mt-1 text-[12.5px] text-ink-soft">
                                  已選 {selectedFeatures.length} 項核心條款，依契合度多至少置頂排序，最貼近心水方案永遠排最前。
                                </p>
                              </div>
                            </div>

                            {/* 控制器：清空全部 + 模式切換 */}
                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                              {selectedFeatures.length > 1 && (
                                <div className="inline-flex items-center rounded-full bg-paper p-1 text-[11px] border border-line shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => setFeatureMatchMode("smart")}
                                    className={cn(
                                      "rounded-full px-2.5 py-1 font-medium transition-all",
                                      featureMatchMode === "smart"
                                        ? "bg-jade text-paper font-bold shadow-xs"
                                        : "text-ink-soft hover:text-ink"
                                    )}
                                    title="智能推薦：符合最多重視項目優先置頂，永不落空"
                                  >
                                    ✨ 智能推薦
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFeatureMatchMode("strict")}
                                    className={cn(
                                      "rounded-full px-2.5 py-1 font-medium transition-all",
                                      featureMatchMode === "strict"
                                        ? "bg-ink text-paper font-bold shadow-xs"
                                        : "text-ink-soft hover:text-ink"
                                    )}
                                    title="嚴格全中：要求同時滿足所有選中條件"
                                  >
                                    🎯 嚴格全中 (AND)
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedFeatures([])}
                                className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:text-red hover:border-red/40 active:scale-95 transition-all shadow-xs"
                                aria-label="清空全部自選條件"
                              >
                                <RotateCcw size={12} className="text-red" />
                                <span>清空全部</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 面板標題區 + 特點微型搜尋欄 */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-line/50">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-sans text-[15px] sm:text-[16px] font-bold text-ink flex items-center gap-1.5">
                            <Sparkles size={16} className="text-jade" />
                            <span>挑選你重視的保障項目（智能推薦最合適保險）</span>
                          </h3>
                          {selectedFeatures.length > 0 && (
                            <span className="rounded-full bg-jade/10 px-2.5 py-0.5 font-grotesk text-[11px] font-bold text-jade">
                              已選 {selectedFeatures.length} 項條件
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-small text-ink-soft">
                          點選你最關注的保障條款或熱門情境，系統將按契合度智能評分並置頂推薦最貼近心水的方案。
                        </p>
                      </div>

                      {/* 特點過濾即時微型搜尋欄 (Search within features) */}
                      <div className="relative w-full sm:w-64 shrink-0">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <input
                          type="text"
                          value={featureSearchQuery}
                          onChange={(e) => setFeatureSearchQuery(e.target.value)}
                          placeholder="搜尋保障標籤（如：租車、免找數）"
                          aria-label="搜尋保障項目標籤"
                          className="h-[36px] w-full rounded-full border border-line bg-paper-2/60 pl-8 pr-8 text-[12px] text-ink placeholder:text-ink-faint focus:border-jade focus:bg-paper focus:outline-none transition-all"
                        />
                        {featureSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setFeatureSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-ink-faint hover:text-ink transition-colors"
                            aria-label="清空搜尋字串"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. 一鍵場景 Preset 晶片列 (Persona / Scenario Shortcuts) */}
                    {categoryPresets.length > 0 && (
                      <div className="mt-3.5 pb-3 border-b border-line/40">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[12px] font-bold text-ink-soft shrink-0">
                            🔥 熱門情境快捷：
                          </span>
                          {categoryPresets.map((preset) => {
                            const isExactActive =
                              selectedFeatures.length === preset.featureIds.length &&
                              preset.featureIds.every((id) => selectedFeatures.includes(id));
                            const isPartialActive =
                              !isExactActive &&
                              preset.featureIds.every((id) => selectedFeatures.includes(id)) &&
                              preset.featureIds.length > 0;

                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleTogglePreset(preset)}
                                title={preset.description}
                                aria-pressed={isExactActive}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-all duration-200 active:scale-95",
                                  isExactActive
                                    ? "bg-ink text-paper shadow-xs ring-2 ring-ink/20"
                                    : isPartialActive
                                      ? "bg-jade/15 text-jade border border-jade/40 font-bold"
                                      : "bg-paper-2 text-ink-soft border border-line/60 hover:border-ink/40 hover:text-ink hover:bg-paper"
                                )}
                              >
                                {isExactActive && <Check size={12} className="text-paper" />}
                                <span>{preset.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. 已選條款常駐置頂列 (Pinned Active Selection Bar) */}
                    {selectedFeatures.length > 0 && (
                      <div className="mt-3.5 rounded-xl border border-jade/30 bg-jade-wash/50 p-2.5 sm:p-3 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[12px] font-bold text-jade flex items-center gap-1 shrink-0">
                              <Check size={13} className="text-jade" />
                              已選條件 ({selectedFeatures.length})：
                            </span>
                            {selectedFeatures.map((fid) => {
                              const tag = categoryFeatureTags.find((t) => t.id === fid);
                              return (
                                <button
                                  key={fid}
                                  type="button"
                                  onClick={() => toggleFeature(fid)}
                                  className="group inline-flex items-center gap-1 rounded-full bg-jade px-2.5 py-0.5 text-[11.5px] font-bold text-paper shadow-xs hover:bg-jade/90 active:scale-95 transition-all"
                                  title="點擊取消選取此條件"
                                >
                                  <span>{tag?.label || fid}</span>
                                  <X size={11} className="opacity-70 group-hover:opacity-100" />
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {maxMatchedCount > 0 && (
                              <span className="text-[11.5px] font-grotesk font-bold text-jade">
                                🎯 最高命中 {maxScore}% ({maxMatchedCount}/{selectedFeatures.length} 項)
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedFeatures([])}
                              className="text-[11.5px] font-semibold text-red hover:underline ml-1"
                            >
                              清空全部
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. 特點標籤 Chips 列（漸進式揭示 Progressive Disclosure：精選 9 項 + 折疊收納） */}
                    <div className="mt-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-ink-faint mr-1 shrink-0">
                          {featureSearchQuery ? "搜尋結果：" : isExpandedTags ? "所有保障條款：" : "🔥 精選核心保障："}
                        </span>
                        {displayedFeatureTags.map((tag) => {
                          const isSelected = selectedFeatures.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleFeature(tag.id)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium transition-all active:scale-95",
                                isSelected
                                  ? "bg-jade text-paper font-bold shadow-xs scale-[1.02]"
                                  : "bg-paper-2/70 text-ink-soft border border-line/70 hover:border-jade/50 hover:text-jade hover:bg-paper"
                              )}
                            >
                              {isSelected && <Check size={12} />}
                              <span>{tag.label}</span>
                            </button>
                          );
                        })}

                        {/* 折疊/展開更多標籤按鈕 */}
                        {!featureSearchQuery && remainingTagCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsExpandedTags((prev) => !prev)}
                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-jade/50 bg-jade/5 hover:bg-jade/10 px-3 py-1 text-[12px] font-bold text-jade transition-all active:scale-95"
                          >
                            <span>{isExpandedTags ? "收起更多條款 ▴" : `展開更多條款標籤 (+${remainingTagCount} 項) ▾`}</span>
                          </button>
                        )}

                        {filteredFeatureTags.length === 0 && (
                          <div className="flex items-center gap-2 py-1 text-[12px] text-ink-faint">
                            <span>未搵到包含「{featureSearchQuery}」嘅保障標籤</span>
                            <button
                              type="button"
                              onClick={() => setFeatureSearchQuery("")}
                              className="font-bold text-jade hover:underline"
                            >
                              清除搜尋
                            </button>
                          </div>
                        )}

                        {selectedFeatures.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedFeatures([])}
                            className="ml-2 inline-flex items-center gap-1 text-[12px] font-semibold text-red hover:underline"
                          >
                            <RotateCcw size={12} />
                            <span>重設重視保障</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fallback 智能提示 */}
                    {rankedFeatureData.fallbackTriggered && (
                      <div className="mt-3.5 rounded-xl border border-amber-300/80 bg-amber-50/90 dark:bg-amber-950/40 p-3 text-amber-900 dark:text-amber-200 text-[12.5px] flex items-start gap-2">
                        <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>本站摘要未有同時命中全部 {selectedFeatures.length} 項條件。</strong>
                          <p className="mt-0.5 text-[12px] text-amber-800/90 dark:text-amber-300/90">
                            以下只係部分命中嘅替代資料，並不符合你全部條件。未命中可能係不保或資料不足；百分比唔係適合度、核保或理賠機會。
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* ── S3 篩選工具列 ───────────────────────────────────── */}
      <div id="category-filter-controls" style={{ scrollMarginTop: 110 }} />
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
        isTravel={isTravel}
        travelTripType={travelTripType}
        onTravelTripTypeChange={setTravelTripType}
        travelRegion={travelRegion}
        onTravelRegionChange={setTravelRegion}
        onlyPromo={onlyPromo}
        onTogglePromo={() => setOnlyPromo((v) => !v)}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        activeFeatureCount={selectedFeatures.length}
      />

      {/* ── S4 產品列表 ─────────────────────────────────────── */}
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
                    premiumSortDir={
                      sort === "premium-asc" || (sort === "premium" && premiumDir === "asc")
                        ? "asc"
                        : sort === "premium-desc" || (sort === "premium" && premiumDir === "desc")
                          ? "desc"
                          : null
                    }
                    onTogglePremiumSort={handleTogglePremiumSort}
                    productMatchMap={productMatchMap}
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
                      <ProductCard product={p} className="h-full" match={productMatchMap.get(p.id)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
          </div>
        </section>

      {/* ── S4 點揀重點 ─────────────────────────────────────── */}
      <section
        id="tips-section"
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
              揀{category.name_zh.replace("（自願醫保）", "")}，睇呢 {copy.highlights.length} 樣。
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

import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import {
  useCategories,
  useInsuranceData,
  useProduct,
  useProducts,
} from "@/providers/InsuranceDataProvider";
import { categoryColor } from "@/lib/categories";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmptyState from "@/components/EmptyState";
import ProductHeader, { deriveSeriesInfo } from "@/components/product/ProductHeader";
import AnchorNav from "@/components/product/AnchorNav";
import CoverageSection from "@/components/product/CoverageSection";
import PremiumSection from "@/components/product/PremiumSection";
import PlanTiersSection from "@/components/product/PlanTiersSection";
import KeyTermsSection from "@/components/product/KeyTermsSection";
import ExclusionsSection from "@/components/product/ExclusionsSection";
import SourcesSection from "@/components/product/SourcesSection";
import RelatedProducts from "@/components/product/RelatedProducts";
import CompareCTA from "@/components/product/CompareCTA";
import { EASE_OUT_EXPO } from "@/components/product/SectionHeading";

const SECTION_SCROLL_MARGIN = { scrollMarginTop: "110px" } as const;

/**
 * 產品詳情頁 `/product/:productId`（product.md S1–S4，85 條路由共用模板）。
 * 所有欄位直接渲染 JSON 原文（premium_range / key_terms / exclusions 唔改寫）。
 */
export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const product = useProduct(productId);
  const { loading, error } = useInsuranceData();
  const categories = useCategories();
  const categoryProducts = useProducts(product?.category);

  const category = categories.find((c) => c.id === product?.category);
  const catName = category?.name_zh ?? product?.category ?? "";
  const displayTitle = product ? deriveSeriesInfo(product, catName).title : "";

  // SEO：<title> = 「{產品名}｜{公司} — 保險格價站」（附錄 6）
  useEffect(() => {
    if (!product) return;
    const prev = document.title;
    document.title = `${displayTitle}｜${product.insurer_zh || product.insurer} — 保險格價站`;
    return () => {
      document.title = prev;
    };
  }, [product, displayTitle]);

  // 載入中
  if (loading) {
    return (
      <div className="site-container py-24">
        <div className="h-4 w-56 animate-pulse rounded bg-paper-3" />
        <div className="mt-8 h-10 w-2/3 animate-pulse rounded bg-paper-3" />
        <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-paper-3" />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-card bg-paper-2" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-card bg-paper-2 lg:col-span-4" />
        </div>
      </div>
    );
  }

  // productId 無效 / 載入失敗 → EmptyState
  if (error || !product) {
    return (
      <div className="site-container py-24">
        <Breadcrumbs
          items={[{ label: "首頁", to: "/" }, { label: "產品詳情" }]}
          className="mb-8"
        />
        <EmptyState
          title="搵唔到呢份產品"
          description={
            error ??
            "呢個產品連結可能已經過期，或者網址打錯咗。試下由類別頁重新揀過。"
          }
        />
        <p className="mt-8">
          <Link to="/categories" className="font-bold text-red hover:underline">
            ← 瀏覽全部保險類別
          </Link>
        </p>
      </div>
    );
  }

  const color = categoryColor(product.category);

  return (
    <>
      {/* S1 產品頁首 */}
      <ProductHeader product={product} />

      {/* S2 內容雙欄：錨點導航 + 主欄 */}
      <section className="pb-20 pt-8 max-md:pb-14 max-md:pt-6">
        <div className="site-container flex gap-12">
          <AnchorNav className="sticky top-[140px] hidden self-start lg:block" />
          <div className="flex w-full max-w-[780px] flex-col gap-14">
            <section id="pd-coverage" style={SECTION_SCROLL_MARGIN}>
              <CoverageSection coverage={product.coverage ?? []} />
            </section>
            <section id="pd-premium" style={SECTION_SCROLL_MARGIN}>
              <PremiumSection product={product} color={color} />
            </section>
            <section id="pd-tiers" style={SECTION_SCROLL_MARGIN}>
              <PlanTiersSection product={product} color={color} />
            </section>
            <section id="pd-terms" style={SECTION_SCROLL_MARGIN}>
              <KeyTermsSection terms={product.key_terms ?? []} />
            </section>
            <section id="pd-exclusions" style={SECTION_SCROLL_MARGIN}>
              <ExclusionsSection exclusions={product.exclusions ?? []} />
            </section>
            <section id="pd-sources" style={SECTION_SCROLL_MARGIN}>
              <SourcesSection product={product} />
            </section>
          </div>
        </div>
      </section>

      {/* S3 同類產品推薦 */}
      <RelatedProducts
        current={product}
        categoryProducts={categoryProducts}
        catName={catName}
      />

      {/* S4 底部 CTA 帶 */}
      <section className="py-14 max-md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="site-container flex flex-col items-center gap-6 text-center"
        >
          <h2 className="h3-style text-ink">同其他{catName}並排睇？</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CompareCTA productId={product.id} />
            <Link to={`/category/${product.category}`} className="btn-ghost">
              <ArrowLeft size={16} />
              返{catName}類別
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}

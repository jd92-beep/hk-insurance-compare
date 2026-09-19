import { Link, useParams } from "react-router";
import { ArrowLeft, Scale } from "lucide-react";
import { useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import {
  useCategories,
  useInsuranceData,
  useInsurers,
  useProducts,
} from "@/providers/InsuranceDataProvider";
import { categoryName, categoryColor } from "@/lib/categories";
import {
  INSURER_SORT_NOTE,
  categoryPath,
  groupInsurerProductsByCategory,
} from "@/lib/insurer-catalogue";
import type { Insurer } from "@/types/insurance";

/**
 * Density-aware card grid.
 * Many insurers ship 1 product per category — a 2/3-col grid would leave
 * an empty right gutter. Single products fill the row; 2+ use foldable cols.
 */
function productGridClass(count: number): string {
  if (count <= 1) return "grid grid-cols-1 items-start gap-6";
  if (count === 2) return "grid grid-cols-1 items-start gap-6 fold:grid-cols-2";
  return "grid grid-cols-1 items-start gap-6 fold:grid-cols-2 lg:grid-cols-3";
}

function resolveInsurer(raw: string, insurers: Insurer[]): Insurer | undefined {
  const direct = insurers.find((ins) => ins.name === raw);
  if (direct) return direct;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  return (
    insurers.find((ins) => ins.name === decoded) ??
    insurers.find((ins) => ins.name.toLowerCase() === decoded.toLowerCase()) ??
    insurers.find((ins) => ins.name_zh === decoded)
  );
}

/** 單一保險公司產品頁：按類別分組展示快照入面呢間公司嘅全部產品 */
export default function InsurerDetail() {
  const { insurerKey = "" } = useParams();
  const { loading, error, generatedAt } = useInsuranceData();
  const insurers = useInsurers();
  const products = useProducts();
  const categories = useCategories();

  const insurer = useMemo(() => resolveInsurer(insurerKey, insurers), [insurerKey, insurers]);
  const sections = useMemo(
    () => (insurer ? groupInsurerProductsByCategory(products, insurer.name) : []),
    [products, insurer],
  );
  const allProducts = useMemo(
    () => sections.flatMap((s) => s.products),
    [sections],
  );
  const totalProducts = allProducts.length;
  const premiumCount = useMemo(
    () =>
      insurer
        ? products.filter((p) => p.insurer === insurer.name && p.premium_available).length
        : 0,
    [products, insurer],
  );

  if (loading) {
    return (
      <div className="site-container flex min-h-[60vh] items-center justify-center">
        <p className="text-small text-ink-faint">載入保險公司產品中…</p>
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
  if (!insurer) {
    return (
      <div className="site-container py-16">
        <EmptyState
          title="搵唔到呢間保險公司"
          description="請返回保險公司名錄再揀。"
        />
        <div className="mt-6 flex justify-center">
          <Link to="/insurers" className="btn-primary">
            返回保險公司名錄
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 pb-16">
      <header className="site-container pb-6 pt-[68px]">
        <Breadcrumbs
          items={[
            { label: "首頁", to: "/" },
            { label: "保險公司", to: "/insurers" },
            { label: insurer.name_zh },
          ]}
          className="mb-5"
        />
        <p className="eyebrow text-red">
          INSURER
          <span className="eyebrow-zh ml-3 font-sans text-ink-soft">保險公司產品</span>
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="display-2 break-words text-ink">{insurer.name_zh}</h1>
            <p className="mt-2 font-grotesk text-xl font-medium text-ink-soft">{insurer.name}</p>
          </div>
          <Link to="/insurers" className="btn-ghost inline-flex items-center gap-2">
            <ArrowLeft size={16} aria-hidden="true" />
            返回公司名錄
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <span className="chip border bg-paper text-ink" style={{ borderColor: "var(--line-strong)" }}>
            <span className="font-grotesk font-bold">{totalProducts}</span> 份產品
          </span>
          <span className="chip border bg-paper text-ink" style={{ borderColor: "var(--line-strong)" }}>
            <span className="font-grotesk font-bold">{sections.length}</span> 個類別
          </span>
          <span className="chip bg-jade-wash font-bold text-jade">
            <span className="font-grotesk">{premiumCount}</span> 份有公開保費欄
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-soft" data-testid="insurer-detail-disclaimer">
          <span>
            快照 {generatedAt} · 非全市場 · 唔提供適合度評分或報價。
          </span>
          <Link to="/data-quality" className="font-semibold text-jade underline">覆核狀態</Link>
          <Link to="/compare" className="inline-flex min-h-11 items-center gap-1 font-semibold text-jade underline">
            <Scale size={14} aria-hidden="true" />
            比較清單
          </Link>
          <span className="text-xs text-ink-faint">{INSURER_SORT_NOTE}</span>
        </div>

        {sections.length > 1 && (
          <nav
            aria-label="按類別跳至產品"
            className="mt-5 flex flex-wrap items-center gap-2"
            data-testid="insurer-category-jump"
          >
            <span className="text-sm font-semibold text-ink-soft">類別：</span>
            {sections.map((section) => {
              const label = categoryName(categories, section.categoryId);
              return (
                <a
                  key={section.categoryId}
                  href={`#cat-${section.categoryId}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-paper px-3 text-sm font-semibold text-ink hover:border-jade hover:text-jade"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: categoryColor(section.categoryId) }}
                    aria-hidden="true"
                  />
                  {label}
                  <span className="font-grotesk text-[11px] text-ink-faint">
                    {section.products.length}
                  </span>
                </a>
              );
            })}
          </nav>
        )}
      </header>

      {sections.length === 0 ? (
        <section className="site-container py-8">
          <EmptyState
            title="暫時冇呢間公司嘅產品"
            description="返回公司名錄或類別頁繼續。"
          />
        </section>
      ) : (
        <>
          {/* Overview: all products in one dense grid so multi-category insurers (e.g. Bowtie)
              do not look like isolated single cards with empty right gutters. */}
          {allProducts.length >= 2 && (
            <section
              className="site-container scroll-mt-[88px] pb-4 pt-2"
              aria-labelledby="insurer-all-products"
              data-testid="insurer-products-overview"
            >
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--line)" }}>
                <div>
                  <h2 id="insurer-all-products" className="h3-style text-ink">
                    全部產品
                  </h2>
                </div>
              </div>
              <div className={productGridClass(allProducts.length)}>
                {allProducts.map((product) => (
                  <div key={`ov-${product.id}`} className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 text-small font-semibold text-ink-soft">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: categoryColor(product.category) }}
                        aria-hidden="true"
                      />
                      {categoryName(categories, product.category)}
                    </p>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {sections.map((section) => {
            const label = categoryName(categories, section.categoryId);
            return (
              <section
                key={section.categoryId}
                id={`cat-${section.categoryId}`}
                className="site-container scroll-mt-[88px] py-6"
                aria-labelledby={`insurer-cat-${section.categoryId}`}
                data-insurer-category={section.categoryId}
              >
                <div
                  className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-4"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-[4px]"
                        style={{ background: categoryColor(section.categoryId) }}
                        aria-hidden="true"
                      />
                      <h2
                        id={`insurer-cat-${section.categoryId}`}
                        className="h3-style text-ink"
                      >
                        {label}
                      </h2>
                      <span className="chip bg-paper-3 text-ink-soft">
                        <span className="font-grotesk font-bold">{section.products.length}</span> 份
                      </span>
                    </div>
                  </div>
                  <Link
                    to={categoryPath(section.categoryId)}
                    className="inline-flex min-h-11 items-center text-small font-bold text-jade underline-offset-2 hover:underline"
                  >
                    睇全部公司
                  </Link>
                </div>
                <div className={productGridClass(section.products.length)}>
                  {section.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}

      <section className="site-container flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="h3-style text-ink">想跨公司比較？</h2>
        <p className="max-w-[36em] text-ink-soft">
          用並排比較工具核對你關心嘅產品。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/insurers" className="btn-primary">
            保險公司名錄
          </Link>
          <Link to="/compare" className="btn-ghost">
            去比較工具
          </Link>
        </div>
      </section>
    </div>
  );
}

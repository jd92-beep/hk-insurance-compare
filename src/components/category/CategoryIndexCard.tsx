import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Category, Product } from "@/types/insurance";
import { CATEGORY_META } from "@/lib/categories";
import CategorySpectrum from "@/components/category/CategorySpectrum";
import { categoryCopy } from "@/components/category/copy";
import { cn } from "@/lib/utils";

/**
 * 類別大卡（categories.md S2）：
 * icon + 序號 + 類別名 + 痛點描述 + 價錢光譜尺規 + 統計行。
 */
export default function CategoryIndexCard({
  category,
  products,
  index,
  insurerCount,
  className,
}: {
  category: Category;
  products: Product[];
  /** 顯示序號（0-based → 「01」） */
  index: number;
  /** 該類別嘅公司數 */
  insurerCount: number;
  className?: string;
}) {
  const meta = CATEGORY_META[category.id];
  const copy = categoryCopy(category.id);
  const color = meta?.color ?? "#181D2E";
  const noPremium = category.insurers_with_premium === 0;

  return (
    <Link
      to={`/category/${category.id}`}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-card border bg-paper p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
      style={{ borderColor: "var(--line)" }}
    >
      {/* 頂部 4px 類別色條 */}
      <div
        className="absolute inset-x-0 top-0 h-[4px] transition-all duration-300 group-hover:h-[6px]"
        style={{ background: color }}
      />

      {/* 頂行：icon + 序號 */}
      <div className="flex items-start justify-between">
        <span
          className="cat-icon h-11 w-11 transition-transform duration-300 group-hover:-rotate-6"
          style={{
            color,
            WebkitMaskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
            maskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
          }}
          aria-hidden="true"
        />
        <span className="font-grotesk text-[15px] font-bold text-ink-faint">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* 類別名 + 英文 */}
      <div>
        <h3 className="font-serif text-[26px] font-bold leading-[1.25] text-ink max-md:text-[22px]">
          {category.name_zh}
        </h3>
        <p className="eyebrow mt-1.5 text-ink-faint">{copy?.english ?? category.id.toUpperCase()}</p>
      </div>

      {/* 一句痛點描述 */}
      <p className="text-small text-ink-soft">{meta?.tagline}</p>

      {/* 價錢光譜尺規 */}
      <CategorySpectrum products={products} color={color} className="mt-1" />

      {/* 狀態註記 */}
      <div className="flex flex-wrap items-center gap-2 text-small">
        {noPremium ? (
          <span className="chip bg-amber-wash font-bold text-amber">全部需官網即時報價</span>
        ) : (
          <span className="text-ink-soft">
            <span className="font-grotesk font-bold text-jade">{category.insurers_with_premium}</span>{" "}
            間公司公開咗保費
          </span>
        )}
        {category.id === "medical" && (
          <span className="chip bg-jade-wash font-bold text-jade">最齊全</span>
        )}
        {category.id === "pet" && (
          <span className="chip bg-amber-wash font-bold text-amber">較少公開資料</span>
        )}
      </div>

      {/* 底行 */}
      <div
        className="mt-auto flex items-center justify-between border-t pt-4"
        style={{ borderColor: "var(--line)" }}
      >
        <span className="text-small text-ink-faint">
          <span className="font-grotesk font-bold text-ink">{category.count}</span> 份產品 ·{" "}
          <span className="font-grotesk font-bold text-ink">{insurerCount}</span> 間公司
        </span>
        <span className="inline-flex items-center gap-1 text-small font-bold text-red">
          進入比較
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

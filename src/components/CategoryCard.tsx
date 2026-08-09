import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Category } from "@/types/insurance";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * 類別卡（§7.5）：icon + 類別名 + 痛點描述 + 統計行 + 「比較 →」
 */
export default function CategoryCard({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const meta = CATEGORY_META[category.id];
  const color = meta?.color ?? "#181D2E";

  return (
    <Link
      to={`/category/${category.id}`}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-card border bg-paper p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
      style={{ borderColor: "var(--line)" }}
    >
      {/* 頂部類別色條 */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-100 transition-transform duration-500 group-hover:h-[5px]"
        style={{ background: color }}
      />
      <span
        className="cat-icon h-10 w-10 transition-transform duration-300 group-hover:-rotate-6"
        style={{
          color,
          WebkitMaskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
          maskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
        }}
        aria-hidden="true"
      />
      <h3 className="font-serif text-[26px] font-bold leading-[1.25] text-ink max-md:text-[22px]">
        {category.name_zh}
      </h3>
      <p className="text-small text-ink-soft">{meta?.tagline}</p>
      <div className="mt-auto flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--line)" }}>
        <span className="text-small text-ink-faint">
          <span className="font-grotesk font-bold text-ink">{category.count}</span> 份產品 ·{" "}
          <span className="font-grotesk font-bold text-ink">{category.insurers_with_premium}</span> 間有公開保費
        </span>
        <span className="inline-flex items-center gap-1 text-small font-bold text-red">
          比較
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

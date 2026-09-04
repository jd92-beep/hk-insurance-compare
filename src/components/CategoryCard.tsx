import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Category } from "@/types/insurance";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * 類別卡（§7.5）：微浮雕厚紙工藝 + 晶瑩微漸層 + 立體懸浮
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
        "group relative flex flex-col gap-3.5 overflow-hidden rounded-[18px] border border-ink/10 bg-paper p-6 shadow-[0_2px_8px_rgba(24,29,46,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.9)] ring-1 ring-ink/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:border-ink/20 hover:shadow-[0_18px_36px_-8px_rgba(24,29,46,0.13),0_4px_12px_rgba(24,29,46,0.04)] shine-sweep",
        className,
      )}
    >
      {/* 內部晶瑩微漸層底色 */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-transparent opacity-80"
        aria-hidden="true"
      />

      {/* 頂部類別色條：hover 時擴展為精工色彩飾條 */}
      <div
        className="absolute inset-x-0 top-0 h-[3.5px] origin-left scale-x-[.32] transition-transform duration-500 ease-out group-hover:h-[5px] group-hover:scale-x-100"
        style={{ background: color }}
      />

      {/* 類別代表色微妙背景光暈 */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
        style={{ background: color }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between">
        <span
          className="cat-icon h-10 w-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
          style={{
            color,
            WebkitMaskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
            maskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
          }}
          aria-hidden="true"
        />
        <span className="font-grotesk text-[11px] font-semibold tracking-wider text-ink-faint transition-colors group-hover:text-ink-soft">
          0{category.id}
        </span>
      </div>

      <h3 className="relative font-serif text-[24px] font-bold leading-[1.25] text-ink transition-colors group-hover:text-ink max-md:text-[21px] sm:text-[25px]">
        {category.name_zh}
      </h3>

      <p className="relative text-small leading-relaxed text-ink-soft">{meta?.tagline}</p>

      <div className="relative mt-auto flex items-center justify-between border-t border-ink/10 pt-3.5">
        <span className="text-[13px] text-ink-faint">
          <span className="font-grotesk font-bold text-ink">{category.count}</span> 份產品 ·{" "}
          <span className="font-grotesk font-bold text-ink">{category.insurers_with_premium}</span> 間有公開保費
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-red transition-transform duration-300 group-hover:translate-x-0.5">
          比較
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

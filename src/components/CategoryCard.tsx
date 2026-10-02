import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Category } from "@/types/insurance";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * 類別卡：拍立得紙卡 — 類別色「相片」區（icon + 光斑）＋ 手寫說明 ＋ 統計 ＋「比較 →」
 */
export default function CategoryCard({
  category,
  className,
  tilt = 0,
}: {
  category: Category;
  className?: string;
  /** resting rotation in degrees (scrapbook feel) */
  tilt?: number;
}) {
  const meta = CATEGORY_META[category.id];
  const color = meta?.color ?? "#2E2A45";

  return (
    <Link
      to={`/category/${category.id}`}
      className={cn(
        "depth-card group relative flex h-full flex-col overflow-hidden rounded-[22px] border p-3 shine-sweep",
        className,
      )}
      style={{ rotate: `${tilt}deg` }}
    >
      {/* photo area */}
      <div
        className="relative flex h-36 items-center justify-center overflow-hidden rounded-[16px]"
        style={{ background: `radial-gradient(circle at 70% 25%, #FFF4D0 0, transparent 45%), linear-gradient(160deg, ${color}26, ${color}55)` }}
      >
        <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full" aria-hidden="true">
          <path d="M0 50 C 60 26 120 58 180 40 C 230 26 270 44 300 36 L300 80 L0 80Z" fill={color} fillOpacity=".35" />
          <path d="M0 64 C 80 48 160 74 300 56 L300 80 L0 80Z" fill={color} fillOpacity=".55" />
        </svg>
        <span className="absolute right-4 top-3 h-7 w-7 rounded-full bg-[#FFD36B] shadow-[0_0_24px_8px_rgba(255,211,107,.6)]" aria-hidden="true" />
        <span
          className="cat-icon relative h-16 w-16 drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-6 group-hover:scale-110"
          style={{
            color,
            WebkitMaskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
            maskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
          }}
          aria-hidden="true"
        />
      </div>
      <div className="relative flex flex-1 flex-col gap-2 px-2 pb-1 pt-4">
        <h3 className="font-serif text-[24px] font-bold leading-[1.25] text-ink max-md:text-[21px]">{category.name_zh}</h3>
        <p className="text-small text-ink-soft">{meta?.tagline}</p>
        <div className="mt-auto flex items-center justify-between border-t border-dashed pt-3" style={{ borderColor: "var(--line-strong)" }}>
          <span className="text-small text-ink-faint">
            <span className="font-grotesk font-extrabold text-ink">{category.count}</span> 份產品 ·{" "}
            <span className="font-grotesk font-extrabold text-ink">{category.insurers_with_premium}</span> 間有公開保費
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-small font-extrabold text-white transition-transform duration-300 group-hover:translate-x-0.5"
            style={{ background: color }}
          >
            比較
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

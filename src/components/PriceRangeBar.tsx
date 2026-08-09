import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types/insurance";
import { categoryColor, categorySpectrum, parsePremiumAmounts, premiumUnitHint } from "@/lib/categories";
import type { PremiumSpectrum } from "@/lib/categories";
import { useProducts } from "@/providers/InsuranceDataProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

function formatHKD(n: number): string {
  return `HK$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/**
 * 價錢尺規（§7.4）
 * 類別色實線段顯示產品保費範圍喺「全類別光譜」（對數刻度）上嘅位置。
 * 無公開保費 → 虛線 + amber chip「官網即時報價」。
 */
export default function PriceRangeBar({
  product,
  spectrum,
  className,
}: {
  product: Product;
  /** 可選：外部預先計好嘅光譜；唔畀就自動用全類別計 */
  spectrum?: PremiumSpectrum | null;
  className?: string;
}) {
  const categoryProducts = useProducts(product.category);
  const autoSpectrum = useMemo(
    () => categorySpectrum(categoryProducts),
    [categoryProducts],
  );
  const spec = spectrum !== undefined ? spectrum : autoSpectrum;

  const range = useMemo(() => {
    if (!product.premium_available) return null;
    const amounts = parsePremiumAmounts(product.premium_range);
    if (amounts.length === 0) return null;
    return { min: Math.min(...amounts), max: Math.max(...amounts) };
  }, [product]);

  // 最低價係月繳／日繳時喺金額旁標明單位（同年繳價並排唔會誤導）
  const unitHint = product.premium_available ? premiumUnitHint(product.premium_range) : null;
  const unitSuffix = unitHint === "按月繳計" ? "/月" : unitHint === "按日繳計" ? "/日" : "";

  const color = categoryColor(product.category);

  const pos = (n: number): number => {
    if (!spec) return 0;
    const lo = Math.log(spec.min);
    const hi = Math.log(spec.max);
    const v = Math.log(Math.max(spec.min, Math.min(spec.max, n)));
    return ((v - lo) / (hi - lo)) * 100;
  };

  if (!range || !spec) {
    return (
      <div className={cn("flex h-16 flex-col justify-center gap-2", className)} title={product.premium_range}>
        <div className="border-t border-dashed" style={{ borderColor: "var(--line-strong)" }} />
        <span className="chip w-fit bg-amber-wash font-bold text-amber">
          官網即時報價
        </span>
      </div>
    );
  }

  const left = pos(range.min);
  const width = Math.max(pos(range.max) - left, 2);

  return (
    <div className={cn("flex h-16 flex-col justify-end gap-1", className)} title={product.premium_range}>
      <div className="relative h-6">
        {/* 底線 */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2" style={{ background: "var(--line-strong)" }} />
        {/* 類別色範圍段（尺規生長動畫） */}
        <motion.div
          className="absolute top-1/2 h-[5px] origin-left -translate-y-1/2 rounded-full"
          style={{ left: `${left}%`, width: `${width}%`, background: color }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        />
        {/* 端點 */}
        <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-paper" style={{ left: `${left}%`, borderColor: color }} />
        <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-paper" style={{ left: `${left + width}%`, borderColor: color }} />
      </div>
      <div className="flex items-baseline justify-between font-grotesk text-[13px] font-medium text-ink-soft">
        <span>
          {formatHKD(range.min)}
          {unitSuffix && <span className="font-sans text-[11px] text-ink-faint">{unitSuffix}</span>}
        </span>
        {range.max !== range.min && <span>{formatHKD(range.max)}</span>}
      </div>
    </div>
  );
}

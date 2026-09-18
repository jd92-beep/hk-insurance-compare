import type { Product } from "@/types/insurance";
import type { PremiumSpectrum } from "@/lib/categories";
import { cn } from "@/lib/utils";

/** Compatibility entrypoint: a quote-basis notice replaces the misleading cross-product price ruler. */
export default function PriceRangeBar({ product, className }: {
  product: Product;
  spectrum?: PremiumSpectrum | null;
  className?: string;
}) {
  return <div className={cn("rounded-lg border border-line bg-paper-2/60 px-3 py-2 text-sm leading-relaxed", className)}>
    <p className="font-semibold text-ink">{product.premium_available ? "有參考保費資料" : "保費需個別報價"}</p>
    <p className="text-ink-soft">要按年齡、計劃及保障期核對，唔可以直接比價。</p>
  </div>;
}

import type { Product } from "@/types/insurance";
import { quotePathway } from "@/lib/quote-pathway";
import { cn } from "@/lib/utils";

/** Compatibility entrypoint: snapshot premium context + official quote pathway (no live quote). */
export default function PriceRangeBar({ product, className }: {
  product: Product;
  spectrum?: unknown;
  className?: string;
}) {
  const pathway = quotePathway(product);
  return (
    <div className={cn("rounded-lg border border-line bg-paper-2/60 px-3 py-2 text-sm leading-relaxed", className)}>
      <p className="font-semibold text-ink">{pathway.headline}</p>
      <p className="text-ink-soft">{pathway.snapshotText || "未提供公開保費文字。"}</p>
      <p className="mt-1 text-xs text-ink-faint">{pathway.disclaimer}</p>
      {pathway.buyUrl && pathway.buyLabel && (
        <a
          href={pathway.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-jade underline"
        >
          {pathway.buyLabel}
        </a>
      )}
    </div>
  );
}

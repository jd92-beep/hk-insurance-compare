import { ExternalLink } from "lucide-react";
import type { Product } from "@/types/insurance";
import { quotePathway } from "@/lib/quote-pathway";
import { cn } from "@/lib/utils";

/** Compatibility entrypoint: snapshot premium context + official quote pathway (no live quote). */
export default function PriceRangeBar({
  product,
  className,
}: {
  product: Product;
  spectrum?: unknown;
  className?: string;
}) {
  const pathway = quotePathway(product);
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-paper-2/60 p-3 text-xs leading-relaxed",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-ink text-[12px]">{pathway.headline}</span>
        {pathway.buyUrl && pathway.buyLabel && (
          <a
            href={pathway.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-jade hover:underline text-xs"
          >
            <span>{pathway.buyLabel}</span>
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        )}
      </div>
      <p className="mt-1 font-grotesk font-medium text-ink leading-normal">
        {pathway.snapshotText || "未提供公開保費文字，請向保險公司查詢。"}
      </p>
      <p className="mt-1.5 text-[11px] text-ink-faint border-t border-line/50 pt-1">
        {pathway.disclaimer}
      </p>
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types/insurance";
import { MOTION } from "@/lib/motion-runtime";
import {
  QUOTE_PREP_ITEMS,
  quotePathway,
} from "@/lib/quote-pathway";
import { cn } from "@/lib/utils";

/**
 * Official-quote pathway card.
 * Shows snapshot premium text only as catalogue reference + how to get a real
 * insurer quote. Never calculates, estimates, or caches live premiums.
 */
export default function QuotePathwayCard({
  product,
  className,
  compact = false,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  const pathway = quotePathway(product);

  return (
    <motion.section
      aria-label="官方報價途徑"
      initial={{ opacity: 0, y: MOTION.enterY * 0.6, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={MOTION.springSoft}
      className={cn("rounded-card border border-jade/25 bg-jade/5 p-5 md:p-6", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-jade">OFFICIAL QUOTE PATH · 官方報價途徑</p>
          <h3 className="mt-2 font-serif text-xl font-bold text-ink md:text-2xl">{pathway.headline}</h3>
        </div>
        {pathway.buyUrl && pathway.buyLabel && (
          <a
            href={pathway.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[10px] bg-red px-4 text-small font-bold text-paper shadow-xs transition-all hover:scale-105 hover:bg-red-deep active:scale-95"
            title="報價結果以保險公司為準"
          >
            {pathway.buyLabel}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-amber/35 bg-amber/5 p-4">
        <p className="mt-0 text-sm leading-relaxed text-ink-soft">{pathway.disclaimer}</p>
      </div>

      {pathway.snapshotText && (
        <div className="mt-4">
          <p className="text-small font-bold text-ink-soft">
            快照保費文字（唔係你嘅報價）
            {pathway.hasAgeTable && ` · ${pathway.ageTableRowCount} 行年齡表見上方`}
          </p>
          <p className="mt-2 rounded-xl border border-line bg-paper px-4 py-3 text-[15px] leading-relaxed text-ink">
            {pathway.snapshotText}
          </p>
        </div>
      )}

      {pathway.notes && !compact && (
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pathway.notes}</p>
      )}

      {!compact && (
        <div className="mt-5">
          <h4 className="text-base font-bold text-ink">官網報價前準備</h4>
          <ul className="mt-3 grid grid-cols-1 gap-2 fold:grid-cols-2">
            {QUOTE_PREP_ITEMS.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: MOTION.duration.fast, delay: index * 0.03 }}
                className="rounded-lg border border-line bg-paper px-3 py-2.5"
              >
                <span className="block text-sm font-bold text-ink">{item.label}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        {!pathway.buyUrl && "暫無安全官方報價連結；請向公司或持牌中介人查詢。"}
      </p>
    </motion.section>
  );
}

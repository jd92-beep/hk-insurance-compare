import { motion } from "framer-motion";
import type { Product } from "@/types/insurance";
import PriceRangeBar from "@/components/PriceRangeBar";
import PremiumChip from "@/components/product/PremiumChip";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import CitationRef from "@/components/product/citation/CitationRef";
import type { CitationEntry } from "@/components/product/citation/citation-utils";

/**
 * S2.2 保費資料：--paper-2 紙卡（左 4px 類別色邊）。
 * premium_range / premium_notes 原樣呈現；有公開保費 → 附對數尺規。
 * 標題旁可掛引文標記（citationEntries）。
 */
export default function PremiumSection({
  product,
  color,
  citationEntries,
}: {
  product: Product;
  color: string;
  citationEntries?: CitationEntry[];
}) {
  return (
    <div>
      <SectionHeading
        index="02"
        title="保費資料"
        aside={citationEntries && <CitationRef entries={citationEntries} />}
      />
      <motion.div
        initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
        whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
        viewport={{ once: true, margin: "-18% 0px" }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        className="rounded-card bg-paper-2 p-8"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-sans text-[18px] font-bold text-ink">保費範圍</h3>
          <PremiumChip available={product.premium_available} />
        </div>

        <p className="mt-4 font-sans text-[18px] font-medium leading-[1.7] text-ink">
          {product.premium_range}
        </p>
        {product.premium_notes && (
          <p className="mt-3 max-w-[38em] text-[15px] leading-[1.8] text-ink-soft">
            {product.premium_notes}
          </p>
        )}

        {product.premium_available && (
          <div className="mt-6">
            <PriceRangeBar product={product} />
            <p className="mt-1 text-small text-ink-faint">
              尺規顯示此產品保費範圍喺同類產品光譜（對數刻度）上嘅位置，僅供參考。
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

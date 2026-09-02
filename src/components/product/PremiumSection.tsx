import { motion } from "framer-motion";
import type { Product } from "@/types/insurance";
import PriceRangeBar from "@/components/PriceRangeBar";
import PremiumChip from "@/components/product/PremiumChip";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import CitationRef from "@/components/product/citation/CitationRef";
import type { CitationEntry } from "@/components/product/citation/citation-utils";
import { parsePremiumCurve } from "@/components/product/vhis-utils";

/**
 * S2.2 保費資料：--paper-2 紙卡（左 4px 類別色邊）。
 * premium_range / premium_notes 原樣呈現；有公開保費 → 附對數尺規。
 * premium_notes 以「官方標準保費（年繳，港元）：」開頭 → parse 出年齡保費表，
 * 任何格式不符自動 fallback 純文字。標題旁可掛引文標記（citationEntries）。
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
  const curve = parsePremiumCurve(product.premium_notes);

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
        className="rounded-card bg-paper-2 p-8 max-md:p-6"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-sans text-[18px] font-bold text-ink">保費範圍</h3>
          <PremiumChip available={product.premium_available} />
        </div>

        <p className="mt-4 font-sans text-[18px] font-medium leading-[1.7] text-ink">
          {product.premium_range}
        </p>

        {curve ? (
          <div className="mt-5">
            <p className="mb-2.5 text-small font-bold text-ink-soft">
              官方標準保費（年繳，港元）
            </p>
            <div
              className="overflow-hidden rounded-card border bg-paper"
              style={{ borderColor: "var(--line)" }}
            >
              <table className="w-full border-collapse text-left text-[14.5px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
                    <th className="bg-paper-3 px-4 py-2.5 text-small font-bold text-ink-soft">
                      年齡
                    </th>
                    <th className="bg-paper-3 px-4 py-2.5 text-right text-small font-bold text-ink-soft">
                      男性
                    </th>
                    <th className="bg-paper-3 px-4 py-2.5 text-right text-small font-bold text-ink-soft">
                      女性
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {curve.rows.map((row) => (
                    <tr
                      key={row.age}
                      className="border-b transition-colors duration-200 last:border-b-0 hover:bg-paper-2"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <td className="px-4 py-2.5 font-medium text-ink">{row.age} 歲</td>
                      <td className="px-4 py-2.5 text-right font-grotesk font-bold text-ink">
                        HK${row.male}
                      </td>
                      <td className="px-4 py-2.5 text-right font-grotesk font-bold text-ink">
                        HK${row.female}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {curve.tail && (
              <p className="mt-3 max-w-[38em] text-[15px] leading-[1.8] text-ink-soft">
                {curve.tail}
              </p>
            )}
          </div>
        ) : (
          product.premium_notes && (
            <p className="mt-3 max-w-[38em] text-[15px] leading-[1.8] text-ink-soft">
              {product.premium_notes}
            </p>
          )
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

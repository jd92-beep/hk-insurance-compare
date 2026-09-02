import { motion } from "framer-motion";
import type { CoverageItem } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import CitationRef from "@/components/product/citation/CitationRef";
import type { CitationEntry } from "@/components/product/citation/citation-utils";
import { cn } from "@/lib/utils";

/** 標準計劃保障表分組：限額行置頂，靈活計劃級別排尾，其餘為基本保障 */
const LIMIT_ITEMS = new Set(["每年保障限額", "終身保障限額"]);
const FLEXI_ITEM = "靈活計劃保障級別";

function groupBenefitRows(coverage: CoverageItem[]): { label: string; rows: CoverageItem[] }[] {
  const limits = coverage.filter((c) => LIMIT_ITEMS.has(c.item));
  const flexi = coverage.filter((c) => c.item === FLEXI_ITEM);
  const basic = coverage.filter((c) => !LIMIT_ITEMS.has(c.item) && c.item !== FLEXI_ITEM);
  return [
    { label: "保障限額", rows: limits },
    { label: "基本保障", rows: basic },
    { label: "靈活計劃", rows: flexi },
  ].filter((g) => g.rows.length > 0);
}

/**
 * S2.1 保障一覽。
 * 預設：左保障項目 + 右賠償上限，髮線分行（附錄 3）。
 * standardTable（自願醫保標準計劃規格）：分組 definition 表卡
 * （保障限額 → 基本保障 → 靈活計劃），「每年保障限額」headline 行 jade 強調。
 * 標題旁可掛引文標記（citationEntries）。
 */
export default function CoverageSection({
  coverage,
  standardTable = false,
  citationEntries,
}: {
  coverage: CoverageItem[];
  standardTable?: boolean;
  citationEntries?: CitationEntry[];
}) {
  return (
    <div>
      <SectionHeading
        index="01"
        title="保障一覽"
        aside={citationEntries && <CitationRef entries={citationEntries} />}
      />
      {standardTable ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-18% 0px" }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="overflow-hidden rounded-card border bg-paper shadow-card"
          style={{ borderColor: "var(--line)" }}
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
                <th className="bg-paper-2 px-5 py-3 text-small font-bold text-ink-soft">
                  保障項目
                </th>
                <th className="bg-paper-2 px-5 py-3 text-right text-small font-bold text-ink-soft">
                  賠償限額
                </th>
              </tr>
            </thead>
            {groupBenefitRows(coverage).map((group) => (
              <tbody key={group.label}>
                <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                  <td
                    colSpan={2}
                    className="bg-paper-2/60 px-5 pb-1.5 pt-3 text-[11px] font-bold tracking-[0.1em] text-ink-faint"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.rows.map((c, i) => {
                  const headline = c.item === "每年保障限額";
                  return (
                    <tr
                      key={`${c.item}-${i}`}
                      className={cn(
                        "border-b transition-colors duration-200 last:border-b-0",
                        headline ? "bg-jade-wash/60" : "hover:bg-paper-2",
                      )}
                      style={{ borderColor: "var(--line)" }}
                    >
                      <td
                        className={cn(
                          "px-5 py-3.5 align-top font-sans text-[15px] leading-[1.7]",
                          headline ? "font-bold text-ink" : "font-medium text-ink",
                        )}
                      >
                        {c.item}
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3.5 text-right align-top text-[15px] leading-[1.7]",
                          headline
                            ? "font-grotesk text-[16px] font-bold text-jade"
                            : "text-ink-soft",
                        )}
                      >
                        {c.limit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </motion.div>
      ) : (
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-18% 0px" }}
          transition={{ staggerChildren: 0.05 }}
          className="hairline-t"
        >
          {coverage.map((c, i) => (
            <motion.li
              key={`${c.item}-${i}`}
              variants={{
                hidden: { opacity: 0, x: -16 },
                show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
              }}
              className="hairline-b flex flex-col gap-1 px-2 py-4 transition-colors duration-300 hover:bg-paper-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
            >
              <span className="font-sans text-[16px] font-medium leading-[1.7] text-ink">
                {c.item}
              </span>
              <span className="text-[15px] leading-[1.7] text-ink-soft sm:max-w-[60%] sm:shrink-0 sm:text-right">
                {c.limit}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      )}
      {standardTable && (
        <p className="mt-3 text-small text-ink-faint">
          自願醫保標準計劃保障由政府劃一釐定，各認可產品基本保障完全相同。
        </p>
      )}
    </div>
  );
}

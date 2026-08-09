import { motion } from "framer-motion";
import type { CoverageItem } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";

/**
 * S2.1 保障項目：左保障項目 + 右賠償上限，髮線分行。
 * 右欄 max-width 60%，長文自動折行（附錄 3）。
 */
export default function CoverageSection({ coverage }: { coverage: CoverageItem[] }) {
  return (
    <div>
      <SectionHeading index="01" title="保障項目" />
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
    </div>
  );
}

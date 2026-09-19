import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import CitationRef from "@/components/product/citation/CitationRef";
import type { CitationEntry } from "@/components/product/citation/citation-utils";
import ExclusionThemes from "@/components/product/ExclusionThemes";
import AgeReductionNotice from "@/components/product/AgeReductionNotice";
import type { CoverageItem } from "@/types/insurance";
import { cn } from "@/lib/utils";

/**
 * S2.5 不保事項：--amber-wash 提示卡（左 4px amber 邊）。
 * exclusions 原樣呈現。標題上方掛中立主題檢索 + 年齡字眼提示（非阻擋）。
 */
export default function ExclusionsSection({
  exclusions,
  keyTerms,
  coverage,
  citationEntries,
}: {
  exclusions: string[];
  keyTerms?: string[];
  coverage?: CoverageItem[];
  citationEntries?: CitationEntry[];
}) {
  const themeSource = { exclusions, key_terms: keyTerms, coverage };

  return (
    <div>
      <SectionHeading
        index="05"
        title="不保事項"
        aside={citationEntries && <CitationRef entries={citationEntries} />}
      />
      <div className="mb-6 space-y-4">
        <ExclusionThemes product={themeSource} />
        <AgeReductionNotice product={themeSource} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-18% 0px" }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        className="rounded-card bg-amber-wash p-8"
        style={{ borderLeft: "4px solid var(--amber)" }}
      >
        <p className="flex items-start gap-2 text-small text-ink-soft">
          <TriangleAlert size={16} className="mt-[2px] shrink-0 text-amber" aria-hidden="true" />
          節錄；完整不保以保單條款為準。主題檢索唔代表已證實不保。
        </p>
        <ul
          className={cn(
            "mt-4 flex flex-col gap-3",
            exclusions.length >= 4 && "sm:grid sm:grid-cols-2 sm:gap-x-8",
          )}
        >
          {exclusions.map((e, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-[1.8] text-ink">
              <span
                className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber"
                aria-hidden="true"
              />
              {e}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

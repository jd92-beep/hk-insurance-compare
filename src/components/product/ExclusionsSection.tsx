import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import CitationRef from "@/components/product/citation/CitationRef";
import type { CitationEntry } from "@/components/product/citation/citation-utils";

/**
 * S2.5 不保事項：--amber-wash 提示卡（左 4px amber 邊）。
 * exclusions 原樣呈現。標題旁可掛引文標記（citationEntries）。
 */
export default function ExclusionsSection({
  exclusions,
  citationEntries,
}: {
  exclusions: string[];
  citationEntries?: CitationEntry[];
}) {
  return (
    <div>
      <SectionHeading
        index="05"
        title="不保事項"
        aside={citationEntries && <CitationRef entries={citationEntries} />}
      />
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
          以下為節錄，完整不保事項以保單條款為準。
        </p>
        <ul className="mt-4 flex flex-col gap-3">
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

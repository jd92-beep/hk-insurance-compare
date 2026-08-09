import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import SectionHeading, {
  EASE_IN_OUT_QUART,
  EASE_OUT_EXPO,
} from "@/components/product/SectionHeading";
import CitationRef from "@/components/product/citation/CitationRef";
import type { CitationEntry } from "@/components/product/citation/citation-utils";
import { cn } from "@/lib/utils";

const PREVIEW_LEN = 40;
const QUART_CSS = `cubic-bezier(${EASE_IN_OUT_QUART.join(",")})`;

/**
 * S2.4 主要條款：多開手風琴；預設首條展開，
 * 其餘收合顯示前 40 字；左側紅色「§」；「+」旋轉 45°。
 * 展開態顯示 JSON 完整原文，唔截斷。
 */
export default function KeyTermsSection({
  terms,
  citationEntries,
}: {
  terms: string[];
  citationEntries?: CitationEntry[];
}) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div>
      <SectionHeading
        index="04"
        title="主要條款"
        aside={citationEntries && <CitationRef entries={citationEntries} />}
      />
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ staggerChildren: 0.06 }}
        className="hairline-t"
      >
        {terms.map((term, i) => {
          const isOpen = open.has(i);
          const preview =
            term.length > PREVIEW_LEN ? `${term.slice(0, PREVIEW_LEN)}…` : term;
          return (
            <motion.li
              key={i}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
              }}
              className="hairline-b"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-4 px-2 py-4 text-left transition-colors duration-300 hover:bg-paper-2"
              >
                <span
                  className="mt-[1px] shrink-0 font-serif text-[18px] font-bold leading-[1.6] text-red"
                  aria-hidden="true"
                >
                  §
                </span>
                <span className="flex-1 text-[15px] leading-[1.8] text-ink">
                  {/* 收合：前 40 字預覽 */}
                  <span
                    className={cn(
                      "grid transition-all",
                      isOpen ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
                    )}
                    style={{ transitionDuration: "350ms", transitionTimingFunction: QUART_CSS }}
                  >
                    <span className="block overflow-hidden">{preview}</span>
                  </span>
                  {/* 展開：完整原文 */}
                  <span
                    className={cn(
                      "grid transition-all",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                    style={{ transitionDuration: "350ms", transitionTimingFunction: QUART_CSS }}
                  >
                    <span className="block overflow-hidden">{term}</span>
                  </span>
                </span>
                <Plus
                  size={18}
                  className={cn(
                    "mt-1 shrink-0 text-ink-soft transition-transform duration-300",
                    isOpen && "rotate-45 text-red",
                  )}
                  aria-hidden="true"
                />
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
      <p className="mt-3 text-small text-ink-faint">
        以上為官方文件節錄，完整條款以保單原文為準。
      </p>
    </div>
  );
}

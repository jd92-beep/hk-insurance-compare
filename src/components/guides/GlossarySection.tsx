import { useState } from "react";
import { motion } from "framer-motion";
import { GLOSSARY, GLOSSARY_FILTERS } from "@/components/guides/guides-data";
import type { GlossaryTag } from "@/components/guides/guides-data";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * 保險詞彙表（guides.md S3）：墨藍深色段，字典卡網格 + 分類篩選 chips。
 */
export default function GlossarySection() {
  const [filter, setFilter] = useState<GlossaryTag | "全部">("全部");
  const terms = filter === "全部" ? GLOSSARY : GLOSSARY.filter((t) => t.tag === filter);

  return (
    <section className="bg-ink py-20 text-paper md:py-28">
      <div className="mx-auto w-full max-w-[1080px] px-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <p className="eyebrow text-red">GLOSSARY · 詞彙表</p>
          <h2 className="display-2 mt-4 text-paper">詞彙表，講人話。</h2>
          <p className="mt-5 max-w-[38em] text-paper/70">
            保單條款入面嘅術語，用香港人聽得明嘅講法解一次。
          </p>
        </motion.div>

        {/* 分類篩選 chips */}
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="詞彙分類篩選">
          {GLOSSARY_FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={active}
                className={cn(
                  "chip border transition-colors duration-300",
                  active
                    ? "border-red bg-red text-paper"
                    : "border-white/20 bg-transparent text-paper/70 hover:border-white/40 hover:text-paper",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* 字典卡網格 */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2" key={filter}>
          {terms.map((term, i) => (
            <motion.div
              key={term.term}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.55, delay: Math.min(i, 5) * 0.05, ease: EASE_OUT_EXPO }}
              className="rounded-[12px] border border-white/[0.12] bg-paper/[0.08] p-6 transition-colors duration-300 hover:border-white/30"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-serif text-[18px] font-bold text-paper">{term.term}</h3>
                <span className="font-grotesk text-[12px] font-medium uppercase tracking-[0.08em] text-red">
                  {term.en}
                </span>
                <span className="ml-auto rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-paper/50">
                  {term.tag}
                </span>
              </div>
              <p className="mt-2.5 text-small text-paper/80">{term.definition}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

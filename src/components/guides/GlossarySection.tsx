import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Quote } from "lucide-react";
import { GLOSSARY, GLOSSARY_FILTERS } from "@/components/guides/guides-data";
import type { GlossaryTag, GlossaryTerm } from "@/components/guides/guides-data";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** 單張術語卡：hover 浮起＋點擊展開例句 */
function GlossaryCard({ term, index }: { term: GlossaryTerm; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.55, delay: Math.min(index, 5) * 0.05, ease: EASE_OUT_EXPO }}
      className={cn(
        "rounded-[12px] border bg-paper/[0.08] p-6 transition-all duration-300",
        open
          ? "border-red/50 bg-paper/[0.12]"
          : "border-white/[0.12] hover:-translate-y-0.5 hover:border-white/30 hover:bg-paper/[0.12]",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-col text-left"
      >
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-serif text-[18px] font-bold text-paper">{term.term}</h3>
          <span className="font-grotesk text-[12px] font-medium uppercase tracking-[0.08em] text-red">
            {term.en}
          </span>
          <span className="ml-auto flex items-center gap-2">
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-paper/50">
              {term.tag}
            </span>
            <ChevronDown
              size={15}
              className={cn(
                "text-paper/50 transition-transform duration-300",
                open && "rotate-180 text-red",
              )}
              aria-hidden="true"
            />
          </span>
        </span>
        <span className="mt-2.5 block text-small text-paper/80">{term.definition}</span>
        <span
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-[12px] font-medium transition-colors",
            open ? "text-red" : "text-paper/40",
          )}
        >
          <Quote size={11} aria-hidden="true" />
          {open ? "收合例句" : "睇例句"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="example"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <p className="mt-3 border-l-2 border-red pl-3.5 pt-1 text-small italic leading-[1.8] text-paper/85">
              {term.example}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
            保單條款入面嘅術語，用香港人聽得明嘅講法解一次。點卡可以睇例句。
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
            <GlossaryCard key={term.term} term={term} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

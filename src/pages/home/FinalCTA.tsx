import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { scrollToElement } from "@/lib/lenis";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const TITLE_WORDS = ["投保之前，", "先格一格價。"];

/** S8 終段 CTA —「而家開始格價」 */
export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-paper to-paper-2 py-28 md:py-40">
      <motion.img
        src="/stamp-seal.svg"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.04 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 1.2 }}
        className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2"
      />
      <div className="site-container relative flex flex-col items-center text-center">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-22% 0px" }}
          transition={{ staggerChildren: 0.06 }}
          className="display-2 text-ink"
        >
          {TITLE_WORDS.map((w) => (
            <motion.span
              key={w}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
              }}
            >
              {w}
            </motion.span>
          ))}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-22% 0px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
          className="mt-5 text-ink-soft"
        >
          9 大類別 · 85 份產品 · 27 間公司，全部有官方出處。
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-22% 0px" }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <button type="button" onClick={() => scrollToElement("#categories-grid")} className="btn-primary group">
            開始比較
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <Link to="/insurers" className="btn-ghost">
            瀏覽保險公司名錄
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

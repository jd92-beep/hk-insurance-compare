import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router";
import { CATEGORY_ORDER } from "@/lib/categories";
import { DoodleLeaf, SunMark } from "@/components/fx/Sketch";
import { Parallax, Sticker } from "@/components/fx/Depth";
import { PalmArt, SuitcaseArt } from "@/components/fx/StickerArt";

const EASE = [0.22, 1, 0.36, 1] as const;
const TERMS = ["自負額", "等候期", "不保事項", "保證續保", "全數賠償"];

/** S7 指南 — 一本會自己打開嘅立體書 */
export default function GuidesTeaser() {
  return (
    <section className="pb-24 md:pb-32">
      <div className="site-container">
        <div className="relative mx-auto max-w-[1040px]" style={{ perspective: "1800px" }}>
          <Parallax speed={0.55} className="pointer-events-none absolute -left-6 -top-14 z-30 w-20 md:w-24">
            <Sticker tilt={-10}><SuitcaseArt className="h-auto w-full" /></Sticker>
          </Parallax>
          <Parallax speed={0.25} className="pointer-events-none absolute -bottom-10 right-[46%] z-30 hidden w-20 md:block">
            <Sticker tilt={8}><PalmArt className="h-auto w-full" /></Sticker>
          </Parallax>
          <div className="relative grid grid-cols-1 md:grid-cols-2">
            {/* book block: page edges give the closed side real thickness */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-1 -bottom-3 top-3 rounded-[26px]"
              style={{ background: "repeating-linear-gradient(180deg, #FFFFFF 0 2px, #E7E3DC 2px 3px)", boxShadow: "0 3px 0 #8A6BC4, 0 6px 0 #6F55A3, 0 30px 50px -22px rgba(40,30,20,.45)" }}
            />
            {/* left page */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.8, ease: EASE }}
              className="depth-card relative rounded-[24px] border p-8 md:rounded-r-none md:p-12"
            >
              <p className="font-hand text-[26px] font-bold text-[#8A6BC4]">little guidebook</p>
              <h3 className="mt-1 font-serif text-[32px] font-bold leading-[1.25] text-ink">條款睇唔明？</h3>
              <p className="mt-3 text-ink-soft">{CATEGORY_ORDER.length} 類保險指南，附詞彙表。</p>
              <Link to="/guides" className="btn-primary group mt-7">
                睇投保指南
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <DoodleLeaf className="absolute bottom-6 right-8 h-12 w-12 rotate-12" style={{ color: "#A9D28F" }} />
            </motion.div>

            {/* right page: flips open from the spine */}
            <motion.div
              initial={{ rotateY: -150, opacity: 0.4 }}
              whileInView={{ rotateY: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
              style={{ transformOrigin: "0% 50%", transformStyle: "preserve-3d" }}
              className="depth-card relative hidden overflow-hidden rounded-[24px] rounded-l-none border p-10 md:block"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 33px, rgba(138,107,196,.18) 33px 34px)" }}
                aria-hidden="true"
              />
              <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[rgba(120,80,30,.14)] to-transparent" aria-hidden="true" />
              <SunMark className="absolute -right-6 -top-6 h-28 w-28" />
              <p className="relative flex items-center gap-2 font-serif text-[18px] font-bold text-ink">
                <BookOpen size={18} className="text-[#8A6BC4]" /> 詞彙小抄
              </p>
              <ul className="relative mt-5 flex flex-col gap-3">
                {TERMS.map((t, i) => (
                  <motion.li
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 + i * 0.12 }}
                    className="flex items-center gap-3 font-hand text-[24px] font-bold text-ink-soft"
                  >
                    <span className="h-2.5 w-2.5 rotate-45 rounded-sm bg-amber" aria-hidden="true" />
                    {t}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

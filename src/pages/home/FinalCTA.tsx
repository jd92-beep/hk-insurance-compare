import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { lazy, Suspense, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { scrollToElement } from "@/lib/lenis";
import { PHOTO_CREDITS, SUNSET_PHOTO } from "@/lib/landing-photos";
import Magnetic from "@/components/Magnetic";
import { WashEdge } from "@/components/fx/Sketch";
import { Parallax, Sticker } from "@/components/fx/Depth";
import { HeartArt, ShieldArt, SunArt } from "@/components/fx/StickerArt";

const PaintingCanvas = lazy(() => import("@/components/fx/three/PaintingCanvas"));
const EASE = [0.22, 1, 0.36, 1] as const;
const TITLE_WORDS = ["投保之前，", "先格一格價。"];

/** S8 終段 CTA — 峇里日出梯田：捲到先由鉛筆起稿，再由太陽位置暈開水彩 */
export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const reduced = useReducedMotion();
  // painting lags behind, copy rises faster: two depth planes
  const artY = useTransform(scrollYProgress, [0, 1], [-90, 40]);
  const copyY = useTransform(scrollYProgress, [0, 1], [120, -20]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <WashEdge className="absolute inset-x-0 top-0 z-10 rotate-180" />
      <div className="relative min-h-[88svh]">
        <motion.div className="absolute -inset-y-16 inset-x-0" style={reduced ? undefined : { y: artY }}>
        <Suspense fallback={null}>
          <PaintingCanvas
            src={SUNSET_PHOTO.src()}
            alt={SUNSET_PHOTO.alt}
            focus={{ landscape: [0.5, 0.42], portrait: [0.55, 0.42] }}
            sun={[0.7, 0.62]}
            washOrigin={[0.6, 0.45]}
            fade={{ landscape: [0, -1, 0.45], portrait: [0, -1, 0.6] }}
            playOnView
          />
        </Suspense>
        </motion.div>
        <Parallax speed={0.9} className="pointer-events-none absolute left-[8%] top-[30%] z-20 w-20 md:w-28">
          <Sticker tilt={-10}><SunArt className="h-auto w-full" /></Sticker>
        </Parallax>
        <Parallax speed={0.5} className="pointer-events-none absolute right-[10%] top-[24%] z-20 w-14 md:w-20">
          <Sticker tilt={12}><HeartArt className="h-auto w-full" /></Sticker>
        </Parallax>
        <Parallax speed={0.7} className="pointer-events-none absolute bottom-[22%] right-[22%] z-20 hidden w-16 md:block">
          <Sticker tilt={-6}><ShieldArt className="h-auto w-full" /></Sticker>
        </Parallax>
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(252,252,250,.92) 0%, rgba(252,252,250,.6) 30%, transparent 55%)" }} aria-hidden="true" />

        <motion.div style={reduced ? undefined : { y: copyY }} className="site-container relative z-10 flex flex-col items-center pt-28 text-center md:pt-32">
          <p className="font-hand text-[28px] font-bold text-red">bon voyage ☀</p>
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-22% 0px" }}
            transition={{ staggerChildren: 0.1 }}
            className="display-2 text-ink"
          >
            {TITLE_WORDS.map((w) => (
              <motion.span
                key={w}
                className="inline-block"
                variants={{ hidden: { opacity: 0, y: 24, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } } }}
              >
                {w}
              </motion.span>
            ))}
          </motion.h2>
          <p className="mt-4 text-ink-soft">摘要到來源原文，一處睇清；剩低嘅時間，留俾假期同屋企人。</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <button type="button" onClick={() => scrollToElement("#categories-grid")} className="btn-primary group">
                開始比較
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <Link to="/insurers" className="btn-ghost">公司名錄</Link>
          </div>
        </motion.div>
      </div>
      <WashEdge className="absolute inset-x-0 bottom-0 z-10" />
      <details className="site-container relative z-10 -mt-2 pb-6 text-[12px] text-ink-faint">
        <summary className="cursor-pointer select-none">插畫創作及造型參考</summary>
        <p className="mt-2 leading-relaxed">{PHOTO_CREDITS.join(" · ")}</p>
      </details>
    </section>
  );
}

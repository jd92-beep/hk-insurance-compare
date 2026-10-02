import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useCategories, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";
import { useSearch } from "@/providers/SearchProvider";
import { scrollToElement } from "@/lib/lenis";
import { DESTINATIONS, destinationPhoto } from "@/lib/landing-photos";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/Magnetic";
import { PencilCircle, WashEdge } from "@/components/fx/Sketch";
import { Sticker } from "@/components/fx/Depth";
import { CameraArt, PlaneArt, StampArt, SuitcaseArt, SunglassesArt } from "@/components/fx/StickerArt";

/** three.js + the sketch shader live in their own chunk. */
const PaintingCanvas = lazy(() => import("@/components/fx/three/PaintingCanvas"));

const EASE = [0.22, 1, 0.36, 1] as const;

function Letters({ text, delay, className }: { text: string; delay: number; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * 0.06, duration: 0.7, ease: EASE }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/** a sticker on its own depth layer: scroll speed + pointer depth + slap-on intro */
function HeroSticker({
  progress,
  mx,
  my,
  speed,
  depth,
  driftX = 0,
  delay,
  tilt,
  className,
  children,
}: {
  progress: MotionValue<number>;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  speed: number;
  depth: number;
  driftX?: number;
  delay: number;
  tilt: number;
  className: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const y = useTransform(progress, [0, 1], [0, -speed]);
  const x = useTransform(progress, [0, 1], [0, driftX]);
  const ox = useTransform(mx, (v) => v * depth);
  const oy = useTransform(my, (v) => v * depth * 0.66);
  return (
    <motion.div className={`pointer-events-none absolute z-20 ${className}`} style={reduced ? undefined : { y, x }}>
      <motion.div
        style={reduced ? undefined : { x: ox, y: oy }}
        initial={{ scale: 0.2, rotate: tilt - 40, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay, type: "spring", stiffness: 260, damping: 14 }}
      >
        <Sticker tilt={tilt}>{children}</Sticker>
      </motion.div>
    </motion.div>
  );
}

/** S1 Hero — 度假勝地輪播：真實相片即時畫成鉛筆 + 水彩；換景時舊畫褪走、新畫重新起稿上色 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const search = useSearch();
  const categories = useCategories();
  const products = useProducts();
  const insurers = useInsurers();
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { amount: 0.3 });
  const [slide, setSlide] = useState(0);
  const dest = DESTINATIONS[slide];

  useEffect(() => {
    if (reduced || !inView) return;
    const t = window.setTimeout(() => setSlide((i) => (i + 1) % DESTINATIONS.length), 8500);
    return () => window.clearTimeout(t);
  }, [slide, reduced, inView]);

  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const copyY = useTransform(progress, [0, 1], [0, -120]);
  const copyO = useTransform(progress, [0, 0.7], [1, 0]);
  const artScale = useTransform(progress, [0, 1], [1, 1.08]);
  // every layer travels at its own speed: painting lags, copy lines peel apart, stickers fly fastest
  const artY = useTransform(progress, [0, 1], [0, 160]);
  const headY = useTransform(progress, [0, 1], [0, -40]);
  const ctaY = useTransform(progress, [0, 1], [0, -10]);
  const statY = useTransform(progress, [0, 1], [0, 30]);
  const capY = useTransform(progress, [0, 1], [0, -260]);
  // pointer depth: nearer stickers move more
  const mx = useSpring(0, { stiffness: 60, damping: 16 });
  const my = useSpring(0, { stiffness: 60, damping: 16 });
  const onPointer = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse") return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const stats = [
    { n: categories.length || "—", label: "大保險類別", color: "var(--red)" },
    { n: products.length || "—", label: "份官方產品檔案", color: "var(--jade)" },
    { n: insurers.length || "—", label: "間保險公司", color: "var(--sky)" },
  ];

  return (
    <section ref={rootRef} onPointerMove={onPointer} className="relative -mt-16 overflow-hidden" aria-labelledby="hero-title">
      {/* the painting */}
      <motion.div className="absolute inset-0 bg-paper" style={reduced ? undefined : { scale: artScale, y: artY }}>
        <Suspense fallback={null}>
          <PaintingCanvas
            src={destinationPhoto(dest)}
            alt={dest.alt}
            focus={dest.focus}
            sun={dest.sun}
            washOrigin={[0.72, 0.45]}
            fade={{ landscape: [1, 0, 0.95], portrait: [0, -1, 0.55] }}
            progress={progress}
          />
        </Suspense>
        {/* soft paper wash behind the copy so pencil lines never fight the text */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(70% 80% at 18% 45%, rgba(252,252,250,.82), rgba(252,252,250,.35) 55%, transparent 75%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{ background: "linear-gradient(180deg, rgba(252,252,250,.92) 0%, rgba(252,252,250,.8) 48%, transparent 70%)" }}
          aria-hidden="true"
        />
      </motion.div>

      <motion.div
        style={reduced ? undefined : { y: copyY, opacity: copyO }}
        className="site-container relative z-10 flex min-h-[100svh] flex-col justify-start pb-36 pt-28 md:justify-center md:pb-28"
      >
        <div className="max-w-[640px]">
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
            className="flex items-center gap-2 font-hand text-[24px] font-bold text-red"
          >
            <span aria-hidden="true">✈</span> summer holiday · 香港保險比較
          </motion.p>
          <motion.h1 style={reduced ? undefined : { y: headY }} id="hero-title" className="mt-3 font-serif text-[clamp(44px,6.2vw,92px)] font-bold leading-[1.08] text-ink" aria-label="去到邊度玩，保障都跟住。">
            <Letters text="去到邊度玩，" delay={0.25} />
            <br />
            <span>
              <Letters text="保障都" delay={0.6} />
              <span className="relative inline-block">
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-[-0.08em] bottom-[0.08em] h-[0.42em] origin-left -rotate-1 rounded-[40%_60%_50%_50%] bg-amber/75"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3, duration: 0.6, ease: EASE }}
                />
                <Letters text="跟住" delay={0.78} className="relative text-red" />
              </span>
              <Letters text="。" delay={0.9} />
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7, ease: EASE }}
            className="mt-6 max-w-[30em] text-[18px] font-medium leading-[1.75] text-ink-soft md:text-[20px]"
          >
            聖托里尼看日落、夏威夷游水、峇里做瑜伽——出發之前，旅遊到醫療逐項比較保障、價錢同限制，<span className="marker text-ink">附官方文件</span>。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7, ease: EASE }}
            style={reduced ? undefined : { y: ctaY }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <button type="button" onClick={() => scrollToElement("#categories-grid")} className="btn-primary group">
                開始比較
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <Link to="/categories" className="btn-ghost">全部類別</Link>
          </motion.div>
          <motion.button
            type="button"
            onClick={search.openSearch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-5 flex h-12 w-full max-w-[460px] items-center gap-3 rounded-full border-2 border-dashed bg-paper/80 px-5 text-left backdrop-blur-sm transition-colors hover:border-solid hover:bg-white"
            style={{ borderColor: "var(--line-strong)" }}
          >
            <Search size={18} className="shrink-0 text-ink-faint" />
            <span className="flex-1 truncate text-[15px] text-ink-faint">搜尋公司或產品</span>
            <kbd className="shrink-0 rounded-md border bg-paper-2 px-1.5 py-0.5 font-grotesk text-[11px] text-ink-faint" style={{ borderColor: "var(--line)" }}>⌘K</kbd>
          </motion.button>

          <motion.div style={reduced ? undefined : { y: statY }} className="mt-10 flex gap-8 md:gap-12">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + i * 0.12, duration: 0.5, ease: EASE }}
                className="relative"
              >
                <PencilCircle className="absolute -left-4 -top-3 h-[64px] w-[104px]" color={s.color} />
                <p className="relative font-grotesk text-[34px] font-extrabold leading-none md:text-[42px]" style={{ color: s.color }}>{s.n}</p>
                <p className="relative mt-2 text-[12.5px] leading-snug text-ink-soft">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
          {/* phones: leave room for the painting under the copy */}
          <div className="h-[38svh] md:hidden" aria-hidden="true" />
        </div>
      </motion.div>

      {/* sticker layer — drag them around; each sits at its own depth */}
      <HeroSticker progress={progress} mx={mx} my={my} speed={520} driftX={420} depth={46} delay={2.0} tilt={-8} className="left-[44%] top-[13%] hidden w-28 md:block">
        <PlaneArt className="h-auto w-full" />
      </HeroSticker>
      <HeroSticker progress={progress} mx={mx} my={my} speed={300} depth={26} delay={2.2} tilt={10} className="right-[6%] top-[74%] w-20 md:right-[22%] md:top-[58%] md:w-24">
        <StampArt className="h-auto w-full" text={`HKG → ${dest.iata}`} />
      </HeroSticker>
      <HeroSticker progress={progress} mx={mx} my={my} speed={420} depth={36} delay={2.4} tilt={-12} className="bottom-[16%] left-[46%] hidden w-24 lg:block">
        <SunglassesArt className="h-auto w-full" />
      </HeroSticker>
      <HeroSticker progress={progress} mx={mx} my={my} speed={220} depth={18} delay={2.6} tilt={6} className="right-[5%] top-[38%] hidden w-20 md:block">
        <SuitcaseArt className="h-auto w-full" />
      </HeroSticker>
      <HeroSticker progress={progress} mx={mx} my={my} speed={360} depth={30} delay={2.8} tilt={-6} className="bottom-[8%] left-[8%] w-16 md:hidden">
        <CameraArt className="h-auto w-full" />
      </HeroSticker>

      {/* destination caption (hand-lettered) */}
      <motion.div style={reduced ? undefined : { y: capY }} className="absolute right-[clamp(16px,4vw,48px)] top-24 z-10 hidden text-right md:block" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 10, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -3, transition: { delay: 0.9, duration: 0.6 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.3 } }}
            className="inline-block rounded-2xl bg-paper/75 px-5 py-2 shadow-card backdrop-blur-sm"
          >
            <p className="font-hand text-[40px] font-bold leading-none text-ink">{dest.script}</p>
            <p className="mt-1 font-serif text-[15px] font-bold text-ink-soft">📍 {dest.name}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="absolute bottom-20 right-[clamp(16px,4vw,48px)] z-10 flex flex-col items-end gap-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.6 }}
          className="pointer-events-none hidden rounded-full bg-paper/80 px-4 py-1 font-hand text-[21px] font-bold text-ink shadow-card backdrop-blur-sm md:block"
          aria-hidden="true"
        >
          ✎ 移動滑鼠，幫幅畫上色
        </motion.p>
        <div className="flex items-center gap-1.5 rounded-full bg-paper/80 px-2 py-1.5 shadow-card backdrop-blur-sm" role="tablist" aria-label="度假目的地">
          {DESTINATIONS.map((d, i) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={i === slide}
              aria-label={d.name}
              onClick={() => setSlide(i)}
              className={cn("rounded-full px-2 py-1 font-hand text-[18px] font-bold transition-colors md:px-3", i === slide ? "bg-red text-white" : "text-ink-soft hover:bg-amber-wash")}
            >
              <span className="hidden md:inline">{d.script}</span>
              <span className="md:hidden">{i === slide ? d.script : "•"}</span>
            </button>
          ))}
        </div>
        <p className="rounded-full bg-paper/70 px-2 text-[11px] text-ink-soft">
          相片：{dest.credit} / Unsplash · 即時手繪水彩重繪
        </p>
      </div>

      <WashEdge className="absolute inset-x-0 bottom-0 z-10" />
    </section>
  );
}

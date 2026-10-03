import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router";
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useCategories, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";
import { useSearch } from "@/providers/SearchProvider";
import { scrollToElement } from "@/lib/lenis";
import { HERO_SLIDES, slidePhoto, type StickerKind } from "@/lib/landing-photos";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/Magnetic";
import { PencilCircle, WashEdge } from "@/components/fx/Sketch";
import { Sticker } from "@/components/fx/Depth";
import {
  CameraArt,
  CarArt,
  CrossArt,
  FishArt,
  HeartArt,
  HelmetArt,
  HouseArt,
  KeyArt,
  PawArt,
  PlaneArt,
  ShieldArt,
  StampArt,
  SuitcaseArt,
  SunArt,
  SunglassesArt,
} from "@/components/fx/StickerArt";

const STICKER_ART: Record<StickerKind, (p: { className?: string }) => React.ReactElement> = {
  plane: PlaneArt,
  suitcase: SuitcaseArt,
  sunglasses: SunglassesArt,
  camera: CameraArt,
  paw: PawArt,
  fish: FishArt,
  house: HouseArt,
  key: KeyArt,
  cross: CrossArt,
  heart: HeartArt,
  sun: SunArt,
  car: CarArt,
  helmet: HelmetArt,
  shield: ShieldArt,
};

/** three.js + the sketch shader live in their own chunk. */
const PaintingCanvas = lazy(() => import("@/components/fx/three/PaintingCanvas"));

const EASE = [0.22, 1, 0.36, 1] as const;

function Letters({ text, delay, className }: { text: string; delay: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className} aria-hidden="true">{text}</span>;
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

/** Insurance illustration, copy, CTA and stickers switch as one theme. */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const search = useSearch();
  const categories = useCategories();
  const products = useProducts();
  const insurers = useInsurers();
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { amount: 0.3 });
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const cur = HERO_SLIDES[slide];
  const tint = CATEGORY_META[cur.category]?.color ?? "var(--red)";
  const catName = categories.find((c) => c.id === cur.category)?.name_zh;

  useEffect(() => {
    if (reduced || !inView || paused) return;
    const t = window.setTimeout(() => setSlide((i) => (i + 1) % HERO_SLIDES.length), 8500);
    return () => window.clearTimeout(t);
  }, [slide, reduced, inView, paused]);

  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end start"] });
  // follow the (already Lenis-smoothed) scroll directly — a second spring here reads as lag
  const progress = scrollYProgress;
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
    { n: products.length || "—", label: "份產品資料檔案", color: "var(--jade)" },
    { n: insurers.length || "—", label: "間保險公司", color: "var(--sky)" },
  ];
  const [Art1, Art2, Art3, Art4] = cur.stickers.map((k) => STICKER_ART[k]);
  const title = `${cur.line1}${cur.line2.join("")}`;

  return (
    <section ref={rootRef} onPointerMove={onPointer} className="relative -mt-16 overflow-hidden" aria-labelledby="hero-title">
      {/* the painting */}
      <motion.div className="absolute inset-x-0 bottom-0 h-[48svh] bg-paper md:inset-0 md:h-auto" style={reduced ? undefined : { scale: artScale, y: artY }}>
        <Suspense fallback={null}>
          <PaintingCanvas
            src={slidePhoto(cur)}
            alt={cur.alt}
            focus={cur.focus}
            sun={cur.sun}
            washOrigin={[0.72, 0.45]}
            fade={{ landscape: [1, 0, 0.95], portrait: [0, -1, 0.55] }}
          />
        </Suspense>
        {/* soft paper wash behind the copy so pencil lines never fight the text */}
        <div
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{ background: "radial-gradient(70% 80% at 18% 45%, rgba(252,252,250,.85), rgba(252,252,250,.4) 55%, transparent 75%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{ background: "linear-gradient(180deg, rgba(252,252,250,.92) 0%, rgba(252,252,250,.15) 24%, transparent 44%)" }}
          aria-hidden="true"
        />
      </motion.div>

      <motion.div
        style={reduced ? undefined : { y: copyY, opacity: copyO }}
        className="site-container relative z-10 flex min-h-[100svh] flex-col justify-start pb-36 pt-28 md:justify-center md:pb-28"
      >
        <div className="max-w-[660px]" onPointerEnter={() => setPaused(true)} onFocusCapture={() => setPaused(true)}>
          {/* the whole message re-writes itself with each painting */}
          {/* old and new copy share one grid cell and cross-fade, so the buttons below never jump */}
          <div className="grid">
          <AnimatePresence initial={false}>
            <motion.div key={cur.id} className="[grid-area:1/1]" exit={{ opacity: 0, y: reduced ? 0 : -14, filter: reduced ? "none" : "blur(6px)", transition: { duration: reduced ? 0 : 0.35 } }}>
              <motion.p
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
                className="flex items-center gap-2 font-hand text-[24px] font-bold"
                style={{ color: tint }}
              >
                <span aria-hidden="true">✎</span> {cur.script} · {catName ?? "香港保險比較"}
              </motion.p>
              <motion.h1 style={reduced ? undefined : { y: headY }} id="hero-title" className="mt-3 font-serif text-[clamp(42px,6vw,88px)] font-bold leading-[1.08] text-ink" aria-label={title}>
                <Letters text={cur.line1} delay={0.2} />
                <br />
                <span>
                  <Letters text={cur.line2[0]} delay={0.5} />
                  <span className="relative inline-block">
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-x-[-0.08em] bottom-[0.08em] h-[0.42em] origin-left -rotate-1 rounded-[40%_60%_50%_50%] opacity-40"
                      style={{ background: tint }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.1, duration: 0.6, ease: EASE }}
                    />
                    <Letters text={cur.line2[1]} delay={0.7} className="relative" />
                  </span>
                  <Letters text={cur.line2[2]} delay={0.85} />
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
                className="mt-6 max-w-[30em] text-[18px] font-medium leading-[1.75] text-ink-soft md:text-[20px]"
              >
                {cur.sub}
              </motion.p>
            </motion.div>
          </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7, ease: EASE }}
            style={reduced ? undefined : { y: ctaY }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <Link to={`/category/${cur.category}`} className="btn-primary group">
                {cur.cta}
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <button type="button" onClick={() => scrollToElement("#categories-grid")} className="btn-ghost">
              全部類別
            </button>
          </motion.div>
          <motion.button
            type="button"
            data-sketch-search
            onClick={search.openSearch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-5 flex h-12 w-full max-w-[460px] items-center gap-3 rounded-full border-2 border-dashed bg-paper/80 px-5 text-left transition-colors hover:border-solid hover:bg-white"
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

      {/* sticker layer — re-slapped for every theme; drag them around; each sits at its own depth */}
      <AnimatePresence mode="popLayout">
        <motion.div key={cur.id} className="pointer-events-none absolute inset-0 z-20" exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}>
          <HeroSticker progress={progress} mx={mx} my={my} speed={520} driftX={420} depth={46} delay={1.2} tilt={-8} className="left-[44%] top-[13%] hidden w-24 md:block">
            <Art1 className="h-auto w-full" />
          </HeroSticker>
          <HeroSticker progress={progress} mx={mx} my={my} speed={300} depth={26} delay={1.4} tilt={10} className="right-[6%] top-[74%] w-20 md:right-[22%] md:top-[58%] md:w-24">
            <StampArt className="h-auto w-full" text={cur.stamp} />
          </HeroSticker>
          <HeroSticker progress={progress} mx={mx} my={my} speed={420} depth={36} delay={1.6} tilt={-12} className="bottom-[16%] left-[46%] hidden w-20 lg:block">
            <Art3 className="h-auto w-full" />
          </HeroSticker>
          <HeroSticker progress={progress} mx={mx} my={my} speed={220} depth={18} delay={1.8} tilt={6} className="right-[5%] top-[38%] hidden w-20 md:block">
            <Art2 className="h-auto w-full" />
          </HeroSticker>
          <HeroSticker progress={progress} mx={mx} my={my} speed={360} depth={30} delay={2.0} tilt={-6} className="bottom-[8%] left-[8%] w-16 md:hidden">
            <Art4 className="h-auto w-full" />
          </HeroSticker>
        </motion.div>
      </AnimatePresence>

      {/* theme caption (hand-lettered) */}
      <motion.div style={reduced ? undefined : { y: capY }} className="absolute right-[clamp(16px,4vw,48px)] top-24 z-10 hidden text-right md:block" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, y: 10, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -3, transition: { delay: 0.9, duration: 0.6 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.3 } }}
            className="inline-block rounded-2xl bg-paper/95 px-5 py-2 shadow-card"
          >
            <p className="font-hand text-[38px] font-bold leading-none" style={{ color: tint }}>{cur.script}</p>
            <p className="mt-1 font-serif text-[15px] font-bold text-ink-soft">{catName ?? cur.tab}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="absolute bottom-20 right-[clamp(16px,4vw,48px)] z-10 flex flex-col items-end gap-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.6 }}
          className="pointer-events-none hidden rounded-full bg-paper/95 px-4 py-1 font-hand text-[21px] font-bold text-ink shadow-card md:block"
          aria-hidden="true"
        >
          ✎ 移動滑鼠，幫幅畫上色
        </motion.p>
        <div className="flex items-center gap-1 rounded-full bg-paper/95 px-1.5 py-1.5 shadow-card" role="group" aria-label="保險主題">
          {HERO_SLIDES.map((d, i) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={i === slide}
              aria-label={`${d.tab}保險`}
              onClick={() => { setPaused(true); setSlide(i); }}
              className={cn("min-h-11 min-w-8 rounded-full px-2 py-1 font-serif text-[14px] font-bold transition-colors md:px-2.5", i === slide ? "text-white" : "text-ink-soft hover:bg-amber-wash")}
              style={i === slide ? { background: CATEGORY_META[d.category]?.color } : undefined}
            >
              <span className="hidden sm:inline">{d.tab}</span>
              <span className="sm:hidden">{i === slide ? d.tab : "•"}</span>
            </button>
          ))}
        </div>
        {!reduced && <button type="button" onClick={() => setPaused(value => !value)} className="min-h-11 rounded-full border border-line bg-paper/95 px-3 text-sm font-semibold text-ink" aria-label={paused ? "播放主題輪播" : "暫停主題輪播"}>
          {paused ? "播放輪播 ▷" : "暫停輪播 Ⅱ"}
        </button>}
        <p className="rounded-full bg-paper/70 px-2 text-[11px] text-ink-soft">
          {cur.credit} · 互動水彩
        </p>
      </div>

      <WashEdge className="absolute inset-x-0 bottom-0 z-10" />
    </section>
  );
}

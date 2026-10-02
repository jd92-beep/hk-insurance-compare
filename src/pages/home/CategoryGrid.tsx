import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useCategories } from "@/providers/InsuranceDataProvider";
import { CATEGORY_META, CATEGORY_ORDER, DEFAULT_CATEGORIES } from "@/lib/categories";
import { ACTIVITIES, activityPhoto } from "@/lib/landing-photos";
import { Scribble } from "@/components/fx/Sketch";
import { Sticker } from "@/components/fx/Depth";
import { BikeArt, PalmArt, ShellArt, SunArt, SurfboardArt } from "@/components/fx/StickerArt";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ActivityCarouselCanvas = lazy(() => import("@/components/fx/three/ActivityCarouselCanvas"));
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * S3 度假時刻 — a 3D ring of travel-sketchbook pages (cycling, surfing, swimming, hiking…).
 * Desktop: scroll turns the ring. Everywhere: arrows, dots or a click on a page.
 * Below it, every insurance category as a quick link.
 */
export default function CategoryGrid() {
  const rootRef = useRef<HTMLElement>(null);
  const categories = useCategories();
  const list = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const sorted = [...list].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.id as (typeof CATEGORY_ORDER)[number]) - CATEGORY_ORDER.indexOf(b.id as (typeof CATEGORY_ORDER)[number]),
  );
  const n = ACTIVITIES.length;
  const urls = useMemo(() => ACTIVITIES.map((a) => activityPhoto(a)), []);
  const [pos, setPos] = useState(0);
  const active = ((Math.round(pos) % n) + n) % n;
  const act = ACTIVITIES[active];
  const cat = list.find((c) => c.id === act.category);

  const go = useCallback((i: number) => setPos(i), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: `+=${(n - 1) * 55}%`,
          pin: ".moments-pin",
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => setPos(self.progress * (n - 1)),
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section id="categories-grid" ref={rootRef} className="relative z-10">
      <div className="moments-pin relative flex flex-col overflow-hidden py-16 lg:h-[100dvh] lg:justify-center lg:pb-4 lg:pt-20">
        <div className="site-container flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-hand text-[26px] font-bold text-jade">holiday moments ✿</p>
            <h2 className="display-2 relative inline-block text-ink">
              度假玩樂嘅每一刻，都值得保障
              <Scribble className="absolute -bottom-3 left-0 h-4 w-1/2" color="var(--jade)" />
            </h2>
          </div>
          <p className="max-w-[24em] text-ink-soft">由馬略卡踩單車到夏威夷衝浪——轉一轉本旅行速寫簿，正面嗰頁會上色，揀個活動睇相關保障。</p>
        </div>

        {/* far layer: dotted flight path + clouds drift slowly as the ring turns */}
        <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true" style={{ transform: `translate3d(${-pos * 24}px,0,0)` }}>
          <svg viewBox="0 0 2400 400" preserveAspectRatio="none" className="absolute left-0 top-[34%] h-48 w-[180%] opacity-60">
            <path d="M0 300 C 300 120 600 360 900 200 S 1500 60 1800 220 S 2200 320 2400 160" fill="none" stroke="#4E9EDB" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
          </svg>
        </div>
        {/* near layer: stickers race past faster than the ring */}
        <div className="pointer-events-none absolute inset-0 z-20" style={{ transform: `translate3d(${-pos * 70}px,0,0)` }}>
          <div className="absolute left-[6%] top-[30%] hidden w-20 md:block"><Sticker tilt={-10}><BikeArt className="h-auto w-full" /></Sticker></div>
          <div className="absolute left-[78%] top-[26%] w-14 md:w-16"><Sticker tilt={12}><SurfboardArt className="h-auto w-full" /></Sticker></div>
          <div className="absolute left-[96%] top-[58%] hidden w-16 md:block"><Sticker tilt={-6}><ShellArt className="h-auto w-full" /></Sticker></div>
          <div className="absolute left-[130%] top-[34%] hidden w-20 md:block"><Sticker tilt={8}><PalmArt className="h-auto w-full" /></Sticker></div>
        </div>
        <div className="pointer-events-none absolute right-[3%] top-[18%] z-20 hidden w-20 lg:block" style={{ transform: `rotate(${pos * 40}deg)` }}>
          <Sticker><SunArt className="h-auto w-full" /></Sticker>
        </div>

        {/* 3D ring */}
        <div className="relative z-10 mt-4 h-[48vh] min-h-[300px] lg:h-[52vh]">
          <Suspense fallback={null}>
            <ActivityCarouselCanvas urls={urls} index={pos} onSelect={go} />
          </Suspense>
        </div>

        {/* caption for the page facing you */}
        <div className="site-container mt-2 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex flex-col items-center"
              aria-live="polite"
            >
              <p className="font-hand text-[24px] font-bold text-red">{act.note}</p>
              <h3 className="font-serif text-[28px] font-bold text-ink">{act.title}</h3>
              <p className="text-[13px] text-ink-faint">📍 {act.place} · 相片：{act.credit} / Unsplash</p>
              <p className="mt-1 max-w-[30em] text-ink-soft">{act.line}</p>
              <Link
                to={`/category/${act.category}`}
                className="group mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 font-extrabold text-white shadow-card transition-transform hover:-translate-y-0.5"
                style={{ background: CATEGORY_META[act.category]?.color }}
              >
                比較{cat?.name_zh ?? "相關保險"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </AnimatePresence>
          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={() => go(Math.round(pos) - 1)} className="rounded-full border-2 border-ink/70 bg-paper p-2 transition-colors hover:bg-amber-wash" aria-label="上一個場景">
              <ArrowLeft size={16} />
            </button>
            {ACTIVITIES.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={() => go(i)}
                aria-label={a.title}
                aria-current={i === active}
                className={cn("h-2.5 rounded-full transition-all duration-300", i === active ? "w-7 bg-red" : "w-2.5 bg-ink/25 hover:bg-ink/50")}
              />
            ))}
            <button type="button" onClick={() => go(Math.round(pos) + 1)} className="rounded-full border-2 border-ink/70 bg-paper p-2 transition-colors hover:bg-amber-wash" aria-label="下一個場景">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* every category, as hand-labelled quick links */}
      <div className="site-container pb-20 pt-6">
        <p className="mb-4 font-hand text-[22px] font-bold text-ink-soft">or jump straight in →</p>
        <div className="flex flex-wrap gap-3">
          {sorted.map((c, i) => {
            const meta = CATEGORY_META[c.id];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: EASE }}
              >
                <Link
                  to={`/category/${c.id}`}
                  className="group flex items-center gap-2.5 rounded-full border-2 bg-white py-2 pl-2 pr-4 transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5"
                  style={{ borderColor: `${meta?.color ?? "#2E2A45"}66`, boxShadow: `0 1px 0 ${meta?.color}33, 0 2px 0 ${meta?.color}44, 0 3px 0 ${meta?.color}55, 0 4px 0 ${meta?.color}66, 0 10px 14px -8px rgba(40,30,20,.3)` }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: `${meta?.color}22` }}>
                    <span
                      className="cat-icon h-5 w-5 transition-transform duration-300 group-hover:-rotate-12"
                      style={{ color: meta?.color, WebkitMaskImage: `url(${meta?.icon})`, maskImage: `url(${meta?.icon})` }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="font-bold text-ink">{c.name_zh}</span>
                  <span className="font-grotesk text-[12px] text-ink-faint">{c.count}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

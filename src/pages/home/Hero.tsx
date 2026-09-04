import { useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCategories, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";
import { useSearch } from "@/providers/SearchProvider";
import { scrollToElement } from "@/lib/lenis";
import { StampSealIcon } from "@/components/StampSealIcon";
import Magnetic from "@/components/Magnetic";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** 逐字標題（字元級動畫用） */
function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text} role="text">
      {[...text].map((ch, i) => (
        <span key={i} className="hero-char inline-block will-change-transform" aria-hidden="true">
          {ch}
        </span>
      ))}
    </span>
  );
}

/** 漂浮裝飾：保障關鍵字 + 小盾形（CSS 慢速漂移，附滾動/滑鼠 parallax 分層） */
const FLOATERS: { text?: string; shield?: boolean; top: string; left: string; depth: number; dur: string; delay: string; size?: number }[] = [
  { text: "自負額", top: "12%", left: "38%", depth: 1, dur: "9s", delay: "0s" },
  { text: "等候期", top: "30%", left: "52%", depth: 1.6, dur: "11s", delay: "-3s" },
  { text: "保費表", top: "58%", left: "44%", depth: 1, dur: "10s", delay: "-5s" },
  { text: "官方文件", top: "76%", left: "56%", depth: 1.6, dur: "12s", delay: "-2s" },
  { shield: true, top: "18%", left: "62%", depth: 1.6, dur: "13s", delay: "-6s", size: 34 },
  { shield: true, top: "66%", left: "34%", depth: 1, dur: "8s", delay: "-1s", size: 26 },
];

/** S1 Hero —「逐份官方文件幫你睇」 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const search = useSearch();
  const categories = useCategories();
  const products = useProducts();
  const insurers = useInsurers();
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // 滑鼠微 parallax（兩層深度）
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });
  const layerNearX = useTransform(sx, (v) => v * 22);
  const layerNearY = useTransform(sy, (v) => v * 14);
  const layerFarX = useTransform(sx, (v) => v * -12);
  const layerFarY = useTransform(sy, (v) => v * -8);
  const artX = useTransform(sx, (v) => v * 8);
  const artY = useTransform(sy, (v) => v * 6);

  const stats = [
    { n: categories.length || 9, label: "大保險類別" },
    { n: products.length || 85, label: "份官方產品檔案" },
    { n: insurers.length || 27, label: "間保險公司" },
  ];

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  useGSAP(
    () => {
      if (reduced) {
        gsap.set("[data-hero-fade], .hero-char, .hero-art, .hero-stamp", { clearProps: "all" });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo("[data-hero-eyebrow]", { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 }, 0.1)
        .fromTo(
          ".hero-char",
          { opacity: 0, y: 44, rotate: 5 },
          { opacity: 1, y: 0, rotate: 0, duration: 0.9, stagger: 0.045 },
          0.2,
        )
        .fromTo("[data-hero-sub]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 0.7)
        .fromTo(
          "[data-hero-cta]",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          0.85,
        )
        .fromTo(
          ".hero-art",
          { scale: 1.06, clipPath: "inset(8%)" },
          { scale: 1, clipPath: "inset(0%)", duration: 1.2 },
          0.4,
        )
        .fromTo(
          ".hero-stamp",
          { scale: 1.7, rotate: -20, opacity: 0 },
          { scale: 1, rotate: -12, opacity: 1, duration: 0.35, ease: "back.out(1.7)" },
          1.2,
        )
        .fromTo(
          "[data-hero-stat]",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          1.1,
        )
        .fromTo(
          ".hero-floater",
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.7, stagger: 0.08 },
          1.0,
        );

      // 插畫滾動 parallax
      gsap.fromTo(
        ".hero-art",
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
        },
      );
      // 漂浮層滾動 parallax（近層快、遠層慢）
      gsap.to("[data-float-near]", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-float-far]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const floater = (f: (typeof FLOATERS)[number], i: number) =>
    f.shield ? (
      <img
        key={i}
        src="/logo-mark.svg"
        alt=""
        aria-hidden="true"
        className="hero-floater animate-float opacity-[.14]"
        style={{ width: f.size, height: f.size, animationDuration: f.dur, animationDelay: f.delay }}
      />
    ) : (
      <span
        key={i}
        className="hero-floater animate-float select-none whitespace-nowrap rounded-full border px-3 py-1 font-serif text-[13px] font-bold text-ink-faint/80"
        style={{ borderColor: "var(--line-strong)", animationDuration: f.dur, animationDelay: f.delay, background: "color-mix(in srgb, var(--paper) 70%, transparent)" }}
        aria-hidden="true"
      >
        {f.text}
      </span>
    );

  return (
    <section ref={rootRef} className="relative overflow-hidden" onMouseMove={onMouseMove}>
      {/* mobile 底部加多啲 padding：首訪免責聲明 toast（fixed 底條）唔會冚住 9/85/27 統計行 */}
      <div className="site-container relative grid min-h-[92dvh] grid-cols-1 items-center gap-12 pb-16 pt-24 max-md:pb-36 lg:grid-cols-12 lg:gap-8">
        {/* 漂浮裝飾層（左欄文字後面，近/遠兩層） */}
        {!reduced && (
          <>
            <motion.div data-float-near className="pointer-events-none absolute inset-0 hidden lg:block" style={{ x: layerNearX, y: layerNearY }} aria-hidden="true">
              {FLOATERS.filter((f) => f.depth === 1).map((f, i) => (
                <span key={i} className="absolute" style={{ top: f.top, left: f.left }}>
                  {floater(f, i)}
                </span>
              ))}
            </motion.div>
            <motion.div data-float-far className="pointer-events-none absolute inset-0 hidden lg:block" style={{ x: layerFarX, y: layerFarY }} aria-hidden="true">
              {FLOATERS.filter((f) => f.depth !== 1).map((f, i) => (
                <span key={i} className="absolute" style={{ top: f.top, left: f.left }}>
                  {floater(f, i)}
                </span>
              ))}
            </motion.div>
          </>
        )}

        {/* 左 7 欄 */}
        <div className="relative lg:col-span-7">
          <p data-hero-eyebrow className="eyebrow mb-6 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-ink-soft">
            <span className="h-2 w-2 shrink-0 bg-red" aria-hidden="true" />
            {/* zh 段唔准斷字（390px 下「香港保險比/較」好肉酸），英文段先准獨立折行 */}
            <span className="eyebrow-zh whitespace-nowrap">香港保險比較</span>
            <span className="text-ink-faint">· HONG KONG INSURANCE COMPARE</span>
          </p>
          <h1 className="display-hero font-serif text-ink">
            <Chars text="逐份官方文件" />
            <br />
            <Chars text="幫你睇" className="text-red" />
            <Chars text="。" />
          </h1>
          <p data-hero-sub className="mt-7 max-w-[34em] text-[20px] font-medium leading-[1.7] text-ink-soft">
            家居、旅遊、人壽、危疾、意外、醫療、汽車、家傭、寵物——9 大類別、85
            份真實保單，保障範圍、價錢、條款逐項並排，全部附有保險公司官方來源。
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button
                type="button"
                data-hero-cta
                onClick={() => scrollToElement("#categories-grid")}
                className="btn-primary group"
              >
                開始比較
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <Link to="/categories" data-hero-cta className="btn-ghost">
              瀏覽 9 大類別
            </Link>
          </div>
          {/* 快速搜尋條 */}
          <button
            type="button"
            data-hero-cta
            onClick={search.openSearch}
            className="mt-6 flex h-14 w-full max-w-[520px] items-center gap-3 rounded-card border bg-paper px-5 text-left shadow-card transition-colors hover:border-[rgba(24,29,46,.28)]"
            style={{ borderColor: "var(--line)" }}
          >
            <Search size={18} className="shrink-0 text-ink-faint" />
            <span className="flex-1 truncate text-[15px] text-ink-faint">
              搜尋保險公司或產品，例如：旅遊保險、AXA、自願醫保…
            </span>
            <kbd className="shrink-0 rounded border bg-paper-2 px-1.5 py-0.5 font-grotesk text-[11px] text-ink-faint" style={{ borderColor: "var(--line)" }}>
              ⌘K
            </kbd>
          </button>
          {/* 數據行：首屏直出最終值（9/85/27 係賣點，唔可以由 0 開始） */}
          <div className="mt-12 flex items-stretch">
            {stats.map((s, i) => (
              <div
                key={s.label}
                data-hero-stat
                className={i === 0 ? "pr-8" : "border-l px-8"}
                style={{ borderColor: "var(--line)" }}
              >
                <p className="text-stat text-red">{s.n}</p>
                <p className="mt-1 text-small text-ink-soft">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 右 5 欄：插畫 + 印章 + 水印 */}
        <div className="relative lg:col-span-5">
          <img
            src="/stamp-seal.svg"
            alt=""
            aria-hidden="true"
            className="animate-spin-slow pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px] opacity-[.05]"
          />
          <motion.div className="relative" style={reduced ? undefined : { x: artX, y: artY }}>
            <div className="hero-art overflow-hidden rounded-[20px] border shadow-card will-change-transform" style={{ borderColor: "var(--line)" }}>
              <img
                src="/hero-harbour.svg"
                alt="香港維港天際線紙雕插畫，紅色圓日映襯高樓剪影"
                className="img-fade block aspect-[16/9] w-full object-cover"
              />
            </div>
            <div
              className="hero-stamp absolute -bottom-4 -left-4 will-change-transform"
              title="資料來自保險公司官方文件"
            >
              <StampSealIcon size={120} className="text-red" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

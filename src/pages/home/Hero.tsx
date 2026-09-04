import { useRef, useState } from "react";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCategories, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";
import { useSearch } from "@/providers/SearchProvider";
import { scrollToElement } from "@/lib/lenis";
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
interface FloaterItem {
  text?: string;
  en?: string;
  tag?: string;
  shield?: boolean;
  top: string;
  left: string;
  depth: number;
  dur: string;
  delay: string;
  size?: number;
  highlight?: boolean;
}

const FLOATERS: FloaterItem[] = [
  { text: "自負額", en: "Deductible", tag: "條款細則", top: "11%", left: "36%", depth: 1, dur: "9s", delay: "0s" },
  { text: "等候期", en: "Waiting Period", top: "28%", left: "53%", depth: 1.7, dur: "11s", delay: "-3s", highlight: true },
  { text: "保費表", en: "Premium Table", top: "54%", left: "42%", depth: 1, dur: "10s", delay: "-5s" },
  { text: "全數賠償", en: "Full Cover", tag: "免找數", top: "75%", left: "54%", depth: 1.7, dur: "12s", delay: "-2s", highlight: true },
  { text: "官方文件", en: "Policy Wording", top: "86%", left: "35%", depth: 0.8, dur: "9.5s", delay: "-4.5s" },
  { text: "不保事項", en: "Exclusions", top: "22%", left: "82%", depth: 1.4, dur: "13s", delay: "-6s" },
  { shield: true, top: "16%", left: "65%", depth: 1.7, dur: "13s", delay: "-6s", size: 36 },
  { shield: true, top: "68%", left: "28%", depth: 0.8, dur: "8s", delay: "-1s", size: 28 },
];

/** S1 Hero —「逐份官方文件幫你睇」極致視覺傑作 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const search = useSearch();
  const categories = useCategories();
  const products = useProducts();
  const insurers = useInsurers();
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // 滑鼠微 parallax（四層深度分離：近、中、遠、畫框、印章）
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });

  const layerNearX = useTransform(sx, (v) => v * 24);
  const layerNearY = useTransform(sy, (v) => v * 16);
  const layerMidX = useTransform(sx, (v) => v * 12);
  const layerMidY = useTransform(sy, (v) => v * 8);
  const layerFarX = useTransform(sx, (v) => v * -14);
  const layerFarY = useTransform(sy, (v) => v * -10);
  const artX = useTransform(sx, (v) => v * 10);
  const artY = useTransform(sy, (v) => v * 7);
  const sealX = useTransform(sx, (v) => v * -16);
  const sealY = useTransform(sy, (v) => v * -12);

  const stats = [
    { n: categories.length || 11, label: "大保險類別", sub: "全港最齊全" },
    { n: products.length || 158, label: "份官方產品檔案", sub: "現行生效保單" },
    { n: insurers.length || 39, label: "間保險公司", sub: "直接逐項比對" },
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
        gsap.set("[data-hero-fade], .hero-char, .hero-art, .hero-stamp, .hero-floater", { clearProps: "all" });
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
          { scale: 1.05, clipPath: "inset(6%)" },
          { scale: 1, clipPath: "inset(0%)", duration: 1.2 },
          0.35,
        )
        .fromTo(
          ".hero-stamp",
          { scale: 1.8, rotate: -26, opacity: 0 },
          { scale: 1, rotate: -12, opacity: 1, duration: 0.45, ease: "back.out(1.8)" },
          1.15,
        )
        .fromTo(
          "[data-hero-stat]",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          1.05,
        )
        .fromTo(
          ".hero-floater",
          { opacity: 0, scale: 0.75 },
          { opacity: 1, scale: 1, duration: 0.7, stagger: 0.06 },
          0.95,
        );

      // 插畫滾動 parallax
      gsap.fromTo(
        ".hero-art",
        { yPercent: -4 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
        },
      );
      // 翡翠盾徽獨立反向滾動 parallax（強化立體懸浮感）
      gsap.fromTo(
        ".hero-stamp",
        { yPercent: -2 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
        },
      );
      // 漂浮層滾動 parallax（近層快、遠層慢）
      gsap.to("[data-float-near]", {
        yPercent: -22,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-float-mid]", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-float-far]", {
        yPercent: -7,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const floater = (f: FloaterItem, i: number) =>
    f.shield ? (
      <div
        key={i}
        className="hero-floater animate-float flex items-center justify-center rounded-full border border-red/20 bg-red-wash/40 p-2 shadow-sm backdrop-blur-sm"
        style={{ animationDuration: f.dur, animationDelay: f.delay }}
      >
        <img
          src="/logo-mark.svg"
          alt=""
          aria-hidden="true"
          className="opacity-70"
          style={{ width: f.size, height: f.size }}
        />
      </div>
    ) : (
      <span
        key={i}
        className={`hero-floater animate-float inline-flex select-none items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 font-serif text-[12.5px] font-bold shadow-[0_4px_12px_rgba(24,29,46,0.06)] backdrop-blur-md transition-transform hover:scale-105 ${
          f.highlight
            ? "border-amber/40 bg-amber-wash/90 text-ink shadow-amber/10"
            : "border-ink/10 bg-paper/85 text-ink-soft"
        }`}
        style={{ animationDuration: f.dur, animationDelay: f.delay }}
        aria-hidden="true"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red" />
        <span>{f.text}</span>
        {f.en && <span className="font-grotesk text-[10px] uppercase tracking-wider text-ink-faint">· {f.en}</span>}
      </span>
    );

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-paper" onMouseMove={onMouseMove}>
      {/* ── 背景質感層：米紙撕邊、等高線與金融防偽格網紋理 ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-multiply transition-opacity duration-1000"
        style={{
          backgroundImage: "url('/images/textures/mesh-paper-texture.webp')",
          backgroundSize: "800px auto",
          backgroundPosition: "top right",
          backgroundRepeat: "repeat",
        }}
        aria-hidden="true"
      />

      {/* ── 頂部柔和漫射環境光暈（增加紙質景深） ── */}
      <div
        className="pointer-events-none absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-wash/60 blur-[120px] mix-blend-multiply"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full bg-jade-wash/40 blur-[100px] mix-blend-multiply"
        aria-hidden="true"
      />

      {/* mobile 底部加多 padding：首訪免責聲明 toast 唔會遮擋數據行 */}
      <div className="site-container relative grid min-h-[92dvh] grid-cols-1 items-center gap-12 pb-20 pt-24 max-md:pb-36 lg:grid-cols-12 lg:gap-8">
        {/* ── 漂浮裝飾層（左欄文字後面，分層視差） ── */}
        {!reduced && (
          <>
            <motion.div
              data-float-near
              className="pointer-events-none absolute inset-0 hidden lg:block"
              style={{ x: layerNearX, y: layerNearY }}
              aria-hidden="true"
            >
              {FLOATERS.filter((f) => f.depth > 1.5).map((f, i) => (
                <span key={i} className="absolute" style={{ top: f.top, left: f.left }}>
                  {floater(f, i)}
                </span>
              ))}
            </motion.div>
            <motion.div
              data-float-mid
              className="pointer-events-none absolute inset-0 hidden lg:block"
              style={{ x: layerMidX, y: layerMidY }}
              aria-hidden="true"
            >
              {FLOATERS.filter((f) => f.depth >= 1 && f.depth <= 1.5).map((f, i) => (
                <span key={i} className="absolute" style={{ top: f.top, left: f.left }}>
                  {floater(f, i)}
                </span>
              ))}
            </motion.div>
            <motion.div
              data-float-far
              className="pointer-events-none absolute inset-0 hidden lg:block"
              style={{ x: layerFarX, y: layerFarY }}
              aria-hidden="true"
            >
              {FLOATERS.filter((f) => f.depth < 1).map((f, i) => (
                <span key={i} className="absolute" style={{ top: f.top, left: f.left }}>
                  {floater(f, i)}
                </span>
              ))}
            </motion.div>
          </>
        )}

        {/* ── 左 7 欄：核心標題、搜尋島與立體數據台 ── */}
        <div className="relative z-10 lg:col-span-7">
          <p data-hero-eyebrow className="eyebrow mb-6 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-ink-soft">
            <span className="h-2 w-2 shrink-0 bg-red shadow-[0_0_8px_rgba(200,16,46,0.6)]" aria-hidden="true" />
            <span className="eyebrow-zh whitespace-nowrap">香港保險比較</span>
            <span className="text-ink-faint">· HONG KONG INSURANCE COMPARE</span>
          </p>

          <h1 className="display-hero font-serif text-ink">
            <Chars text="逐份官方文件" />
            <br />
            <Chars text="幫你睇" className="text-red" />
            <Chars text="。" />
          </h1>

          <p data-hero-sub className="mt-7 max-w-[34em] text-[19px] font-medium leading-[1.7] text-ink-soft sm:text-[20px]">
            旅遊、自願醫保、高端醫療、家居、危疾、人壽、意外、汽車、家傭、寵物——11 大類別、158
            份真實保單，保障範圍、自負額、價錢及條款逐項並排，全部附有保險公司官方來源與頁碼。
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button
                type="button"
                data-hero-cta
                onClick={() => scrollToElement("#categories-grid")}
                className="btn-primary group shadow-[0_8px_20px_-4px_rgba(200,16,46,0.38)] hover:shadow-[0_12px_24px_-4px_rgba(200,16,46,0.48)]"
              >
                開始比較
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <Link
              to="/categories"
              data-hero-cta
              className="btn-ghost backdrop-blur-sm transition-all hover:border-ink"
            >
              瀏覽 11 大類別
            </Link>
          </div>

          {/* ── 快速搜尋條：毛玻璃立體懸浮島 ── */}
          <button
            type="button"
            data-hero-cta
            onClick={search.openSearch}
            className="group mt-7 flex h-14 w-full max-w-[540px] items-center gap-3.5 rounded-card border border-ink/10 bg-paper/85 px-5 text-left shadow-[0_8px_24px_-6px_rgba(24,29,46,0.08),inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_16px_36px_-8px_rgba(24,29,46,0.14)]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-wash/80 text-red transition-colors group-hover:bg-red group-hover:text-paper">
              <Search size={16} />
            </div>
            <span className="flex-1 truncate text-[14.5px] font-medium text-ink-faint transition-colors group-hover:text-ink-soft sm:text-[15px]">
              搜尋保險公司或產品，例如：旅遊保險、AXA、自願醫保…
            </span>
            <kbd className="shrink-0 rounded-md border border-ink/10 bg-paper-2/90 px-2 py-0.5 font-grotesk text-[11px] font-semibold text-ink-soft shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* ── 數據行：立體浮雕小島底台 ── */}
          <div
            data-hero-stat
            className="mt-10 inline-flex flex-wrap items-stretch gap-y-4 rounded-[20px] border border-ink/10 bg-paper-2/60 p-4 shadow-[0_6px_20px_-6px_rgba(24,29,46,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] backdrop-blur-sm sm:gap-y-0 sm:p-5"
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col justify-center ${
                  i === 0 ? "pr-6 sm:pr-8" : "border-l border-ink/10 pl-6 pr-6 sm:pl-8 sm:pr-8"
                } ${i === stats.length - 1 ? "pr-2 sm:pr-4" : ""}`}
              >
                <div className="flex items-baseline gap-1">
                  <span className="font-grotesk text-[32px] font-black leading-none text-red sm:text-[40px]">
                    {s.n}
                  </span>
                  <span className="font-serif text-[12px] font-bold text-red/80">+</span>
                </div>
                <p className="mt-1 font-serif text-[13px] font-bold text-ink sm:text-[14px]">{s.label}</p>
                <p className="text-[11px] text-ink-faint">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 右 5 欄：3D 象牙紙雕天際線 + Layered Shadowbox 畫框 + 3D 翡翠金盾徽 ── */}
        <div className="relative lg:col-span-5">
          {/* 背景慢速旋轉防偽大水印 */}
          <img
            src="/stamp-seal.svg"
            alt=""
            aria-hidden="true"
            className="animate-spin-slow pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px] opacity-[0.04]"
          />

          <motion.div className="relative" style={reduced ? undefined : { x: artX, y: artY }}>
            {/* ── Layered Shadowbox Frame（多層次精裝紙雕畫框） ── */}
            <div className="hero-art relative rounded-[28px] p-2.5 shadow-[0_30px_70px_-15px_rgba(24,29,46,0.22),0_12px_28px_-6px_rgba(24,29,46,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)] ring-1 ring-ink/10 sm:p-3.5 bg-gradient-to-br from-[#FAF8F4] via-[#F4EFE6] to-[#E9E2D4]">
              {/* 畫框金屬細金線雙邊框 */}
              <div className="relative overflow-hidden rounded-[20px] bg-paper-3/80 p-1 ring-1 ring-amber/20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]">
                {/* 畫芯內陷圖層 */}
                <div className="relative overflow-hidden rounded-[16px] bg-ink/5">
                  <img
                    src="/images/textures/hero-harbour-layered.webp"
                    alt="香港維港天際線 3D 象牙紙雕插畫，多層剪影維港景色"
                    className="img-fade block aspect-[4/3] w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                    loading="eager"
                  />

                  {/* 畫芯表面微光漫反射效果 */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20 mix-blend-overlay"
                    aria-hidden="true"
                  />
                </div>

                {/* 畫框頂部微型金色認證簽章條 */}
                <div className="absolute right-3.5 top-3.5 z-10 flex items-center gap-1.5 rounded-full border border-amber/30 bg-paper/90 px-3 py-1 shadow-sm backdrop-blur-md">
                  <ShieldCheck size={13} className="text-jade" />
                  <span className="font-grotesk text-[11px] font-bold tracking-wider text-ink">
                    OFFICIAL VERIFIED · 158
                  </span>
                </div>
              </div>
            </div>

            {/* ── 3D 翡翠玉石金色防偽盾徽印章（立體浮動徽章） ── */}
            <motion.div
              className="hero-stamp absolute -bottom-8 -left-6 z-20 flex items-center gap-3 will-change-transform sm:-bottom-9 sm:-left-8"
              style={reduced ? undefined : { x: sealX, y: sealY }}
              title="資料來自保險公司官方文件，逐條引證核實"
            >
              <div className="group relative cursor-pointer">
                {/* 翡翠綠立體輝光光暈 */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-full bg-jade/25 blur-[22px] transition-all duration-500 group-hover:bg-jade/40"
                  aria-hidden="true"
                />

                {/* 3D 翡翠盾徽實體圖片 */}
                <img
                  src="/images/textures/shield-seal-emblem.webp"
                  alt="3D 翡翠玉石金色防偽盾徽"
                  className="relative h-[115px] w-[115px] object-contain drop-shadow-[0_16px_30px_rgba(14,124,102,0.45)] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3 sm:h-[135px] sm:w-[135px]"
                />

                {/* 盾徽角落微型文字標籤 */}
                <div className="absolute -bottom-1 -right-2 rounded-full border border-amber/30 bg-paper px-2.5 py-0.5 font-serif text-[10.5px] font-bold text-ink-soft shadow-md backdrop-blur-sm">
                  100% 官方文件核實
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


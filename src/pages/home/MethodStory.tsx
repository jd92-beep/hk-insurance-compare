import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ExternalLink, FileText } from "lucide-react";
import { StampSealIcon } from "@/components/StampSealIcon";
import { DoodleCloud, Scribble } from "@/components/fx/Sketch";
import { Parallax, Sticker } from "@/components/fx/Depth";
import { CameraArt, SunArt } from "@/components/fx/StickerArt";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  { title: "官方網站逐頁睇", body: "記錄產品頁、保障表、保費表來源；缺漏照列。", note: "step 1 · read" },
  { title: "官方文件逐份捉", body: "冊子、條款 PDF、自負額表：對齊版本同頁碼。", note: "step 2 · collect" },
  { title: "結構化逐項排", body: "保障、保費、條款、不保事項統一格式；有源可核，未核實會標示。", note: "step 3 · compare" },
];

function SheetBrowser() {
  return (
    <div className="relative h-full p-6">
      {[
        { url: "axa.com.hk", top: "8%", left: "6%", rot: -3, tag: "保障表" },
        { url: "bluecross.com.hk", top: "34%", left: "22%", rot: 2, tag: "保費表" },
        { url: "zurich.com.hk", top: "58%", left: "10%", rot: -1.5, tag: null },
      ].map((w) => (
        <div key={w.url} className="absolute w-[64%] rounded-2xl border bg-white p-3 shadow-lift" style={{ top: w.top, left: w.left, rotate: `${w.rot}deg`, borderColor: "var(--line)" }}>
          <div className="mb-2.5 flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-red/70" />
            <span className="h-2 w-2 rounded-full bg-amber/80" />
            <span className="h-2 w-2 rounded-full bg-jade/70" />
            <span className="ml-2 font-grotesk text-[12px] text-ink-soft">{w.url}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-3/4 rounded bg-paper-3" />
            <div className="h-2 w-1/2 rounded bg-paper-3" />
          </div>
          {w.tag && (
            <span className="absolute -right-4 -top-3 rotate-6 rounded-full border-2 border-red bg-paper px-2.5 py-0.5 font-hand text-[18px] font-bold text-red">{w.tag}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function SheetDocs() {
  return (
    <div className="flex h-full items-center justify-center gap-5 p-6">
      {["產品冊子.pdf", "保單條款.pdf", "保費表.pdf"].map((name, i) => (
        <div
          key={name}
          className="relative flex h-[210px] w-[140px] flex-col rounded-xl border bg-white p-3 shadow-lift"
          style={{ rotate: `${i === 0 ? -5 : i === 2 ? 5 : 0}deg`, borderColor: "var(--line)" }}
        >
          <FileText size={20} className="text-amber" />
          <p className="mt-1.5 text-[12px] font-bold">{name}</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {[1, 0.8, 0.65, 1, 0.5].map((w, j) => (
              <div key={j} className="h-1.5 rounded bg-paper-3" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
          {i === 1 && (
            <div className="absolute -right-6 -top-6 rotate-[-12deg]">
              <StampSealIcon size={78} className="text-red" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SheetTable() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-[470px] overflow-hidden rounded-2xl border bg-white shadow-lift" style={{ borderColor: "var(--line)" }}>
        <div className="grid grid-cols-3 border-b bg-amber-wash px-4 py-2.5 text-[13px] font-bold text-ink-soft" style={{ borderColor: "var(--line)" }}>
          <span>公司</span>
          <span>保費</span>
          <span>醫療額</span>
        </div>
        {[
          { co: "AIG 美亞", premium: "HK$40 起", med: "HK$1,000,000" },
          { co: "Blue Cross 藍十字", premium: "HK$248 起", med: "HK$1,200,000" },
          { co: "AXA 安盛", premium: "即時報價", med: "HK$1,000,000" },
        ].map((r, i) => (
          <div key={r.co} className="relative grid grid-cols-3 items-center border-b px-4 py-3 text-[14px] last:border-b-0" style={{ borderColor: "var(--line)" }}>
            <span className="font-medium">{r.co}</span>
            <span className="font-grotesk font-extrabold text-red">{r.premium}</span>
            <span className="font-grotesk">{r.med}</span>
            {i === 2 && (
              <span className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full bg-jade px-2.5 py-0.5 text-[11px] font-bold text-white">
                附官方來源 <ExternalLink size={10} />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const SHEETS = [SheetBrowser, SheetDocs, SheetTable];

/** Notepad sheet chrome: spiral rings + ruled paper */
function Notepad({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("depth-card absolute inset-0 rounded-[24px] border", className)}
      style={{ ...style, backgroundImage: "repeating-linear-gradient(180deg, transparent 0 33px, rgba(78,158,219,.16) 33px 34px), url(/textures/paper-fiber.svg), linear-gradient(#FFFFFF,#FCFCFA)" }}
    >
      <div className="absolute inset-x-10 -top-3 flex justify-between" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="h-7 w-3 rounded-full border-2 border-ink/50 bg-paper-3" />
        ))}
      </div>
      <div className="relative h-full pt-6">{children}</div>
    </div>
  );
}

/** S4 方法 — 筆記簿：捲動時一頁頁翻上去 */
export default function MethodStory() {
  const rootRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const sheets = gsap.utils.toArray<HTMLElement>(".method-sheet");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=160%",
            pin: ".method-pin",
            scrub: 0.6,
            anticipatePin: 1,
            onUpdate: (self) => setStep(self.progress < 0.36 ? 0 : self.progress < 0.7 ? 1 : 2),
          },
        });
        tl.to(sheets[0], { rotateX: 105, y: -40, opacity: 0, duration: 1, ease: "power2.in" }, 0.25)
          .to(sheets[1], { rotateX: 105, y: -40, opacity: 0, duration: 1, ease: "power2.in" }, 1.55)
          .to(".method-cloud", { x: 120, duration: 2.8, ease: "none" }, 0);
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-sky-wash/70">
      <DoodleCloud className="method-cloud absolute left-[4%] top-16 h-16 w-32 opacity-90" />
      <DoodleCloud className="method-cloud absolute right-[18%] top-28 h-12 w-24 opacity-70" />
      <Parallax speed={0.7} className="pointer-events-none absolute right-[4%] top-[14%] z-20 hidden w-20 lg:block">
        <Sticker tilt={12}><CameraArt className="h-auto w-full" /></Sticker>
      </Parallax>
      <Parallax speed={-0.3} className="pointer-events-none absolute bottom-[10%] left-[3%] z-20 w-16 md:w-20">
        <Sticker tilt={-8}><SunArt className="h-auto w-full" /></Sticker>
      </Parallax>
      <div className="method-pin relative flex items-center py-20 lg:h-[100dvh] lg:py-0">
        <div className="site-container relative grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-hand text-[26px] font-bold text-sky">our method ✎</p>
            <h2 className="display-2 relative text-ink">
              每條資料，
              <br />
              都搵到<span className="relative inline-block">官方出處<Scribble className="absolute -bottom-2 left-0 h-3.5 w-full" color="var(--sky)" /></span>。
            </h2>
            <ol className="mt-10 flex flex-col gap-5">
              {STEPS.map((s, i) => {
                const active = step === i;
                return (
                  <li key={s.title} className={cn("flex gap-4 transition-all duration-500", active ? "opacity-100" : "lg:opacity-45")}>
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-hand text-[24px] font-bold transition-all duration-500",
                        active ? "rotate-[-8deg] border-red bg-red text-white shadow-sun" : "border-ink/40 bg-paper text-ink",
                      )}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-serif text-[21px] font-bold text-ink">{s.title}</p>
                      <p className="mt-1 max-w-[32em] text-[15px] leading-[1.75] text-ink-soft">{s.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* notepad stack — top sheet flips up as you scroll (desktop) */}
          <div className="relative lg:col-span-7" style={{ perspective: "1400px" }}>
            <div className="relative hidden h-[440px] lg:block">
              {/* the pad's thickness: page edges stacked underneath */}
              {[18, 13, 8, 4].map((o, k) => (
                <div
                  key={o}
                  aria-hidden="true"
                  className="absolute inset-x-2 rounded-[24px] border"
                  style={{ top: o, bottom: -o, background: k % 2 ? "#F4F3EF" : "#FFFFFF", borderColor: "rgba(46,42,69,.12)", boxShadow: k === 0 ? "0 24px 40px -18px rgba(40,30,20,.35)" : undefined }}
                />
              ))}
              {SHEETS.map((Sheet, i) => (
                <Notepad
                  key={i}
                  className="method-sheet"
                  style={{ zIndex: 3 - i, transformOrigin: "50% 0%", rotate: `${(i - 1) * 1.2}deg` }}
                >
                  <span className="absolute right-6 top-8 font-hand text-[20px] font-bold text-ink-faint">{STEPS[i].note}</span>
                  <Sheet />
                </Notepad>
              ))}
            </div>
            <div className="flex flex-col gap-10 lg:hidden">
              {SHEETS.map((Sheet, i) => (
                <div key={i} className="relative h-[340px]">
                  <Notepad style={{ rotate: `${(i % 2 ? 1 : -1) * 1}deg` }}>
                    <span className="absolute right-6 top-8 font-hand text-[20px] font-bold text-ink-faint">{STEPS[i].note}</span>
                    <div className="h-full origin-top scale-[.82] fold:scale-100">
                      <Sheet />
                    </div>
                  </Notepad>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

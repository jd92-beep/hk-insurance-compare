import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ExternalLink, FileText } from "lucide-react";
import { StampSealIcon } from "@/components/StampSealIcon";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    title: "官方網站逐頁睇",
    body: "27 間保險公司官網，產品頁、保障表、保費表逐頁記錄。",
  },
  {
    title: "官方文件逐份捉",
    body: "產品冊子、保單條款 PDF、自負額表——85 份產品全部註明搵到邊份文件。",
  },
  {
    title: "結構化逐項排",
    body: "保障上限、保費範圍、主要條款、不保事項，統一格式先好比較。每個產品附官方來源連結，你可以自己核實。",
  },
];

/** S4 Pinned 敘事 —「我哋嘅數據，唔係靠估」（深色反轉段） */
export default function MethodStory() {
  const rootRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scenes = gsap.utils.toArray<HTMLElement>(".method-scene");
      gsap.set(scenes, { autoAlpha: 0, y: 24 });
      gsap.set(scenes[0], { autoAlpha: 1, y: 0 });

      const showScene = (idx: number) => {
        scenes.forEach((scene, i) => {
          gsap.to(scene, {
            autoAlpha: i === idx ? 1 : 0,
            y: i === idx ? 0 : 24,
            duration: 0.5,
            ease: "expo.out",
            overwrite: true,
          });
        });
        if (idx === 1) {
          gsap.fromTo(
            ".method-stamp",
            { scale: 1.7, rotate: -20, autoAlpha: 0 },
            { scale: 1, rotate: -12, autoAlpha: 1, duration: 0.35, ease: "back.out(1.7)", delay: 0.25, overwrite: true },
          );
        }
        if (idx === 2) {
          gsap.fromTo(
            ".method-table-row",
            { autoAlpha: 0, x: -16 },
            { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.12, ease: "expo.out", delay: 0.15, overwrite: true },
          );
          gsap.fromTo(
            ".method-source-chip",
            { autoAlpha: 0, scale: 0.8 },
            { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(1.7)", delay: 0.65, overwrite: true },
          );
        }
      };

      if (reduced) {
        setStep(2);
        showScene(2);
        return;
      }

      let current = 0;
      const pinInner = rootRef.current?.querySelector<HTMLElement>(".method-pin-inner");
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "+=130%",
        pin: ".method-pin",
        pinSpacing: true,
        onUpdate: (self) => {
          const p = self.progress;
          const idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
          if (idx !== current) {
            current = idx;
            setStep(idx);
            showScene(idx);
          }
          // 解 pin 前 fade out 內容，消除收尾純黑死位
          if (pinInner) {
            const outro = gsap.utils.clamp(0, 1, (p - 0.84) / 0.14);
            gsap.set(pinInner, { autoAlpha: 1 - outro, y: -32 * outro });
          }
        },
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="relative bg-ink text-paper">
      <div className="method-pin flex h-[100dvh] items-center overflow-hidden">
        <div className="method-pin-inner site-container relative grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* 進度指示 dots */}
          <div
            className="absolute -left-2 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
            aria-hidden="true"
          >
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={cn(
                  "block rounded-full transition-all duration-500",
                  step === i ? "h-6 w-2 bg-red" : "h-2 w-2 bg-paper/30",
                )}
              />
            ))}
          </div>
          {/* 左 5 欄：步驟 */}
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4 text-red">OUR METHOD · 數據點嚟</p>
            <h2 className="display-2 text-paper">每條資料，<br />都搵到官方出處。</h2>
            <div className="mt-10 flex flex-col gap-6">
              {STEPS.map((s, i) => {
                const active = step === i;
                return (
                  <div
                    key={s.title}
                    className={cn(
                      "relative pl-6 transition-all duration-500",
                      active ? "translate-x-3 opacity-100" : "opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1 w-[3px] rounded-full bg-red transition-all duration-500",
                        active ? "h-full" : "h-4",
                      )}
                      aria-hidden="true"
                    />
                    <p className="font-serif text-[22px] font-bold">
                      <span className="mr-2 font-grotesk text-[15px] text-red">0{i + 1}</span>
                      {s.title}
                    </p>
                    <p className="mt-1.5 max-w-[32em] text-[15px] leading-[1.75] text-paper/70">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右 7 欄：視覺舞台 */}
          <div className="relative hidden h-[420px] lg:col-span-7 lg:block">
            {/* 幕一：瀏覽器視窗層疊 */}
            <div className="method-scene absolute inset-0">
              <div className="relative h-full">
                {[
                  { url: "axa.com.hk", top: "6%", left: "4%", rot: -3, tag: "保障表", tagTop: "18%", tagLeft: "58%" },
                  { url: "bluecross.com.hk", top: "30%", left: "22%", rot: 2, tag: "保費表", tagTop: "62%", tagLeft: "12%" },
                  { url: "zurich.com.hk", top: "54%", left: "8%", rot: -1.5, tag: null, tagTop: "0", tagLeft: "0" },
                ].map((w) => (
                  <div
                    key={w.url}
                    className="absolute w-[62%] rounded-card border bg-paper p-4 text-ink shadow-lift"
                    style={{ top: w.top, left: w.left, transform: `rotate(${w.rot}deg)`, borderColor: "var(--line)" }}
                  >
                    <div className="mb-3 flex items-center gap-2 rounded-full bg-paper-2 px-3 py-1.5">
                      <span className="h-2 w-2 rounded-full bg-red/70" />
                      <span className="h-2 w-2 rounded-full bg-amber/70" />
                      <span className="h-2 w-2 rounded-full bg-jade/70" />
                      <span className="ml-2 font-grotesk text-[12px] text-ink-soft">{w.url}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-2.5 w-3/4 rounded bg-paper-3" />
                      <div className="h-2.5 w-1/2 rounded bg-paper-3" />
                      <div className="h-2.5 w-2/3 rounded bg-paper-3" />
                    </div>
                    {w.tag && (
                      <span
                        className="absolute rounded-full border-2 border-red px-2.5 py-1 font-sans text-[12px] font-bold text-red"
                        style={{ top: w.tagTop, left: w.tagLeft }}
                      >
                        {w.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 幕二：三份文件 + 蓋印 */}
            <div className="method-scene absolute inset-0">
              <div className="flex h-full items-center justify-center gap-8">
                {["產品冊子.pdf", "保單條款.pdf", "保費表.pdf"].map((name, i) => (
                  <div
                    key={name}
                    className="relative flex h-[240px] w-[170px] flex-col rounded-card border bg-paper p-4 text-ink shadow-lift"
                    style={{ transform: `rotate(${i === 0 ? -4 : i === 2 ? 4 : 0}deg)`, borderColor: "var(--line)" }}
                  >
                    <FileText size={22} className="text-red" />
                    <p className="mt-2 text-[13px] font-bold">{name}</p>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="h-2 w-full rounded bg-paper-3" />
                      <div className="h-2 w-5/6 rounded bg-paper-3" />
                      <div className="h-2 w-4/6 rounded bg-paper-3" />
                      <div className="h-2 w-full rounded bg-paper-3" />
                      <div className="h-2 w-3/6 rounded bg-paper-3" />
                    </div>
                    {i === 1 && (
                      <div className="method-stamp absolute -right-6 -top-6">
                        <StampSealIcon size={84} className="text-red" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 幕三：簡化比較表 */}
            <div className="method-scene absolute inset-0">
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-[520px] overflow-hidden rounded-card border bg-paper text-ink shadow-lift" style={{ borderColor: "var(--line)" }}>
                  <div className="grid grid-cols-3 border-b bg-paper-2 px-5 py-3 text-[13px] font-bold text-ink-soft" style={{ borderColor: "var(--line)" }}>
                    <span>公司</span><span>保費</span><span>醫療額</span>
                  </div>
                  {[
                    { co: "AIG 美亞", premium: "HK$40 起", med: "HK$1,000,000" },
                    { co: "Blue Cross 藍十字", premium: "HK$248 起", med: "HK$1,200,000" },
                    { co: "AXA 安盛", premium: "即時報價", med: "HK$1,000,000" },
                  ].map((r, i) => (
                    <div key={r.co} className="method-table-row relative grid grid-cols-3 items-center border-b px-5 py-3.5 text-[14px] last:border-b-0" style={{ borderColor: "var(--line)" }}>
                      <span className="font-medium">{r.co}</span>
                      <span className="font-grotesk font-bold text-red">{r.premium}</span>
                      <span className="font-grotesk">{r.med}</span>
                      {i === 2 && (
                        <span className="method-source-chip absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-jade px-2.5 py-1 text-[11px] font-bold text-paper">
                          附官方來源 <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

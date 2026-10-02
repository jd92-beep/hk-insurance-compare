import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** first-visit walkthrough of the PDF centre; targets are elements with `data-tour="<id>"` */
export const TOUR_KEY = "pdf-center-tour-v1";

const STEPS = [
  { id: "picker", title: "① 揀文件", body: "先揀保險類別，再揀保險公司，最後揀產品。搵唔到？用上面嘅快速搜尋。" },
  { id: "entries", title: "② 揀條款", body: "每一行係一項保障或條款引用，右邊標住 PDF 頁碼。撳一下就跳去嗰頁。" },
  { id: "viewer", title: "③ 對原文", body: "右邊直接打開官方 PDF 原文，並會高亮相關摘錄。可以複製條款連結傳俾朋友。" },
] as const;

const PAD = 10;

function seen(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) === "done";
  } catch {
    return true;
  }
}

/** mount once the page has content; remount with `force` (new key) to replay */
export default function PdfCenterTour({ force = false }: { force?: boolean }) {
  const [step, setStep] = useState<number | null>(() => (force || !seen() ? 0 : null));
  const [rect, setRect] = useState<DOMRect | null>(null);
  const reduced = useReducedMotion();

  const finish = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, "done");
    } catch {
      /* private mode: show again next time */
    }
    setStep(null);
  }, []);
  const next = useCallback(() => setStep((s) => (s == null ? s : s + 1 < STEPS.length ? s + 1 : (finish(), null))), [finish]);

  // measure the target and keep the cut-out on it while scrolling / resizing
  useLayoutEffect(() => {
    if (step == null) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${STEPS[step].id}"]`);
    const tall = el ? el.getBoundingClientRect().height > window.innerHeight * 0.6 : false;
    el?.scrollIntoView({ block: tall ? "start" : "center", behavior: reduced ? "auto" : "smooth" });
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => (el ? setRect(el.getBoundingClientRect()) : next()));
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [step, next, reduced]);

  useEffect(() => {
    if (step == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, next, finish]);

  if (step == null || !rect) return null;
  const s = STEPS[step];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // cut-out clipped to the viewport so tall targets (the PDF viewer) still leave room for the caption
  const top = Math.max(8, rect.top - PAD);
  const hole = {
    x: Math.max(8, rect.left - PAD),
    y: top,
    width: Math.min(vw - 16, rect.width + PAD * 2),
    height: Math.max(0, Math.min(vh - 8 - top, rect.height + PAD * 2)),
  };
  // caption: below → above → beside (left / right) → pinned to the bottom over the target
  const CW = Math.min(360, vw - 32);
  const CH = 230;
  const clampX = (x: number) => Math.min(Math.max(16, x), vw - CW - 16);
  let place: { top: number; left: number; arrow: string };
  if (hole.y + hole.height + CH + 16 < vh) place = { top: hole.y + hole.height + 18, left: clampX(hole.x), arrow: "↑" };
  else if (hole.y - CH - 16 > 0) place = { top: hole.y - CH - 8, left: clampX(hole.x), arrow: "↓" };
  else if (hole.x - CW - 32 > 0) place = { top: Math.max(96, hole.y + 24), left: hole.x - CW - 24, arrow: "→" };
  else if (vw - (hole.x + hole.width) - CW - 32 > 0) place = { top: Math.max(96, hole.y + 24), left: hole.x + hole.width + 24, arrow: "←" };
  else place = { top: vh - CH - 16, left: clampX(16), arrow: "↑" };
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 220, damping: 28 };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-tour-title"
      aria-describedby="pdf-tour-body"
      onClick={next}
    >
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id="pdf-tour-hole">
            <rect width="100%" height="100%" fill="#fff" />
            <motion.rect initial={false} animate={hole} transition={spring} rx={18} fill="#000" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(24,20,38,.8)" mask="url(#pdf-tour-hole)" />
        <motion.rect
          initial={false}
          animate={{ x: hole.x - 5, y: hole.y - 5, width: hole.width + 10, height: hole.height + 10 }}
          transition={spring}
          rx={22}
          fill="none"
          stroke="#fff"
          strokeWidth={2.5}
          strokeDasharray="10 8"
          className={reduced ? undefined : "tour-ants"}
        />
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
          className="absolute rounded-[20px_14px_22px_12px/12px_22px_14px_20px] border-2 border-dashed border-white/35 bg-[rgba(24,20,38,.92)] p-5 text-white shadow-2xl"
          style={{ top: place.top, left: place.left, width: CW }}
        >
          <p className="font-hand text-[22px] font-bold text-amber">
            {place.arrow} 第 {step + 1} / {STEPS.length} 步
          </p>
          <h2 id="pdf-tour-title" className="mt-1 font-serif text-[24px] font-bold leading-tight">
            {s.title}
          </h2>
          <p id="pdf-tour-body" className="mt-2 text-[15px] leading-relaxed text-white/90">
            {s.body}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true">
              {STEPS.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-amber" : "w-1.5 bg-white/40"}`} />
              ))}
            </span>
            <button type="button" autoFocus className="ml-auto rounded-full bg-white px-4 py-1.5 text-[14px] font-bold text-ink" onClick={(e) => (e.stopPropagation(), next())}>
              {step + 1 < STEPS.length ? "下一步" : "開始使用"}
            </button>
            <button type="button" className="text-[13px] font-bold text-white/70 underline-offset-4 hover:underline" onClick={(e) => (e.stopPropagation(), finish())}>
              略過
            </button>
          </div>
          <p className="mt-2 text-[12px] text-white/55">撳畫面任何位置繼續 · Esc 略過</p>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  );
}

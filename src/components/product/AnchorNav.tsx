import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLenis } from "@/lib/lenis";
import { cn } from "@/lib/utils";

export interface AnchorSection {
  id: string;
  num: string;
  label: string;
}

/** product.md S2 錨點導航分節 */
export const PRODUCT_SECTIONS: AnchorSection[] = [
  { id: "pd-coverage", num: "01", label: "保障項目" },
  { id: "pd-premium", num: "02", label: "保費資料" },
  { id: "pd-tiers", num: "03", label: "計劃層級" },
  { id: "pd-terms", num: "04", label: "主要條款" },
  { id: "pd-exclusions", num: "05", label: "不保事項" },
  { id: "pd-citations", num: "06", label: "資料出處" },
  { id: "pd-sources", num: "07", label: "官方來源" },
];

const NAV_OFFSET = 100;

function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, {
      offset: -NAV_OFFSET,
      duration: 0.9,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * 左側錨點導航（desktop only，sticky top 140px）：
 * scroll-spy 現時 section 紅點＋紅字、已讀 section 墨點，
 * 頂部進度條顯示閱讀進度。
 */
export default function AnchorNav({ className }: { className?: string }) {
  const [active, setActive] = useState<string>(PRODUCT_SECTIONS[0].id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = NAV_OFFSET + 60;
      let current = PRODUCT_SECTIONS[0].id;
      let firstTop: number | null = null;
      let lastBottom: number | null = null;
      for (const s of PRODUCT_SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (firstTop === null) firstTop = rect.top + window.scrollY;
        lastBottom = rect.bottom + window.scrollY;
        if (rect.top <= probe) current = s.id;
      }
      setActive(current);
      if (firstTop !== null && lastBottom !== null && lastBottom > firstTop) {
        const read = window.scrollY + probe - firstTop;
        setProgress(Math.min(1, Math.max(0, read / (lastBottom - firstTop))));
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Lenis 平滑捲動都會觸發（window scroll 之外嘅保險）
    const lenis = getLenis();
    lenis?.on("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      lenis?.off("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const activeIndex = PRODUCT_SECTIONS.findIndex((s) => s.id === active);

  return (
    <nav aria-label="產品檔案分節" className={cn("w-[200px] shrink-0", className)}>
      {/* 閱讀進度 */}
      <div className="mb-4 pl-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
            閱讀進度
          </span>
          <span className="font-grotesk text-[12px] font-bold text-red">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div
          className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full"
          style={{ background: "var(--line)" }}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="產品檔案閱讀進度"
        >
          <motion.div
            className="h-full origin-left rounded-full bg-red"
            animate={{ scaleX: progress }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>
      </div>

      <ul className="relative flex flex-col gap-1 border-l pl-4" style={{ borderColor: "var(--line)" }}>
        {PRODUCT_SECTIONS.map((s, i) => {
          const isActive = active === s.id;
          const isPassed = i < activeIndex;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-small transition-colors duration-300",
                  isActive
                    ? "font-bold text-red"
                    : isPassed
                      ? "text-ink hover:text-red"
                      : "text-ink-soft hover:text-ink",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300",
                    isActive
                      ? "bg-red"
                      : isPassed
                        ? "bg-ink"
                        : "bg-transparent group-hover:bg-ink-faint",
                  )}
                  aria-hidden="true"
                />
                <span className="font-grotesk text-[11px] font-bold tracking-wider opacity-60">
                  {s.num}
                </span>
                {s.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

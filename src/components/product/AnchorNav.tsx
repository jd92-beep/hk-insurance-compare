import { useEffect, useState } from "react";
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
  { id: "pd-sources", num: "06", label: "官方來源" },
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
 * 左側錨點導航（desktop only，sticky top 140px，滾動 spy：
 * 當前 section 紅點 + 紅字）。
 */
export default function AnchorNav({ className }: { className?: string }) {
  const [active, setActive] = useState<string>(PRODUCT_SECTIONS[0].id);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = NAV_OFFSET + 60;
      let current = PRODUCT_SECTIONS[0].id;
      for (const s of PRODUCT_SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probe) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <nav aria-label="產品檔案分節" className={cn("w-[200px] shrink-0", className)}>
      <ul className="flex flex-col gap-1 border-l pl-4" style={{ borderColor: "var(--line)" }}>
        {PRODUCT_SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-small transition-colors duration-300",
                  isActive ? "font-bold text-red" : "text-ink-soft hover:text-ink",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300",
                    isActive ? "bg-red" : "bg-transparent group-hover:bg-ink-faint",
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

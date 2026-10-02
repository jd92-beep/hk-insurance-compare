import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { GuideEntry } from "@/components/guides/guides-data";
import { CATEGORY_META } from "@/lib/categories";
import TiltCard from "@/components/fx/TiltCard";
import { SketchFrame } from "@/components/fx/Sketch";
import { handleCardClickNavigation } from "@/lib/card-navigation";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * 九類「點揀」指南卡（guides.md S2）：
 * 紙卡 + 頂 3px 類別色條 + icon + 重點列表（紅色 §）+「去格價 →」。
 * 卡 id 係類別錨點（/guides#home 由類別頁 S4 連入）。
 */
export default function GuideCard({ guide, index }: { guide: GuideEntry; index: number }) {
  const meta = CATEGORY_META[guide.id];
  const color = meta?.color ?? "#2E2A45";
  const navigate = useNavigate();
  const detailHref = `/category/${guide.id}`;

  return (
    <TiltCard max={8} glare sketch={color} className="h-full rounded-card">
    <motion.article
      id={guide.id}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: EASE_OUT_EXPO }}
      className="depth-card card-accent sketch-card group relative flex h-full cursor-pointer scroll-mt-24 flex-col overflow-hidden border bg-paper p-7"
      style={{ "--accent": color } as React.CSSProperties}
      onClick={(e) => handleCardClickNavigation(e, detailHref, navigate)}
    >
      <SketchFrame color={color} />
      {/* 頂部類別色手繪筆觸 */}
      <svg viewBox="0 0 300 14" preserveAspectRatio="none" className="absolute inset-x-0 top-0 block h-3.5 w-full" aria-hidden="true">
        <motion.path
          d="M0 6 C 40 2 80 10 130 6 S 220 2 300 7 L300 0 L0 0Z"
          fill={color}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.7, delay: 0.15 + (index % 3) * 0.08, ease: EASE_OUT_EXPO }}
        />
      </svg>
      <div className="flex items-center gap-3">
        <span
          className="cat-icon h-8 w-8 shrink-0 transition-transform duration-300 group-hover:-rotate-6"
          style={{
            color,
            WebkitMaskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
            maskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
          }}
          aria-hidden="true"
        />
        <h3 className="font-serif text-[22px] font-bold leading-[1.3] text-ink">
          {guide.shortName}點揀
        </h3>
      </div>
      <ul className="mt-5 flex flex-col gap-4">
        {guide.tips.map((tip) => (
          <li key={tip.title} className="flex gap-2.5">
            <span className="shrink-0 font-hand text-[19px] font-bold leading-none" style={{ color }} aria-hidden="true">
              ✓
            </span>
            <p className="text-small text-ink-soft">
              <span className="font-bold text-ink">{tip.title}</span>
              {" — "}
              {tip.detail}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Link
          to={`/category/${guide.id}`}
          className="inline-flex items-center gap-1.5 border-t-2 border-dashed pt-4 text-small font-bold text-red transition-colors hover:text-red-deep w-full"
          style={{ borderColor: `${color}55` }}
        >
          去格價
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.article>
    </TiltCard>
  );
}

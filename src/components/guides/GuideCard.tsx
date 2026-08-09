import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { GuideEntry } from "@/components/guides/guides-data";
import { CATEGORY_META } from "@/lib/categories";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * 九類「點揀」指南卡（guides.md S2）：
 * 紙卡 + 頂 3px 類別色條 + icon + 重點列表（紅色 §）+「去格價 →」。
 * 卡 id 係類別錨點（/guides#home 由類別頁 S4 連入）。
 */
export default function GuideCard({ guide, index }: { guide: GuideEntry; index: number }) {
  const meta = CATEGORY_META[guide.id];
  const color = meta?.color ?? "#181D2E";

  return (
    <motion.article
      id={guide.id}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: EASE_OUT_EXPO }}
      className="group relative flex scroll-mt-24 flex-col overflow-hidden rounded-card border bg-paper p-7 shadow-card transition-shadow duration-300 hover:shadow-lift"
      style={{ borderColor: "var(--line)" }}
    >
      {/* 頂部類別色條 */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.7, delay: 0.15 + (index % 3) * 0.08, ease: EASE_OUT_EXPO }}
        className="absolute inset-x-0 top-0 h-[3px] origin-left"
        style={{ background: color }}
        aria-hidden="true"
      />
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
            <span className="mt-px shrink-0 font-serif font-bold text-red" aria-hidden="true">
              §
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
          className="inline-flex items-center gap-1.5 border-t pt-4 text-small font-bold text-red transition-colors hover:text-red-deep w-full"
          style={{ borderColor: "var(--line)" }}
        >
          去格價
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}

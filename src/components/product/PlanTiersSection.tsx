import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";

/**
 * S2.3 計劃層級：每個 tier 一張橫向紙卡；點擊跳官方來源（新分頁）。
 * 只有 1 項 → 單張寬卡，唔顯示層級序號（附錄 2）。
 */
export default function PlanTiersSection({
  product,
  color,
}: {
  product: Product;
  color: string;
}) {
  const tiers = product.plan_tiers ?? [];
  if (tiers.length === 0) return null;
  const single = tiers.length === 1;
  const sourceUrl = product.source_urls?.[0];

  return (
    <div>
      <SectionHeading index="03" title="計劃層級" />
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ staggerChildren: 0.07 }}
        className="flex flex-col gap-3"
      >
        {tiers.map((tier, i) => (
          <motion.li
            key={tier}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_EXPO } },
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (sourceUrl) window.open(sourceUrl, "_blank", "noopener,noreferrer");
              }}
              className="group relative flex w-full items-center gap-4 overflow-hidden rounded-card border bg-paper px-6 py-5 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              style={{ borderColor: "var(--line)" }}
              aria-label={`${tier}（前往官方產品頁）`}
            >
              {/* 左緣色條（scaleY 生長） */}
              <motion.span
                className="absolute inset-y-0 left-0 w-[4px] origin-top"
                style={{ background: color }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.15 + i * 0.07 }}
                aria-hidden="true"
              />
              {!single && (
                <span className="font-grotesk text-small font-bold text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <span className="flex-1 font-sans text-[16px] font-medium leading-[1.7] text-ink">
                {tier}
              </span>
              <ArrowRight
                size={18}
                className="shrink-0 text-red transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </motion.li>
        ))}
      </motion.ul>
      <p className="mt-3 text-small text-ink-faint">
        點擊計劃卡可前往官方產品頁睇各層級詳細保障（新分頁開啟）。
      </p>
    </div>
  );
}

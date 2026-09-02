import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Product } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import { renderTierText } from "@/components/product/tier-text";
import { cn } from "@/lib/utils";

/** tab 短名：括號前嘅主名（太長就截短） */
function tierShortName(tier: string): string {
  const main = tier.split(/[（(]/)[0]?.trim() ?? tier;
  return main.length > 18 ? `${main.slice(0, 18)}…` : main;
}

function TierSourceLink({ url, className }: { url?: string; className?: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-small font-bold text-red transition-colors hover:text-red-deep hover:underline",
        className,
      )}
    >
      去官方產品頁睇呢個層級詳細保障
      <ExternalLink size={14} />
    </a>
  );
}

/**
 * S2.3 計劃層級。
 * 1–3 個層級：每個 tier 一張橫向紙卡；多過 3 個：tabs 分層展示（附錄 2 / UX 建議 4）。
 * 行內 S/F 認可編號 → monospace chip；「（只供現有保單續保）」→ amber badge。
 */
export default function PlanTiersSection({
  product,
  color,
}: {
  product: Product;
  color: string;
}) {
  const tiers = product.plan_tiers ?? [];
  const [activeTab, setActiveTab] = useState(0);
  if (tiers.length === 0) return null;
  const single = tiers.length === 1;
  const sourceUrl = product.source_urls?.[0];

  /* ── 多於 3 個層級 → tabs ── */
  if (tiers.length > 3) {
    const active = Math.min(activeTab, tiers.length - 1);
    return (
      <div>
        <SectionHeading index="03" title="計劃層級" />
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="計劃層級分頁"
        >
          {tiers.map((tier, i) => {
            const isActive = i === active;
            return (
              <button
                key={tier}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "chip border font-bold transition-all duration-300 active:scale-[0.96]",
                  isActive
                    ? "border-transparent bg-ink text-paper"
                    : "bg-paper-3 text-ink-soft hover:text-ink",
                )}
                style={!isActive ? { borderColor: "transparent" } : undefined}
                title={tier}
              >
                <span className="font-grotesk text-[11px] opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {tierShortName(tier)}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="relative mt-4 overflow-hidden rounded-card border bg-paper px-6 py-6 shadow-card"
            style={{ borderColor: "var(--line)" }}
            role="tabpanel"
          >
            <span
              className="absolute inset-y-0 left-0 w-[4px]"
              style={{ background: color }}
              aria-hidden="true"
            />
            <p className="font-grotesk text-small font-bold text-ink-faint">
              層級 {String(active + 1).padStart(2, "0")} / {String(tiers.length).padStart(2, "0")}
            </p>
            <p className="mt-2 font-sans text-[17px] font-medium leading-[1.9] text-ink">
              {renderTierText(tiers[active])}
            </p>
            <TierSourceLink url={sourceUrl} className="mt-4" />
          </motion.div>
        </AnimatePresence>
        <p className="mt-3 text-small text-ink-faint">
          共 {tiers.length} 個層級；點上方 tabs 切換，保障細節以官方文件為準。
        </p>
      </div>
    );
  }

  /* ── 1–3 個層級 → 橫向紙卡 ── */
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
              <span className="flex-1 font-sans text-[16px] font-medium leading-[1.9] text-ink">
                {renderTierText(tier)}
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

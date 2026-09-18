import VerifiedPromotion from "@/components/VerifiedPromotion";
import { priceDisplay } from "@/lib/premium-display";
import { ExternalLink, FileText, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router";
import type { Product } from "@/types/insurance";
import type { FeatureMatchResult } from "@/lib/feature-filters";
import { categoryColor } from "@/lib/categories";
import { useCompare } from "@/providers/CompareProvider";
import PriceRangeBar from "@/components/PriceRangeBar";
import StampBadge from "@/components/StampBadge";
import { cn } from "@/lib/utils";
import { toastCompareToggle } from "@/lib/ui-feedback";
import { motion } from "framer-motion";
import { MOTION } from "@/lib/motion-runtime";

/**
 * 產品卡（§7.3）— 全站核心組件。
 * 點卡身 → 產品詳情頁；右下「+ 加入比較」獨立按鈕。
 */
export default function ProductCard({
  product,
  className,
  match,
}: {
  product: Product;
  className?: string;
  match?: FeatureMatchResult;
}) {
  const navigate = useNavigate();
  const compare = useCompare();
  const color = categoryColor(product.category);
  const inTray = compare.has(product.id);
  const tiers = product.plan_tiers ?? [];
  const shownTiers = tiers.slice(0, 3);
  const extraTiers = tiers.length - shownTiers.length;
  const highlights = (product.coverage ?? []).slice(0, 3);
  const sourceUrl = product.source_urls?.[0];
  const pricing = priceDisplay(product);
  const buyUrl = pricing.buyUrl;

  const goDetail = () => navigate(`/product/${product.id}`);

  return (
    <motion.article
      onClick={goDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) goDetail();
      }}
      tabIndex={0}
      whileHover={{ y: -MOTION.hoverLiftPx, scale: 1.025, transition: MOTION.springSoft }}
      whileTap={{ scale: MOTION.pressScale, transition: { duration: MOTION.duration.snap } }}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-card border bg-paper shadow-card transition-shadow duration-300 hover:shadow-lift shine-sweep",
        className,
      )}
      style={{ borderColor: "var(--line)" }}
      aria-label={`${product.insurer_zh} ${product.product_name_zh || product.product_name}`}
    >
      {/* 頂部類別色條 */}
      <div
        className="h-[3px] w-full transition-all duration-300 group-hover:h-[7px]"
        style={{ background: color }}
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* 保險公司 + 印章 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-small">
              <span className="font-grotesk font-bold text-ink">{product.insurer}</span>
              <span className="ml-2 font-sans font-medium text-ink-soft">{product.insurer_zh}</span>
            </p>
            <h3 className="mt-1 font-sans text-[20px] font-bold leading-[1.35] text-ink max-md:text-[18px]">
              {product.product_name_zh || product.product_name}
            </h3>
          </div>
          <StampBadge
            variant={product.premium_available ? "jade" : "gray"}
            size={28}
          />
        </div>

        {/* 摘要條件對照（關鍵字檢索，唔係核保／理賠結果） */}
        {match && match.totalSelected > 0 && (
          <div className="flex flex-col gap-1 rounded-lg border border-jade/30 bg-jade/10 p-2.5 text-[12px]">
            <div className="flex items-center justify-between gap-1.5">
              <span className={cn(
                "font-bold font-sans",
                match.matchedCount === match.totalSelected ? "text-jade" : "text-sky-800 dark:text-sky-300"
              )}>
                {match.matchedCount === match.totalSelected
                  ? `✅ 摘要條件全部對到 ${match.matchedCount}/${match.totalSelected} 項（仍要核對原文）`
                  : `🔍 摘要對到 ${match.matchedCount}/${match.totalSelected} 項你揀嘅條件`}
              </span>
              <span className="font-mono text-[11px] font-bold text-jade" title="只係關鍵字對照百分比，唔係適合度">
                {match.score}% 摘要對照
              </span>
            </div>
            {match.matchedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {match.matchedTags.map((t) => (
                  <span key={t.id} className="rounded bg-paper px-1.5 py-0.5 text-[10.5px] font-semibold text-jade shadow-2xs border border-jade/25">
                    ✓ {t.label}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[10.5px] leading-snug text-ink-faint">
              摘要命中唔等於核保批核、理賠機會或「最適合你」。
            </p>
          </div>
        )}

        {/* 計劃層級 chips */}
        {shownTiers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shownTiers.map((t) => (
              <span key={t} className="chip bg-paper-3 text-ink-soft">
                {t.length > 14 ? `${t.slice(0, 14)}…` : t}
              </span>
            ))}
            {extraTiers > 0 && (
              <span className="chip bg-paper-3 font-grotesk text-ink-faint">+{extraTiers}</span>
            )}
          </div>
        )}

        <VerifiedPromotion product={product} />

        {/* 保費尺規 / 即時報價 */}
        <PriceRangeBar product={product} />

        {/* 保障亮點 */}
        {highlights.length > 0 && (
          <ul className="flex flex-col gap-1 text-small text-ink-soft">
            {highlights.map((c) => (
              <li key={c.item} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
                <span>
                  <span className="font-medium text-ink">{c.item}</span>
                  <span className="mx-1 text-ink-faint">·</span>
                  <span>{c.limit.length > 42 ? `${c.limit.slice(0, 42)}…` : c.limit}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* 底部行：文件數 + 官方來源 + 加入比較 */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-3 text-small text-ink-faint">
            <span className="inline-flex items-center gap-1" title="官方文件">
              <FileText size={13} />
              {product.documents_found?.length ?? 0}
            </span>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 font-medium text-jade transition-colors hover:underline"
              >
                官方來源
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-[10px] bg-red text-paper hover:scale-105 hover:bg-red-deep px-3 py-1.5 text-small font-bold shadow-xs active:scale-90 transition-all duration-200"
                title="前往該保險公司官方投保／報價頁面"
              >
                <span>{pricing.buyLabel ?? "官網報價"}</span>
                <ExternalLink size={12} />
              </a>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const label = product.product_name_zh || product.product_name;
                if (!inTray && compare.isFull) {
                  toastCompareToggle(label, false, true);
                  return;
                }
                compare.toggle(product.id);
                toastCompareToggle(label, !inTray);
              }}
              disabled={!inTray && compare.isFull}
              className={cn(
                "inline-flex items-center gap-1 rounded-[10px] border px-3 py-1.5 text-small font-bold transition-all duration-200 active:scale-90",
                inTray
                  ? "border-jade bg-jade-wash text-jade shadow-[0_0_0_3px_rgba(14,124,102,.18)]"
                  : "text-ink hover:scale-105 hover:border-red hover:bg-red hover:text-paper disabled:cursor-not-allowed disabled:opacity-40",
              )}
              style={!inTray ? { borderColor: "var(--line-strong)" } : undefined}
            >
              {inTray ? <Check size={14} /> : <Plus size={14} />}
              {inTray ? "已加入比較" : "加入比較"}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

import { purchaseUrl } from "@/lib/product-availability";
import { ExternalLink, FileText, Plus, Check, Sparkles, Copy } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Product } from "@/types/insurance";
import type { FeatureMatchResult } from "@/lib/feature-filters";
import { categoryColor } from "@/lib/categories";
import { useCompare } from "@/providers/CompareProvider";
import PriceRangeBar from "@/components/PriceRangeBar";
import StampBadge from "@/components/StampBadge";
import { cn } from "@/lib/utils";

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
  const buyUrl = purchaseUrl(product);
  const origPrice = product.original_price || product.promo?.original_price;
  const discPrice = product.discounted_price || product.promo?.discounted_price;
  const hasDiscount = Boolean(origPrice && discPrice && origPrice > discPrice);

  const goDetail = () => navigate(`/product/${product.id}`);

  return (
    <article
      onClick={goDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) goDetail();
      }}
      tabIndex={0}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-card border bg-paper shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift shine-sweep",
        className,
      )}
      style={{ borderColor: "var(--line)" }}
      aria-label={`${product.insurer_zh} ${product.product_name_zh || product.product_name}`}
    >
      {/* 頂部類別色條 */}
      <div
        className="h-[3px] w-full transition-all duration-300 group-hover:h-[5px]"
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

        {/* 智能契合度 Badge（用戶自選重視保障命中狀態） */}
        {match && match.totalSelected > 0 && (
          <div className="flex flex-col gap-1 rounded-lg border border-jade/30 bg-jade/10 p-2.5 text-[12px]">
            <div className="flex items-center justify-between gap-1.5">
              <span className={cn(
                "font-bold font-sans",
                match.matchedCount === match.totalSelected ? "text-jade" : "text-sky-800 dark:text-sky-300"
              )}>
                {match.matchedCount === match.totalSelected
                  ? `🎯 完美符合全部 ${match.matchedCount}/${match.totalSelected} 項重視保障`
                  : `✨ 符合 ${match.matchedCount}/${match.totalSelected} 項重視保障`}
              </span>
              <span className="font-mono text-[11px] font-bold text-jade">
                {match.score}% 契合
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

        {/* 推廣折扣優惠與優惠碼 Badge */}
        {product.promo && (
          <div
            className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[12px] font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 font-bold text-amber-900 dark:text-amber-200">
                <Sparkles size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                {product.promo.tag}
              </span>
              {product.promo.discount && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  {product.promo.discount}
                </span>
              )}
            </div>
            {product.promo.code ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(product.promo!.code!);
                  toast.success(`已複製優惠碼：${product.promo!.code}`, { position: "top-center" });
                }}
                className="group/btn inline-flex items-center gap-1 rounded border border-amber-400/40 bg-paper px-2 py-0.5 font-mono text-[11px] font-bold text-amber-800 shadow-xs transition-all hover:border-amber-500 hover:bg-amber-100/60 dark:bg-paper-2 dark:text-amber-200"
                title="點擊複製優惠碼"
              >
                <span>{product.promo.code}</span>
                <Copy size={11} className="text-amber-600 transition-transform group-hover/btn:scale-110" />
              </button>
            ) : product.promo.note ? (
              <span className="text-[11px] text-ink-soft line-clamp-1" title={product.promo.note}>
                {product.promo.note}
              </span>
            ) : null}
          </div>
        )}


        {/* 官方即時折後價與劃線原價（精準、最新、不誤導） */}
        {hasDiscount && origPrice && discPrice && (
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-[12.5px] font-grotesk text-ink-faint line-through">
              HK${origPrice.toLocaleString()}
            </span>
            <span className="font-grotesk text-[19px] font-black text-red">
              HK${discPrice.toLocaleString()}
            </span>
            <span className="rounded bg-red/10 px-1.5 py-0.5 font-sans text-[11px] font-bold text-red">
              {product.promo?.discount || "折後價"}
            </span>
            <span className="text-[11px] text-ink-faint">
              （實付價）
            </span>
          </div>
        )}

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
                className="inline-flex items-center gap-1 rounded-[10px] bg-red text-paper hover:bg-red/90 px-3 py-1.5 text-small font-bold shadow-xs active:scale-95 transition-all"
                title="前往該保險公司官方投保／報價頁面"
              >
                <span>官網投保</span>
                <ExternalLink size={12} />
              </a>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                compare.toggle(product.id);
              }}
              disabled={!inTray && compare.isFull}
              className={cn(
                "inline-flex items-center gap-1 rounded-[10px] border px-3 py-1.5 text-small font-bold transition-all duration-300",
                inTray
                  ? "border-jade bg-jade-wash text-jade"
                  : "text-ink hover:border-red hover:bg-red hover:text-paper disabled:cursor-not-allowed disabled:opacity-40",
              )}
              style={!inTray ? { borderColor: "var(--line-strong)" } : undefined}
            >
              {inTray ? <Check size={13} /> : <Plus size={13} />}
              {inTray ? "已加入" : "加入比較"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

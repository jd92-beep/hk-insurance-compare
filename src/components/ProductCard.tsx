import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Check,
  Plus,
  ArrowRight,
  ChevronDown,
  Heart,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import type { Product } from "@/types/insurance";
import type { FeatureMatchResult } from "@/lib/feature-filters";
import { getInsurerColor } from "@/lib/insurer-colors";
import { isReferenceOnlyProduct } from "@/lib/product-availability";
import { useCompare } from "@/providers/CompareProvider";
import { useFavorites } from "@/providers/FavoritesProvider";
import { toastCompareToggle, toastFavoriteToggle } from "@/lib/ui-feedback";
import { handleCardClickNavigation } from "@/lib/card-navigation";
import {
  deriveCardSellingPoints,
  deriveCardPlanTiers,
  deriveCompactPremium,
} from "@/lib/product-card-data";
import { quotePathway } from "@/lib/quote-pathway";
import VerifiedPromotion from "@/components/VerifiedPromotion";
import TiltCard from "@/components/fx/TiltCard";
import Card3DGem from "@/components/fx/Card3DGem";
import { cn } from "@/lib/utils";

/** Separate links/buttons: selecting text, opening details and using a keyboard never navigates the card accidentally. */
export default function ProductCard({
  product,
  className,
  match,
}: {
  product: Product;
  className?: string;
  match?: FeatureMatchResult;
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const compare = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();
  const selected = compare.has(product.id);
  const isFav = isFavorite(product.id);
  const title = product.product_name_zh || product.product_name;
  const historical = isReferenceOnlyProduct(product);
  const detailHref = `/product/${product.id}`;
  const highlightColor = getInsurerColor(product.insurer || product.insurer_zh);

  // 1. 核心賣點（Selling Points）：官方提煉、清晰精煉，不再是大段文字
  const sellingPoints = useMemo(() => deriveCardSellingPoints(product), [product]);

  // 2. 計劃層級（Plan Tiers）：獨立結構化呈現，包括 VHIS 認可編號及自付費選項
  const planTiersInfo = useMemo(() => deriveCardPlanTiers(product), [product]);

  // 3. 參考保費（Compact Premium）：首屏不再顯示厚重的「有公開保費文字」區塊，改為極簡清晰標籤
  const compactPremium = useMemo(() => deriveCompactPremium(product), [product]);

  // 4. 展開後所使用的詳細報價通道資料
  const pathway = useMemo(() => quotePathway(product), [product]);

  return (
    <TiltCard max={10} glare className={cn("h-full rounded-card", className)}>
      <article
        className="depth-surface group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-card border border-line bg-paper"
        aria-label={`${product.insurer_zh} ${title}`}
        onClick={(e) => handleCardClickNavigation(e, detailHref, navigate)}
      >
        {/* 頂部彩色品牌 Highlight 條 */}
        <div
          className="h-1.5 depth-z-bar"
          style={{ background: highlightColor }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-3 p-5 md:p-6">
          {/* 公司名稱與收藏按鈕 */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <span>
                  {product.insurer_zh}{" "}
                  <span className="font-grotesk">{product.insurer}</span>
                </span>
                {historical && (
                  <span className="rounded bg-amber-wash px-1.5 py-0.5 text-[10px] font-bold text-amber">
                    歷史資料
                  </span>
                )}
              </p>

              {/* 互動式最愛收藏按鈕 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleFavorite(product.id);
                  toastFavoriteToggle(title, !isFav);
                }}
                aria-label={isFav ? `取消收藏 ${title}` : `加入我的最愛 ${title}`}
                title={isFav ? "已加入我的最愛（點擊取消）" : "加入我的最愛"}
                className={cn(
                  "shrink-0 depth-z-icon flex items-center justify-center rounded-lg border p-1 shadow-xs transition-all duration-300",
                  isFav
                    ? "border-red/40 bg-red-wash/60 text-red shadow-sm scale-105 hover:scale-110"
                    : "border-line-strong/20 bg-paper-2/60 text-ink-soft hover:scale-105 hover:border-line-strong hover:bg-paper hover:shadow-sm"
                )}
              >
                {isFav ? (
                  <Heart size={20} className="fill-red text-red drop-shadow-xs" />
                ) : (
                  <Card3DGem size={22} color={highlightColor} glow={false} />
                )}
              </button>
            </div>

            {/* 產品名稱 */}
            <h3 className="mt-2 text-lg font-bold leading-snug text-ink">
              <Link
                className="rounded hover:text-jade hover:underline focus-visible:outline-offset-4"
                to={detailHref}
              >
                {title}
              </Link>
            </h3>

            {/* 計劃層級 (Plan Tiers) 獨立標籤列 */}
            {planTiersInfo.tiers.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-ink-soft">計劃層級：</span>
                {planTiersInfo.tiers.map((tier, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md border border-line bg-paper-2/80 px-2 py-0.5 text-[11px] font-semibold text-ink"
                  >
                    {tier}
                  </span>
                ))}
                {planTiersInfo.vhisCode && (
                  <span className="inline-flex items-center rounded-md border border-jade/30 bg-jade-wash/40 px-2 py-0.5 text-[11px] font-bold text-jade">
                    認可編號 {planTiersInfo.vhisCode}
                  </span>
                )}
                {planTiersInfo.deductibles && (
                  <span className="text-[10px] text-ink-faint">
                    自付費：{planTiersInfo.deductibles}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 核心保障賣點 (Selling Points) 區塊：重點突出、簡明易掃描 */}
          {sellingPoints.length > 0 && (
            <div className="rounded-xl border border-line bg-paper-2/70 p-3 text-xs">
              <p className="mb-2 flex items-center justify-between font-bold text-ink-soft">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: highlightColor }}
                  />
                  官方核心保障賣點 · SELLING POINTS
                </span>
                <span className="text-[10px] text-ink-faint font-normal">精華摘要</span>
              </p>
              <ul className="space-y-1.5 text-ink">
                {sellingPoints.map((sp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className="font-bold select-none text-[12px] leading-tight"
                      style={{ color: highlightColor }}
                    >
                      ✓
                    </span>
                    <span className="leading-snug">
                      <strong className="font-bold text-ink mr-1">{sp.label}：</strong>
                      <span className="font-medium text-ink-soft">{sp.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 檢索摘要吻合指示 */}
          {match && match.totalSelected > 0 && (
            <p className="rounded-lg bg-paper-2 px-3 py-1.5 text-xs leading-relaxed text-ink-soft">
              摘要對照 <strong className="text-ink">{match.matchedCount}/{match.totalSelected}</strong> · 非核保結果
            </p>
          )}

          {/* 首屏極簡參考保費標籤（取代原先冗長且重複的「有公開保費文字」區塊） */}
          <div className="flex items-center justify-between rounded-lg border border-line bg-paper-2/40 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-ink-soft">參考保費：</span>
              <span className="font-grotesk font-bold text-ink">
                {compactPremium.text}
              </span>
            </div>
            <span className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-medium text-ink-faint border border-line/60">
              {compactPremium.subtext || "官方快照"}
            </span>
          </div>

          {/* 認證推廣優惠 */}
          <VerifiedPromotion product={product} />

          {/* 展開詳細計劃 (See More) 摺疊區域：點擊後才呈現完整保費資料與主要條款 */}
          {expanded && (
            <div className="flex flex-col gap-3.5 pt-1 animate-in fade-in duration-200">
              {/* 1. 保費資料與官方報價通道 */}
              <section
                aria-label="保費資料與報價"
                className="rounded-xl border border-line bg-paper-2/50 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ink">{pathway.headline}</h4>
                  {pathway.buyUrl && (
                    <a
                      href={pathway.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-jade hover:underline text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>前往官網報價</span>
                      <ExternalLink size={11} aria-hidden="true" />
                    </a>
                  )}
                </div>
                <p className="mt-1 font-grotesk font-medium text-ink leading-relaxed">
                  {pathway.snapshotText || "未提供公開保費文字，請向保險公司查詢。"}
                </p>
                <p className="mt-1 text-[11px] text-ink-faint">
                  {pathway.disclaimer}
                </p>
              </section>

              {/* 2. 計劃層級提醒 */}
              {planTiersInfo.multiple && (
                <div className="rounded-lg border border-amber/40 bg-amber/5 p-2.5 text-xs text-ink">
                  <span className="font-bold">此系列涵蓋多個保障級別：</span>
                  <p className="mt-0.5 text-ink-soft">
                    {product.plan_tiers.slice(0, 4).join("、")}
                    {product.plan_tiers.length > 4 ? " 等" : ""}
                  </p>
                </div>
              )}

              {/* 3. 主要條款與保障摘要 */}
              <section aria-label="保障摘要" className="text-xs">
                <h4 className="font-bold text-ink">主要保障條款摘要</h4>
                <p className="mt-0.5 text-[11px] text-ink-soft">
                  具體限額及不保條件以官方保單條款為準。
                </p>
                {product.coverage.length ? (
                  <dl className="mt-2 space-y-2 border-t border-line pt-2">
                    {product.coverage.slice(0, 3).map((row, i) => (
                      <div key={`${row.item}-${i}`} className="flex flex-col">
                        <dt className="font-semibold text-ink">{row.item}</dt>
                        <dd className="mt-0.5 leading-relaxed text-ink-soft">
                          {row.limit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-1 text-ink-soft">未提供可比較摘要。</p>
                )}
              </section>

              {/* 4. 主要不保事項與限制 */}
              <section
                className="rounded-xl border border-amber/40 bg-amber/5 p-3 text-xs"
                aria-label="主要不保事項"
              >
                <div className="flex items-center gap-1.5 font-bold text-ink">
                  <ShieldAlert size={14} className="text-amber" />
                  <h4>主要不保事項與限制</h4>
                </div>
                <p className="mt-1.5 leading-relaxed text-ink">
                  {product.exclusions[0] ||
                    "未提供完整不保事項；投保前已有病症、高危活動及合約生效等候期等除外條款以原文為準。"}
                </p>
                <Link
                  to={detailHref}
                  className="mt-2 inline-flex min-h-8 items-center gap-1 font-bold text-jade underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>查看全部限制及官方 PDF 原文</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </section>
            </div>
          )}

          {/* 下方居中「See More」切換按鈕 */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-2/80 px-4 py-1.5 text-xs font-bold text-ink-soft transition-all hover:border-jade hover:bg-jade-wash hover:text-jade active:scale-95 cursor-pointer"
              aria-expanded={expanded}
            >
              <span>{expanded ? "收起詳細計劃" : "查看詳細計劃 (See More)"}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-300",
                  expanded && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* 底部雙按鈕：睇計劃詳情 & 加入比較 */}
          <div className="mt-1 grid grid-cols-2 gap-3 border-t border-line-strong pt-4">
            <Link
              to={detailHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line-strong px-3 py-3 text-center text-base font-bold text-ink hover:bg-paper-2 transition-colors"
            >
              睇計劃詳情
            </Link>
            <button
              type="button"
              aria-pressed={selected}
              disabled={!selected && compare.isFull}
              onClick={(e) => {
                e.stopPropagation();
                if (!selected && compare.isFull) {
                  toastCompareToggle(title, false, true);
                  return;
                }
                compare.toggle(product.id);
                toastCompareToggle(title, !selected);
              }}
              className={cn(
                "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-jade bg-jade-wash text-jade"
                  : "border-ink bg-ink text-paper hover:bg-ink-soft"
              )}
            >
              {selected ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Plus size={18} aria-hidden="true" />
              )}
              {selected ? "已加入比較" : "加入比較"}
            </button>
          </div>

          {!selected && compare.isFull && (
            <p className="text-sm text-ink-soft text-center">
              已揀三項。請先在比較清單移除一項。
            </p>
          )}
        </div>
      </article>
    </TiltCard>
  );
}

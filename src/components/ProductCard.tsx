import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, Plus, ArrowRight, ChevronDown, Heart } from 'lucide-react';
import type { Product } from '@/types/insurance';
import type { FeatureMatchResult } from '@/lib/feature-filters';
import { getInsurerColor } from '@/lib/insurer-colors';
import { isReferenceOnlyProduct } from '@/lib/product-availability';
import { useCompare } from '@/providers/CompareProvider';
import { useFavorites } from '@/providers/FavoritesProvider';
import { toastCompareToggle, toastFavoriteToggle } from '@/lib/ui-feedback';
import { handleCardClickNavigation } from '@/lib/card-navigation';
import PriceRangeBar from '@/components/PriceRangeBar';
import VerifiedPromotion from '@/components/VerifiedPromotion';
import TiltCard from '@/components/fx/TiltCard';
import Card3DGem from '@/components/fx/Card3DGem';
import { cn } from '@/lib/utils';

/** Separate links/buttons: selecting text, opening details and using a keyboard never navigates the card accidentally. */
export default function ProductCard({ product, className, match }: { product: Product; className?: string; match?: FeatureMatchResult }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const compare = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();
  const selected = compare.has(product.id);
  const isFav = isFavorite(product.id);
  const title = product.product_name_zh || product.product_name;
  const historical = isReferenceOnlyProduct(product);
  const multiplePlans = product.plan_tiers.length > 1;
  const detailHref = `/product/${product.id}`;
  const highlightColor = getInsurerColor(product.insurer || product.insurer_zh);

  // 提取核心賣點（Selling Points），在縮細卡片時精準呈現最有價值的保障
  const sellingPoints = useMemo(() => {
    const points: string[] = [];
    // 1. 優先從 coverage 提取高價值項目（如每年保障額、終身保障額、住院及手術等）
    if (product.coverage && product.coverage.length > 0) {
      for (const cov of product.coverage) {
        if (points.length >= 3) break;
        if (
          cov.item &&
          cov.limit &&
          cov.limit !== '未提供' &&
          cov.limit !== '未收錄' &&
          cov.limit !== '依細項上限'
        ) {
          points.push(`${cov.item}：${cov.limit}`);
        }
      }
    }
    // 2. 從 plan_tiers 提取包含的計劃層級
    if (points.length < 3 && product.plan_tiers && product.plan_tiers.length > 0) {
      const validTiers = product.plan_tiers.filter(Boolean);
      if (validTiers.length > 0) {
        points.push(`涵蓋計劃：${validTiers.slice(0, 2).join('、')}${validTiers.length > 2 ? '等' : ''}`);
      }
    }
    // 3. 從 key_terms 提取關鍵條款亮點
    if (points.length < 3 && product.key_terms && product.key_terms.length > 0) {
      for (const term of product.key_terms) {
        if (points.length >= 3) break;
        if (term && !points.includes(term)) {
          points.push(term);
        }
      }
    }
    return points;
  }, [product]);

  return <TiltCard max={10} glare className={cn('h-full rounded-card', className)}>
    <article
      className="depth-surface group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-card border border-line bg-paper"
      aria-label={`${product.insurer_zh} ${title}`}
      onClick={(e) => handleCardClickNavigation(e, detailHref, navigate)}
    >
      <div className="h-1.5 depth-z-bar" style={{ background: highlightColor }} aria-hidden="true" />
      <div className="flex flex-col gap-3 p-5 md:p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-ink-soft flex items-center gap-2">
              <span>{product.insurer_zh} <span className="font-grotesk">{product.insurer}</span></span>
              {historical && (
                <span className="rounded bg-amber-wash px-1.5 py-0.5 text-[10px] font-bold text-amber">
                  歷史資料
                </span>
              )}
            </p>
            {/* 互動式最愛收藏按鈕（寶石/心形切換） */}
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
          <h3 className="mt-2 text-lg font-bold leading-snug text-ink">
            <Link className="rounded hover:text-jade hover:underline focus-visible:outline-offset-4" to={`/product/${product.id}`}>
              {title}
            </Link>
          </h3>
        </div>

        {/* 核心賣點 (Selling Points) 區塊：精準凸顯保障重點 */}
        {sellingPoints.length > 0 && (
          <div className="rounded-xl border border-line bg-paper-2/70 p-3 text-xs">
            <p className="font-bold text-ink-soft uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: highlightColor }} />
              核心保障賣點 · SELLING POINTS
            </p>
            <ul className="space-y-1 text-ink font-medium">
              {sellingPoints.map((sp, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold select-none" style={{ color: highlightColor }}>✓</span>
                  <span className="line-clamp-1">{sp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {match && match.totalSelected > 0 && (
          <p className="rounded-lg bg-paper-2 px-3 py-2 text-xs leading-relaxed text-ink-soft">
            摘要對照 <strong className="text-ink">{match.matchedCount}/{match.totalSelected}</strong> · 非核保結果
          </p>
        )}
        <PriceRangeBar product={product} />
        <VerifiedPromotion product={product} />
        {/* 展開詳細計劃 (See More) 摺疊區域：預設收摺縮短 1/3 長度 */}
        {expanded && (
          <div className="flex flex-col gap-4 pt-1 animate-in fade-in duration-200">
            {multiplePlans && (
              <p className="rounded-lg border border-amber/50 bg-amber/5 p-2.5 text-xs font-medium leading-relaxed text-ink">
                多個級別：此系列涵蓋不同保障級別，請先確認你所選的具體計劃。
              </p>
            )}
            <section aria-label="保障摘要">
              <h4 className="text-base font-bold text-ink">保障摘要</h4>
              <p className="mt-1 text-sm text-ink-soft">限額及條件以計劃原文為準。</p>
              {product.coverage.length ? <dl className="mt-3 space-y-3">{product.coverage.slice(0, 2).map((row, i) => <div key={`${row.item}-${i}`}><dt className="text-base font-semibold text-ink">{row.item}</dt><dd className="mt-1 text-base leading-relaxed text-ink-soft">{row.limit}</dd></div>)}</dl> : <p className="mt-2 text-base text-ink-soft">未提供可比較摘要；請向公司索取保障表。</p>}
            </section>
            <section className="rounded-xl border border-amber/50 bg-amber/5 p-4" aria-label="不保與限制">
              <h4 className="text-base font-bold text-ink">可能唔保</h4>
              <p className="mt-2 text-base leading-relaxed text-ink">{product.exclusions[0] || '未提供完整不保事項；唔代表沒有除外條款。'}</p>
              <Link to={`/product/${product.id}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-jade underline">全部限制同來源 <ArrowRight size={16} aria-hidden="true" /></Link>
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
            <span>{expanded ? '收起詳細計劃' : '查看詳細計劃 (See More)'}</span>
            <ChevronDown size={14} className={cn('transition-transform duration-300', expanded && 'rotate-180')} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-3 border-t border-line-strong pt-4">
          <Link to={`/product/${product.id}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line-strong px-3 py-3 text-center text-base font-bold text-ink hover:bg-paper-2">睇計劃詳情</Link>
          <button type="button" aria-pressed={selected} disabled={!selected && compare.isFull} onClick={() => {
            if (!selected && compare.isFull) { toastCompareToggle(title, false, true); return; }
            compare.toggle(product.id); toastCompareToggle(title, !selected);
          }} className={cn('inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50', selected ? 'border-jade bg-jade-wash text-jade' : 'border-ink bg-ink text-paper hover:bg-ink-soft')}>
            {selected ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}{selected ? '已加入比較' : '加入比較'}
          </button>
        </div>
        {!selected && compare.isFull && <p className="text-sm text-ink-soft">已揀三項。請先在比較清單移除一項。</p>}
      </div>
    </article>
  </TiltCard>;
}

import { Link } from 'react-router';
import { Check, Plus, ArrowRight } from 'lucide-react';
import type { Product } from '@/types/insurance';
import type { FeatureMatchResult } from '@/lib/feature-filters';
import { categoryColor } from '@/lib/categories';
import { isReferenceOnlyProduct } from '@/lib/product-availability';
import { useCompare } from '@/providers/CompareProvider';
import { toastCompareToggle } from '@/lib/ui-feedback';
import PriceRangeBar from '@/components/PriceRangeBar';
import VerifiedPromotion from '@/components/VerifiedPromotion';
import TiltCard from '@/components/fx/TiltCard';
import { cn } from '@/lib/utils';

/** Separate links/buttons: selecting text, opening details and using a keyboard never navigates the card accidentally. */
export default function ProductCard({ product, className, match }: { product: Product; className?: string; match?: FeatureMatchResult }) {
  const compare = useCompare();
  const selected = compare.has(product.id);
  const title = product.product_name_zh || product.product_name;
  const historical = isReferenceOnlyProduct(product);
  const multiplePlans = product.plan_tiers.length > 1;
  return <TiltCard max={3} glare={false} className={cn('rounded-card', className)}>
    <article className="depth-surface relative flex flex-col overflow-hidden rounded-card border border-line bg-paper" aria-label={`${product.insurer_zh} ${title}`}>
      <div className="h-1" style={{ background: categoryColor(product.category) }} aria-hidden="true" />
      <div className="flex flex-col gap-4 p-5 md:p-6">
        <div>
          <p className="text-base font-semibold text-ink-soft">{product.insurer_zh} <span className="font-grotesk">{product.insurer}</span></p>
          <h3 className="mt-2 text-xl font-bold leading-relaxed text-ink"><Link className="rounded hover:text-jade hover:underline focus-visible:outline-offset-4" to={`/product/${product.id}`}>{title}</Link></h3>
          <p className="mt-2 text-sm font-medium text-ink-soft">{historical ? '舊資料／唔作新投保參考' : '資料摘要・未全面核實現行條款'}</p>
        </div>
        {multiplePlans && <p className="rounded-lg border border-amber/30 bg-amber/5 p-3 text-sm leading-relaxed text-ink">多個級別：保障未必同一計劃，先確認你揀嘅級別。</p>}
        {match && match.totalSelected > 0 && <p className="rounded-lg bg-paper-2 p-3 text-sm leading-relaxed text-ink-soft">摘要對照 <strong className="text-ink">{match.matchedCount}/{match.totalSelected}</strong> · 非核保結果</p>}
        <PriceRangeBar product={product} />
        <VerifiedPromotion product={product} />
        <section aria-label="保障摘要">
          <h4 className="text-base font-bold text-ink">保障摘要</h4>
          <p className="mt-1 text-sm text-ink-soft">限額及條件以計劃原文為準。</p>
          {product.coverage.length ? <dl className="mt-3 space-y-3">{product.coverage.slice(0, 2).map((row, i) => <div key={`${row.item}-${i}`}><dt className="text-base font-semibold text-ink">{row.item}</dt><dd className="mt-1 text-base leading-relaxed text-ink-soft">{row.limit}</dd></div>)}</dl> : <p className="mt-2 text-base text-ink-soft">未提供可比較摘要；請向公司索取保障表。</p>}
        </section>
        <section className="rounded-xl border border-amber/30 bg-amber/5 p-4" aria-label="不保與限制">
          <h4 className="text-base font-bold text-ink">可能唔保</h4>
          <p className="mt-2 text-base leading-relaxed text-ink-soft">{product.exclusions[0] || '未提供完整不保事項；唔代表沒有除外條款。'}</p>
          <Link to={`/product/${product.id}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-jade underline">全部限制同來源 <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
        <div className="mt-1 grid grid-cols-2 gap-3 border-t border-line pt-4">
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

import { useMemo } from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import type { Product } from '@/types/insurance';
import { resolveCoverage } from '@/components/compare/canonical-benefits';
import { CoverageLimitCell, ExclusionsCell, KeyTermsCell, PlanTiersCell, PremiumRangeCell } from '@/components/compare/cells';
import EvidenceChip from '@/components/EvidenceChip';
import { useInsuranceData } from '@/providers/InsuranceDataProvider';

/** On a phone, put every selected product under the same question; no memory-heavy A/B/C tab switching. */
export default function MobileCompare({ products, onRemove }: { products: Product[]; onRemove?: (id: string) => void }) {
  const resolved = useMemo(() => resolveCoverage(products), [products]);
  const { generatedAt } = useInsuranceData();
  return <div className="space-y-5">
    <section aria-label="已選產品" className="space-y-3">{products.map((p,i) => <article key={p.id} className="depth-surface rounded-xl border border-line bg-paper p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-base font-bold text-ink">{String.fromCharCode(65+i)} · {p.insurer_zh}</p><Link to={`/product/${p.id}`} className="mt-2 block text-base leading-relaxed text-jade underline">{p.product_name_zh || p.product_name}</Link><EvidenceChip product={p} generatedAt={generatedAt} className="mt-2" /></div>{onRemove && <button type="button" onClick={() => onRemove(p.id)} aria-label={`移除 ${p.product_name_zh || p.product_name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:bg-paper-2"><X size={20} aria-hidden="true" /></button>}</div></article>)}</section>
    <p className="rounded-xl border border-amber/30 bg-amber/5 p-4 text-base leading-relaxed text-ink">先睇限制，再睇保費。同一問題下面逐份對照，唔使來回切換。未提供唔等於不保。來源欄位狀態只係機械檢查，唔代表條款已核實。</p>
    <section className="rounded-xl border border-line bg-paper" aria-label="不保事項比較"><h2 className="border-b border-line bg-paper-2 px-4 py-4 text-lg font-bold text-ink">咩情況唔保？</h2>{products.map(p => <div key={p.id} className="border-b border-line p-4 last:border-0"><h3 className="mb-3 text-base font-bold text-ink">{p.insurer_zh}</h3><ExclusionsCell product={p} /></div>)}</section>
    <details className="rounded-xl border border-line bg-paper p-4"><summary className="min-h-11 cursor-pointer py-2 text-lg font-bold text-ink">計劃級別、自付費同其他條件</summary><p className="py-2 text-base text-ink-soft">核對自付費係每年定每次計。以下保留原始摘要，唔係自付金額計算。</p>{products.map(p => <div key={p.id} className="space-y-3 border-t border-line py-4"><h3 className="text-base font-bold text-ink">{p.insurer_zh}</h3><PlanTiersCell product={p} /><KeyTermsCell product={p} /></div>)}</details>
    {[...resolved.matched, ...resolved.others].map(benefit => <details key={benefit.key} className="rounded-xl border border-line bg-paper p-4"><summary className="min-h-11 cursor-pointer py-2 text-lg font-bold text-ink">{benefit.label}</summary>{products.map((p,i) => <div key={p.id} className="border-t border-line py-4"><h3 className="mb-2 text-base font-bold text-ink">{p.insurer_zh}</h3><CoverageLimitCell limit={benefit.limits[i]} highlight={false} /></div>)}</details>)}
    <section className="rounded-xl border border-line bg-paper" aria-label="參考保費比較"><h2 className="border-b border-line bg-paper-2 p-4 text-lg font-bold text-ink">參考保費（唔係即時報價）</h2>{products.map(p => <div key={p.id} className="border-b border-line p-4 last:border-0"><h3 className="mb-3 text-base font-bold text-ink">{p.insurer_zh}</h3><PremiumRangeCell product={p} /><Link to={`/product/${p.id}`} className="mt-3 inline-flex min-h-11 items-center text-base font-semibold text-jade underline">核對完整條款及來源</Link></div>)}</section>
  </div>;
}

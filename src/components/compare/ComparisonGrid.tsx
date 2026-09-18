import { useMemo, useState, type ReactNode } from 'react';
import type { Product } from '@/types/insurance';
import { resolveCoverage } from '@/components/compare/canonical-benefits';
import { CoverageLimitCell, DocumentsCell, ExclusionsCell, KeyTermsCell, PlanTiersCell, PremiumNotesCell, PremiumRangeCell, SourceLinksCell } from '@/components/compare/cells';

/** Semantic table. Differences are textual differences, never a product winner. */
export default function ComparisonGrid({ products }: { products: Product[]; spare?: boolean }) {
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const resolved = useMemo(() => resolveCoverage(products), [products]);
  const rows = [...resolved.matched, ...resolved.others].filter(row => !differencesOnly || new Set(row.limits.map(value => value?.trim() || '未提供')).size > 1);
  const group = (label: string) => <tr><th colSpan={products.length + 1} className="bg-paper-3 px-5 py-4 text-left text-lg font-bold text-ink">{label}</th></tr>;
  const row = (label: string, render: (p: Product, i: number) => ReactNode) => <tr className="border-b border-line"><th scope="row" className="sticky left-0 z-10 w-44 border-r border-line bg-paper px-4 py-5 text-left align-top text-base font-semibold text-ink">{label}</th>{products.map((p,i) => <td key={p.id} className="min-w-0 px-5 py-5 align-top text-base leading-relaxed text-ink">{render(p,i)}</td>)}</tr>;
  return <div>
    <label className="mb-4 flex min-h-11 items-center gap-3 text-base font-semibold text-ink"><input type="checkbox" checked={differencesOnly} onChange={e => setDifferencesOnly(e.target.checked)} disabled={products.length < 2} className="h-5 w-5 accent-[var(--jade)]" />保障項目只睇文字差異</label>
    <div className="overflow-x-auto rounded-xl border border-line" role="region" aria-label="保險資料比較表，可橫向捲動" tabIndex={0}>
      <table className="w-full min-w-[720px] table-fixed border-collapse">
        <caption className="bg-paper-2 px-5 py-4 text-left text-base leading-relaxed text-ink-soft">同一行只方便核對，唔代表保障相同。每年／每次上限、自付費、年齡、級別及地區要一致先可以比。未提供唔等於不保。</caption>
        <thead><tr><th scope="col" className="w-44 border-b border-line bg-paper p-4 text-left text-base text-ink">核對項目</th>{products.map(p => <th key={p.id} scope="col" className="border-b border-line bg-paper p-4 text-left align-top text-base font-bold text-ink">{p.insurer_zh}<span className="mt-2 block text-sm font-normal leading-relaxed text-ink-soft">{p.product_name_zh || p.product_name}</span></th>)}</tr></thead>
        <tbody>
          {group('01 先睇級別同限制')}
          {row('邊個計劃級別？', p => <PlanTiersCell product={p} />)}
          {row('咩情況唔保？', p => <ExclusionsCell product={p} />)}
          {row('自己要付幾多？', p => <div><p className="mb-3 text-sm text-ink-soft">以下係摘要，唔係自付金額計算。請在原文核對自負額、自付比例及計算期間。</p><KeyTermsCell product={p} /></div>)}
          {group('02 再睇保障摘要')}
          {rows.map(benefit => <tr key={benefit.key} className="border-b border-line"><th scope="row" className="sticky left-0 z-10 border-r border-line bg-paper px-4 py-5 text-left align-top text-base font-semibold text-ink">{benefit.label}</th>{products.map((p,i) => <td key={p.id} className="px-5 py-5 align-top"><CoverageLimitCell limit={benefit.limits[i]} highlight={false} /></td>)}</tr>)}
          {rows.length === 0 && <tr><td colSpan={products.length + 1} className="p-5 text-base text-ink-soft">{differencesOnly ? '摘要文字沒有顯示差異，唔代表實際保障完全相同。' : '本站未提供可對照保障。請核對公司文件。'}</td></tr>}
          {group('03 最後核對保費同原文')}
          {row('參考保費（非報價）', p => <PremiumRangeCell product={p} />)}
          {row('保費有咩條件？', p => <PremiumNotesCell product={p} />)}
          {row('記錄的文件名稱', p => <DocumentsCell product={p} />)}
          {row('原文來源', p => <SourceLinksCell product={p} />)}
        </tbody>
      </table>
    </div>
  </div>;
}

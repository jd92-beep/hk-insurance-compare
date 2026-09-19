import { lazy, Suspense, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Search, Scale } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import EmptyState from '@/components/EmptyState';
import ProductCard from '@/components/ProductCard';
import HowWeRankCard from '@/components/trust/HowWeRankCard';
import FilterBar, { type SortKey, type ViewMode, type TravelTripType, type TravelRegion } from '@/components/category/FilterBar';
import ProductTable from '@/components/category/ProductTable';
import CategoryDecisionGuide from '@/components/category/CategoryDecisionGuide';
import { categoryCopy } from '@/components/category/copy';
import { CATEGORY_META } from '@/lib/categories';
import { filterCatalogue } from '@/lib/catalogue-search';
import {
  filterAndRankProductsByFeatures,
  getCategoryFeatureTags,
  getCategoryPersonaPresets,
  type FeatureMatchMode,
  type PersonaPreset,
} from '@/lib/feature-filters';
import { MEDICAL_PATH_CHIPS, isMedicalFamilyCategory } from '@/lib/research-intents';
import { useInsuranceData, useProducts } from '@/providers/InsuranceDataProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePolicyCalendar } from '@/hooks/use-policy-calendar';

/** Keying by entry parameters also resets stale filters on back/forward navigation. */
export default function CategoryDetail() {
  const { categoryId = '' } = useParams();
  const [params] = useSearchParams();
  return <Catalogue key={`${categoryId}:${params.get('insurer') ?? ''}`} categoryId={categoryId} initialInsurer={params.get('insurer') ?? ''} />;
}
const UniversalComparisonChart = lazy(() => import('@/components/category/UniversalComparisonChart'));

function Catalogue({ categoryId, initialInsurer }: { categoryId: string; initialInsurer: string }) {
  const { loading, error, retry, generatedAt } = useInsuranceData();
  const products = useProducts(categoryId);
  const mobile = useIsMobile();
  const today = usePolicyCalendar();
  const [, setParams] = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>(initialInsurer ? [initialInsurer] : []);
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [includeHistorical, setIncludeHistorical] = useState(false);
  const [trip, setTrip] = useState<TravelTripType>('all');
  const [region, setRegion] = useState<TravelRegion>('all');
  const [sort, setSort] = useState<SortKey>('default');
  const [view, setView] = useState<ViewMode>('cards');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<FeatureMatchMode>('smart');
  const [featureQuery, setFeatureQuery] = useState('');
  const copy = categoryCopy(categoryId);
  const isTravel = categoryId === 'travel';
  const color = CATEGORY_META[categoryId]?.color ?? 'var(--jade)';
  const tags = getCategoryFeatureTags(categoryId);
  const validTagIds = useMemo(() => new Set(tags.map(tag => tag.id)), [tags]);
  const personaPresets = useMemo(() => getCategoryPersonaPresets(categoryId), [categoryId]);
  const insurerOptions = useMemo(() => [...new Map(products.map(p => [p.insurer, p.insurer_zh])).entries()].map(([name, name_zh]) => ({ name, name_zh })).sort((a,b) => a.name.localeCompare(b.name)), [products]);
  const applyPersonaPreset = (preset: PersonaPreset) => {
    const ids = [...new Set([...preset.tagIds, ...preset.featureIds])].filter(id => validTagIds.has(id));
    setSelectedFeatures(ids);
  };
  const ranked = useMemo(() => {
    const candidates = filterCatalogue(products, { query, insurers: selectedInsurers, onlyPremium, onlyPromo: isTravel && onlyPromo, includeHistorical, trip: isTravel ? trip : 'all', region: isTravel ? region : 'all', now: new Date(`${today}T12:00:00+08:00`) });
    return filterAndRankProductsByFeatures(candidates, selectedFeatures, categoryId, matchMode).results;
  }, [products, query, selectedInsurers, onlyPremium, onlyPromo, includeHistorical, trip, region, today, isTravel, selectedFeatures, categoryId, matchMode]);
  const matches = useMemo(() => new Map(ranked.map(r => [r.product.id, r.match])), [ranked]);
  const shown = useMemo(() => {
    const rows = ranked.map(r => r.product);
    if (sort === 'insurer-az') rows.sort((a,b) => a.insurer.localeCompare(b.insurer) || a.id.localeCompare(b.id));
    return rows;
  }, [ranked, sort]);
  const active = Boolean(query || selectedInsurers.length || onlyPremium || onlyPromo || includeHistorical || trip !== 'all' || region !== 'all' || selectedFeatures.length || sort !== 'default');
  const reset = () => {
    setQuery(''); setSelectedInsurers([]); setOnlyPremium(false); setOnlyPromo(false); setIncludeHistorical(false);
    setTrip('all'); setRegion('all'); setSelectedFeatures([]); setFeatureQuery(''); setMatchMode('smart'); setSort('default');
    if (initialInsurer) setParams(params => { const next = new URLSearchParams(params); next.delete('insurer'); return next; }, { replace: true });
  };
  if (!copy) return <div className="site-container py-16"><EmptyState title="搵唔到呢個保險類別" description="請返回首頁揀選類別。" /><Link className="btn-outline mt-5" to="/">返回首頁</Link></div>;
  return <div className="pb-16" data-catalogue-layout="plain-first" data-catalogue-total={shown.length}>
    <header className="site-container pb-6 pt-6 md:pt-10">
      <Breadcrumbs items={[{ label: '首頁', to: '/' }, { label: copy.h1 }]} />
      <p className="eyebrow mt-6 text-jade">{copy.english}</p>
      <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-ink md:text-5xl">{copy.h1}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{copy.sub}</p>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">先揀資料 → 加入比較 → 核對條款。本站唔係全市場清單，亦唔提供個人投保建議。</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm text-ink-soft">
        <span>資料快照：{generatedAt}；唔代表全部條款已更新。<Link to="/data-quality" className="ml-2 inline-flex min-h-11 items-center font-semibold text-jade underline">查看覆核狀態</Link><Link to={`/guides#${categoryId}`} className="ml-2 inline-flex min-h-11 items-center font-semibold text-jade underline">睇「點揀」指南</Link></span>
        <Link to="/compare" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line-strong bg-paper px-4 font-semibold text-ink"><Scale size={18} aria-hidden="true" />開啟比較清單</Link>
      </div>
      <div className="mt-5">
        <HowWeRankCard snapshotDate={generatedAt} sort={sort} onSortChange={setSort} categoryId={categoryId} />
      </div>
      {isMedicalFamilyCategory(categoryId) && (
        <nav aria-label="醫療路徑導航" className="mt-4 flex flex-wrap items-center gap-2" data-testid="medical-path-chips">
          <span className="text-sm font-semibold text-ink-soft">醫療路徑：</span>
          {MEDICAL_PATH_CHIPS.map((chip) => (
            <Link
              key={chip.id}
              to={chip.to}
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-paper px-3 text-sm font-semibold text-ink hover:border-jade hover:text-jade"
            >
              {chip.label}
            </Link>
          ))}
        </nav>
      )}
      <label htmlFor="catalogue-search" className="mt-6 block text-base font-bold text-ink">搵保險公司或產品名稱</label>
      <div className="relative mt-2 max-w-2xl"><Search size={20} aria-hidden="true" className="absolute left-4 top-4 text-ink-soft" /><input id="catalogue-search" type="search" value={query} onChange={e => setQuery(e.target.value)} maxLength={120} placeholder="例如：安盛、AXA、產品名稱" className="h-12 w-full rounded-xl border border-line-strong bg-paper pl-12 pr-4 text-base text-ink" /></div>
    </header>
    {/* Non-blocking decision scaffold — never blocks filters or results */}
    <CategoryDecisionGuide categoryId={categoryId} />
    {personaPresets.length > 0 && (
      <section className="site-container pt-5" aria-label="摘要檢索情境快捷鍵">
        <div className="rounded-xl border border-line bg-paper-2 px-4 py-3">
          <p className="text-sm font-bold text-ink">摘要檢索</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            以下情境只係幫你快速填入篩選條件（filter shortcuts），唔代表適合度、投保建議或產品推薦。命中摘要仍要核對原文限制同不保事項。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {personaPresets.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPersonaPreset(preset)}
                title={preset.description}
                className="chip min-h-11 border bg-paper text-ink transition-colors hover:border-jade hover:text-jade"
                style={{ borderColor: 'var(--line-strong)' }}
              >
                <span className="font-grotesk text-[11px] font-bold text-jade">摘要檢索</span>
                <span className="ml-2">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    )}
    <div id="category-filter-controls">
      <FilterBar insurers={insurerOptions} selectedInsurers={selectedInsurers} onToggleInsurer={name => setSelectedInsurers(current => current.includes(name) ? current.filter(n => n !== name) : [...current, name])} onClearInsurers={() => setSelectedInsurers([])} onlyPremium={onlyPremium} onTogglePremium={() => setOnlyPremium(v => !v)} onlyPromo={onlyPromo} onTogglePromo={() => setOnlyPromo(v => !v)} includeHistorical={includeHistorical} onToggleHistorical={() => setIncludeHistorical(v => !v)} sort={sort} onSortChange={setSort} view={view} onViewChange={setView} showViewToggle={!mobile} shown={shown.length} total={products.length} onReset={reset} hasActiveFilters={active} isTravel={isTravel} travelTripType={trip} onTravelTripTypeChange={setTrip} travelRegion={region} onTravelRegionChange={setRegion} activeFeatureCount={selectedFeatures.length} />
    </div>
    {tags.length > 0 && <section className="site-container pt-5">
      <details className="rounded-xl border border-line bg-paper p-4">
        <summary className="min-h-11 cursor-pointer py-2 text-base font-bold text-ink">再按保障項目篩選{selectedFeatures.length ? `（已揀 ${selectedFeatures.length} 項）` : '（可略過）'}</summary>
        <p className="mt-2 text-base leading-relaxed text-ink-soft">呢度只搵摘要入面相關字眼，唔代表已確認受保。限制同不保事項仍然要睇原文。例如「自駕遊」可以試篩「租車」；「滑雪」可以試篩相關運動標籤——呢啲只係檢索條件，唔係投保建議。</p>
        <label className="mt-4 block text-sm font-semibold text-ink">搵保障項目<input value={featureQuery} onChange={e => setFeatureQuery(e.target.value)} type="search" maxLength={80} className="mt-2 block min-h-11 w-full rounded-lg border border-line-strong bg-paper px-3 text-base" placeholder="例如：租車、醫療" /></label>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tags.filter(tag => `${tag.label} ${tag.keywords.join(' ')}`.toLowerCase().includes(featureQuery.trim().toLowerCase())).map(tag => <label key={tag.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-line px-3 py-3 text-base leading-relaxed text-ink"><input type="checkbox" checked={selectedFeatures.includes(tag.id)} onChange={() => setSelectedFeatures(current => current.includes(tag.id) ? current.filter(id => id !== tag.id) : [...current, tag.id])} className="mt-1 h-5 w-5 shrink-0 accent-[var(--jade)]" />{tag.label}</label>)}
        </div>
        <fieldset className="mt-4 flex flex-wrap gap-4 text-base text-ink"><legend className="mb-2 font-bold">點樣篩選？</legend>{([{ id: 'smart', label: '保留部分符合的資料' }, { id: 'strict', label: '只顯示全部所選項目都有對應摘要' }] as const).map(mode => <label key={mode.id} className="flex min-h-11 items-center gap-2"><input type="radio" name="feature-mode" value={mode.id} checked={matchMode === mode.id} onChange={() => setMatchMode(mode.id)} className="h-5 w-5" />{mode.label}</label>)}</fieldset>
        {selectedFeatures.length > 0 && <button type="button" onClick={() => setSelectedFeatures([])} className="mt-3 min-h-11 rounded-lg border border-line-strong px-4 text-base font-semibold text-ink">清除保障項目</button>}
      </details>
    </section>}
    <section className="site-container py-6" aria-label="產品搜尋結果" aria-busy={loading}>
      {loading ? <p role="status" className="py-12 text-base text-ink">載入資料中…</p> : error ? <EmptyState title="暫時載入唔到資料" description="唔好將載入失敗當作沒有產品。請重試。" onReset={retry} resetLabel="重新載入" /> : shown.length === 0 ? <EmptyState title="暫時搵唔到符合條件嘅資料" description="可能係資料未註明，唔代表市場上冇呢類保障。試吓減少條件。" onReset={reset} /> : mobile || view === 'cards' ? <div className="grid grid-cols-1 items-start gap-6 fold:grid-cols-2 lg:grid-cols-3">{shown.map(product => <ProductCard key={product.id} product={product} match={matches.get(product.id)} />)}</div> : <ProductTable products={shown} color={color} coverageKeywords={copy.coverageKeywords} productMatchMap={matches} />}
    </section>
    <section className="site-container py-4">
      <details className="rounded-xl border border-line bg-paper px-5 py-3" onToggle={event => setShowAdvanced(event.currentTarget.open)}>
        <summary className="min-h-11 cursor-pointer py-2 text-base font-bold text-ink">進階：按相同計算單位對照金額</summary>
        <p className="pt-2 text-base text-ink-soft">金額大唔代表更適合。呢個對照保留不同單位、限制及未確認資料，唔作產品排名。</p>
        {showAdvanced && <Suspense fallback={<p role="status" className="py-6">載入數值對照…</p>}><UniversalComparisonChart products={shown} /></Suspense>}
      </details>
    </section>
    <section className="site-container pt-6" aria-labelledby="questions-title">
      <h2 id="questions-title" className="font-serif text-2xl font-bold text-ink">報價前，問清楚三件事</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 fold:grid-cols-3">{copy.highlights.map((hint, index) => <article key={hint.title} className="depth-surface rounded-card border border-line bg-paper p-5"><span aria-hidden="true" className="font-grotesk text-3xl text-amber">0{index + 1}</span><h3 className="mt-3 text-lg font-bold text-ink">{hint.title}</h3><p className="mt-2 text-base leading-relaxed text-ink-soft">{hint.body}</p></article>)}</div>
      <div className="mt-8 space-y-3">{copy.faq.map(faq => <details key={faq.q} className="rounded-xl border border-line bg-paper px-5 py-3"><summary className="min-h-11 cursor-pointer py-2 text-lg font-semibold text-ink">{faq.q}</summary><p className="pb-3 pt-2 text-base leading-relaxed text-ink-soft">{faq.a}</p></details>)}</div>
    </section>
  </div>;
}

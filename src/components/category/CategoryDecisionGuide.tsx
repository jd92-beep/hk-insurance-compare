import { useState } from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowRight, Check, FileSearch } from "lucide-react";
import { CATEGORY_DECISIONS, preparedCount } from "@/lib/category-decisions";
const stages = ["先定需要", "同一基準比較", "回到條款"];
export default function CategoryDecisionGuide({ categoryId }: { categoryId: string }) {
  const [stage, setStage] = useState(0), [prepared, setPrepared] = useState<number[]>([]);
  const guide = CATEGORY_DECISIONS[categoryId]; if (!guide) return null;
  const count = preparedCount(prepared);
  return <section className="relative border-y border-jade/15 bg-paper py-10 md:py-14" aria-labelledby="decision-heading">
    <div className="site-container">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl"><p className="text-xs font-bold tracking-[.18em] text-jade">YOUR COMPARISON, YOUR TERMS</p><h2 id="decision-heading" className="mt-3 font-serif text-2xl font-bold leading-snug md:text-3xl">{guide.question}</h2></div>
        <a href="#category-filter-controls" className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-sm font-semibold text-jade underline-offset-4 hover:underline">直接去篩選<ArrowDown size={16} /></a>
      </div>
      <nav aria-label="比較準備步驟" className="grid grid-cols-3 gap-2 border-b border-line pb-3 md:gap-6">{stages.map((label,i) => <button key={label} onClick={() => setStage(i)} aria-pressed={stage===i} className={`flex min-h-14 flex-col items-start gap-1 rounded-lg px-3 py-2 text-left transition-colors sm:flex-row sm:items-center sm:gap-3 ${stage===i ? 'bg-jade text-white' : 'bg-paper-2 text-ink-soft hover:bg-jade/10'}`}><span className="font-grotesk text-lg opacity-70">0{i+1}</span><span className="text-sm font-semibold">{label}</span></button>)}</nav>
      <div className="mt-6 grid gap-7 md:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] md:gap-12">
        <div className="min-w-0" aria-live="polite">
          {stage===0 ? <><p className="mb-3 text-sm text-ink-soft">比較之前，先準備呢三項資料。</p><div className="divide-y">{guide.prepare.map((text,i) => <label key={text} className="flex min-h-16 cursor-pointer items-center gap-3 py-3 text-sm leading-relaxed"><input type="checkbox" checked={prepared.includes(i)} onChange={() => setPrepared(p => p.includes(i) ? p.filter(n=>n!==i) : [...p,i])} className="h-5 w-5 shrink-0 accent-jade" />{text}</label>)}</div></> : stage===1 ? <dl className="divide-y">{guide.compare.map(([label,text]) => <div key={label} className="py-3 first:pt-0"><dt className="font-bold text-ink">{label}</dt><dd className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</dd></div>)}</dl> : <><p className="mb-3 text-sm font-semibold text-ink">未買之前，逐條確認：</p><ol className="space-y-4">{guide.verify.map((text,i) => <li key={text} className="flex gap-3 text-sm leading-relaxed"><span className="font-grotesk text-jade">{i+1}.</span>{text}</li>)}</ol></>}
        </div>
        <aside className="flex flex-col justify-between rounded-2xl border border-jade/15 bg-gradient-to-br from-jade/5 via-paper to-paper-2 p-6">
          <div><div className="flex items-center justify-between"><FileSearch className="text-jade" size={25} /><span className="font-grotesk text-3xl font-medium text-jade">{count}<span className="text-base text-ink-faint"> / 3</span></span></div><h3 className="mt-4 font-serif text-xl font-bold">資料準備好，先比較得準。</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">呢個清單只記錄你有冇準備比較資料，唔係保障適合度評分。網站摘要命中，仍要核對原文、投保資格同不保事項。</p></div>
          <div className="mt-5 flex flex-wrap gap-3">{stage<2 ? <button className="btn-ghost min-h-11 text-sm" onClick={() => setStage(s=>s+1)}>下一步<ArrowRight size={15} /></button> : <Link to="/documents" className="btn-ghost min-h-11 text-sm">開啟 PDF 中心<ArrowRight size={15} /></Link>}<button className="min-h-11 text-sm text-ink-soft underline" onClick={() => {setPrepared([]);setStage(0);}}>重設準備清單</button></div>
          {count===3 && <p className="mt-3 flex items-center gap-2 text-sm text-jade"><Check size={15} />三項資料已準備；下一步核對同一比較基準。</p>}
        </aside>
      </div>
    </div>
  </section>;
}

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
interface Entry { kind: string; index: number; item: string; source: string; page: number | null; status: string; flags: string[] }
interface Row { id: string; category: string; name: string; counts: Record<string, number>; reused_quote_claims: number; entries: Entry[] }
interface Audit { audited_at: string; source_dataset_sha256: string; summary: { products: number; categories: number; pdfs: number }; products: Row[] }
const labels: Record<string, string> = { "literal-match": "此頁有相同摘錄", "external-only": "只有外部來源", "not-found": "此頁未找到逐字摘錄", "invalid-or-missing-page": "頁碼缺失／越界", "no-text": "頁面無可搜尋文字", "missing-source": "未提供來源", "no-quote": "缺少有效摘錄", "ambiguous": "多處相同摘錄", "missing-mirror": "鏡像缺失" };
export default function DataQuality() {
  const [audit, setAudit] = useState<Audit | null>(null), [error, setError] = useState("");
  const [params, setParams] = useSearchParams(); const query = params.get("product") ?? "";
  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/evidence-audit.json", { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { if (!Array.isArray(data.products) || !data.summary) throw new Error(); setAudit(data); })
      .catch(e => { if (e.name !== "AbortError") setError("未能載入審核清單；請重新整理或使用產品頁的來源連結。"); });
    return () => controller.abort();
  }, []);
  const rows = useMemo(() => audit?.products.filter(p => `${p.id} ${p.name} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase())) ?? [], [audit, query]);
  return <div className="site-container py-12">
    <p className="eyebrow text-jade">EVIDENCE AUDIT</p><h1 className="mt-3 font-serif text-4xl font-bold md:text-5xl">可信，先要睇到缺口。</h1>
    <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">逐款列出 PDF 鏡像、引用頁碼、摘錄吻合同重用問題。呢度係機械核查結果，唔係已完成逐條保障解讀或確認所有版本最新。</p>
    {audit && <p className="mt-4 rounded-xl border bg-paper-2 p-4 text-sm">{audit.summary.products} 款產品 · {audit.summary.categories} 類 · {audit.summary.pdfs} 份 PDF · 核查執行日期 {audit.audited_at}（唔係條款生效日期）</p>}
    <label htmlFor="audit-search" className="mb-2 mt-7 block font-semibold">搜尋產品名稱、ID 或類別</label>
    <input id="audit-search" value={query} onChange={e => setParams(e.target.value ? { product: e.target.value } : {}, { replace: true })} className="min-h-12 w-full max-w-xl rounded-lg border bg-paper px-4" />
    {!audit && !error && <p role="status" className="py-6">正在載入逐項清單…</p>}{error && <p role="alert" className="py-6 text-red">{error}</p>}
    <p role="status" className="my-4 text-sm text-ink-soft">{rows.length} 個結果。找不到逐字摘錄可能涉及翻譯、改寫或文字擷取問題，唔可直接推斷保障錯誤。</p>
    <div className="divide-y border-y">{rows.map(row => <details key={row.id} open={query === row.id} className="py-4">
      <summary className="min-h-12 cursor-pointer leading-relaxed"><strong>{row.name}</strong><span className="ml-3 text-sm text-ink-soft">{row.id} · 內容最新性：未核實 · 重用摘錄：{row.reused_quote_claims}</span></summary>
      <div className="mt-3 flex flex-wrap gap-4 text-sm"><Link className="min-h-11 text-jade underline" to={`/product/${row.id}`}>產品摘要</Link><Link className="min-h-11 text-jade underline" to={`/documents?product=${encodeURIComponent(row.id)}`}>PDF 中心</Link></div>
      <div className="overflow-x-auto" data-lenis-prevent><table className="w-full min-w-[540px] text-left text-sm"><caption className="sr-only">{row.name} 逐項引用核查</caption><thead><tr className="bg-paper-2"><th className="p-3">項目</th><th className="p-3">實際 PDF 頁</th><th className="p-3">機械檢查結果</th></tr></thead><tbody>{row.entries.map(e => <tr key={`${e.kind}-${e.index}`} className="border-b"><td className="max-w-md p-3">{e.item || e.kind}</td><td className="p-3">{e.page ?? "未提供"}</td><td className="p-3">{labels[e.status] ?? e.status}{e.flags.length > 0 && <span className="mt-1 block text-red">同一摘錄用於不同保障，需覆核</span>}</td></tr>)}</tbody></table></div>
    </details>)}</div>
    {audit && <details className="mt-6 text-xs text-ink-soft"><summary className="cursor-pointer py-3">重現此核查</summary><p className="break-all">資料 SHA-256：{audit.source_dataset_sha256}</p><code>python scripts/audit_evidence.py --as-of {audit.audited_at}</code></details>}
  </div>;
}

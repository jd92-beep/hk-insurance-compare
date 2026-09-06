import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Copy, ExternalLink, FileText, Search } from "lucide-react";
import { useInsuranceData, useProducts } from "@/providers/InsuranceDataProvider";
import { evidenceEntries, evidenceHref, resolveEvidence, sourceTarget } from "@/lib/pdf-evidence";
const PdfEvidenceViewer = lazy(() => import("@/components/documents/PdfEvidenceViewer"));

export default function Documents() {
  const products = useProducts(); const { loading, error } = useInsuranceData();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(""); const [notice, setNotice] = useState("");
  const filtered = useMemo(() => products.filter(p => `${p.product_name_zh} ${p.insurer_zh} ${p.product_name}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const requested = params.get("product");
  const product = products.find(p => p.id === requested) ?? (!requested ? filtered[0] : undefined);
  const entries = useMemo(() => product ? evidenceEntries(product) : [], [product]);
  const resolved = product ? resolveEvidence(product, params) : { status: "missing" as const };
  const selected = params.has("entry") ? resolved.entry : entries.find(entry => sourceTarget(entry.url)?.local) ?? entries[0];
  const target = selected ? sourceTarget(selected.url, selected.page) : null;
  const repeated = selected?.quote ? new Set(entries.filter(e => e.quote === selected.quote && e.kind === "coverage").map(e => e.item)).size : 0;
  const groupLabels = { coverage: "保障項目", citation: "條款引用", source: "其他來源" };
  const copy = async () => {
    if (!product || !selected) return;
    try { await navigator.clipboard.writeText(new URL(evidenceHref(product.id, selected), location.origin).href); setNotice("已複製包含引用指紋嘅連結。"); }
    catch { setNotice("未能複製，請從瀏覽器網址列複製連結。"); }
  };
  return <div className="site-container py-10 md:py-16">
    <div className="mb-8 max-w-3xl">
      <p className="eyebrow text-jade">PDF 中心 · SOURCE LIBRARY</p>
      <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl">原文，逐條對照。</h1>
      <p className="mt-4 leading-relaxed text-ink-soft">由保障摘要直接去到來源頁碼，核對原文、限制同計劃級別。鏡像係本站保存嘅文件副本；唔代表已確認為保險公司最新版本。</p>
    </div>
    {loading && <p role="status">正在載入文件目錄…</p>}
    {error && <p role="alert">{error}</p>}
    <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="min-w-0 rounded-2xl border bg-paper p-4">
        <label className="mb-2 flex items-center gap-2 text-sm font-bold" htmlFor="document-search"><Search size={16} />搜尋產品或公司</label>
        <input id="document-search" value={search} onChange={e => setSearch(e.target.value)} className="min-h-11 w-full rounded-lg border bg-paper px-3 text-sm" placeholder="例如：旅遊、保泰、AXA" />
        <label htmlFor="document-product" className="mb-2 mt-4 block text-sm font-bold">保險產品</label>
        <select id="document-product" value={product?.id ?? ""} onChange={e => { setParams({ product: e.target.value }); setNotice(""); }} className="min-h-11 w-full rounded-lg border bg-paper p-2 text-sm">
          {!product && <option value="">請選擇產品</option>}
          {product && !filtered.some(p => p.id === product.id) && <option value={product.id}>{product.insurer_zh} · {product.product_name_zh}</option>}
          {filtered.map(p => <option key={p.id} value={p.id}>{p.insurer_zh} · {p.product_name_zh}</option>)}
        </select>
        <p className="mt-2 text-xs text-ink-faint">{filtered.length} 個符合搜尋嘅產品</p>
        <div className="mt-4 max-h-72 overflow-y-auto lg:max-h-[32rem]" data-lenis-prevent>
          {entries.map(entry => <button key={`${entry.kind}-${entry.index}`} onClick={() => { setParams(new URLSearchParams(evidenceHref(product!.id, entry).split("?")[1])); setNotice(""); }} aria-current={selected?.fingerprint === entry.fingerprint ? "true" : undefined} className={`mb-2 min-h-11 w-full rounded-xl border p-3 text-left text-sm transition-colors ${selected?.fingerprint === entry.fingerprint ? "border-jade bg-jade/10" : "border-transparent hover:bg-paper-2"}`}>
            <span className="mb-1 block text-xs text-ink-faint">{groupLabels[entry.kind]} · {entry.page ? `PDF ${entry.page}` : "頁碼未提供"}</span>
            <span className="block font-medium">{entry.item}</span>
          </button>)}
          {!loading && entries.length === 0 && <p className="p-3 text-sm">未有可安全開啟嘅來源，唔會代填文件。</p>}
        </div>
      </aside>
      <section className="min-w-0 overflow-hidden rounded-2xl border bg-paper">
        {product && <div className="border-b p-5">
          <Link to={`/product/${product.id}`} className="text-sm font-semibold text-jade">{product.insurer_zh} · {product.product_name_zh}</Link>
          {selected && <><h2 className="mt-2 font-serif text-xl font-bold">{selected.item}</h2><p className="mt-1 text-sm text-ink-soft">{selected.limit}</p></>}
          {repeated > 1 && <p role="note" className="mt-3 rounded-lg bg-amber/10 p-3 text-sm">同一摘錄用於 {repeated} 項不同保障，需逐項覆核；即使文字高亮成功，都唔可以視為呢項保障已獲證實。</p>}
          {selected?.quote && <details className="mt-3 text-sm"><summary className="cursor-pointer py-2 font-semibold">查看待核對摘錄</summary><blockquote className="max-h-40 overflow-auto border-l-2 border-jade pl-3 leading-relaxed">{selected.quote}</blockquote></details>}
          <div className="mt-3 flex flex-wrap gap-2">
            {target && <a className="btn-ghost min-h-11 text-sm" href={`${target.url}${target.local ? `#page=${target.page}` : ""}`} target="_blank" rel="noopener noreferrer">{target.local ? "鏡像原檔" : "來源網站"}<ExternalLink size={14} /></a>}
            {selected && <button className="btn-ghost min-h-11 text-sm" onClick={copy}><Copy size={14} />複製條款連結</button>}
          </div>
          <p role="status" className="text-sm text-jade">{notice}</p>
        </div>}
        {requested && !product && !loading && <p role="alert" className="p-6">搵唔到連結指定嘅產品。請重新選擇，本站不會自動打開另一款產品代替。</p>}
        {product && params.has("entry") && !selected && <p role="alert" className="p-6">{resolved.status === "changed" ? "引用內容已經改變。為免連錯條款，請從左方重新選擇。" : "此引用不存在，請重新選擇。"}</p>}
        {target?.local ? <div className="flex h-[75dvh] min-h-[420px] flex-col"><Suspense fallback={<p role="status" className="p-6">正在載入 PDF 閱讀器…</p>}><PdfEvidenceViewer url={target.url} page={target.page} quote={selected?.quote} /></Suspense></div> : selected && <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-6 text-center text-ink-soft"><FileText size={32} /><p>此引用只有外部來源，未有可核對嘅本地 PDF。請直接到來源網站查看。</p></div>}
      </section>
    </div>
  </div>;
}

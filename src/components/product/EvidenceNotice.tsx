import { Link } from "react-router";
import type { Product } from "@/types/insurance";
import { AIG_TRAVEL_NOTICE } from "@/lib/product-availability";
export default function EvidenceNotice({ product }: { product: Product }) {
  const rows = product.coverage ?? [];
  const complete = rows.filter(r => r.source_url && r.quote && r.page).length;
  return <aside className="site-container my-5" aria-label="資料核實狀態">
    <div className="rounded-xl border border-amber/30 bg-amber/5 p-4 text-sm leading-relaxed">
      <strong className="text-ink">資料狀態透明度</strong>
      <p className="mt-1 text-ink-soft">{complete}/{rows.length} 項保障有來源、摘錄及頁碼欄位。欄位齊全唔代表內容正確；現行版本與保障解讀仍待覆核。</p>
      {product.id === "travel-aig" && <p className="mt-3 font-medium text-ink">{AIG_TRAVEL_NOTICE.text} <a href={AIG_TRAVEL_NOTICE.source} target="_blank" rel="noopener noreferrer" className="underline">官方公告（檢視：{AIG_TRAVEL_NOTICE.checkedAt}）</a></p>}
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
        <Link className="inline-flex min-h-11 items-center font-semibold text-jade underline" to={`/data-quality?product=${encodeURIComponent(product.id)}`}>查看此產品逐條審核</Link>
        <Link className="inline-flex min-h-11 items-center font-semibold text-jade underline" to={`/documents?product=${encodeURIComponent(product.id)}`}>到 PDF 中心核對原文</Link>
      </div>
    </div>
  </aside>;
}

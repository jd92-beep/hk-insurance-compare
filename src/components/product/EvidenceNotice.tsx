import { Link } from "react-router";
import type { Product } from "@/types/insurance";
import { AIG_TRAVEL_NOTICE } from "@/lib/product-availability";
import { productLifecycle } from "@/lib/product-lifecycle";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";

export default function EvidenceNotice({ product }: { product: Product }) {
  const { generatedAt } = useInsuranceData();
  const lifecycle = productLifecycle(product, generatedAt);
  const reportUrl = `https://github.com/jd92-beep/hk-insurance-compare/issues/new?${new URLSearchParams({ title: `[資料覆核] ${product.id}`, body: `產品編號：${product.id}\n\n請填寫出錯的項目、官方來源連結及條款版本。\n請勿提供身份證、保單號碼、病歷或其他私人資料。` })}`;
  return <aside className="site-container my-5" aria-label="資料核實狀態">
    <div className="rounded-xl border border-amber/30 bg-amber/5 p-4 text-base leading-relaxed">
      <strong className="text-ink">資料限制</strong>
      <p className="mt-1 text-ink-soft">
        有連結唔代表已核實。請核對計劃、條款版本及不保事項；{lifecycle.statusLabel}。
      </p>
      {product.review_notes?.map(note => <p key={note} className="mt-3 font-medium text-ink">{note}</p>)}
      {product.id === "travel-aig" && <p className="mt-3 font-medium text-ink">{AIG_TRAVEL_NOTICE.text} <a href={AIG_TRAVEL_NOTICE.source} target="_blank" rel="noopener noreferrer" className="underline">官方公告（檢視：{AIG_TRAVEL_NOTICE.checkedAt}）</a></p>}
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
        <Link className="inline-flex min-h-11 items-center font-semibold text-jade underline" to={`/data-quality?product=${encodeURIComponent(product.id)}`}>逐條審核</Link>
        <Link className="inline-flex min-h-11 items-center font-semibold text-jade underline" to={`/documents?product=${encodeURIComponent(product.id)}`}>PDF 核對原文</Link>
        <a className="inline-flex min-h-11 items-center font-semibold text-jade underline" href={reportUrl} target="_blank" rel="noopener noreferrer">回報資料問題</a>
      </div>
      <p className="mt-2 text-sm text-ink-soft">回報會公開；請勿提供身份證、保單號碼或病歷。</p>
    </div>
  </aside>;
}

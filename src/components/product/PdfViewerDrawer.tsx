import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router";
import { ExternalLink, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { evidenceEntries, evidenceHref, sourceTarget } from "@/lib/pdf-evidence";
import { useProduct } from "@/providers/InsuranceDataProvider";
import { getLenis } from "@/lib/lenis";
const PdfEvidenceViewer = lazy(() => import("@/components/documents/PdfEvidenceViewer"));

export interface PdfViewerDrawerProps {
  isOpen: boolean; onClose: () => void; pdfUrl?: string; documentName?: string;
  page?: number | null; itemTitle?: string; limitText?: string; quote?: string; productId?: string;
}
export default function PdfViewerDrawer({ isOpen, onClose, pdfUrl, documentName, page, itemTitle, limitText, quote, productId }: PdfViewerDrawerProps) {
  const product = useProduct(productId);
  const target = sourceTarget(pdfUrl, page);
  const entry = product && evidenceEntries(product).find(row => row.url === pdfUrl && row.item === itemTitle && row.quote === (quote ?? ""));
  const center = entry ? evidenceHref(product!.id, entry) : `/documents?${new URLSearchParams(productId ? { product: productId } : {})}`;
  useEffect(() => {
    if (!isOpen) return;
    const lenis = getLenis(); const wasStopped = lenis?.isStopped;
    lenis?.stop(); return () => { if (!wasStopped) lenis?.start(); };
  }, [isOpen]);
  if (!isOpen) return null;
  return <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
    <SheetContent side="right" className="z-[90] flex h-full w-full flex-col gap-0 overflow-hidden bg-paper p-0 sm:max-w-3xl lg:max-w-5xl" data-lenis-prevent>
      <SheetHeader className="shrink-0 border-b p-5 pr-12 text-left">
        <SheetTitle className="flex items-start gap-2 font-serif"><FileText size={20} className="shrink-0" />{documentName || "來源文件"}</SheetTitle>
        <SheetDescription className="text-ink-soft">{itemTitle}{limitText && ` · ${limitText}`}。請同時核對計劃級別、限制同不保事項。</SheetDescription>
        {quote && <blockquote className="mt-2 max-h-28 overflow-auto rounded-lg bg-amber/10 p-3 text-sm leading-relaxed">待核對摘錄：「{quote}」</blockquote>}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <Link className="btn-ghost min-h-11" to={center} onClick={onClose}>在 PDF 中心開啟／分享</Link>
          {target && <a className="btn-ghost min-h-11" href={`${target.url}${target.local ? `#page=${target.page}` : ""}`} target="_blank" rel="noopener noreferrer">{target.local ? "開啟鏡像原檔" : "開啟來源網站"}<ExternalLink size={14} /></a>}
        </div>
      </SheetHeader>
      {!target ? <p role="alert" className="p-6">來源連結無效或不安全，未有載入。</p> : target.local ?
        <Suspense fallback={<p role="status" className="p-6">正在載入 PDF 閱讀器…</p>}><PdfEvidenceViewer url={target.url} page={target.page} quote={quote} /></Suspense> :
        <div className="p-6 text-ink-soft">呢個來源係外部網站，未有可定位嘅本地 PDF。請用上方連結核對原文；本站未驗證該網站有否限制內嵌。</div>}
    </SheetContent>
  </Sheet>;
}

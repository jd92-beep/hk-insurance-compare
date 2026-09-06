import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, TextLayer } from "pdfjs-dist";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "pdfjs-dist/web/pdf_viewer.css";
import { findQuote } from "@/lib/pdf-evidence";
import type { QuoteResult } from "@/lib/pdf-evidence";

GlobalWorkerOptions.workerSrc = workerUrl;
const STATUS: Record<QuoteResult["status"], string> = {
  matched: "已定位相同原文；文字吻合唔等於保障內容已核實。",
  ambiguous: "此頁有多處相同原文，暫不自動標示；請核對上下文。",
  "not-found": "此頁搵唔到相同原文；可能頁碼、版本或摘錄不符，未作高亮。",
  "no-text": "此頁沒有可搜尋文字；可能係掃描頁，未作高亮。",
  "no-quote": "未有足夠長度嘅逐字原文，未作高亮。",
};

export default function PdfEvidenceViewer(props: { url: string; page: number; quote?: string }) {
  return <DocumentSession key={props.url} {...props} />;
}
function DocumentSession({ url, page, quote = "" }: { url: string; page: number; quote?: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState("");
  const [pageOverride, setPageOverride] = useState<{ selection: string; page: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const selection = `${page}:${quote}`;
  const current = pageOverride?.selection === selection ? pageOverride.page : page;
  useEffect(() => {
    let active = true;
    const loading = getDocument({ url, cMapUrl: "/pdfjs/cmaps/", cMapPacked: true, standardFontDataUrl: "/pdfjs/standard_fonts/", wasmUrl: "/pdfjs/wasm/" });
    loading.promise.then(doc => { if (active) setPdf(doc); }).catch(() => { if (active) setError("未能讀取 PDF。請使用原檔連結，或稍後重試。"); });
    return () => { active = false; void loading.destroy(); };
  }, [url]);
  if (error) return <p role="alert" className="p-6 text-red">{error}</p>;
  if (!pdf) return <p role="status" className="p-6 text-ink-soft">正在讀取 PDF…</p>;
  const valid = current >= 1 && current <= pdf.numPages;
  const shown = valid ? current : 1;
  return <div className="flex min-h-0 flex-1 flex-col" data-lenis-prevent>
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-paper p-3 text-sm">
      <button className="btn-ghost min-h-11" disabled={shown <= 1} onClick={() => setPageOverride({ selection, page: shown - 1 })}>上一頁</button>
      <span className="font-grotesk" aria-live="polite">PDF {shown} / {pdf.numPages}</span>
      <button className="btn-ghost min-h-11" disabled={shown >= pdf.numPages} onClick={() => setPageOverride({ selection, page: shown + 1 })}>下一頁</button>
      <button className="btn-ghost min-h-11" disabled={zoom <= .75} onClick={() => setZoom(z => Math.max(.75, z - .25))} aria-label="縮小 PDF">−</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button className="btn-ghost min-h-11" disabled={zoom >= 2} onClick={() => setZoom(z => Math.min(2, z + .25))} aria-label="放大 PDF">＋</button>
      {shown !== page && <button className="btn-ghost min-h-11" onClick={() => setPageOverride(null)}>返回引用頁</button>}
    </div>
    {!valid && <p role="alert" className="bg-amber/10 p-3 text-sm">引用頁碼 {current} 超出文件範圍；現顯示第 1 頁，唔會冒認已定位。</p>}
    <PdfPage key={`${shown}:${quote}:${zoom}`} pdf={pdf} page={shown} quote={valid && shown === page ? quote : ""} zoom={zoom} />
  </div>;
}
function PdfPage({ pdf, page, quote, zoom }: { pdf: PDFDocumentProxy; page: number; quote: string; zoom: number }) {
  const host = useRef<HTMLDivElement>(null), layer = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(600);
  const [status, setStatus] = useState("正在繪製及核對原文…");
  const [rects, setRects] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  useEffect(() => {
    if (!host.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width - 24))));
    observer.observe(host.current); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true, render: RenderTask | undefined, textLayer: TextLayer | undefined;
    const target = canvas.current!, text = layer.current!;
    const work = async () => {
      const pdfPage = await pdf.getPage(page); if (!active) return;
      const natural = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: Math.min(width, 1100) / natural.width * zoom });
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(8_000_000 / (viewport.width * viewport.height)));
      target.width = Math.floor(viewport.width * dpr); target.height = Math.floor(viewport.height * dpr);
      target.style.width = `${viewport.width}px`; target.style.height = `${viewport.height}px`;
      text.replaceChildren(); text.style.setProperty("--scale-factor", String(viewport.scale)); text.style.setProperty("--total-scale-factor", String(viewport.scale));
      text.style.width = `${viewport.width}px`; text.style.height = `${viewport.height}px`;
      render = pdfPage.render({ canvas: target, viewport, transform: [dpr, 0, 0, dpr, 0, 0] });
      // Observe cancellation immediately, before awaiting text extraction.
      const rendered = render.promise.then(() => ({ ok: true as const }), error => ({ ok: false as const, error }));
      const content = await pdfPage.getTextContent(); if (!active) return;
      textLayer = new TextLayer({ textContentSource: content, container: text, viewport });
      const [outcome] = await Promise.all([rendered, textLayer.render()]); if (!active) return;
      if (!outcome.ok) throw outcome.error;
      const found = findQuote(textLayer.textContentItemsStr, quote);
      const boxes: typeof rects = [];
      if (found.status === "matched" && found.start && found.end) {
        const start = textLayer.textDivs[found.start.run]?.firstChild, end = textLayer.textDivs[found.end.run]?.firstChild;
        if (start?.nodeType === Node.TEXT_NODE && end?.nodeType === Node.TEXT_NODE) {
          const range = document.createRange(); range.setStart(start, found.start.offset); range.setEnd(end, found.end.offset);
          const origin = text.getBoundingClientRect();
          for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) boxes.push({ x: r.left - origin.left, y: r.top - origin.top, width: r.width, height: r.height });
        }
      }
      if (!active) return;
      setRects(boxes); setStatus(found.status === "matched" && boxes.length === 0 ? "原文文字吻合，但無法可靠定位畫面；未作高亮。" : STATUS[found.status]);
    };
    work().catch(err => { if (active && err?.name !== "RenderingCancelledException") setStatus("PDF 頁面繪製失敗，請使用原檔連結。"); });
    return () => { active = false; render?.cancel(); textLayer?.cancel(); };
  }, [pdf, page, quote, width, zoom]);
  return <div ref={host} className="min-w-0 flex-1 overflow-auto bg-slate-100" data-lenis-prevent>
    <p role="status" data-pdf-match-status className="sticky left-0 border-b bg-paper p-3 text-sm text-ink-soft">{status}</p>
    <div className="relative mx-3 my-3 w-fit bg-white shadow-md">
      <canvas ref={canvas} aria-label={`PDF 第 ${page} 頁`} />
      <div ref={layer} className="textLayer" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {rects.map((r, i) => <mark key={i} data-pdf-highlight className="absolute bg-yellow-300/45 ring-1 ring-amber-500/40" style={{ left: r.x, top: r.y, width: r.width, height: r.height }} />)}
      </div>
    </div>
  </div>;
}

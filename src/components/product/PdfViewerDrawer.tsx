import * as React from "react";
import { ExternalLink, Download, X, FileText, Sparkles, BookOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface PdfViewerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  documentName?: string;
  page?: number | null;
  itemTitle?: string;
  limitText?: string;
  quote?: string;
  productId?: string;
}

/**
 * 官方條款 PDF 原生閱讀抽屜（In-App PDF Slide-over Drawer）
 *
 * 核心解決三大體驗痛點：
 * 1. 杜絕首頁跳轉：優先使用本地/CDN 鏡像官方 PDF，直達指定頁碼。
 * 2. 同份 PDF 無感跳頁：用戶點擊同一保單之不同條款時，抽屜保持開啟，
 *    僅平滑更新頁碼（#page=N）與高亮摘要，絕不重複下載或刷新重載！
 * 3. 分頁重用（Window Reuse）：若點擊「新分頁開啟」，使用固定的 window target，
 *    在同一瀏覽器標籤頁聚焦跳轉，避免彈出多個重複分頁。
 */
export default function PdfViewerDrawer({
  isOpen,
  onClose,
  pdfUrl,
  documentName,
  page,
  itemTitle,
  limitText,
  quote,
  productId = "insurance",
}: PdfViewerDrawerProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // 分離基礎 URL 與 Hash 頁碼
  const { baseUrl, hashPage } = React.useMemo(() => {
    if (!pdfUrl) return { baseUrl: "", hashPage: page ?? 1 };
    const [base, hash] = pdfUrl.split("#");
    let p = page ?? 1;
    if (hash && hash.startsWith("page=")) {
      const parsed = parseInt(hash.replace("page=", ""), 10);
      if (!isNaN(parsed)) p = parsed;
    }
    return { baseUrl: base, hashPage: p };
  }, [pdfUrl, page]);

  // 構造帶有 PDF open parameters 的完整直達路徑
  const viewerUrl = React.useMemo(() => {
    if (!baseUrl) return "";
    return `${baseUrl}#page=${hashPage}&view=FitH&toolbar=1&navpanes=0`;
  }, [baseUrl, hashPage]);

  // 當頁碼或 URL 變更時，若同一份 PDF 已在 iframe 加載，直接更新 hash 或 location，避免整份重新下載
  React.useEffect(() => {
    if (isOpen && iframeRef.current && viewerUrl) {
      try {
        if (iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.location.replace(viewerUrl);
        } else {
          iframeRef.current.src = viewerUrl;
        }
      } catch {
        // 跨域 iframe fallback
        iframeRef.current.src = viewerUrl;
      }
    }
  }, [isOpen, viewerUrl]);

  // 點擊新分頁開啟：重用同一視窗 target 名稱
  const handleOpenNewTab = () => {
    if (!viewerUrl) return;
    const targetName = `doc_viewer_${productId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    window.open(viewerUrl, targetName);
  };

  if (!isOpen || !pdfUrl) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="z-[90] flex h-full w-full flex-col p-0 sm:max-w-3xl lg:max-w-5xl"
        style={{ backgroundColor: "var(--paper)", color: "var(--ink)" }}
      >
        {/* 頂部功能列與佐證標註 */}
        <SheetHeader className="shrink-0 border-b px-5 py-3.5" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-jade-wash text-jade ring-1 ring-jade/20">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <SheetTitle className="flex flex-wrap items-center gap-2 text-left font-serif text-[16px] font-bold text-ink">
                  <span>{documentName ?? "官方產品手冊與條款細則"}</span>
                  {hashPage != null && (
                    <span className="rounded bg-jade/10 px-2 py-0.5 font-grotesk text-[12px] font-bold text-jade ring-1 ring-jade/20">
                      第 {hashPage} 頁
                    </span>
                  )}
                </SheetTitle>

                {itemTitle && (
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-ink-soft">
                    <span className="font-medium text-ink">🎯 賠償項目：{itemTitle}</span>
                    {limitText && (
                      <>
                        <span className="text-ink-faint">·</span>
                        <span className="font-grotesk font-bold text-jade">{limitText}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 快捷操作按鈕 */}
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="inline-flex items-center gap-1.5 rounded-lg border bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-soft shadow-xs transition-colors hover:border-jade hover:text-jade"
                style={{ borderColor: "var(--line)" }}
                title="在獨立分頁開啟（重用同一個分頁，不重複開啟新視窗）"
              >
                <span>新分頁開啟</span>
                <ExternalLink size={13} />
              </button>

              <a
                href={baseUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-soft shadow-xs transition-colors hover:border-jade hover:text-jade"
                style={{ borderColor: "var(--line)" }}
                title="下載原始官方 PDF 文件"
              >
                <Download size={13} />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-ink-faint hover:bg-paper-2 hover:text-ink"
                aria-label="關閉預覽"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 官方原文摘錄 Callout（如果存在） */}
          {quote && (
            <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-50/70 px-3 py-2 text-[12px] leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <span className="font-bold">官方條款摘錄：</span>
                <span>「{quote}」</span>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* 核心 PDF 渲染區域 */}
        <div className="relative flex-1 bg-neutral-100 dark:bg-neutral-900">
          <iframe
            ref={iframeRef}
            src={viewerUrl}
            title={documentName ?? "PDF Viewer"}
            className="h-full w-full border-0"
            allow="fullscreen"
          />

          {/* 移動端或不支援 iframe 提示 */}
          <noscript>
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <BookOpen size={36} className="mb-2 text-ink-soft" />
              <p className="text-small text-ink">你的瀏覽器未支援內嵌 PDF 預覽</p>
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-jade px-4 py-2 text-small font-bold text-white shadow-sm"
              >
                在新分頁直接開啟官方條款 →
              </button>
            </div>
          </noscript>
        </div>

        {/* 底部導覽備註 */}
        <div
          className="flex shrink-0 items-center justify-between border-t bg-paper px-4 py-2 text-[11px] text-ink-faint"
          style={{ borderColor: "var(--line)" }}
        >
          <span>💡 提示：點擊不同賠償項目，本視窗將自動平滑切換頁碼，毋須重複下載。</span>
          <span className="font-grotesk font-medium">PAGE {hashPage}</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

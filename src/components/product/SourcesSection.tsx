import { Link } from "react-router";
import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import type { Product } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import { labelForSourceUrl } from "@/components/product/vhis-utils";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** URL 末段檔名（labelled 來源嘅小字補充） */
function fileNameOf(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").filter(Boolean).pop() ?? "";
    return decodeURIComponent(last);
  } catch {
    return "";
  }
}

/**
 * S2.7 官方來源：全部 source_urls + documents_found 文件 chips。
 * vhis.gov.hk 官方文件（條款及保障 PDF／標準保費表 PDF／認可名單／數據 CSV）
 * 用人性化標籤顯示；認唔出嘅 URL 維持原文連結。逐條引文出處喺 06「資料出處」。
 */
export default function SourcesSection({ product }: { product: Product }) {
  const sources = product.source_urls ?? [];
  const docs = product.documents_found ?? [];

  return (
    <div>
      <SectionHeading index="07" title="官方來源" />
      <Link to={`/documents?${new URLSearchParams({ product: product.id })}`} className="btn-ghost mb-5 min-h-11">到 PDF 中心逐條核對</Link>
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ staggerChildren: 0.06 }}
        className="hairline-t"
      >
        {sources.map((url) => {
          const labelled = labelForSourceUrl(url);
          return (
            <motion.li
              key={url}
              variants={{
                hidden: { opacity: 0, x: -12 },
                show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
              }}
              className="hairline-b flex items-start gap-3 py-4"
            >
              {labelled ? (
                <span className="mt-[1px] flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-jade-wash text-jade">
                  <FileText size={15} aria-hidden="true" />
                </span>
              ) : (
                <span className="chip mt-[1px] shrink-0 bg-jade-wash font-bold text-jade">
                  官方
                </span>
              )}
              <div className="min-w-0 flex-1">
                {labelled ? (
                  <>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 font-sans text-[15.5px] font-bold text-ink transition-colors hover:text-jade"
                    >
                      {labelled.label}
                      <ExternalLink
                        size={13}
                        className="shrink-0 text-ink-faint transition-colors group-hover:text-jade"
                        aria-hidden="true"
                      />
                    </a>
                    <p className="mt-1 text-small text-ink-faint">
                      {labelled.hint && <>{labelled.hint}・</>}
                      <span className="font-grotesk">{domainOf(url)}</span>
                      {fileNameOf(url) && (
                        <span className="font-grotesk">／{fileNameOf(url)}</span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-grotesk text-[14.5px] font-medium text-ink underline decoration-ink-faint underline-offset-4 transition-colors hover:text-red hover:decoration-red"
                    >
                      {url}
                    </a>
                    <p className="mt-1 text-small text-ink-faint">{domainOf(url)}</p>
                  </>
                )}
              </div>
              {!labelled && (
                <ExternalLink size={15} className="mt-1.5 shrink-0 text-ink-faint" aria-hidden="true" />
              )}
            </motion.li>
          );
        })}
      </motion.ul>

      {docs.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-small font-bold text-ink">
            <FileText size={14} aria-hidden="true" />
            官方文件（{docs.length} 份）
          </p>
          <div className="flex flex-wrap gap-1.5">
            {docs.map((d) => (
              <span key={d} className="chip bg-paper-3 text-ink-soft">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 text-small text-ink-faint">
        連結將於新分頁開啟，內容以保險公司網站為準。
      </p>
    </div>
  );
}

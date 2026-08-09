import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import type { Product } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * S2.6 官方來源：全部 source_urls（jade「官方」chip + 連結全文 + 域名小字）
 * + documents_found 文件 chips。
 */
export default function SourcesSection({ product }: { product: Product }) {
  const sources = product.source_urls ?? [];
  const docs = product.documents_found ?? [];

  return (
    <div>
      <SectionHeading index="06" title="官方來源" />
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ staggerChildren: 0.06 }}
        className="hairline-t"
      >
        {sources.map((url) => (
          <motion.li
            key={url}
            variants={{
              hidden: { opacity: 0, x: -12 },
              show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
            }}
            className="hairline-b flex items-start gap-3 py-4"
          >
            <span className="chip mt-[1px] shrink-0 bg-jade-wash font-bold text-jade">官方</span>
            <div className="min-w-0 flex-1">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-grotesk text-[14.5px] font-medium text-ink underline decoration-ink-faint underline-offset-4 transition-colors hover:text-red hover:decoration-red"
              >
                {url}
              </a>
              <p className="mt-1 text-small text-ink-faint">{domainOf(url)}</p>
            </div>
            <ExternalLink size={15} className="mt-1.5 shrink-0 text-ink-faint" aria-hidden="true" />
          </motion.li>
        ))}
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

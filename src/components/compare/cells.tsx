import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types/insurance";
import { cn } from "@/lib/utils";

/** 保費範圍原文（有公開保費 → 左側 jade 圓點） */
export function PremiumRangeCell({ product }: { product: Product }) {
  return (
    <div className="flex items-start gap-2.5 text-[15px] leading-[1.7] text-ink">
      {product.premium_available && (
        <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-jade" aria-label="有公開保費" />
      )}
      <span className={cn(!product.premium_available && "text-ink-soft")}>
        {product.premium_range}
      </span>
    </div>
  );
}

/** 保費備註（small） */
export function PremiumNotesCell({ product }: { product: Product }) {
  if (!product.premium_notes) return <span className="text-ink-faint">—</span>;
  return <p className="text-small text-ink-soft">{product.premium_notes}</p>;
}

/** 公開保費狀態：jade「✓ 有」/ amber「官網即時報價」 */
export function PremiumStatusCell({ product }: { product: Product }) {
  if (product.premium_available) {
    return <span className="chip bg-jade-wash font-bold text-jade">✓ 有公開保費</span>;
  }
  return <span className="chip bg-amber-wash font-bold text-amber">官網即時報價</span>;
}

/** 超過呢個長度嘅 limit 預設 clamp 3 行，撳「展開全文」睇晒 */
const LONG_LIMIT_CHARS = 110;

/**
 * 保障項目 limit 儲存格。
 * highlight=true → jade 底 chip 包裹（最優高亮，附 tooltip）。
 * 長文（多層級限額串聯可過百字）預設 clamp 3 行 + 展開／收合，
 * 保持行高一致、左右欄易掃讀。
 */
export function CoverageLimitCell({
  limit,
  highlight,
}: {
  limit: string | undefined;
  highlight: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!limit) return <span className="text-ink-faint">—</span>;
  const isLong = limit.length > LONG_LIMIT_CHARS;
  const text = (
    <span className={cn("break-words", isLong && !expanded && "line-clamp-3")}>
      {limit}
    </span>
  );
  return (
    <span className="flex flex-col items-start gap-1">
      {highlight ? (
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="inline-flex rounded-[8px] bg-jade-wash px-2.5 py-1 text-[14px] font-medium leading-[1.55] text-jade"
          title="按官方文件所示上限比較"
        >
          {text}
        </motion.span>
      ) : (
        <span className="text-[14px] leading-[1.55] text-ink">{text}</span>
      )}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[12px] font-bold text-red transition-colors hover:text-red-deep hover:underline"
        >
          {expanded ? "收合" : "展開全文"}
        </button>
      )}
    </span>
  );
}

/** 計劃層級 TierChips（可換行，全部列出） */
export function PlanTiersCell({ product }: { product: Product }) {
  const tiers = product.plan_tiers ?? [];
  if (tiers.length === 0) return <span className="text-ink-faint">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tiers.map((t) => (
        <span key={t} className="chip bg-paper-3 text-ink-soft">
          {t}
        </span>
      ))}
    </div>
  );
}

/** 主要條款：預設顯示首 2 條 +「展開全部 N 條」（每欄獨立開合） */
export function KeyTermsCell({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);
  const terms = product.key_terms ?? [];
  if (terms.length === 0) return <span className="text-ink-faint">—</span>;
  const shown = expanded ? terms : terms.slice(0, 2);
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1.5 text-small text-ink-soft">
        {shown.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      {terms.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-fit text-small font-bold text-red transition-colors hover:text-red-deep hover:underline"
        >
          {expanded ? "收合" : `展開全部 ${terms.length} 條`}
        </button>
      )}
    </div>
  );
}

/** 不保事項列表（small） */
export function ExclusionsCell({ product }: { product: Product }) {
  const list = product.exclusions ?? [];
  if (list.length === 0) return <span className="text-ink-faint">—</span>;
  return (
    <ul className="flex flex-col gap-1.5 text-small text-ink-soft">
      {list.map((e, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-amber" />
          <span>{e}</span>
        </li>
      ))}
    </ul>
  );
}

/** 官方文件 chips */
export function DocumentsCell({ product }: { product: Product }) {
  const docs = product.documents_found ?? [];
  if (docs.length === 0) return <span className="text-ink-faint">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {docs.map((d) => (
        <span key={d} className="chip border bg-paper text-ink-soft" style={{ borderColor: "var(--line)" }}>
          <FileText size={12} className="text-ink-faint" />
          {d}
        </span>
      ))}
    </div>
  );
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 官方來源連結列（jade「官方」chip + 域名，新分頁） */
export function SourceLinksCell({ product }: { product: Product }) {
  const urls = product.source_urls ?? [];
  if (urls.length === 0) return <span className="text-ink-faint">—</span>;
  return (
    <ul className="flex flex-col gap-2">
      {urls.map((url) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex max-w-full items-center gap-2 text-small"
          >
            <span className="chip shrink-0 bg-jade-wash font-bold text-jade">官方</span>
            <span className="truncate font-grotesk text-[12.5px] text-ink-soft transition-colors group-hover:text-jade group-hover:underline">
              {domainOf(url)}
            </span>
            <ExternalLink size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-jade" />
          </a>
        </li>
      ))}
    </ul>
  );
}

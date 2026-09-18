import { Link } from "react-router";
import type { Product } from "@/types/insurance";
import { evidenceChipLabel, productEvidenceSummary } from "@/lib/evidence-status";
import { productLifecycle } from "@/lib/product-lifecycle";
import { cn } from "@/lib/utils";

/**
 * Compact neutral evidence chip for compare surfaces.
 * Reports snapshot field presence + unverified freshness only — never that a
 * policy is verified, current, suitable, or approved.
 */
export default function EvidenceChip({
  product,
  generatedAt,
  className,
}: {
  product: Product;
  generatedAt?: string;
  className?: string;
}) {
  const summary = productEvidenceSummary(product);
  const lifecycle = productLifecycle(product, generatedAt);
  const label = evidenceChipLabel(summary);
  const qualityHref = `/data-quality?product=${encodeURIComponent(product.id)}`;
  const docsHref = `/documents?product=${encodeURIComponent(product.id)}`;
  const title = [
    lifecycle.statusLabel,
    lifecycle.snapshotNote,
    "欄位存在唔等於保單條款已核實、仍然適用或適合你投保。",
  ].join("。");

  return (
    <span
      className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1", className)}
      data-testid="evidence-chip"
      title={title}
    >
      <span className="chip border bg-paper-3 font-medium text-ink-soft" style={{ borderColor: "var(--line-strong)" }}>
        {label}
      </span>
      <Link
        to={qualityHref}
        className="inline-flex min-h-11 items-center text-[12px] font-semibold text-jade underline underline-offset-2 hover:opacity-80"
      >
        資料核查
      </Link>
      <Link
        to={docsHref}
        className="inline-flex min-h-11 items-center text-[12px] font-semibold text-jade underline underline-offset-2 hover:opacity-80"
      >
        原文
      </Link>
    </span>
  );
}

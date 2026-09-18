import { Copy, ExternalLink } from "lucide-react";
import type { Product } from "@/types/insurance";
import { promoDisplay } from "@/lib/premium-display";
import { usePolicyCalendar } from "@/hooks/use-policy-calendar";
import { copyTextToClipboard, toastPromoCopy } from "@/lib/ui-feedback";

/** Dated campaign terms only. No unverified strike-through prices or 'best deal' claims. */
export default function VerifiedPromotion({ product }: { product: Product }) {
  const today = usePolicyCalendar();
  const promo = today ? promoDisplay(product, new Date(`${today}T12:00:00+08:00`)) : null;
  if (!promo?.present) return null;
  return <div className="rounded-xl border border-amber/30 bg-amber/5 p-3 text-sm leading-relaxed" onClick={(event) => event.stopPropagation()}>
    <p className="font-bold text-ink">{promo.badgeLabel}</p>
    <p className="text-ink-soft">至 {promo.validUntil}（香港時間）</p>
    <details className="mt-1">
      <summary className="min-h-11 cursor-pointer content-center font-semibold text-jade">優惠條件及來源</summary>
      <p className="text-ink-soft">{promo.note}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {promo.code && <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-paper px-3 font-semibold text-ink" onClick={() => {
          const code = promo.code!;
          void copyTextToClipboard(code).then((ok) => toastPromoCopy(ok, code));
        }}><Copy size={14} aria-hidden="true" />複製 {promo.code}</button>}
        <a className="inline-flex min-h-11 items-center gap-1 font-semibold text-jade underline" href={promo.sourceUrl} target="_blank" rel="noopener noreferrer">官方優惠條款<ExternalLink size={14} aria-hidden="true" /></a>
      </div>
    </details>
  </div>;
}

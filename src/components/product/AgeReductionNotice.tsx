import { TriangleAlert } from "lucide-react";
import {
  AGE_REDUCTION_NOTICE,
  deriveAgeReductionExcerpts,
} from "@/lib/exclusion-themes";
import type { ExclusionThemeSourceProduct } from "@/lib/exclusion-themes";
import { cn } from "@/lib/utils";

/**
 * Amber lexical warning when summary text mentions senior/kid/age-reduction wording.
 * Consumer Council research notes many plans reduce benefits for seniors/kids —
 * this notice does NOT invent per-product reduction percentages.
 */
export default function AgeReductionNotice({
  product,
  className,
}: {
  product: ExclusionThemeSourceProduct;
  className?: string;
}) {
  const excerpts = deriveAgeReductionExcerpts(product);
  if (excerpts.length === 0) return null;

  return (
    <aside
      className={cn(
        "rounded-card border-l-4 border-amber bg-amber-wash p-5",
        className,
      )}
      aria-label="年齡相關字眼提示"
    >
      <p className="flex items-start gap-2 text-base font-semibold text-ink">
        <TriangleAlert
          size={16}
          className="mt-[3px] shrink-0 text-amber"
          aria-hidden="true"
        />
        年齡相關字眼（字面提示）
      </p>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">
        {AGE_REDUCTION_NOTICE}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {excerpts.map((excerpt) => (
          <li
            key={excerpt}
            className="flex gap-2 text-base leading-relaxed text-ink"
          >
            <span
              className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber"
              aria-hidden="true"
            />
            <span className="break-words">{excerpt}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-ink-faint">
        本站唔會喺未有原文數據時自行推算扣減百分比。請打開保單／產品單張核對實際年齡條款。
      </p>
    </aside>
  );
}

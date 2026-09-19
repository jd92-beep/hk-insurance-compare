import { deriveExclusionThemes, EXCLUSION_THEMES_NOTE } from "@/lib/exclusion-themes";
import type { ExclusionThemeSourceProduct } from "@/lib/exclusion-themes";
import { cn } from "@/lib/utils";

/**
 * Neutral exclusion-theme summary. Lexical retrieval only — never a suitability
 * ranking, never “stricter/looser”. Always shows original excerpt strings.
 */
export default function ExclusionThemes({
  product,
  compact = false,
  className,
}: {
  product: ExclusionThemeSourceProduct;
  compact?: boolean;
  className?: string;
}) {
  const themes = deriveExclusionThemes(product);
  if (themes.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-sm font-semibold text-ink-soft">不保主題檢索</p>
        <p className="text-base leading-relaxed text-ink-soft">
          摘要未見明顯主題字眼。未命中唔等於受保；仍要核對保單原文不保事項。
        </p>
        <p className="text-sm leading-relaxed text-ink-faint">{EXCLUSION_THEMES_NOTE}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink-soft">不保主題檢索（字面）</p>
        <p className="text-sm text-ink-faint">唔係產品排名／適合度</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <li key={theme.themeId}>
            <span
              className="chip border bg-paper-2 text-ink"
              style={{ borderColor: "var(--line-strong)" }}
              title="字面命中，唔代表已證實不保"
            >
              {theme.label}
              <span className="ml-1 font-grotesk text-ink-faint">
                {theme.excerpts.length}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className={cn("space-y-3", compact && "text-sm")}>
        {themes.map((theme) => (
          <section key={theme.themeId} aria-label={`${theme.label}字面節錄`}>
            <h4 className="text-base font-bold text-ink">{theme.label}</h4>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {theme.excerpts.map((excerpt) => (
                <li
                  key={`${theme.themeId}-${excerpt}`}
                  className="flex gap-2 text-base leading-relaxed text-ink-soft"
                >
                  <span
                    className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-amber"
                    aria-hidden="true"
                  />
                  <span className="break-words">{excerpt}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-ink-faint">{EXCLUSION_THEMES_NOTE}</p>
    </div>
  );
}

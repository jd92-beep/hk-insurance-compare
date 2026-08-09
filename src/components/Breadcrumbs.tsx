import { Fragment } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  to?: string;
}

/**
 * 麵包屑（§7.9）：首頁 / 類別 / 產品，小字，`/` 分隔
 */
export default function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="麵包屑" className={cn("text-small text-ink-faint", className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((crumb, i) => (
          <Fragment key={`${crumb.label}-${i}`}>
            {i > 0 && <li aria-hidden="true" className="select-none">/</li>}
            <li>
              {crumb.to && i < items.length - 1 ? (
                <Link to={crumb.to} className="transition-colors hover:text-red">
                  {crumb.label}
                </Link>
              ) : (
                <span className={i === items.length - 1 ? "text-ink-soft" : undefined} aria-current={i === items.length - 1 ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

import { cn } from "@/lib/utils";

/** 「只供現有保單續保」amber 標記（計劃行內聯用） */
export function RenewalOnlyBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "mx-0.5 inline-flex translate-y-[-1px] items-center rounded-full bg-amber-wash px-2 py-0.5 align-middle text-[11px] font-bold text-amber",
        className,
      )}
    >
      只供現有保單續保
    </span>
  );
}

/**
 * 認可編號 monospace chip（S00xxx 標準計劃／F00xxx 靈活計劃）。
 * renewalOnly=true 用 amber  muted 款。
 */
export default function CertCodeChip({
  code,
  renewalOnly = false,
  className,
}: {
  code: string;
  renewalOnly?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mx-0.5 inline-flex translate-y-[-1px] items-center rounded-md border px-1.5 py-0.5 align-middle font-grotesk text-[12px] font-bold tracking-wide",
        renewalOnly
          ? "border-amber/30 bg-amber-wash text-amber"
          : "border-transparent bg-paper-3 text-ink-soft",
        className,
      )}
      style={!renewalOnly ? { borderColor: "var(--line-strong)" } : undefined}
    >
      {code}
    </span>
  );
}

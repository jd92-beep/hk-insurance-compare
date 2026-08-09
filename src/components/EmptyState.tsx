import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import StampBadge from "@/components/StampBadge";

/**
 * 空白狀態（§7.9）：印章灰版 + 訊息 + 可選重設按鈕
 */
export default function EmptyState({
  title = "搵唔到相關產品",
  description = "試下調整篩選條件，或者瀏覽全部產品。",
  onReset,
  resetLabel = "重設篩選",
  className,
}: {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-card border border-dashed px-8 py-16 text-center",
        className,
      )}
      style={{ borderColor: "var(--line-strong)" }}
    >
      <StampBadge variant="gray" size={72} className="opacity-50" />
      <div>
        <p className="font-serif text-xl font-bold text-ink">{title}</p>
        <p className="mt-1 text-small text-ink-soft">{description}</p>
      </div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 inline-flex items-center gap-2 rounded-[10px] border px-5 py-2.5 text-small font-bold text-ink transition-colors hover:bg-paper-3"
          style={{ borderColor: "var(--line-strong)" }}
        >
          <RotateCcw size={14} />
          {resetLabel}
        </button>
      )}
    </div>
  );
}

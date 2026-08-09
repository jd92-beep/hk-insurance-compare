import { Check, Plus } from "lucide-react";
import { useCompare } from "@/providers/CompareProvider";
import { cn } from "@/lib/utils";

/**
 * 「加入比較」主 CTA（product.md S1 / S4 共用）。
 * 已加入 → jade「✓ 已加入」；比較籃滿（3/3）→ disabled + 提示。
 */
export default function CompareCTA({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const compare = useCompare();
  const inTray = compare.has(productId);
  const full = compare.isFull && !inTray;

  return (
    <button
      type="button"
      onClick={() => compare.toggle(productId)}
      disabled={full}
      title={full ? "比較籃已滿（最多 3 份產品），請先移除一份" : undefined}
      className={cn(
        "btn-primary",
        inTray && "bg-jade hover:bg-jade",
        full && "cursor-not-allowed opacity-40 hover:bg-red",
        className,
      )}
    >
      {inTray ? <Check size={18} /> : <Plus size={18} />}
      {inTray ? "已加入比較" : full ? "比較籃已滿（3/3）" : "加入比較"}
    </button>
  );
}

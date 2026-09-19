import { cn } from "@/lib/utils";

/**
 * 保費狀態 chip — 快照欄位狀態，唔係即時報價保證。
 */
export default function PremiumChip({
  available,
  className,
}: {
  available: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "chip font-bold",
        available ? "bg-jade-wash text-jade" : "bg-amber-wash text-amber",
        className,
      )}
      title="本站唔提供即時保費試算；請到保險公司官網報價"
    >
      {available ? "快照有公開保費文字" : "需官網即時報價（本站唔代報價）"}
    </span>
  );
}

import { cn } from "@/lib/utils";

/**
 * 保費狀態 chip（product.md S1 / S2.2 共用）
 * premium_available=true → jade「有官方公開保費」；false → amber「官網即時報價」
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
    >
      {available ? "有官方公開保費" : "官網即時報價"}
    </span>
  );
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StampSealIcon } from "@/components/StampSealIcon";

export type StampVariant = "jade" | "ink" | "red" | "gray";

const VARIANT_COLOR: Record<StampVariant, string> = {
  jade: "text-jade",
  ink: "text-ink",
  red: "text-red",
  gray: "text-ink-faint",
};

const TOOLTIP = "來源參考標記，不代表保障內容或文件版本已核實";

/**
 * 印章徽章（§7.6）
 * 顏色僅延續設計樣式，不能作為官方認證或資料時效狀態。
 */
export default function StampBadge({
  variant = "ink",
  size = 28,
  animated = false,
  className,
}: {
  variant?: StampVariant;
  size?: number;
  /** true 時用「蓋印」進場動畫（scale 1.6 → 1 回彈） */
  animated?: boolean;
  className?: string;
}) {
  const seal = (
    <StampSealIcon
      size={size}
      className={cn(VARIANT_COLOR[variant], "drop-shadow-none")}
    />
  );
  if (!animated) {
    return (
      <span role="img" title={TOOLTIP} aria-label={TOOLTIP} className={cn("inline-flex", className)}>
        {seal}
      </span>
    );
  }
  return (
    <motion.span
      role="img"
      title={TOOLTIP}
      aria-label={TOOLTIP}
      className={cn("inline-flex", className)}
      initial={{ scale: 1.6, rotate: -8, opacity: 0 }}
      whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {seal}
    </motion.span>
  );
}

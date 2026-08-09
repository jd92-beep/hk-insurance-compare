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

const TOOLTIP = "資料來自保險公司官方文件，附來源連結";

/**
 * 印章徽章（§7.6）
 * - jade：有官方保費公開
 * - ink：有官方文件但需報價
 * - red：首頁主印章「官方文件核實」
 * - gray：EmptyState 灰版
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
      <span title={TOOLTIP} aria-label={TOOLTIP} className={cn("inline-flex", className)}>
        {seal}
      </span>
    );
  }
  return (
    <motion.span
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

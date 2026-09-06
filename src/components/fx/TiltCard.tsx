import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 3D 傾斜卡（Tilt）：滑鼠追蹤 rotateX/rotateY + 可選 glare 高光。
 * - `transformPerspective` 自帶透視，入面用 `translateZ` 可以令子層浮出卡面。
 * - `prefers-reduced-motion` 或觸控裝置（pointer: coarse）直接原樣 render，零傾斜。
 * - 用嘅時候記得喺 className 帶埋圓角（例如 `rounded-card`），glare 會 inherit。
 */
export default function TiltCard({
  children,
  className,
  /** 最大傾斜角度（度） */
  max = 6,
  /** 滑鼠高光掃層 */
  glare = true,
  perspective = 900,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
  perspective?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const enabled = !reduced && typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches;

  // 0–1 歸一化滑鼠位置（卡中心為 0.5）
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 220, damping: 20 });
  const glareX = useTransform(mx, (v) => v * 100);
  const glareY = useTransform(my, (v) => v * 100);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,.28), transparent 55%)`;

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{
        rotateX,
        rotateY,
        transformPerspective: perspective,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mx.set((e.clientX - rect.left) / rect.width);
        my.set((e.clientY - rect.top) / rect.height);
      }}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

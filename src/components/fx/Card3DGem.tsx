import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  renderGem,
  boundedDpr,
  boundedGemSize,
} from "@/lib/depth-geometry";
import { createFrameLoop } from "@/lib/motion-runtime";

export interface Card3DGemProps {
  /** 尺寸（像素寬高），默認 32px */
  size?: number;
  /** 顏色主題（支持 jade #00A67E, amber #D97706, ink #1B2B25 或任意 hex/rgb） */
  color?: string;
  /** 外層自定義 class */
  className?: string;
  /** 自轉速度倍率，默認 1 */
  speed?: number;
  /** 是否允許鼠標/指針互動微動，默認 true */
  interactive?: boolean;
  /** 是否開啟寶石底部微弱光暈，默認 true */
  glow?: boolean;
  /** 可訪問性標籤；若未提供則自動設為 aria-hidden="true"，避免污染屏幕閱讀器或文字排版 */
  ariaLabel?: string;
}

/**
 * 獨立、高效、精緻的 Web3D 水晶/徽章幾何元件。
 * 渲染於獨立 canvas，具備 33 面 3D 多面體光照、高光與低能耗微動態。
 */
export default function Card3DGem({
  size = 32,
  color = "jade",
  className,
  speed = 1,
  interactive = true,
  glow = true,
  ariaLabel,
}: Card3DGemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clampedSize = boundedGemSize(size);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // DPR 封頂為 2，避免超高像素屏幕過度消耗 GPU/CPU
    const dpr = boundedDpr(typeof window !== "undefined" ? window.devicePixelRatio : 1);
    const renderWidth = Math.round(clampedSize * dpr);
    const renderHeight = Math.round(clampedSize * dpr);

    canvas.width = renderWidth;
    canvas.height = renderHeight;
    canvas.style.width = `${clampedSize}px`;
    canvas.style.height = `${clampedSize}px`;

    const reducedMedia = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    let isVisible = true;
    let currentPitch = 0.38;
    let currentYaw = 0.55;
    let targetPitch = 0.38;
    let targetYaw = 0.55;
    let pointerOffset = { x: 0, y: 0 };
    let startTime = performance.now();

    const renderCurrentFrame = () => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderGem(ctx, {
        width: clampedSize,
        height: clampedSize,
        pitch: currentPitch,
        yaw: currentYaw,
        color,
        glow,
        scale: 0.40,
      });
      ctx.restore();
    };

    // 使用 motion-runtime createFrameLoop，確保 unmount 時嚴格 cancelAnimationFrame
    const loop = createFrameLoop((now: number) => {
      const elapsed = (now - startTime) * 0.001;
      const basePitch = 0.38 + Math.sin(elapsed * 0.8) * 0.12;
      const baseYaw = (elapsed * 0.65 * speed) % (Math.PI * 2);

      targetPitch = basePitch + pointerOffset.y;
      targetYaw = baseYaw + pointerOffset.x;

      currentPitch += (targetPitch - currentPitch) * 0.15;
      currentYaw += (targetYaw - currentYaw) * 0.15;

      renderCurrentFrame();
    });

    const syncMotion = () => {
      const prefersReduced = reducedMedia?.matches ?? false;
      const shouldRun = isVisible && !document.hidden && !prefersReduced;

      if (shouldRun) {
        startTime = performance.now();
        loop.start();
      } else {
        loop.stop();
        if (isVisible && !document.hidden) {
          currentPitch = 0.38;
          currentYaw = 0.55;
          renderCurrentFrame();
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || (reducedMedia?.matches ?? false) || e.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      pointerOffset = { x: px * 0.65, y: -py * 0.55 };
    };

    const handlePointerLeave = () => {
      pointerOffset = { x: 0, y: 0 };
    };

    if (interactive) {
      canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
      canvas.addEventListener("pointerleave", handlePointerLeave, { passive: true });
      canvas.addEventListener("pointercancel", handlePointerLeave, { passive: true });
    }

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        syncMotion();
      });
      io.observe(canvas);
    }

    const handleVisibility = () => syncMotion();
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMedia?.addEventListener("change", syncMotion);

    syncMotion();

    return () => {
      loop.stop();
      io?.disconnect();
      if (interactive) {
        canvas.removeEventListener("pointermove", handlePointerMove);
        canvas.removeEventListener("pointerleave", handlePointerLeave);
        canvas.removeEventListener("pointercancel", handlePointerLeave);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMedia?.removeEventListener("change", syncMotion);
    };
  }, [clampedSize, color, speed, interactive, glow]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "inline-block shrink-0 align-middle select-none pointer-events-auto",
        className
      )}
      style={{
        width: `${clampedSize}px`,
        height: `${clampedSize}px`,
      }}
      aria-hidden={ariaLabel ? undefined : "true"}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    />
  );
}

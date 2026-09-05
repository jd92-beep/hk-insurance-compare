import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 極光漸變背景層：超大 radial-gradient blob 慢速漂移變形（transform-only，GPU 友善）。
 * - variant="light"：淺色段用（Hero / FinalCTA），multiply 混色壓喺 paper 底上。
 * - variant="dark"：深色段用（MethodStory），screen 混色浮喺 ink 底上。
 * AI 圖位：light 變體會嘗試載入 `/hero-aurora-ai.webp`（nano banana 生成）——
 * 檔案存在即自動疊上；唔存在就 onError 靜靜哋收埋，純代碼極光繼續做底。
 * `prefers-reduced-motion` 由 index.css 全域 rule 自動停晒動畫，靜態漸變照顯示。
 */
export default function AuroraBackground({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const [aiOk, setAiOk] = useState(true);
  const dark = variant === "dark";

  // 每個 blob：位置 / 大小 / 配色 / 動畫節奏（三組 keyframes 錯開）
  const blobs = dark
    ? [
        { top: "-20%", left: "-10%", size: "62%", bg: "radial-gradient(circle, rgba(200,16,46,.20), transparent 62%)", anim: "aurora-drift-a 26s ease-in-out infinite alternate" },
        { top: "30%", left: "55%", size: "58%", bg: "radial-gradient(circle, rgba(14,124,102,.18), transparent 62%)", anim: "aurora-drift-b 32s ease-in-out infinite alternate" },
        { top: "55%", left: "8%", size: "52%", bg: "radial-gradient(circle, rgba(217,142,4,.13), transparent 62%)", anim: "aurora-drift-c 38s ease-in-out infinite alternate" },
      ]
    : [
        { top: "-25%", left: "-12%", size: "66%", bg: "radial-gradient(circle, rgba(200,16,46,.12), transparent 62%)", anim: "aurora-drift-a 24s ease-in-out infinite alternate" },
        { top: "18%", left: "58%", size: "60%", bg: "radial-gradient(circle, rgba(14,124,102,.12), transparent 62%)", anim: "aurora-drift-b 30s ease-in-out infinite alternate" },
        { top: "52%", left: "6%", size: "56%", bg: "radial-gradient(circle, rgba(217,142,4,.14), transparent 62%)", anim: "aurora-drift-c 36s ease-in-out infinite alternate" },
        { top: "-8%", left: "34%", size: "46%", bg: "radial-gradient(circle, rgba(46,111,219,.08), transparent 62%)", anim: "aurora-drift-b 28s ease-in-out infinite alternate-reverse" },
      ];

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {blobs.map((b, i) => (
        <div
          key={i}
          className="aurora-blob"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            paddingTop: b.size,
            background: b.bg,
            animation: b.anim,
            mixBlendMode: dark ? "screen" : "multiply",
          }}
        />
      ))}
      {/* AI 生成圖位（nano banana）：存在即疊上，唔存在自動收埋 */}
      {!dark && aiOk && (
        <img
          src="/hero-aurora-ai.webp"
          alt=""
          loading="lazy"
          onError={() => setAiOk(false)}
          className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-multiply"
        />
      )}
    </div>
  );
}

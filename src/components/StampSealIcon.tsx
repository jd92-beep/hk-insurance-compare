import { cn } from "@/lib/utils";

/**
 * 官方文件印章（inline SVG 版，跟 currentColor）。
 * 用嚟做需要變色嘅印章；public/stamp-seal.svg 仍然畀 <img> 引用。
 */
export function StampSealIcon({
  size = 120,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="1.2" />
      <defs>
        <path
          id="seal-arc"
          d="M60 60 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0"
        />
      </defs>
      <text
        fill="currentColor"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="9.5"
        fontWeight="700"
        letterSpacing="2.4"
      >
        <textPath href="#seal-arc" startOffset="4%">
          OFFICIAL SOURCE · VERIFIED · 官方文件核實 ·
        </textPath>
      </text>
      <text
        x="60"
        y="56"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="'Noto Serif TC', serif"
        fontWeight="900"
        fontSize="17"
      >
        官方
      </text>
      <text
        x="60"
        y="76"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="'Noto Serif TC', serif"
        fontWeight="900"
        fontSize="17"
      >
        文件
      </text>
      <path
        d="M60 26.5l1.5 3.2 3.4.4-2.5 2.4.7 3.4-3.1-1.7-3.1 1.7.7-3.4-2.5-2.4 3.4-.4L60 26.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

import type { ReactNode } from "react";
import CertCodeChip, { RenewalOnlyBadge } from "@/components/product/CertCodeChip";

/** 計劃行文字分段：認可編號／續保標記 */
const TIER_TOKEN_RE = /(（只供現有保單續保）|[SF]\d{5})/g;

/**
 * 將 plan_tiers 行文字渲染做 rich text：
 * S/F 認可編號 → monospace chip；「（只供現有保單續保）」→ amber badge。
 */
export function renderTierText(tier: string): ReactNode[] {
  return tier.split(TIER_TOKEN_RE).map((part, i) => {
    if (!part) return null;
    if (part === "（只供現有保單續保）") return <RenewalOnlyBadge key={i} />;
    if (/^[SF]\d{5}$/.test(part)) return <CertCodeChip key={i} code={part} />;
    return <span key={i}>{part}</span>;
  });
}

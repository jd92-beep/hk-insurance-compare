import VerifiedPromotion from "@/components/VerifiedPromotion";
import { purchaseUrl } from "@/lib/product-availability";
import { quotePathway } from "@/lib/quote-pathway";
import { ExternalLink, FileText } from "lucide-react";
import type { Product } from "@/types/insurance";
import type { PlanTierItem } from "@/components/product/plan-parser";
import { extractTierCoverageLimit } from "@/components/product/plan-parser";
import CertCodeChip from "@/components/product/CertCodeChip";
import CompareCTA from "@/components/product/CompareCTA";
import {
  deriveKeyFacts,
  extractCertEntries,
  labelForSourceUrl,
} from "@/components/product/vhis-utils";
import { cn } from "@/lib/utils";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 側欄用官方文件連結：認得嘅 vhis.gov.hk 文件用標籤，否則用域名；最多 4 條 */
function quickDocLinks(product: Product): { url: string; text: string }[] {
  const links = (product.source_urls ?? []).map((url) => ({
    url,
    text: labelForSourceUrl(url)?.label ?? domainOf(url),
  }));
  // 去重（同一標籤多只留第一條），條款及保費表等 labelled 文件排前
  const seen = new Set<string>();
  return links
    .filter((l) => {
      if (seen.has(l.text)) return false;
      seen.add(l.text);
      return true;
    })
    .slice(0, 4);
}

export interface ProductSideRailProps {
  product: Product;
  color: string;
  selectedTier?: PlanTierItem | null;
  onSelectTier?: (tierId: string | null) => void;
  className?: string;
}

/**
 * 產品頁右側 sticky 欄（lg+）：重點數字濃縮版 + 加入比較 CTA + 官方文件快連。
 * 支援與特定子計劃（Plan Tier）動態連動，展示專屬限額與卡片；未選中時展示全局一覽。
 */
export default function ProductSideRail({
  product,
  color,
  selectedTier,
  onSelectTier,
  className,
}: ProductSideRailProps) {
  const facts = deriveKeyFacts(product);
  const certs = extractCertEntries(product);
  const docs = quickDocLinks(product);
  const pathway = quotePathway(product);

  // 動態計算每年保障限額：有選中 selectedTier 且 coverage 中有「每年保障限額」時，調用 extractTierCoverageLimit 萃取專屬限額；否則回退到 facts.annualLimitAmount
  const annualItem = (product.coverage ?? []).find((c) =>
    c.item.includes("每年保障限額")
  );
  const dynamicAnnualLimit =
    selectedTier && annualItem
      ? extractTierCoverageLimit(annualItem.limit, selectedTier) || facts.annualLimitAmount
      : facts.annualLimitAmount;

  // 動態計算終身保障限額：有選中 selectedTier 時，萃取該計劃專屬終身限額（例如「不設終身保障限額（無上限賠償）」）
  const lifetimeItem = (product.coverage ?? []).find((c) =>
    c.item.includes("終身保障限額")
  );
  const dynamicLifetimeLimit =
    selectedTier && lifetimeItem
      ? extractTierCoverageLimit(lifetimeItem.limit, selectedTier)
      : null;

  const hasFacts =
    Boolean(dynamicAnnualLimit) ||
    Boolean(dynamicLifetimeLimit) ||
    Boolean(facts.premium30) ||
    Boolean(selectedTier) ||
    certs.length > 0;
  const buyUrl = purchaseUrl(product);

  return (
    <aside className={className}>
      <div className="sticky top-[100px] w-full max-w-[300px] min-w-0">
        <div
          className="overflow-hidden rounded-card border bg-paper shadow-card"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="h-[3px] w-full" style={{ background: color }} />
          <div className="p-5">
            {hasFacts && (
              <>
                {/* 頂部標題列：選中計劃時標注專屬規格並提供重設按鈕 */}
                {selectedTier ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-jade" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-jade">
                        重點一覽 · 專屬規格
                      </span>
                    </div>
                    {onSelectTier && (
                      <button
                        type="button"
                        onClick={() => onSelectTier(null)}
                        className="text-[11px] font-medium text-ink-soft hover:text-jade hover:underline cursor-pointer transition-colors"
                      >
                        重設回全覽 ↩
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                    重點一覽
                  </p>
                )}

                {/* 選中計劃時的專屬卡片（計劃名稱、專屬認可編號、房型等） */}
                {selectedTier && (
                  <div
                    className="mt-3 rounded-[8px] border bg-paper-2/70 p-3"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-sans text-[14px] font-bold text-ink">
                        {selectedTier.name}
                      </span>
                      {selectedTier.code && (
                        <CertCodeChip
                          code={selectedTier.code}
                          renewalOnly={selectedTier.renewalOnly}
                        />
                      )}
                    </div>
                    {(selectedTier.roomType ||
                      (selectedTier.badges && selectedTier.badges.length > 0)) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        {selectedTier.roomType && (
                          <span
                            className="rounded border bg-paper px-1.5 py-0.5 font-medium text-ink-soft"
                            style={{ borderColor: "var(--line)" }}
                          >
                            房型：{selectedTier.roomType}
                          </span>
                        )}
                        {selectedTier.badges
                          ?.filter((b) => b !== selectedTier.roomType)
                          .map((badge) => (
                            <span
                              key={badge}
                              className="rounded bg-jade-wash px-1.5 py-0.5 font-medium text-jade"
                            >
                              {badge}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                <dl className="mt-3 flex flex-col gap-2.5">
                  {dynamicAnnualLimit && (
                    <div>
                      <dt className="text-small text-ink-faint">
                        {selectedTier
                          ? `${selectedTier.name} 每年保障限額`
                          : "每年保障限額"}
                      </dt>
                      <dd className="font-grotesk text-[18px] font-bold leading-snug text-ink">
                        {dynamicAnnualLimit}
                      </dd>
                    </div>
                  )}
                  {selectedTier && dynamicLifetimeLimit && (
                    <div>
                      <dt className="text-small text-ink-faint">終身保障限額</dt>
                      <dd className="font-grotesk text-[15px] font-bold leading-snug text-ink">
                        {dynamicLifetimeLimit}
                      </dd>
                    </div>
                  )}
                  {facts.premium30 && (
                    <div>
                      <dt className="text-small text-ink-faint">30 歲年繳保費（資料快照）</dt>
                      <dd className="font-grotesk text-[15px] font-bold leading-[1.5] text-ink">
                        男 HK${facts.premium30.male}
                        <span className="mx-1.5 text-ink-faint">／</span>女 HK$
                        {facts.premium30.female}
                      </dd>
                    </div>
                  )}
                  {!selectedTier && certs.length > 0 && (
                    <div>
                      <dt className="text-small text-ink-faint">認可編號</dt>
                      <dd className="mt-1 flex flex-wrap gap-1">
                        {certs.slice(0, 4).map((c) => (
                          <CertCodeChip
                            key={c.code}
                            code={c.code}
                            renewalOnly={c.renewalOnly}
                          />
                        ))}
                        {certs.length > 4 && (
                          <span className="text-small text-ink-faint">
                            +{certs.length - 4}
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </>
            )}

            <div className="mt-4"><VerifiedPromotion product={product} /></div>

            {buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-red px-4 py-2.5 text-small font-bold text-paper shadow-md transition-all hover:scale-[1.03] hover:bg-red-deep hover:shadow-lg active:scale-95"
              >
                <span>{pathway.buyLabel ?? "往官網即時報價／核對"}</span>
                <ExternalLink size={14} />
              </a>
            )}
            <p className="mt-2 text-[11px] leading-snug text-ink-faint">
              本站唔提供即時保費試算。快照文字／年齡表只係參考；真正報價請用保險公司官網。
            </p>

            <CompareCTA productId={product.id} className={cn("w-full px-4", (hasFacts || buyUrl) && "mt-3")} />

            {docs.length > 0 && (
              <div className="hairline-t mt-5 pt-4">
                <p className="mb-2.5 flex items-center gap-1.5 text-small font-bold text-ink">
                  <FileText size={13} aria-hidden="true" />
                  官方文件
                </p>
                <ul className="flex flex-col gap-2">
                  {docs.map((d) => (
                    <li key={d.url}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 text-small font-medium text-jade transition-colors hover:underline"
                      >
                        <span className="break-all">{d.text}</span>
                        <ExternalLink
                          size={12}
                          className="shrink-0 text-ink-faint transition-colors group-hover:text-jade"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

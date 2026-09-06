import { purchaseUrl } from "@/lib/product-availability";
import { ExternalLink, FileText } from "lucide-react";
import type { Product } from "@/types/insurance";
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

/**
 * 產品頁右側 sticky 欄（lg+）：重點數字濃縮版 + 加入比較 CTA + 官方文件快連。
 * 全部內容按數據存在與否渲染；mobile 收埋（重點一覽卡已覆蓋）。
 */
export default function ProductSideRail({
  product,
  color,
  className,
}: {
  product: Product;
  color: string;
  className?: string;
}) {
  const facts = deriveKeyFacts(product);
  const certs = extractCertEntries(product);
  const docs = quickDocLinks(product);

  const hasFacts = facts.annualLimitAmount || facts.premium30 || certs.length > 0;
  const buyUrl = purchaseUrl(product);
  const origPrice = product.original_price ?? product.promo?.original_price;
  const discPrice = product.discounted_price ?? product.promo?.discounted_price;

  return (
    <aside className={className}>
      <div className="sticky top-[100px] w-[260px] shrink-0 xl:w-[280px]">
        <div
          className="overflow-hidden rounded-card border bg-paper shadow-card"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="h-[3px] w-full" style={{ background: color }} />
          <div className="p-5">
            {hasFacts && (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                  重點一覽
                </p>
                <dl className="mt-3 flex flex-col gap-2.5">
                {facts.annualLimitAmount && (
                  <div>
                    <dt className="text-small text-ink-faint">每年保障限額</dt>
                    <dd className="font-grotesk text-[18px] font-bold leading-snug text-ink">
                      {facts.annualLimitAmount}
                    </dd>
                  </div>
                )}
                {facts.premium30 && (
                  <div>
                    <dt className="text-small text-ink-faint">30 歲年繳保費</dt>
                    <dd className="font-grotesk text-[15px] font-bold leading-[1.5] text-ink">
                      男 HK${facts.premium30.male}
                      <span className="mx-1.5 text-ink-faint">／</span>女 HK$
                      {facts.premium30.female}
                    </dd>
                  </div>
                )}
                {certs.length > 0 && (
                  <div>
                    <dt className="text-small text-ink-faint">認可編號</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {certs.slice(0, 4).map((c) => (
                        <CertCodeChip key={c.code} code={c.code} renewalOnly={c.renewalOnly} />
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

            {/* 即時折後價 / 劃線原價展示 */}
            {discPrice && origPrice && (
              <div className="mt-4 rounded-lg bg-red-wash/40 p-3 border border-red/20">
                <p className="text-[11px] font-bold text-red">網上官方即時優惠</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-grotesk text-[13px] text-ink-faint line-through">
                    HK${origPrice.toLocaleString()}
                  </span>
                  <span className="font-grotesk text-[20px] font-black text-red">
                    HK${discPrice.toLocaleString()}
                  </span>
                  {product.promo?.discount && (
                    <span className="rounded bg-red/10 px-1.5 py-0.5 text-[11px] font-bold text-red">
                      {product.promo.discount}
                    </span>
                  )}
                </div>
                {product.promo?.code && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-ink-faint">優惠碼:</span>
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                      {product.promo.code}
                    </span>
                  </div>
                )}
              </div>
            )}

            {buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-red px-4 py-2.5 text-small font-bold text-paper shadow-md transition-all hover:bg-red/90 hover:shadow-lg active:scale-95"
              >
                <span>前往官網投保／報價</span>
                <ExternalLink size={14} />
              </a>
            )}

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

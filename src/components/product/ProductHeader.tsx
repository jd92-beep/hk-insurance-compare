import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "@/types/insurance";
import { CATEGORY_META, categoryColor } from "@/lib/categories";
import { useCategories, useInsuranceData } from "@/providers/InsuranceDataProvider";
import StampBadge from "@/components/StampBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import CompareCTA from "@/components/product/CompareCTA";
import PremiumChip from "@/components/product/PremiumChip";
import { EASE_OUT_EXPO } from "@/components/product/SectionHeading";

/** 類別英文名（eyebrow 用） */
const CATEGORY_EN: Record<string, string> = {
  home: "HOME INSURANCE",
  travel: "TRAVEL INSURANCE",
  life: "LIFE INSURANCE",
  "critical-illness": "CRITICAL ILLNESS",
  accident: "ACCIDENT INSURANCE",
  medical: "MEDICAL / VHIS",
  motor: "MOTOR INSURANCE",
  "domestic-helper": "DOMESTIC HELPER",
  pet: "PET INSURANCE",
};

/** 超長產品名（多計劃並列）門檻 — product.md 附錄 4 */
const LONG_NAME = 40;

/** 自願醫保認可編號（例如 F00040 / S00013） */
const CERT_CODE = /[SF]\d{5}/g;

/** 系列產品資訊（多計劃並列名 → 主標短名＋計劃全名列表） */
export function deriveSeriesInfo(product: Product, catName: string): {
  isSeries: boolean;
  /** 主標題：系列產品 → 「公司中文名 + 拉丁名 + 系列短名」，否則產品原名 */
  title: string;
  /** 各計劃全名（系列產品先用） */
  planNames: string[];
  /** 認可編號列表（自願醫保） */
  certCodes: string[];
} {
  const nameZh = product.product_name_zh || product.product_name;
  const isSeries = nameZh.length > LONG_NAME;
  const certCodes = [...new Set(nameZh.match(CERT_CODE) ?? [])];
  if (!isSeries) {
    return { isSeries, title: nameZh, planNames: [], certCodes };
  }
  const seriesBase =
    product.category === "medical" ? "自願醫保系列" : `${catName.replace(/（.*?）/g, "")}系列`;
  const title = `${product.insurer_zh} ${product.insurer} ${seriesBase}`.trim();
  const planNames = nameZh
    .split("／")
    .map((s) => s.trim())
    .filter(Boolean);
  return { isSeries, title, planNames, certCodes };
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 詞級進場（y 26 → 0, stagger 0.05s） */
function SplitWords({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: delay + i * 0.05 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * S1 產品頁首：左 8 欄主資訊 + 右 4 欄「檔案卡」（sticky）。
 */
export default function ProductHeader({ product }: { product: Product }) {
  const categories = useCategories();
  const { generatedAt } = useInsuranceData();
  const category = categories.find((c) => c.id === product.category);
  const catName = category?.name_zh ?? product.category;
  const catEn = CATEGORY_EN[product.category] ?? "INSURANCE";
  const color = categoryColor(product.category);
  const meta = CATEGORY_META[product.category];

  const nameZh = product.product_name_zh || product.product_name;
  const series = deriveSeriesInfo(product, catName);
  const { isSeries } = series;
  const tiers = product.plan_tiers ?? [];
  const docs = product.documents_found ?? [];
  const sources = product.source_urls ?? [];
  const positioning = (product.premium_range ?? "").split(/[；;]/)[0]?.trim() ?? "";
  const productType = (product as Product & { product_type?: string }).product_type;

  return (
    <header className="pb-8 pt-16 max-md:pb-6 max-md:pt-12">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Breadcrumbs
            items={[
              { label: "首頁", to: "/" },
              { label: catName, to: `/category/${product.category}` },
              { label: series.title },
            ]}
            className="mb-8"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* ── 左 8 欄主資訊 ─────────────────────────── */}
          <div className="lg:col-span-8">
            {/* Eyebrow（類別色） */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="eyebrow mb-5 flex items-center gap-2"
              style={{ color }}
            >
              <span
                className="cat-icon h-5 w-5"
                style={{
                  color,
                  WebkitMaskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
                  maskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
                }}
                aria-hidden="true"
              />
              <span className="eyebrow-zh font-sans">{catName}</span>
              <span aria-hidden="true">·</span>
              <span>{catEn}</span>
            </motion.p>

            {/* 公司行 */}
            <p className="mb-2">
              <SplitWords
                text={product.insurer}
                delay={0.1}
                className="font-grotesk text-[24px] font-bold leading-[1.3] text-ink"
              />
              <SplitWords
                text={product.insurer_zh}
                delay={0.15}
                className="ml-3 font-sans text-[18px] font-medium text-ink-soft"
              />
            </p>

            {/* h1：系列產品 → 「公司 + 系列短名」；單一產品 → 原名 */}
            <h1 className="display-2 font-black text-ink">
              <SplitWords text={series.title} delay={0.2} />
            </h1>
            {product.product_name && product.product_name !== nameZh && !isSeries && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-2 font-grotesk text-[15px] font-medium text-ink-faint"
              >
                {product.product_name}
              </motion.p>
            )}

            {/* 系列產品：各計劃全名 chips 列表（副標區） */}
            {isSeries && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.35 }}
                className="mt-5"
              >
                <p className="mb-2.5 text-small font-bold text-ink-faint">
                  系列包括 {series.planNames.length > 0 ? series.planNames.length : tiers.length} 個計劃
                </p>
                <ol className="flex flex-col gap-1.5">
                  {(series.planNames.length > 0 ? series.planNames : tiers).map((name, i) => (
                    <li key={name} className="flex items-start gap-2.5 text-small leading-[1.7]">
                      <span className="mt-0.5 shrink-0 font-grotesk text-[12px] font-bold text-ink-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium text-ink-soft">{name}</span>
                    </li>
                  ))}
                </ol>
                {/* metadata definition list */}
                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t pt-4 text-small" style={{ borderColor: "var(--line)" }}>
                  <div className="flex items-baseline gap-2">
                    <dt className="text-ink-faint">計劃數目</dt>
                    <dd className="font-grotesk font-bold text-ink">
                      {series.planNames.length > 0 ? series.planNames.length : tiers.length}
                    </dd>
                  </div>
                  {series.certCodes.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <dt className="text-ink-faint">認可編號</dt>
                      <dd className="font-grotesk font-bold text-ink">
                        {series.certCodes.join("、")}
                      </dd>
                    </div>
                  )}
                </dl>
              </motion.div>
            )}

            {/* 狀態 chips 行 */}
            <motion.div
              initial="hidden"
              animate="show"
              transition={{ staggerChildren: 0.06, delayChildren: 0.4 }}
              className="mt-6 flex flex-wrap items-center gap-2"
            >
              <motion.span variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <PremiumChip available={product.premium_available} />
              </motion.span>
              {productType && (
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="chip bg-red-wash font-bold text-red"
                >
                  {productType}
                </motion.span>
              )}
              {docs.map((d) => (
                <motion.span
                  key={d}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="chip bg-paper-3 text-ink-soft"
                >
                  {d}
                </motion.span>
              ))}
            </motion.div>

            {/* 一句定位 */}
            {positioning && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.5 }}
                className="mt-6 max-w-[38em] font-sans text-[16px] font-medium leading-[1.7] text-ink-soft"
              >
                {positioning}
              </motion.p>
            )}

            {/* CTA 行 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <CompareCTA productId={product.id} />
              {sources[0] && (
                <a
                  href={sources[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  睇官方產品頁
                  <ExternalLink size={16} />
                </a>
              )}
            </motion.div>
          </div>

          {/* ── 右 4 欄「檔案卡」（sticky） ─────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.5 }}
            className="lg:col-span-4"
          >
            <div className="paper-card overflow-hidden lg:sticky lg:top-[100px]">
              <div className="h-[3px] w-full" style={{ background: color }} />
              <div className="p-7">
                <div className="flex items-center gap-4">
                  <StampBadge
                    variant={product.premium_available ? "jade" : "ink"}
                    size={64}
                    animated
                  />
                  <div>
                    <p className="font-serif text-[17px] font-bold leading-snug text-ink">
                      官方文件核實
                    </p>
                    <p className="mt-0.5 text-small text-ink-soft">
                      資料來自保險公司官方文件
                    </p>
                  </div>
                </div>

                <dl className="mt-6 flex flex-col gap-2.5 text-small">
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-faint">保險公司</dt>
                    <dd className="text-right font-medium text-ink">
                      <span className="font-grotesk font-bold">{product.insurer}</span>{" "}
                      {product.insurer_zh}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-faint">類別</dt>
                    <dd className="text-right">
                      <Link
                        to={`/category/${product.category}`}
                        className="font-medium text-red hover:underline"
                      >
                        {catName}
                      </Link>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-faint">計劃層級數</dt>
                    <dd className="text-right font-grotesk font-bold text-ink">
                      {tiers.length} 個
                    </dd>
                  </div>
                  {series.certCodes.length > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="shrink-0 text-ink-faint">認可編號</dt>
                      <dd className="text-right font-grotesk font-bold text-ink">
                        {series.certCodes.join("、")}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-faint">官方文件</dt>
                    <dd className="text-right font-grotesk font-bold text-ink">
                      {docs.length} 份
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-faint">資料快照</dt>
                    <dd className="text-right font-grotesk font-bold text-ink">{generatedAt}</dd>
                  </div>
                </dl>

                {sources.length > 0 && (
                  <div className="hairline-t mt-6 pt-5">
                    <p className="mb-3 text-small font-bold text-ink">官方來源</p>
                    <ul className="flex flex-col gap-2.5">
                      {sources.slice(0, 2).map((url) => (
                        <li key={url}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 text-small font-bold text-jade hover:underline"
                          >
                            <span className="chip bg-jade-wash px-2 py-0.5 text-[11px] font-bold text-jade">
                              官方
                            </span>
                            <span className="font-grotesk">{domainOf(url)}</span>
                            <ExternalLink size={12} />
                          </a>
                        </li>
                      ))}
                      {sources.length > 2 && (
                        <li className="text-small text-ink-faint">
                          另有 <span className="font-grotesk font-bold">{sources.length - 2}</span>{" "}
                          條來源，見下方「官方來源」
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <p className="hairline-t mt-6 pt-4 text-small text-ink-faint">
                  資料僅供參考，以官方文件為準
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </header>
  );
}

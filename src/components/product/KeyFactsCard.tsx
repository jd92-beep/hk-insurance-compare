import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "@/types/insurance";
import CertCodeChip from "@/components/product/CertCodeChip";
import { deriveKeyFacts, extractCertEntries } from "@/components/product/vhis-utils";
import { EASE_OUT_EXPO } from "@/components/product/SectionHeading";

/**
 * 頁首「自願醫保認可產品」資質卡（medical 專用）：
 * - 官方合資格徽章與認可名單快連
 * - 結構化清晰分組：標準計劃 vs 靈活計劃 vs 續保專用認可編號
 * - 三大自願醫保法定保障柱石（保證續保、稅務扣減、冷靜期）
 * - 投保年齡與形式規格微型指標
 */
export default function KeyFactsCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  if (product.category !== "medical") return null;

  const certs = extractCertEntries(product);
  const facts = deriveKeyFacts(product);
  const active = certs.filter((c) => !c.renewalOnly);
  const standardCerts = active.filter((c) => c.kind === "standard");
  const flexiCerts = active.filter((c) => c.kind !== "standard");
  const renewalOnly = certs.filter((c) => c.renewalOnly);

  const hasTiles =
    facts.annualLimitRaw ||
    facts.premium30 ||
    facts.premiumFallback ||
    facts.formType ||
    facts.entryAge;
  if (certs.length === 0 && !hasTiles && facts.guarantees.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.35 }}
      className={className || "site-container mb-6"}
    >
      <div
        className="flex h-full flex-col justify-between overflow-hidden rounded-card border bg-paper shadow-card"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="h-[3px] w-full" style={{ background: "var(--jade)" }} />
        <div className="flex flex-1 flex-col justify-between gap-5 p-5 md:p-6">
          {/* ── 頂部官方認證 Header ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-jade-wash text-jade shadow-xs">
                <ShieldCheck size={22} aria-hidden="true" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-[16px] font-bold leading-tight text-ink">
                    自願醫保認可產品
                  </h3>
                  <span className="rounded bg-jade-wash px-1.5 py-0.5 font-grotesk text-[10px] font-bold text-jade">
                    VHIS
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  已獲醫務衞生局審批並納入官方合資格名冊
                </p>
              </div>
            </div>

            <Link
              to="/vhis"
              className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-paper-2 px-3 py-1.5 text-xs font-bold text-jade transition-all hover:border-jade hover:bg-jade-wash hover:underline"
            >
              <span>官方名冊</span>
              <ArrowRight
                size={12}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* ── 認可編號分組矩陣（結構化清晰呈現，告別雜亂堆砌） ── */}
          {certs.length > 0 && (
            <div
              className="flex flex-col gap-2.5 rounded-xl border bg-paper-2/50 p-3.5"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-ink-faint">
                <span>政府認可計劃編號 ({certs.length})</span>
                <span className="font-medium text-ink-faint">點擊編號可查核條款</span>
              </div>

              {standardCerts.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="shrink-0 rounded bg-jade-wash px-2 py-0.5 text-[11px] font-bold text-jade">
                    標準計劃
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {standardCerts.map((c) => (
                      <CertCodeChip key={c.code} code={c.code} />
                    ))}
                  </div>
                </div>
              )}

              {flexiCerts.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="shrink-0 rounded bg-ink/10 px-2 py-0.5 text-[11px] font-bold text-ink">
                    靈活計劃
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {flexiCerts.map((c) => (
                      <CertCodeChip key={c.code} code={c.code} />
                    ))}
                  </div>
                </div>
              )}

              {renewalOnly.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t pt-2" style={{ borderColor: "var(--line)" }}>
                  <span className="shrink-0 rounded bg-amber-wash px-2 py-0.5 text-[11px] font-bold text-amber">
                    只供續保
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {renewalOnly.map((c) => (
                      <CertCodeChip key={c.code} code={c.code} renewalOnly />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 自願醫保法定保障柱石與核心規格 ── */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center justify-center rounded-lg border bg-paper-2/40 p-2.5" style={{ borderColor: "var(--line)" }}>
              <Sparkles size={16} className="text-jade mb-1" />
              <p className="text-[12px] font-bold text-ink">保證續保</p>
              <p className="text-[10px] text-ink-faint mt-0.5">終身或至 100 歲</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border bg-paper-2/40 p-2.5" style={{ borderColor: "var(--line)" }}>
              <FileCheck2 size={16} className="text-jade mb-1" />
              <p className="text-[12px] font-bold text-ink">稅務扣減</p>
              <p className="text-[10px] text-ink-faint mt-0.5">每名最高 $8,000</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border bg-paper-2/40 p-2.5" style={{ borderColor: "var(--line)" }}>
              <BadgeCheck size={16} className="text-jade mb-1" />
              <p className="text-[12px] font-bold text-ink">冷靜期保障</p>
              <p className="text-[10px] text-ink-faint mt-0.5">21 天全額退款</p>
            </div>
          </div>

          {/* ── 底部微型指標 Chips ── */}
          {(facts.formType || facts.entryAge || facts.annualLimitRaw) && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
              <div className="flex flex-wrap items-center gap-2">
                {facts.formType && (
                  <span className="rounded border bg-paper px-2 py-0.5 font-medium text-ink-soft" style={{ borderColor: "var(--line)" }}>
                    提供形式：{facts.formType}
                  </span>
                )}
                {facts.entryAge && (
                  <span className="rounded border bg-paper px-2 py-0.5 font-medium text-ink-soft" style={{ borderColor: "var(--line)" }}>
                    新單年齡：0–{facts.entryAge} 歲
                  </span>
                )}
              </div>
              {facts.annualLimitAmount && (
                <span className="font-grotesk text-xs font-bold text-jade">
                  最高每年限額 {facts.annualLimitAmount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

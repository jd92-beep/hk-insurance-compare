import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "@/types/insurance";
import CertCodeChip from "@/components/product/CertCodeChip";
import { deriveKeyFacts, extractCertEntries } from "@/components/product/vhis-utils";
import { EASE_OUT_EXPO } from "@/components/product/SectionHeading";

/** 重點數字 tile（label 小字 + value 大字），有數據先 render */
function FactTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] bg-paper-2 px-4 py-3.5">
      <p className="text-[11px] font-bold tracking-[0.08em] text-ink-faint">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/**
 * 頁首下方「重點一覽」卡（medical 產品專用，有數據先顯示）：
 * 自願醫保認可 badge + S/F 認可編號 chips（續保專用 amber 款）＋ 官方認可名單連結，
 * 下面係關鍵數字 tiles（每年保障限額／30 歲保費／提供形式／投保年齡）
 * 同保證類亮點 chips（保證續保／冷靜期／稅務扣減）。
 */
export default function KeyFactsCard({ product }: { product: Product }) {
  if (product.category !== "medical") return null;

  const certs = extractCertEntries(product);
  const facts = deriveKeyFacts(product);
  const active = certs.filter((c) => !c.renewalOnly);
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
      className="site-container mb-6"
    >
      <div
        className="overflow-hidden rounded-card border bg-paper shadow-card"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="h-[3px] w-full" style={{ background: "var(--jade)" }} />
        <div className="flex flex-col gap-5 p-6 md:p-7">
          {/* ── 認可行：badge + 認可編號 + 名單連結 ── */}
          {certs.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jade-wash text-jade">
                  <ShieldCheck size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-sans text-[15px] font-bold leading-snug text-jade">
                    自願醫保認可產品
                  </p>
                  <p className="mt-0.5 text-small text-ink-faint">
                    已列入醫務衞生局官方認可名單
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2">
                {active.map((c) => (
                  <span key={c.code} className="inline-flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                      {c.kind === "standard" ? "標準計劃" : "靈活計劃"}
                    </span>
                    <CertCodeChip code={c.code} />
                  </span>
                ))}
                {renewalOnly.map((c) => (
                  <span key={c.code} className="inline-flex items-center gap-1.5">
                    <CertCodeChip code={c.code} renewalOnly />
                    <span className="text-[11px] font-bold text-amber">只供現有保單續保</span>
                  </span>
                ))}
              </div>

              <Link
                to="/vhis"
                className="group inline-flex shrink-0 items-center gap-1.5 text-small font-bold text-jade transition-colors hover:underline"
              >
                官方認可名單
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}

          {/* ── 關鍵數字 tiles ── */}
          {hasTiles && (
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {facts.annualLimitRaw && (
                <FactTile label="每年保障限額">
                  {facts.annualLimitAmount ? (
                    <p className="font-grotesk text-[19px] font-bold leading-tight text-ink">
                      {facts.annualLimitAmount}
                    </p>
                  ) : (
                    <p className="text-small font-medium leading-[1.5] text-ink">
                      {facts.annualLimitRaw}
                    </p>
                  )}
                </FactTile>
              )}
              {facts.premium30 && (
                <FactTile label="30 歲年繳保費">
                  <p className="font-grotesk text-[15px] font-bold leading-[1.5] text-ink">
                    <span className="mr-1 font-sans text-[11px] font-medium text-ink-faint">男</span>
                    HK${facts.premium30.male}
                  </p>
                  <p className="font-grotesk text-[15px] font-bold leading-[1.5] text-ink">
                    <span className="mr-1 font-sans text-[11px] font-medium text-ink-faint">女</span>
                    HK${facts.premium30.female}
                  </p>
                </FactTile>
              )}
              {!facts.premium30 && facts.premiumFallback && (
                <FactTile label="保費參考">
                  <p className="line-clamp-3 text-small font-medium leading-[1.6] text-ink">
                    {facts.premiumFallback}
                  </p>
                </FactTile>
              )}
              {facts.formType && (
                <FactTile label="提供形式">
                  <p className="font-sans text-[16px] font-bold leading-tight text-ink">
                    {facts.formType}
                  </p>
                </FactTile>
              )}
              {facts.entryAge && (
                <FactTile label="新單投保年齡">
                  <p className="font-grotesk text-[19px] font-bold leading-tight text-ink">
                    {facts.entryAge}
                    <span className="ml-1 font-sans text-[12px] font-medium text-ink-faint">歲</span>
                  </p>
                </FactTile>
              )}
            </div>
          )}

          {/* ── 保證類亮點 chips ── */}
          {facts.guarantees.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {facts.guarantees.map((g) => (
                <span
                  key={g}
                  className="chip bg-jade-wash font-medium text-jade"
                >
                  <BadgeCheck size={13} aria-hidden="true" />
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

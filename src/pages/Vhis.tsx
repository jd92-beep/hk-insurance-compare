import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, RotateCcw, Search } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmptyState from "@/components/EmptyState";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVhisRegistry } from "@/hooks/use-vhis-registry";
import type { VhisFlexiProduct, VhisStandardPlan, VhisStatus } from "@/types/vhis";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];
/** 醫療類別色（= tailwind jade） */
const ACCENT = "#0E7C66";

type PlanTypeFilter = "all" | "standard" | "flexi";

const TYPE_OPTIONS: { key: PlanTypeFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "standard", label: "標準計劃" },
  { key: "flexi", label: "靈活計劃" },
];

/** 狀態排序：在售先，續保專用次之，已終止註冊排尾 */
function statusRank(status: VhisStatus): number {
  if (status === "active") return 0;
  if (status === "renewal-only") return 1;
  return 2;
}

/** 非在售狀態 badge；active 唔顯示 */
function StatusBadge({ status }: { status: VhisStatus }) {
  if (status === "active") return null;
  if (status === "renewal-only") {
    return (
      <span className="chip bg-amber-wash font-bold text-amber">只供現有保單續保</span>
    );
  }
  return <span className="chip bg-paper-3 font-bold text-ink-faint">已終止註冊</span>;
}

/** 官方文件外連（條款及保障／標準保費表） */
function DocLinks({
  planDocUrl,
  premiumDocUrl,
  className,
}: {
  planDocUrl: string;
  premiumDocUrl: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {planDocUrl && (
        <a
          href={planDocUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 whitespace-nowrap text-small font-medium text-jade transition-colors hover:underline"
        >
          條款及保障
          <ExternalLink size={12} />
        </a>
      )}
      {premiumDocUrl && (
        <a
          href={premiumDocUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 whitespace-nowrap text-small font-medium text-jade transition-colors hover:underline"
        >
          標準保費表
          <ExternalLink size={12} />
        </a>
      )}
    </span>
  );
}

/** h1 字級進場（同 CategoryDetail 一致） */
function AnimatedTitle({ text, className }: { text: string; className?: string }) {
  const chars = [...text];
  return (
    <h1 className={className} aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.15 + i * 0.04 }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </h1>
  );
}

/** 自願醫保認可產品名單 `/vhis`（vhis.gov.hk 官方公開數據） */
export default function Vhis() {
  const { data, loading, error } = useVhisRegistry();

  const [planType, setPlanType] = useState<PlanTypeFilter>("all");
  const [company, setCompany] = useState<string>("all");
  const [query, setQuery] = useState("");

  const companies = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const p of data.standard_plans) set.add(p.company_zh);
    for (const p of data.flexi_products) set.add(p.company_zh);
    return [...set].sort((a, b) => a.localeCompare(b, "zh-Hant-HK"));
  }, [data]);

  const q = query.trim().toLowerCase();
  const matchQuery = (fields: string[]) =>
    q === "" || fields.some((f) => f.toLowerCase().includes(q));

  const filteredStandard = useMemo(() => {
    if (!data || planType === "flexi") return [];
    return data.standard_plans
      .filter((p) => company === "all" || p.company_zh === company)
      .filter((p) =>
        matchQuery([p.name_zh, p.name_en, p.company_zh, p.cert_no, p.cert_base]),
      )
      .sort((a, b) => statusRank(a.status) - statusRank(b.status));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, planType, company, q]);

  const filteredFlexi = useMemo(() => {
    if (!data || planType === "standard") return [];
    return data.flexi_products
      .filter((p) => company === "all" || p.company_zh === company)
      .filter((p) =>
        matchQuery([p.name_zh, p.name_en, p.company_zh, p.cert_base]),
      )
      .sort((a, b) => statusRank(a.status) - statusRank(b.status));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, planType, company, q]);

  const hasActiveFilters = planType !== "all" || company !== "all" || q !== "";
  const resetFilters = () => {
    setPlanType("all");
    setCompany("all");
    setQuery("");
  };

  /* ── 未載入 ── */
  if (loading) {
    return (
      <div className="site-container py-24">
        <div className="h-6 w-48 animate-pulse rounded bg-paper-2" />
        <div className="mt-8 h-14 w-2/3 animate-pulse rounded bg-paper-2" />
        <div className="mt-6 h-24 w-full max-w-[38em] animate-pulse rounded bg-paper-2" />
        <div className="mt-16 h-[420px] w-full animate-pulse rounded-card bg-paper-2" />
      </div>
    );
  }

  /* ── 載入失敗 ── */
  if (error || !data) {
    return (
      <div className="site-container py-24">
        <EmptyState
          title="載入唔到認可產品名單"
          description={error ?? "載入數據失敗，請重新整理再試。"}
          resetLabel="重新整理"
          onReset={() => window.location.reload()}
        />
      </div>
    );
  }

  const shown = filteredStandard.length + filteredFlexi.length;
  const total =
    (planType === "flexi" ? 0 : data.standard_plans.length) +
    (planType === "standard" ? 0 : data.flexi_products.length);

  return (
    <>
      {/* ── 頁首 ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* 頂部 6px 醫療類別色條 */}
        <motion.div
          className="h-[6px] w-full origin-left"
          style={{ background: ACCENT }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        />

        <div className="site-container pb-14 pt-14 max-md:pb-10 max-md:pt-10">
          <Breadcrumbs
            items={[
              { label: "首頁", to: "/" },
              { label: "醫療保險（自願醫保）", to: "/category/medical" },
              { label: "認可產品名單" },
            ]}
          />

          <div className="mt-9">
            <p className="eyebrow" style={{ color: ACCENT }}>
              VHIS CERTIFIED PRODUCTS · 官方名單
            </p>
          </div>

          <AnimatedTitle
            text="自願醫保認可產品名單"
            className="display-2 mt-5 font-black text-ink"
          />
          <motion.p
            className="mt-6 max-w-[38em] text-ink-soft"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.4 }}
          >
            自願醫保嘅認可產品分兩類：
            <span className="font-bold text-ink">標準計劃</span>
            係政府劃一條款嘅固定設計，邊間公司買基本保障都一樣；
            <span className="font-bold text-ink">靈活計劃</span>
            就喺標準保障之上，提供更高或者更廣嘅保障。以下名單全部嚟自
            vhis.gov.hk 官方公開數據，逐份附官方條款同保費表連結。
          </motion.p>

          {/* 統計 chips */}
          <motion.div
            className="mt-7 flex flex-wrap gap-2.5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.55 } } }}
          >
            {[
              <span key="a">
                <span className="font-grotesk font-bold text-ink">
                  {data.summary.standard_plan_count}
                </span>{" "}
                標準計劃
              </span>,
              <span key="b">
                <span className="font-grotesk font-bold text-ink">
                  {data.summary.flexi_product_count}
                </span>{" "}
                靈活計劃
              </span>,
              <span key="c">
                <span className="font-grotesk font-bold text-jade">
                  {data.summary.total_cert_bases}
                </span>{" "}
                認可產品
              </span>,
              <span key="d" className="text-ink-faint">
                快照 <span className="font-grotesk font-bold">{data.fetched_at}</span>
              </span>,
            ].map((content, i) => (
              <motion.span
                key={i}
                className="chip border bg-paper text-small text-ink-soft"
                style={{ borderColor: "var(--line)" }}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
                }}
              >
                {content}
              </motion.span>
            ))}
          </motion.div>

          {/* 數據來源 */}
          <motion.p
            className="mt-6 text-small text-ink-faint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            數據來源：
            <a
              href="https://www.vhis.gov.hk"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-jade hover:underline"
            >
              vhis.gov.hk
            </a>
            官方公開數據（
            {data.source_urls["standard-plans.csv"] && (
              <a
                href={data.source_urls["standard-plans.csv"]}
                target="_blank"
                rel="noreferrer"
                className="text-jade hover:underline"
              >
                標準計劃 CSV
              </a>
            )}
            {data.source_urls["standard-plans.csv"] && data.source_urls["flexi-plans.csv"] && "・"}
            {data.source_urls["flexi-plans.csv"] && (
              <a
                href={data.source_urls["flexi-plans.csv"]}
                target="_blank"
                rel="noreferrer"
                className="text-jade hover:underline"
              >
                靈活計劃 CSV
              </a>
            )}
            ）
          </motion.p>
        </div>
      </section>

      {/* ── 篩選工具列 ───────────────────────────────────────── */}
      <motion.div
        className="sticky top-[72px] z-40 border-b bg-paper"
        style={{ borderColor: "var(--line)" }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.2 }}
      >
        <div className="site-container flex flex-wrap items-center gap-3 py-3.5">
          {/* 計劃類型 chips */}
          <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="計劃類型篩選">
            {TYPE_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPlanType(key)}
                aria-pressed={planType === key}
                className={cn(
                  "chip shrink-0 whitespace-nowrap font-bold transition-all duration-300 active:scale-[0.94]",
                  planType === key ? "bg-ink text-paper" : "bg-paper-3 text-ink-soft hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="h-6 w-px max-md:hidden" style={{ background: "var(--line-strong)" }} aria-hidden="true" />

          {/* 保險公司 */}
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger
              className="h-[34px] w-[220px] shrink-0 rounded-full border-transparent bg-paper-3 px-3 text-small font-medium text-ink-soft shadow-none hover:text-ink focus:ring-red/40"
              aria-label="保險公司篩選"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-small">
                全部保險公司
              </SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c} className="text-small">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 搜尋 */}
          <label className="flex h-[34px] min-w-[200px] flex-1 items-center gap-2 rounded-full bg-paper-3 px-3 text-ink-soft focus-within:text-ink md:max-w-[280px]">
            <Search size={14} className="shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋計劃名稱或認可編號"
              className="w-full bg-transparent text-small font-medium text-ink outline-none placeholder:text-ink-faint"
              aria-label="搜尋計劃名稱或認可編號"
            />
          </label>

          {/* 結果數 + 重設 */}
          <div className="ml-auto flex shrink-0 items-center gap-3 text-small">
            <span className="whitespace-nowrap text-ink-faint">
              顯示 <span className="font-grotesk font-bold text-ink">{shown}</span> /{" "}
              <span className="font-grotesk">{total}</span> 份
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 whitespace-nowrap text-ink-faint transition-colors hover:text-red"
              >
                <RotateCcw size={12} />
                重設
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── 名單 ─────────────────────────────────────────────── */}
      <section className="py-10 max-md:py-8">
        <div className="site-container flex flex-col gap-14">
          {shown === 0 ? (
            <EmptyState
              title="呢個組合搵唔到認可產品"
              description="試下移除部分篩選條件。"
              onReset={resetFilters}
            />
          ) : (
            <>
              {/* 標準計劃 */}
              {filteredStandard.length > 0 && (
                <div>
                  <div className="mb-5 flex flex-wrap items-baseline gap-3">
                    <h2 className="h3-style text-ink">標準計劃</h2>
                    <span className="chip bg-jade-wash font-bold text-jade">
                      {filteredStandard.length} 份
                    </span>
                    <span className="text-small text-ink-faint">
                      政府劃一條款，基本保障各公司完全相同
                    </span>
                  </div>
                  <div
                    className="rounded-card border bg-paper shadow-card max-lg:overflow-x-auto"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <table className="w-full border-collapse text-left text-[14.5px] leading-[1.55] max-lg:min-w-[860px] max-md:text-[13.5px]">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
                          <th className="bg-paper-2 px-5 py-3.5 text-left text-small font-bold text-ink-soft">
                            計劃名稱 / 認可編號
                          </th>
                          <th className="bg-paper-2 px-4 py-3.5 text-left text-small font-bold text-ink-soft">
                            保險公司
                          </th>
                          <th className="bg-paper-2 px-4 py-3.5 text-left text-small font-bold text-ink-soft">
                            生效日期
                          </th>
                          <th className="bg-paper-2 px-4 py-3.5 text-left text-small font-bold text-ink-soft">
                            狀態
                          </th>
                          <th className="bg-paper-2 px-4 py-3.5 text-left text-small font-bold text-ink-soft">
                            官方文件
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStandard.map((p: VhisStandardPlan, i) => (
                          <motion.tr
                            key={p.cert_no}
                            className="border-b transition-colors duration-200 hover:bg-paper-2"
                            style={{ borderColor: "var(--line)" }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: p.status === "withdrawn" ? 0.6 : 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i < 9 ? i * 0.04 : 0 }}
                          >
                            <td className="px-5 py-4 align-top">
                              <span className="block font-sans font-medium leading-snug text-ink">
                                {p.name_zh}
                              </span>
                              <span className="mt-1 block font-grotesk text-[12px] text-ink-faint">
                                {p.cert_no}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top text-ink-soft">{p.company_zh}</td>
                            <td className="px-4 py-4 align-top whitespace-nowrap text-ink-soft">
                              {p.effective_date_zh}
                            </td>
                            <td className="px-4 py-4 align-top">
                              {p.status === "active" ? (
                                <span className="chip bg-jade-wash font-bold text-jade">在售</span>
                              ) : (
                                <StatusBadge status={p.status} />
                              )}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <DocLinks
                                planDocUrl={p.plan_doc_url}
                                premiumDocUrl={p.premium_doc_url}
                              />
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 靈活計劃 */}
              {filteredFlexi.length > 0 && (
                <div>
                  <div className="mb-5 flex flex-wrap items-baseline gap-3">
                    <h2 className="h3-style text-ink">靈活計劃</h2>
                    <span className="chip bg-jade-wash font-bold text-jade">
                      {filteredFlexi.length} 份
                    </span>
                    <span className="text-small text-ink-faint">
                      喺標準保障之上提供更高／更廣保障，每份計劃可分多個級別，點開睇詳情
                    </span>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFlexi.map((p: VhisFlexiProduct) => (
                      <AccordionItem
                        key={p.cert_base}
                        value={p.cert_base}
                        style={{ borderColor: "var(--line)" }}
                        className={cn(p.status === "withdrawn" && "opacity-60")}
                      >
                        <AccordionTrigger className="py-5 text-left hover:no-underline [&>svg]:shrink-0 [&>svg]:text-ink-faint">
                          <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 pr-2">
                            <span className="font-sans text-[16px] font-bold text-ink">
                              {p.name_zh}
                            </span>
                            <span className="font-grotesk text-[12px] text-ink-faint">
                              {p.cert_base}
                            </span>
                            <span className="chip bg-paper-3 text-ink-soft">
                              <span className="font-grotesk font-bold">{p.levels.length}</span> 個級別
                            </span>
                            <StatusBadge status={p.status} />
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1 pb-2">
                            <p className="mb-2 text-small text-ink-faint">
                              {p.company_zh}・生效日期 {p.effective_date_zh}
                            </p>
                            {p.levels.map((lv) => (
                              <div
                                key={lv.cert_no}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-paper-2"
                              >
                                <span className="min-w-[180px] flex-1 font-medium text-ink">
                                  {lv.level_zh}
                                </span>
                                <span className="font-grotesk text-[12px] text-ink-faint">
                                  {lv.cert_no}
                                </span>
                                <DocLinks
                                  planDocUrl={lv.plan_doc_url}
                                  premiumDocUrl={lv.premium_doc_url}
                                />
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── 頁尾備註 ─────────────────────────────────────────── */}
      <section className="pb-24 max-md:pb-16">
        <div className="site-container">
          <p
            className="mx-auto max-w-[640px] border-t pt-6 text-center text-small text-ink-faint"
            style={{ borderColor: "var(--line)" }}
          >
            本頁名單由 vhis.gov.hk 官方公開數據生成（scripts/build_vhis.py），最後更新{" "}
            <span className="font-grotesk font-bold">{data.fetched_at}</span>
            ；保障及保費以保險公司官方文件為準。
          </p>
        </div>
      </section>
    </>
  );
}

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { useCategories, useInsuranceData } from "@/providers/InsuranceDataProvider";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface LedgerRow {
  id: string;
  name: string;
  color: string;
  products: number;
  withPremium: number;
  insurers: number;
}

/** 數據未載入時嘅後備（design/about.md S3 行數據，同 insurance-data.json 一致） */
const FALLBACK_ROWS: LedgerRow[] = [
  { id: "home", name: "家居保險", color: "#B5533C", products: 12, withPremium: 7, insurers: 12 },
  { id: "travel", name: "旅遊保險", color: "#2E6FDB", products: 9, withPremium: 6, insurers: 9 },
  { id: "life", name: "人壽保險", color: "#5B4FA6", products: 12, withPremium: 4, insurers: 12 },
  { id: "critical-illness", name: "危疾保險", color: "#C8102E", products: 10, withPremium: 5, insurers: 10 },
  { id: "accident", name: "意外保險", color: "#D98E04", products: 10, withPremium: 5, insurers: 10 },
  { id: "medical", name: "醫療保險（自願醫保）", color: "#0E7C66", products: 12, withPremium: 12, insurers: 12 },
  { id: "motor", name: "汽車保險", color: "#3C4A63", products: 9, withPremium: 0, insurers: 9 },
  { id: "domestic-helper", name: "家傭保險", color: "#7A4FB5", products: 7, withPremium: 6, insurers: 7 },
  { id: "pet", name: "寵物保險", color: "#E0662B", products: 4, withPremium: 1, insurers: 4 },
];

type StatusKind = "full" | "partial" | "quote";

function statusOf(row: LedgerRow): { kind: StatusKind; label: string } {
  if (row.withPremium >= row.products) return { kind: "full", label: "保費較齊" };
  if (row.withPremium <= 1) return { kind: "quote", label: "多為即時報價" };
  return { kind: "partial", label: "部分公開" };
}

const STATUS_CLASS: Record<StatusKind, string> = {
  full: "bg-jade-wash text-jade",
  partial: "bg-paper-3 text-ink",
  quote: "bg-amber-wash text-amber",
};

/**
 * 數據規模一覽（about.md S3）：「總賬表」——9 類別產品數 / 保費公開情況 / 狀態。
 */
export default function DataLedger() {
  const { data, generatedAt } = useInsuranceData();
  const categories = useCategories();

  const rows = useMemo<LedgerRow[]>(() => {
    if (!data || categories.length === 0) return FALLBACK_ROWS;
    const ordered = [...categories].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a.id as (typeof CATEGORY_ORDER)[number]) - CATEGORY_ORDER.indexOf(b.id as (typeof CATEGORY_ORDER)[number]),
    );
    return ordered.map((cat) => {
      const products = data.products.filter((p) => p.category === cat.id);
      return {
        id: cat.id,
        name: cat.name_zh,
        color: CATEGORY_META[cat.id]?.color ?? "#181D2E",
        products: cat.count,
        withPremium: products.filter((p) => p.premium_available).length,
        insurers: new Set(products.map((p) => p.insurer)).size,
      };
    });
  }, [data, categories]);

  const totals = useMemo(
    () => ({
      products: rows.reduce((s, r) => s + r.products, 0),
      withPremium: rows.reduce((s, r) => s + r.withPremium, 0),
    }),
    [rows],
  );

  return (
    <section className="bg-paper-2 py-20 md:py-24" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="site-container">
        <div className="mx-auto max-w-[900px]">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="eyebrow text-ink-faint"
          >
            LEDGER · 數據規模
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="h3-style mt-4 text-ink"
          >
            總賬一覽，逐類點算。
          </motion.h2>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[14.5px] leading-[1.55] max-md:text-[13.5px]">
              <thead>
                <tr className="text-left text-small text-ink-faint">
                  <th scope="col" className="border-b pb-3 pr-4 font-medium" style={{ borderColor: "var(--line-strong)" }}>類別</th>
                  <th scope="col" className="border-b pb-3 pr-4 font-medium" style={{ borderColor: "var(--line-strong)" }}>產品數</th>
                  <th scope="col" className="border-b pb-3 pr-4 font-medium" style={{ borderColor: "var(--line-strong)" }}>有公開保費</th>
                  <th scope="col" className="border-b pb-3 pr-4 font-medium" style={{ borderColor: "var(--line-strong)" }}>涵蓋公司數</th>
                  <th scope="col" className="border-b pb-3 font-medium" style={{ borderColor: "var(--line-strong)" }}>狀態</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const status = statusOf(row);
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
                      whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
                      viewport={{ once: true, margin: "-18% 0px" }}
                      transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT_EXPO }}
                      className="transition-colors hover:bg-paper-3"
                    >
                      <td className="border-b py-3.5 pr-4" style={{ borderColor: "var(--line)" }}>
                        <Link
                          to={`/category/${row.id}`}
                          className="inline-flex items-center gap-2.5 font-medium text-ink transition-colors hover:text-red"
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: row.color }}
                            aria-hidden="true"
                          />
                          {row.name}
                        </Link>
                      </td>
                      <td className="border-b py-3.5 pr-4 font-grotesk font-bold text-ink" style={{ borderColor: "var(--line)" }}>
                        {row.products}
                      </td>
                      <td className="border-b py-3.5 pr-4" style={{ borderColor: "var(--line)" }}>
                        <span className={cn("font-grotesk font-bold", row.withPremium > 0 ? "text-jade" : "text-amber")}>
                          {row.withPremium}
                        </span>
                      </td>
                      <td className="border-b py-3.5 pr-4 font-grotesk font-bold text-ink" style={{ borderColor: "var(--line)" }}>
                        {row.insurers}
                      </td>
                      <td className="border-b py-3.5" style={{ borderColor: "var(--line)" }}>
                        <span className={cn("chip", STATUS_CLASS[status.kind])}>{status.label}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
              <tfoot>
                <motion.tr
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-18% 0px" }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="font-bold text-ink"
                >
                  <td className="py-4 pr-4" style={{ borderTop: "3px double var(--line-strong)" }}>合計</td>
                  <td className="py-4 pr-4 font-grotesk" style={{ borderTop: "3px double var(--line-strong)" }}>{totals.products}</td>
                  <td className="py-4 pr-4 font-grotesk text-jade" style={{ borderTop: "3px double var(--line-strong)" }}>{totals.withPremium}</td>
                  <td className="py-4 pr-4" style={{ borderTop: "3px double var(--line-strong)" }}>—</td>
                  <td className="py-4 text-small font-medium text-ink-soft" style={{ borderTop: "3px double var(--line-strong)" }}>
                    快照 {generatedAt}
                  </td>
                </motion.tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

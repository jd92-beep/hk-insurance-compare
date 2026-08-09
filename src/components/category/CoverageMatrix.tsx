import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import type { Category, Insurer, Product } from "@/types/insurance";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/utils";

const BACK_OUT = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
const COLLAPSED_ROWS = 12;

/**
 * 類別 × 公司覆蓋矩陣（categories.md S4）
 * 縱軸 27 間公司（按產品數降序，預設顯示首 12 間），橫軸 9 個類別。
 * 點實心格 → 該類別產品列表。
 */
export default function CoverageMatrix({
  insurers,
  categories,
  products,
}: {
  insurers: Insurer[];
  categories: Category[];
  products: Product[];
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // 覆蓋查表：insurer → category → 產品數
  const coverage = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const p of products) {
      let row = map.get(p.insurer);
      if (!row) {
        row = new Map();
        map.set(p.insurer, row);
      }
      row.set(p.category, (row.get(p.category) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const orderedCats = useMemo(
    () =>
      CATEGORY_ORDER.map((id) => categories.find((c) => c.id === id)).filter(
        (c): c is Category => Boolean(c),
      ),
    [categories],
  );

  const visibleInsurers = expanded ? insurers : insurers.slice(0, COLLAPSED_ROWS);
  const hiddenCount = insurers.length - COLLAPSED_ROWS;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th className="w-[180px] min-w-[180px] px-2 pb-3 text-left align-bottom text-small font-bold text-ink-faint">
              保險公司
            </th>
            {orderedCats.map((c) => {
              const meta = CATEGORY_META[c.id];
              return (
                <th key={c.id} className="px-1 pb-2 align-bottom">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="text-small font-medium text-ink-soft [writing-mode:vertical-rl]"
                      style={{ letterSpacing: "0.08em" }}
                    >
                      {c.name_zh.replace("（自願醫保）", "")}
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: meta?.color ?? "#181D2E" }}
                      aria-hidden="true"
                    />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visibleInsurers.map((ins, rowIndex) => {
            const row = coverage.get(ins.name);
            return (
              <tr key={ins.name} className="border-t" style={{ borderColor: "var(--line)" }}>
                <th className="px-2 py-2 text-left align-middle font-normal">
                  <span className="block truncate text-small">
                    <span className="font-grotesk font-bold text-ink">{ins.name}</span>
                    <span className="ml-1.5 text-ink-soft">{ins.name_zh}</span>
                  </span>
                </th>
                {orderedCats.map((c) => {
                  const n = row?.get(c.id) ?? 0;
                  const color = CATEGORY_META[c.id]?.color ?? "#181D2E";
                  return (
                    <td key={c.id} className="px-1 py-2 text-center align-middle">
                      {n > 0 ? (
                        <motion.button
                          type="button"
                          title={`${ins.name} ${ins.name_zh} · ${c.name_zh} · ${n} 份產品`}
                          aria-label={`${ins.name_zh} ${c.name_zh}，${n} 份產品`}
                          onClick={() => navigate(`/category/${c.id}`)}
                          className="mx-auto block h-[18px] w-[18px] rounded-[3px] transition-transform duration-200 hover:scale-125"
                          style={{ background: color }}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true, margin: "-10% 0px" }}
                          transition={{ duration: 0.3, ease: BACK_OUT, delay: rowIndex * 0.04 }}
                        />
                      ) : (
                        <span
                          className="mx-auto block h-[18px] w-[18px] rounded-[3px] border"
                          style={{ borderColor: "var(--line-strong)", background: "var(--paper-3)", opacity: 0.55 }}
                          aria-hidden="true"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 rounded-[10px] border px-4 py-2 text-small font-bold text-ink transition-colors hover:bg-paper-3",
          )}
          style={{ borderColor: "var(--line-strong)" }}
        >
          顯示全部 {insurers.length} 間
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}

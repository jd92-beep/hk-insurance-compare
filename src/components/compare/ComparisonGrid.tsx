import { Fragment, useMemo } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types/insurance";
import { cn } from "@/lib/utils";
import {
  bestValueColumnsFromLimits,
  premiumStatusDiffers,
} from "@/components/compare/coverage";
import { resolveCoverage } from "@/components/compare/canonical-benefits";
import {
  CoverageLimitCell,
  DocumentsCell,
  ExclusionsCell,
  KeyTermsCell,
  PlanTiersCell,
  PremiumNotesCell,
  PremiumRangeCell,
  PremiumStatusCell,
  SourceLinksCell,
} from "@/components/compare/cells";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** 對照組標題橫條（--paper-3 底，eyebrow 字級） */
function GroupBand({ en, zh }: { en: string; zh: string }) {
  return (
    <div className="border-y bg-paper-3 px-4 py-2.5" style={{ borderColor: "var(--line)" }}>
      <p className="eyebrow text-ink-soft">
        {en}
        <span className="eyebrow-zh ml-3 font-sans font-bold normal-case tracking-[0.3em] text-ink">
          {zh}
        </span>
      </p>
    </div>
  );
}

/** 一行對照：左 200px 標籤欄（sticky left）+ 各產品欄；整行 hover 變底 */
function Row({
  label,
  columns,
  children,
  amberWash = false,
  spare = false,
}: {
  label: string;
  columns: string;
  children: React.ReactNode;
  /** 差異高亮：淡 amber 掃底 */
  amberWash?: boolean;
  /** 未揀滿 3 份時，尾部留一個空欄位同產品欄頭虛線槽對齊 */
  spare?: boolean;
}) {
  return (
    <motion.div
      layout="position"
      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
      className={cn("group grid border-b", amberWash && "bg-amber-wash/50")}
      style={{ gridTemplateColumns: columns, borderColor: "var(--line)" }}
    >
      <div
        className={cn(
          "sticky left-0 z-10 border-r px-4 py-4 text-[14px] font-medium leading-[1.55] text-ink transition-colors group-hover:bg-paper-2",
          amberWash ? "bg-[#F6ECDA]" : "bg-paper",
        )}
        style={{ borderColor: "var(--line)" }}
      >
        {label}
      </div>
      {children}
      {spare && (
        <div
          className="min-w-0 px-4 py-4 transition-colors group-hover:bg-paper-2"
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 px-4 py-4 transition-colors group-hover:bg-paper-2">
      {children}
    </div>
  );
}

/** 每組以「表格行揭示」clip-path 逐組揭開 */
function GroupReveal({
  en,
  zh,
  index,
  children,
}: {
  en: string;
  zh: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: EASE_OUT_EXPO }}
      className="border-x"
      style={{ borderColor: "var(--line)" }}
    >
      <GroupBand en={en} zh={zh} />
      {children}
    </motion.section>
  );
}

/**
 * 對照表（compare.md S3，桌面版）：
 * 5 個對照組，左 200px 標籤欄 sticky left。
 */
export default function ComparisonGrid({
  products,
  spare = false,
}: {
  products: Product[];
  /** 未揀滿 3 份 → 表格尾部留一個空欄位同欄頭虛線槽對齊 */
  spare?: boolean;
}) {
  const columns = `200px repeat(${products.length + (spare ? 1 : 0)}, minmax(0, 1fr))`;
  // canonical benefit mapping：等值保障對齊同一行；對唔到嘅歸「其他保障」
  const resolved = useMemo(() => resolveCoverage(products), [products]);
  const bestMap = useMemo(() => {
    const map = new Map<string, Set<number>>();
    for (const row of resolved.matched) map.set(row.key, bestValueColumnsFromLimits(row.limits, row.label));
    return map;
  }, [resolved]);
  const priceDiffers = premiumStatusDiffers(products);
  const noCoverage =
    resolved.matched.length === 0 && resolved.others.length === 0;

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[720px] flex-col gap-8">
        {/* 組 1 — 保費 */}
        <GroupReveal en="PRICE" zh="保費" index={0}>
          <Row label="保費範圍" columns={columns} spare={spare}>
            {products.map((p) => (
              <Cell key={p.id}><PremiumRangeCell product={p} /></Cell>
            ))}
          </Row>
          <Row label="保費備註" columns={columns} spare={spare}>
            {products.map((p) => (
              <Cell key={p.id}><PremiumNotesCell product={p} /></Cell>
            ))}
          </Row>
          <Row label="公開保費" columns={columns} amberWash={priceDiffers} spare={spare}>
            {products.map((p) => (
              <Cell key={p.id}><PremiumStatusCell product={p} /></Cell>
            ))}
          </Row>
        </GroupReveal>

        {/* 組 2 — 保障項目（canonical 標準行對齊） */}
        <GroupReveal en="COVERAGE" zh="保障項目" index={1}>
          {noCoverage && (
            <Row label="保障項目" columns={columns} spare={spare}>
              {products.map((p) => (
                <Cell key={p.id}><span className="text-ink-faint">—</span></Cell>
              ))}
            </Row>
          )}
          {resolved.matched.map((row) => (
            <Row key={row.key} label={row.label} columns={columns} spare={spare}>
              {products.map((p, i) => (
                <Cell key={p.id}>
                  <CoverageLimitCell
                    limit={row.limits[i]}
                    highlight={bestMap.get(row.key)?.has(i) ?? false}
                  />
                </Cell>
              ))}
            </Row>
          ))}
        </GroupReveal>

        {/* 組 2b — 其他保障（命名對唔到標準項目嘅條目，以原文列出） */}
        {resolved.others.length > 0 && (
          <GroupReveal en="OTHER BENEFITS" zh="其他保障" index={2}>
            {resolved.others.map((row) => (
              <Row key={row.key} label={row.label} columns={columns} spare={spare}>
                {products.map((p, i) => (
                  <Cell key={p.id}>
                    <CoverageLimitCell limit={row.limits[i]} highlight={false} />
                  </Cell>
                ))}
              </Row>
            ))}
          </GroupReveal>
        )}

        {/* 組 3 — 計劃層級 */}
        <GroupReveal en="PLANS" zh="計劃層級" index={3}>
          <Row label="計劃層級" columns={columns} spare={spare}>
            {products.map((p) => (
              <Cell key={p.id}><PlanTiersCell product={p} /></Cell>
            ))}
          </Row>
        </GroupReveal>

        {/* 組 4 — 主要條款 */}
        <GroupReveal en="KEY TERMS" zh="主要條款" index={4}>
          <Row label="主要條款" columns={columns} spare={spare}>
            {products.map((p) => (
              <Cell key={p.id}><KeyTermsCell product={p} /></Cell>
            ))}
          </Row>
        </GroupReveal>

        {/* 組 5 — 不保事項與文件 */}
        <GroupReveal en="EXCLUSIONS & DOCS" zh="不保事項與文件" index={5}>
          <Fragment>
            <Row label="不保事項" columns={columns} spare={spare}>
              {products.map((p) => (
                <Cell key={p.id}><ExclusionsCell product={p} /></Cell>
              ))}
            </Row>
            <Row label="官方文件" columns={columns} spare={spare}>
              {products.map((p) => (
                <Cell key={p.id}><DocumentsCell product={p} /></Cell>
              ))}
            </Row>
            <Row label="官方來源" columns={columns} spare={spare}>
              {products.map((p) => (
                <Cell key={p.id}><SourceLinksCell product={p} /></Cell>
              ))}
            </Row>
          </Fragment>
        </GroupReveal>
      </div>
    </div>
  );
}

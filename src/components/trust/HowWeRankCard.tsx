import { motion } from "framer-motion";
import { Link } from "react-router";
import { MOTION } from "@/lib/motion-runtime";
import {
  HOW_WE_RANK,
  HOW_WE_RANK_POINTS,
  SORT_METHODOLOGY,
  type CatalogueSortId,
} from "@/lib/trust-methodology";

/**
 * Always-visible ranking methodology card.
 * Default sort is 摘要命中排序 — not sponsored, not suitability.
 */
export default function HowWeRankCard({
  snapshotDate,
  sort = HOW_WE_RANK.defaultSortId,
  onSortChange,
  categoryId,
}: {
  snapshotDate: string;
  sort?: CatalogueSortId;
  onSortChange?: (next: CatalogueSortId) => void;
  categoryId?: string;
}) {
  const active = SORT_METHODOLOGY.find((option) => option.id === sort) ?? SORT_METHODOLOGY[0];
  return (
    <motion.section
      aria-labelledby="how-we-rank-title"
      data-testid="how-we-rank-card"
      initial={{ opacity: 0, y: MOTION.enterY, scale: MOTION.enterScale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={MOTION.springy}
      className="rounded-card border border-line bg-paper-2 p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-jade">{HOW_WE_RANK.cardKicker}</p>
          <h2 id="how-we-rank-title" className="mt-2 font-serif text-2xl font-bold text-ink">
            {HOW_WE_RANK.cardTitle}
          </h2>
        </div>
        <span className="chip shrink-0 bg-paper text-ink-soft" data-testid="how-we-rank-snapshot">
          {HOW_WE_RANK.snapshotLabelPrefix}：{snapshotDate}
        </span>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft" data-testid="how-we-rank-always-visible">
        {HOW_WE_RANK.alwaysVisibleLead}
      </p>
      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-ink-faint">{HOW_WE_RANK.snapshotNote}</p>

      <ul className="mt-5 grid grid-cols-1 gap-3 fold:grid-cols-2">
        {HOW_WE_RANK_POINTS.map((point, index) => (
          <motion.li
            key={point.id}
            initial={{ opacity: 0, y: MOTION.enterY / 2 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...MOTION.springSoft, delay: index * 0.04 }}
            className="rounded-xl border border-line bg-paper p-4"
          >
            <h3 className="text-base font-bold text-ink">{point.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{point.body}</p>
          </motion.li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-line bg-paper p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-ink">排列方式（你可以改）</h3>
            <p className="mt-1 text-sm text-ink-soft" data-testid="how-we-rank-active-sort">
              而家：{active.label} — {active.explanation}
            </p>
          </div>
          {onSortChange ? (
            <label className="inline-flex min-h-11 flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              改排序
              <select
                data-testid="how-we-rank-sort-select"
                value={sort}
                onChange={(event) => onSortChange(event.target.value as CatalogueSortId)}
                className="min-h-11 max-w-full rounded-lg border border-line-strong bg-paper px-3 text-sm text-ink"
              >
                {SORT_METHODOLOGY.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {SORT_METHODOLOGY.map((option) => (
                <li key={option.id} className="chip bg-paper-3 text-ink-soft">
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          預設＝{HOW_WE_RANK.defaultSortShort}。本站冇 lead form、唔賣資料、冇適合度分數。
          {categoryId ? (
            <>
              {" "}
              <Link to="/guides#trust" className="min-h-11 inline-flex items-center font-semibold text-jade underline">
                睇完整信任邊界
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </motion.section>
  );
}

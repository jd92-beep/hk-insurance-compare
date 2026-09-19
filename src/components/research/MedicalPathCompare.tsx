import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MOTION } from "@/lib/motion-runtime";
import {
  MEDICAL_PATH_COLUMNS,
  MEDICAL_PATH_COMPARE,
  MEDICAL_PATH_DIMENSIONS,
} from "@/lib/trust-methodology";

/**
 * Educational medical-path dimension table.
 * Dimensions only — never “which is better”, never suitability ranking.
 */
export default function MedicalPathCompare() {
  const links = [
    MEDICAL_PATH_COMPARE.links.vhisList,
    MEDICAL_PATH_COMPARE.links.medicalCategory,
    MEDICAL_PATH_COMPARE.links.topUpCategory,
    MEDICAL_PATH_COMPARE.links.guidesVhis,
  ];
  return (
    <motion.section
      aria-labelledby="medical-path-compare-title"
      data-testid="medical-path-compare"
      initial={{ opacity: 0, y: MOTION.enterY, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={MOTION.springy}
      className="rounded-card border border-line bg-paper p-5 md:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-jade">{MEDICAL_PATH_COMPARE.kicker}</p>
          <h2
            id="medical-path-compare-title"
            className="mt-2 font-serif text-2xl font-bold text-ink md:text-3xl"
          >
            {MEDICAL_PATH_COMPARE.title}
          </h2>
        </div>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">{MEDICAL_PATH_COMPARE.lead}</p>
      <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-ink" data-testid="medical-path-not-better">
        {MEDICAL_PATH_COMPARE.notBetterNote}
      </p>

      <div className="mt-5 overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[480px] border-collapse text-left text-sm fold:min-w-[640px] lg:min-w-[720px]" data-testid="medical-path-table">
          <caption className="sr-only">醫療路徑教育維度對照（非優劣排名）</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pr-3 font-bold text-ink">
                維度
              </th>
              {MEDICAL_PATH_COLUMNS.map((column) => (
                <th key={column.id} scope="col" className="py-3 pr-3 font-bold text-ink">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEDICAL_PATH_DIMENSIONS.map((dimension, index) => (
              <motion.tr
                key={dimension.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...MOTION.springSoft, delay: index * 0.03 }}
                className="border-b border-line align-top"
              >
                <th scope="row" className="w-[9rem] py-3 pr-3 font-bold text-ink">
                  {dimension.label}
                </th>
                {MEDICAL_PATH_COLUMNS.map((column) => (
                  <td key={column.id} className="py-3 pr-3 leading-relaxed text-ink-soft">
                    {dimension.values[column.id]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" data-testid="medical-path-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line-strong bg-paper-2 px-3 text-sm font-semibold text-ink hover:border-jade hover:text-jade"
          >
            {link.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        以上維度只係教育導航，唔代表邊條路徑更適合你，亦唔構成報價或核保證據。
      </p>
    </motion.section>
  );
}

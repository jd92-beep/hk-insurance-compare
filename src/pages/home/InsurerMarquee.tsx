import { motion } from "framer-motion";
import { Link } from "react-router";
import { useInsurers } from "@/providers/InsuranceDataProvider";

/** S2 保險公司跑馬燈 */
export default function InsurerMarquee() {
  const insurers = useInsurers();
  if (insurers.length === 0) return null;
  const row = [...insurers, ...insurers];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6 }}
      className="border-y bg-paper-2 py-7"
      style={{ borderColor: "var(--line)" }}
      aria-label="涵蓋保險公司"
    >
      <div className="flex items-center gap-8">
        <p className="eyebrow eyebrow-zh shrink-0 pl-[clamp(20px,4vw,48px)] text-ink-faint">
          涵蓋保險公司
        </p>
        <div className="marquee-mask marquee-track min-w-0 flex-1 overflow-hidden">
          <div className="animate-marquee flex w-max items-center whitespace-nowrap">
            {row.map((ins, i) => (
              <span key={`${ins.name}-${i}`} className="inline-flex items-center gap-8 pr-8" aria-hidden={i >= insurers.length}>
                <Link
                  to={`/insurers#${ins.name}`}
                  className="text-[15px] transition-colors hover:text-red"
                  tabIndex={i >= insurers.length ? -1 : undefined}
                >
                  <span className="font-grotesk font-medium text-ink">{ins.name}</span>
                  <span className="ml-2 font-sans font-medium text-ink-soft">{ins.name_zh}</span>
                </Link>
                <span className="h-1.5 w-1.5 rotate-45 bg-red" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

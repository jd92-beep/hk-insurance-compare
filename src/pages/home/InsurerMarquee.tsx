import { motion } from "framer-motion";
import { Link } from "react-router";
import { useInsurers } from "@/providers/InsuranceDataProvider";
import { ShieldCheck } from "lucide-react";

/** S2 保險公司跑馬燈 — 典藏壓印紙帶 */
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
      className="relative z-10 border-y border-ink/10 bg-paper-2/95 py-6 shadow-[inset_0_2px_6px_rgba(24,29,46,0.03),inset_0_-2px_6px_rgba(24,29,46,0.03)] backdrop-blur-xs"
      aria-label="涵蓋保險公司"
    >
      <div className="flex items-center gap-8">
        <div className="flex shrink-0 items-center gap-2 pl-[clamp(20px,4vw,48px)]">
          <ShieldCheck size={15} className="text-jade" />
          <p className="eyebrow eyebrow-zh text-[11.5px] tracking-widest text-ink-soft">
            涵蓋保險公司 · 39 間官方認可
          </p>
        </div>
        <div className="marquee-mask marquee-track min-w-0 flex-1 overflow-hidden">
          <div className="animate-marquee flex w-max items-center whitespace-nowrap">
            {row.map((ins, i) => (
              <span key={`${ins.name}-${i}`} className="inline-flex items-center gap-8 pr-8" aria-hidden={i >= insurers.length}>
                <Link
                  to={`/insurers#${ins.name}`}
                  className="group/ins inline-flex items-center text-[15px] transition-all duration-200 hover:text-red hover:-translate-y-0.5"
                  tabIndex={i >= insurers.length ? -1 : undefined}
                >
                  <span className="font-grotesk font-semibold text-ink transition-colors group-hover/ins:text-red">{ins.name}</span>
                  <span className="ml-2 font-sans text-sm font-medium text-ink-soft transition-colors group-hover/ins:text-red/90">{ins.name_zh}</span>
                </Link>
                <span className="h-1.5 w-1.5 rotate-45 bg-red/60" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}


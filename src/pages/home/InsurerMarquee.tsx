import { motion } from "framer-motion";
import { Link } from "react-router";
import { useInsurers } from "@/providers/InsuranceDataProvider";
import { insurerDetailPath } from "@/lib/insurer-catalogue";
import type { Insurer } from "@/types/insurance";
import { Parallax, Sticker } from "@/components/fx/Depth";
import { HeartArt, ShieldArt } from "@/components/fx/StickerArt";

function Tape({ insurers, reverse, tone, rotate }: { insurers: Insurer[]; reverse?: boolean; tone: string; rotate: number }) {
  const row = [...insurers, ...insurers];
  return (
    <div className="marquee-mask marquee-track relative overflow-hidden py-3" style={{ rotate: `${rotate}deg` }}>
      {/* pencil baseline */}
      <svg viewBox="0 0 1440 8" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-1 h-2 w-full" aria-hidden="true">
        <path d="M0 4 C 240 2 480 6 720 4 S 1200 2 1440 5" fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className={`${reverse ? "animate-marquee-rev" : "animate-marquee"} flex w-max items-center whitespace-nowrap`}>
        {row.map((ins, i) => (
          <span key={`${ins.name}-${i}`} className="inline-flex items-center gap-6 pr-6" aria-hidden={i >= insurers.length}>
            <Link
              to={insurerDetailPath(ins.name)}
              className="text-[15px] text-ink transition-colors hover:text-red"
              tabIndex={i >= insurers.length ? -1 : undefined}
            >
              <span className="font-hand text-[22px] font-bold">{ins.name}</span>
              <span className="ml-2 font-serif">{ins.name_zh}</span>
            </Link>
            <span className="text-[15px]" style={{ color: tone }} aria-hidden="true">✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** S2 保險公司 — two hand-lettered lines drifting in opposite directions */
export default function InsurerMarquee() {
  const insurers = useInsurers();
  if (insurers.length === 0) return null;
  const half = Math.ceil(insurers.length / 2);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7 }}
      className="relative z-10 overflow-hidden py-10"
      aria-label="涵蓋保險公司"
    >
      <p className="mb-4 text-center font-hand text-[24px] font-bold text-ink-soft">{insurers.length} insurers, side by side ↓</p>
      {/* the two lines slide against each other as you scroll */}
      <Parallax x={-360} speed={0.06}>
        <Tape insurers={insurers.slice(0, half)} tone="#F2A71B" rotate={-0.8} />
      </Parallax>
      <Parallax x={360} speed={-0.04} className="-mt-1">
        <Tape insurers={insurers.slice(half)} tone="#3F9A5B" rotate={0.6} reverse />
      </Parallax>
      <Parallax speed={0.5} className="pointer-events-none absolute left-[6%] top-2 z-10 hidden w-14 md:block">
        <Sticker tilt={-12}><ShieldArt className="h-auto w-full" /></Sticker>
      </Parallax>
      <Parallax speed={0.8} className="pointer-events-none absolute bottom-0 right-[8%] z-10 w-12 md:w-14">
        <Sticker tilt={14}><HeartArt className="h-auto w-full" /></Sticker>
      </Parallax>
    </motion.section>
  );
}

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import TiltCard from "@/components/fx/TiltCard";
import { Parallax } from "@/components/fx/Depth";

const drawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1, delay: 0.15 * i, ease: "easeOut" },
  }),
};

function DrawnIcon({ paths }: { paths: string[] }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-11 w-11 text-ink transition-transform duration-300 group-hover:-rotate-6"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-18% 0px" }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <motion.path key={d} d={d} variants={drawVariants} custom={i} />
      ))}
    </motion.svg>
  );
}

const PROMISES = [
  {
    title: "官方文件做底",
    body: "摘自官方網站同 PDF，唔係二手轉載。",
    paths: [
      "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z",
      "M14 3v5h5",
      "M9 13h6M9 17h4",
    ],
  },
  {
    title: "來源全部公開",
    body: "每份附官方來源，可自己對返原文。",
    paths: [
      "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7",
      "M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
    ],
  },
  {
    title: "中立唔賣保",
    body: "唔賣保險、唔收轉介；按公開資料排列。",
    paths: [
      "M12 3v18",
      "M8 21h8",
      "M6 7l-3 6a3.5 3.5 0 0 0 6 0L6 7Z",
      "M18 7l-3 6a3.5 3.5 0 0 0 6 0l-3-6Z",
      "M4 7h16",
    ],
  },
];

const NOTES = [
  { bg: "#FFF2C2", rot: -2.5 },
  { bg: "#E4F3E1", rot: 1.8 },
  { bg: "#FDE7DE", rot: -1.2 },
];

/** S6 三大承諾 — 三張便利貼 */
export default function Promises() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="site-container">
        <p className="mb-2 text-center font-hand text-[26px] font-bold text-red">why trust us ♥</p>
        <h2 className="display-2 mb-14 text-center text-ink">點解信得過？</h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-18% 0px" }}
          transition={{ staggerChildren: 0.14 }}
          className="grid grid-cols-1 gap-10 fold:grid-cols-2 fold-wide:grid-cols-3"
        >
          {PROMISES.map((p, i) => (
            <Parallax key={p.title} speed={[0.12, 0.3, 0.18][i]}>
            <TiltCard className="h-full" max={14}>
            <div className="relative h-full">
            {/* a little pad of notes underneath = visible thickness */}
            {[10, 6, 3].map((o) => (
              <span
                key={o}
                aria-hidden="true"
                className="absolute inset-0"
                style={{ transform: `translate(${o * 0.4}px, ${o}px) rotate(${NOTES[i].rot + o * 0.15}deg)`, background: NOTES[i].bg, filter: "brightness(.94)", borderRadius: "4px 4px 22px 4px", boxShadow: "0 1px 0 rgba(0,0,0,.06)" }}
              />
            ))}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -60, rotate: NOTES[i].rot * 4 },
                show: { opacity: 1, y: 0, rotate: NOTES[i].rot, transition: { type: "spring", stiffness: 120, damping: 12 } },
              }}
              whileHover={{ rotate: 0, y: -8, transition: { type: "spring", stiffness: 300, damping: 15 } }}
              className="group relative h-full p-7 pt-10"
              style={{
                background: NOTES[i].bg,
                backgroundImage: "url(/textures/paper-fiber.svg)",
                backgroundBlendMode: "multiply",
                boxShadow: "0 1px 1px rgba(120,80,30,.1), 0 18px 28px -16px rgba(120,80,30,.4)",
                borderRadius: "4px 4px 22px 4px",
              }}
            >
              <span className="absolute left-1/2 top-3 h-3.5 w-3.5 -translate-x-1/2 rounded-full shadow-[0_2px_3px_rgba(0,0,0,.25)]" style={{ background: "radial-gradient(circle at 35% 35%, #ff9a7a, #E4573D)" }} aria-hidden="true" />
              <DrawnIcon paths={p.paths} />
              <h3 className="mt-4 font-serif text-[24px] font-bold text-ink">{p.title}</h3>
              <p className="mt-2 max-w-[32em] text-[15px] leading-[1.75] text-ink-soft">{p.body}</p>
            </motion.div>
            </div>
            </TiltCard>
            </Parallax>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

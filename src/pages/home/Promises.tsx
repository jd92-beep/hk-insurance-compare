import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

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
      className="h-9 w-9 text-ink transition-transform duration-300 group-hover:rotate-3"
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
    body: "所有保障、保費、條款摘自保險公司官方網站及 PDF 文件，唔係二手轉載。",
    paths: [
      "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z",
      "M14 3v5h5",
      "M9 13h6M9 17h4",
    ],
  },
  {
    title: "來源全部公開",
    body: "每份產品附官方來源連結同文件清單，你隨時可以自己對返原文。",
    paths: [
      "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7",
      "M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
    ],
  },
  {
    title: "中立唔賣保",
    body: "本站唔賣保險、唔收投保轉介，比較結果按公開資料如實排列。",
    paths: [
      "M12 3v18",
      "M8 21h8",
      "M6 7l-3 6a3.5 3.5 0 0 0 6 0L6 7Z",
      "M18 7l-3 6a3.5 3.5 0 0 0 6 0l-3-6Z",
      "M4 7h16",
    ],
  },
];

/** S6 三大承諾 —「點解信得過？」 */
export default function Promises() {
  return (
    <section className="py-24 md:py-28">
      <div className="site-container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-18% 0px" }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {PROMISES.map((p) => (
            <motion.div
              key={p.title}
              variants={{
                hidden: { opacity: 0, y: 32 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
              }}
              className="group relative pt-6"
            >
              <span className="absolute left-0 top-0 h-[2px] w-full bg-red transition-all duration-300 group-hover:h-[4px]" aria-hidden="true" />
              <DrawnIcon paths={p.paths} />
              <h3 className="mt-4 font-serif text-[22px] font-bold text-ink">{p.title}</h3>
              <p className="mt-2 max-w-[32em] text-[15px] leading-[1.75] text-ink-soft">{p.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

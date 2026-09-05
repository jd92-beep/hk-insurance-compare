import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import TiltCard from "@/components/fx/TiltCard";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** S7 指南預告 —「未識揀？睇埋指南先」 */
export default function GuidesTeaser() {
  return (
    <section className="pb-24 md:pb-32">
      <div className="site-container">
        <motion.div
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ clipPath: "inset(0 0% 0 0)" }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO }}
          className="rounded-[20px] border-l-4 border-red bg-paper-2 p-8 transition-shadow duration-300 hover:shadow-lift md:p-16"
        >
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.08, delayChildren: 0.3 }}
            className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between"
          >
            <div className="max-w-[560px]">
              <motion.h3
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }}
                className="font-serif text-[26px] font-bold leading-[1.25] text-ink max-md:text-[22px]"
              >
                墊底費、等候期、不保事項……睇唔明條款？
              </motion.h3>
              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }}
                className="mt-3 text-ink-soft"
              >
                投保指南用大白話解釋 9 類保險嘅揀選重點，附保險詞彙表。
              </motion.p>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }}>
                <Link to="/guides" className="btn-primary group mt-6">
                  睇投保指南
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
            <motion.div
              variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } } }}
              className="shrink-0"
            >
              {/* 指南插畫 3D 傾斜互動 */}
              <TiltCard className="rounded-[12px]" max={6}>
                <img
                  src="/guides-hero.svg"
                  alt="保單文件、放大鏡同紅色批註嘅紙雕插畫"
                  className="img-fade h-auto w-full max-w-[360px] rounded-[12px] border md:w-[360px]"
                  style={{ borderColor: "var(--line)" }}
                />
              </TiltCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

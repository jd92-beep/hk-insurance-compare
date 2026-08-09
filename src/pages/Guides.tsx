import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import Breadcrumbs from "@/components/Breadcrumbs";
import GuideCard from "@/components/guides/GuideCard";
import GlossarySection from "@/components/guides/GlossarySection";
import FaqAccordion from "@/components/guides/FaqAccordion";
import { GUIDES } from "@/components/guides/guides-data";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** h1 詞級進場（guides.md S1：詞級 SplitText 0.7s） */
function HeroTitle() {
  const words = ["睇得明，", "先好買。"];
  return (
    <h1 className="display-2 mt-5 text-ink" aria-label="睇得明，先好買。">
      {words.map((word, i) => (
        <motion.span
          key={word}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: EASE_OUT_EXPO }}
          className="inline-block"
        >
          {word}
          {i < words.length - 1 && <span className="inline-block w-[0.25em]" />}
        </motion.span>
      ))}
    </h1>
  );
}

/** 投保指南・詞彙 `/guides`（design/guides.md S1–S5） */
export default function Guides() {
  return (
    <>
      {/* S1 頁首 */}
      <section className="pb-16 pt-[88px]">
        <div className="site-container">
          <Breadcrumbs items={[{ label: "首頁", to: "/" }, { label: "投保指南" }]} />
          <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                className="eyebrow text-red"
              >
                GUIDES · 投保指南
              </motion.p>
              <HeroTitle />
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: EASE_OUT_EXPO }}
                className="mt-6 max-w-[34em] text-ink-soft"
              >
                墊底費、等候期、不保事項……保險條款唔使怕。每個類別一篇「點揀」重點，
                加埋大白話詞彙表，格價之前打底。
              </motion.p>
            </div>
            <motion.div
              initial={{ clipPath: "inset(6%)", scale: 1.05, opacity: 0 }}
              animate={{ clipPath: "inset(0%)", scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE_OUT_EXPO }}
              className="lg:col-span-5"
            >
              <img
                src="/guides-hero.svg"
                alt="攤開嘅保單文件、放大鏡同紅色批註嘅紙雕拼貼插畫"
                className="h-auto w-full rounded-[16px] border"
                style={{ borderColor: "var(--line)" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* S2 九類指南卡 */}
      <section className="pb-24 md:pb-32">
        <div className="site-container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide, i) => (
              <GuideCard key={guide.id} guide={guide} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* S3 保險詞彙表（深色段） */}
      <GlossarySection />

      {/* S4 常見問題 */}
      <FaqAccordion />

      {/* S5 底部 CTA */}
      <section className="pb-24 md:pb-32">
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <h2 className="h3-style text-ink">睇完指南，實戰格價。</h2>
            <Link to="/categories" className="btn-primary group">
              開始比較
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router";
import Breadcrumbs from "@/components/Breadcrumbs";
import StampBadge from "@/components/StampBadge";
import MethodTimeline from "@/components/about/MethodTimeline";
import DataLedger from "@/components/about/DataLedger";
import DisclaimerCard from "@/components/about/DisclaimerCard";
import { getLenis } from "@/lib/lenis";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** h1 詞級進場（about.md S1） */
function HeroTitle() {
  const words = ["每個數字，", "都有出處。"];
  return (
    <h1 className="display-2 mt-5 text-ink" aria-label="每個數字，都有出處。">
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

/** 關於數據・免責聲明 `/about`（design/about.md S1–S5） */
export default function About() {
  const location = useLocation();

  // #disclaimer 錨點：全站 Footer「完整免責聲明 →」嘅落點（對齊卡頂 -100px）
  useEffect(() => {
    if (location.hash !== "#disclaimer") return;
    const t = window.setTimeout(() => {
      const el = document.getElementById("disclaimer");
      if (!el) return;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(el, { offset: -100, duration: 0.9 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  return (
    <>
      {/* S1 頁首（置中） */}
      <section className="pb-14 pt-[88px]">
        <div className="site-container">
          <Breadcrumbs items={[{ label: "首頁", to: "/" }, { label: "關於數據" }]} />
          <div className="mx-auto mt-10 flex max-w-[760px] flex-col items-center text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="eyebrow text-red"
            >
              ABOUT THE DATA · 關於數據
            </motion.p>
            <HeroTitle />
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE_OUT_EXPO }}
              className="mt-6 text-ink-soft"
            >
              保險格價站唔賣保險、唔收轉介費。我哋只做一件事：
              將保險公司官方文件嘅資料，整理成你睇得明嘅比較。
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10"
            >
              <StampBadge variant="red" size={96} animated />
            </motion.div>
          </div>
        </div>
      </section>

      {/* S2 數據方法三步 */}
      <MethodTimeline />

      {/* S3 數據規模一覽 */}
      <DataLedger />

      {/* S4 完整免責聲明（#disclaimer） */}
      <DisclaimerCard />

      {/* S5 更正與聯絡 */}
      <section className="pb-28 pt-4">
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="mx-auto max-w-[640px] text-center"
          >
            <h3 className="h3-style text-ink">發現資料有誤？</h3>
            <p className="mt-4 text-ink-soft">
              保險產品更新頻繁。如發現本網站資料與官方文件不符，請經產品頁嘅「官方來源」連結核實最新版本——嗰度先係最準確嘅答案。
            </p>
            <p className="mt-6 text-small text-ink-faint">
              本網站為獨立資料整理項目，與各保險公司並無從屬關係。各公司名稱及產品名稱之商標權屬其持有人。
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

import { motion } from "framer-motion";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const CLAUSES = [
  "資料（保費、保障、條款等）摘錄自保險公司官方網站及文件，僅供參考比較。",
  "快照日期以頁面為準；公司可隨時更新，本站唔保證即時、完整或準確。一切以官方最新文件及正式保單為準。",
  "本站唔係持牌中介人，唔提供保險意見、唔賣保險、唔收投保費用。投保前請向持牌中介人或保險公司查詢，並細閱條款。",
  "「官網即時報價」指公司按個人資料報價；本站唔估算保費。優惠須有官方來源、條件及有效日期先顯示。",
  "使用本站資料引致嘅損失，本站概不負責。",
];

/**
 * 完整免責聲明（about.md S4，#disclaimer 錨點——全站 DisclaimerBand 連結目標）：
 * amber-wash 大提示卡，左 6px amber 邊。
 */
export default function DisclaimerCard() {
  const { generatedAt } = useInsuranceData();

  return (
    <section id="disclaimer" className="scroll-mt-28 py-20 md:py-24">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-18% 0px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="mx-auto max-w-[760px] rounded-[16px] border-l-[6px] border-amber bg-amber-wash p-8 md:p-12"
        >
          <h2 className="h3-style text-ink">免責聲明</h2>
          <div className="mt-6 flex flex-col gap-5">
            {CLAUSES.map((clause, i) => (
              <motion.p
                key={clause.slice(0, 12)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.06, ease: EASE_OUT_EXPO }}
                className="flex gap-3 text-[16px] leading-[1.8] text-ink"
              >
                <span className="mt-1 shrink-0 font-grotesk text-[13px] font-bold text-amber">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {clause}
              </motion.p>
            ))}
          </div>
          <div
            className="mt-8 flex flex-wrap items-center gap-3 border-t pt-5"
            style={{ borderColor: "rgba(217,142,4,.28)" }}
          >
            <span className="chip bg-amber text-paper">資料快照：{generatedAt}</span>
            <span className="text-small text-ink-soft">
              資料來源：各保險公司官方網站及官方文件
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

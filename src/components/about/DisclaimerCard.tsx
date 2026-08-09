import { motion } from "framer-motion";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const CLAUSES = [
  "本網站所有資料（包括但不限於保費、保障範圍、賠償上限、條款及不保事項）均摘錄自相關保險公司之官方網站及官方文件，僅供一般參考及比較用途。",
  "資料快照日期為 2026-08-09。保險公司或會隨時更新產品內容、保費及條款，本網站不保證資料之即時性、完整性或準確性。一切內容以保險公司最新官方文件及正式保單條款為準。",
  "本網站並非持牌保險中介人，不提供保險意見，不銷售保險產品，亦不因投保與否收取任何費用。投保前，請向持牌保險中介人或相關保險公司查詢，並細閱保單條款、產品冊子及利益說明。",
  "「官網即時報價」表示相關公司按個人資料提供報價；本網站不會代為估算保費。",
  "如因使用本網站資料而引致任何損失，本網站概不負責。",
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

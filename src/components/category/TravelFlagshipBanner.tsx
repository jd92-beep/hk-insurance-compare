import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Sparkles,
  Calculator,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

interface TravelFlagshipBannerProps {
  productCount: number;
  premiumCount: number;
  onSelectProduct?: (productId: string) => void;
}

export default function TravelFlagshipBanner({
  productCount,
  premiumCount,
}: TravelFlagshipBannerProps) {
  const [showCalculator, setShowCalculator] = useState(false);

  // 計算機 state
  const [tripsPerYear, setTripsPerYear] = useState<number>(3);
  const [tripType, setTripType] = useState<"asia" | "longhaul" | "mixed" | "gba">("mixed");
  const [travellerType, setTravellerType] = useState<"single" | "couple" | "family">("single");

  // 計算邏輯
  const calculation = useMemo(() => {
    // 單次旅程基準價格（HKD）
    let singleTripCost = 0;
    if (tripType === "asia") {
      singleTripCost = 220; // 5-7天日韓泰
    } else if (tripType === "longhaul") {
      singleTripCost = 550; // 10-14天歐美澳紐
    } else if (tripType === "mixed") {
      singleTripCost = 350; // 混合型平均
    } else {
      singleTripCost = 90; // 大灣區短途週末
    }

    // 人數加乘
    let multiplier = 1;
    if (travellerType === "couple") multiplier = 1.9; // 雙人
    if (travellerType === "family") multiplier = 2.8; // 家庭（兩大一/兩細）

    const totalSingleTripCost = Math.round(singleTripCost * multiplier * tripsPerYear);

    // 全年計劃基準年費（HKD）
    let annualPlanCost = 0;
    if (travellerType === "single") {
      annualPlanCost = 1680;
    } else if (travellerType === "couple") {
      annualPlanCost = 3100;
    } else {
      annualPlanCost = 3680; // 全年家庭計劃（兩大不限子女）
    }

    const difference = totalSingleTripCost - annualPlanCost;
    const isAnnualBetter = difference >= 0 || tripsPerYear >= 3;

    return {
      totalSingleTripCost,
      annualPlanCost,
      difference,
      isAnnualBetter,
      savings: Math.abs(difference),
    };
  }, [tripsPerYear, tripType, travellerType]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      className="mt-7 overflow-hidden rounded-[14px] border border-sky-500/30 bg-gradient-to-r from-[#0C1E3A] via-[#122B52] to-[#1A3B6E] p-6 text-white shadow-xl max-md:p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.6 }}
    >
      {/* 頂部 Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-300 ring-1 ring-sky-400/40">
            <Plane size={22} className="rotate-[-20deg]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1 rounded bg-sky-400/20 px-2.5 py-0.5 font-grotesk text-[11px] font-black tracking-wider text-sky-300 ring-1 ring-sky-400/40">
                <Sparkles size={12} />
                TOP CATEGORY · 旗艦首選
              </span>
              <span className="font-serif text-[16px] font-bold text-white sm:text-[18px]">
                全港 {productCount} 大主流旅遊保險深度對比（{premiumCount} 款公開定價）
              </span>
            </div>
            <p className="mt-1.5 max-w-[46em] text-[13px] leading-relaxed text-sky-100/80">
              海外天價醫療開支、24小時包機運送、手提電話電腦折舊、日本租車自負額、滑雪深潛受保邊界及任何原因取消，逐項官方條款對照。
            </p>
          </div>
        </div>

        {/* 快捷操作按鈕組 */}
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold shadow-sm transition-all",
              showCalculator
                ? "bg-amber-400 text-amber-950 hover:bg-amber-300"
                : "bg-white/15 text-white hover:bg-white/25 ring-1 ring-white/25"
            )}
          >
            <Calculator size={14} />
            <span>單次 vs 全年精算機</span>
            {showCalculator ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("tips-section")}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/20"
          >
            <Lightbulb size={14} className="text-amber-300" />
            <span>6 大避坑指南</span>
          </button>
        </div>
      </div>

      {/* 5 大特色快速標籤 */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-sky-400/20 pt-4 text-[12px]">
        <span className="font-bold text-sky-300">熱門考量：</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-950/60 px-3 py-1 text-sky-100 ring-1 ring-sky-400/30">
          🎿 滑雪・潛水業餘運動
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-950/60 px-3 py-1 text-sky-100 ring-1 ring-sky-400/30">
          🚗 租車自負額 HK$20,000
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-950/60 px-3 py-1 text-sky-100 ring-1 ring-sky-400/30">
          📱 手機電腦被盜專項
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-950/60 px-3 py-1 text-sky-100 ring-1 ring-sky-400/30">
          🤷 任何原因取消 (CFAR)
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-950/60 px-3 py-1 text-sky-100 ring-1 ring-sky-400/30">
          👵 長者小童零折減
        </span>
      </div>

      {/* 展開之互動精算計算機 */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-[12px] border border-sky-400/30 bg-[#07152B]/90 p-5 max-md:p-4">
              <div className="flex items-center gap-2 border-b border-sky-400/20 pb-3">
                <Calculator size={18} className="text-amber-400" />
                <h3 className="font-sans text-[15px] font-bold text-white">
                  單次 vs 全年旅遊保險（Annual Multi-Trip）性價比精算機
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* 題目 1 */}
                <div>
                  <label className="text-[12px] font-bold text-sky-200">
                    1. 預計一年外遊次數？
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setTripsPerYear(n)}
                        className={cn(
                          "rounded-md px-3 py-1 text-[12px] font-bold transition-all",
                          tripsPerYear === n
                            ? "bg-amber-400 text-amber-950"
                            : "bg-sky-900/60 text-sky-100 hover:bg-sky-800/80 ring-1 ring-sky-500/30"
                        )}
                      >
                        {n === 3 ? "3次 (臨界點)" : `${n}次`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 題目 2 */}
                <div>
                  <label className="text-[12px] font-bold text-sky-200">
                    2. 通常去邊度？
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { id: "asia" as const, label: "亞洲短途（日韓泰）" },
                      { id: "longhaul" as const, label: "歐美澳紐長線" },
                      { id: "mixed" as const, label: "長短線混合" },
                      { id: "gba" as const, label: "大灣區快閃" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTripType(t.id)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-[12px] font-bold transition-all",
                          tripType === t.id
                            ? "bg-amber-400 text-amber-950"
                            : "bg-sky-900/60 text-sky-100 hover:bg-sky-800/80 ring-1 ring-sky-500/30"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 題目 3 */}
                <div>
                  <label className="text-[12px] font-bold text-sky-200">
                    3. 投保人數？
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { id: "single" as const, label: "個人" },
                      { id: "couple" as const, label: "夫妻二人" },
                      { id: "family" as const, label: "家庭（連小童）" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTravellerType(m.id)}
                        className={cn(
                          "rounded-md px-3 py-1 text-[12px] font-bold transition-all",
                          travellerType === m.id
                            ? "bg-amber-400 text-amber-950"
                            : "bg-sky-900/60 text-sky-100 hover:bg-sky-800/80 ring-1 ring-sky-500/30"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 精算結論卡片 */}
              <div className="mt-5 rounded-[10px] border border-amber-400/30 bg-gradient-to-r from-amber-500/15 to-sky-500/15 p-4 text-white">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950">
                        精算結果
                      </span>
                      <span className="text-[14px] font-bold text-amber-300">
                        {calculation.isAnnualBetter
                          ? "推薦購買：全年旅遊保險（Annual Multi-Trip Plan）"
                          : "推薦購買：單次旅程保險（Single Trip Plan）"}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-sky-100/90">
                      預估單次購買總支出：
                      <span className="font-mono font-bold text-white">
                        HK${calculation.totalSingleTripCost.toLocaleString()}
                      </span>
                      {" · "}
                      全年計劃年費約：
                      <span className="font-mono font-bold text-white">
                        HK${calculation.annualPlanCost.toLocaleString()}
                      </span>
                      {calculation.difference > 0 && (
                        <span className="ml-1 font-bold text-emerald-400">
                          （買全年慳足約 HK${calculation.savings.toLocaleString()}！）
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 text-right max-sm:text-left">
                    <span className="block text-[11px] text-sky-200">
                      全年保額隨時話走就走，自動受保
                    </span>
                    <span className="mt-0.5 inline-block text-[12px] font-bold text-amber-300">
                      每次出境上限通常達 90 天
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

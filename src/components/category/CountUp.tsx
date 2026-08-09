import { useEffect, useState } from "react";
import { animate } from "framer-motion";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * 數字滾動（Count-Up）：mount 即刻觸發（唔等入視口）。
 * 統計帶多數喺首屏之下，等入視口先郁會令快速捲動嘅用戶見到假嘅「0」；
 * 即刻播嘅話，捲到嗰陣經已係最終值。
 */
export default function CountUp({
  to,
  duration = 1.2,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const controls = animate(0, to, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, duration]);

  return <span className={className}>{val.toLocaleString("en-US")}</span>;
}

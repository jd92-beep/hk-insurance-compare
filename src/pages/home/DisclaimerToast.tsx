import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { Link } from "react-router";

const STORAGE_KEY = "ic-disclaimer-seen";
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];
const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as [number, number, number, number];

/** S0 首訪免責聲明條（localStorage 記錄已讀；可收埋成細 pill，唔遮內容） */
export default function DisclaimerToast() {
  const [show, setShow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        timer = window.setTimeout(() => setShow(true), 1600);
      }
    } catch {
      timer = window.setTimeout(() => setShow(true), 1600);
    }
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode — non-fatal */
    }
    setShow(false);
  };

  return (
    <>
      {/* 文件流預留空間：toast 展開時 footer/內容區唔會被固定底條遮蓋 */}
      {show && !collapsed && <div aria-hidden="true" className="h-[118px] md:h-[76px]" />}
      <AnimatePresence mode="wait">
        {show && !collapsed && (
          <motion.div
            key="disclaimer-toast"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0, transition: { duration: 0.35, ease: EASE_IN_OUT_QUART } }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            className="pointer-events-none fixed bottom-3 left-0 right-0 z-[65] flex justify-center px-3 md:bottom-5 md:px-6"
            role="alert"
          >
            <div className="pointer-events-auto flex w-full max-w-[760px] items-center gap-3 rounded-[14px] bg-ink p-3.5 pl-4 text-paper shadow-lift">
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <TriangleAlert size={17} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
                <p className="text-[13px] leading-[1.65]">
                  本網站資料僅供參考，所有保障、保費及條款以保險公司官方文件為準。
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <Link
                  to="/about#disclaimer"
                  onClick={dismiss}
                  className="hidden text-[13px] text-paper/80 underline underline-offset-4 transition-colors hover:text-paper min-[480px]:inline"
                >
                  完整免責聲明
                </Link>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-[10px] bg-red px-4 py-1.5 text-[13px] font-bold text-paper transition-colors hover:bg-red-deep"
                >
                  明白
                </button>
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="rounded-full p-1.5 text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper"
                  aria-label="收埋免責聲明"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {show && collapsed && (
          <motion.button
            key="disclaimer-pill"
            type="button"
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            onClick={() => setCollapsed(false)}
            className="fixed bottom-3 right-3 z-[65] inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[12px] font-bold text-paper shadow-lift transition-colors hover:bg-ink-soft md:bottom-5 md:right-5"
            aria-label="展開免責聲明"
          >
            <TriangleAlert size={13} className="text-amber" aria-hidden="true" />
            免責聲明
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

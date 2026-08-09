import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { Link } from "react-router";

const STORAGE_KEY = "ic-disclaimer-seen";
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];
const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as [number, number, number, number];

/** S0 首訪免責聲明條（localStorage 記錄已讀） */
export default function DisclaimerToast() {
  const [show, setShow] = useState(false);

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
    <AnimatePresence>
      {show && (
        <motion.div
          key="disclaimer-toast"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0, transition: { duration: 0.35, ease: EASE_IN_OUT_QUART } }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="pointer-events-none fixed bottom-0 left-0 right-0 z-[65] flex justify-center md:bottom-6 md:px-6"
          role="alert"
        >
          <div className="pointer-events-auto flex w-full flex-col gap-3 bg-ink p-5 text-paper shadow-lift md:w-full md:max-w-[960px] md:flex-row md:items-center md:gap-4 md:rounded-[14px]">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <TriangleAlert size={20} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
              <p className="text-[14px] leading-[1.7]">
                本網站資料僅供參考，所有保障、保費及條款以保險公司官方文件為準。
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={dismiss}
                className="rounded-[10px] bg-red px-6 py-2.5 text-[14px] font-bold text-paper transition-colors hover:bg-red-deep"
              >
                明白
              </button>
              <Link
                to="/about#disclaimer"
                onClick={dismiss}
                className="text-[14px] text-paper/80 underline underline-offset-4 transition-colors hover:text-paper"
              >
                完整免責聲明 →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { Scale, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useCompare, COMPARE_LIMIT } from "@/providers/CompareProvider";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";
import { categoryColor } from "@/lib/categories";

/**
 * 比較托盤（§7.7）：加入 ≥1 產品後底部中央浮出膠囊條。
 * 跨頁持久（localStorage + CompareProvider）。
 */
export default function CompareTray() {
  const { items, remove, clear } = useCompare();
  const { data } = useInsuranceData();
  const navigate = useNavigate();
  const location = useLocation();

  const visible = items.length > 0 && location.pathname !== "/compare";
  const products = items
    .map((id) => data?.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="compare-tray"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-40px)] max-w-[720px] -translate-x-1/2"
          style={{ x: "-50%" }}
        >
          <div className="flex items-center gap-3 rounded-full bg-ink py-2.5 pl-5 pr-2.5 text-paper shadow-lift">
            <Scale size={16} className="shrink-0 text-paper/70" aria-hidden="true" />
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
              <AnimatePresence initial={false} mode="popLayout">
                {products.map((p) => (
                  <motion.span
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 28, scale: 0.7 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-small"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: categoryColor(p.category) }}
                    />
                    <span className="max-w-[120px] truncate">
                      {p.insurer_zh} {p.product_name_zh || p.product_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="text-paper/60 transition-colors hover:text-paper"
                      aria-label={`移除 ${p.product_name_zh || p.product_name}`}
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() => navigate("/compare")}
              className="shrink-0 rounded-full bg-red px-5 py-2 text-small font-bold text-paper transition-colors hover:bg-red-deep"
            >
              開始比較（
              <motion.span
                key={items.length}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 16 }}
                className="inline-block"
              >
                {items.length}
              </motion.span>
              /{COMPARE_LIMIT}）
            </button>
            <button
              type="button"
              onClick={clear}
              className="shrink-0 rounded-full p-2 text-paper/60 transition-colors hover:text-paper"
              aria-label="清空比較"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { FAQS } from "@/components/guides/guides-data";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];
const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as [number, number, number, number];

/**
 * 常見問題手風琴（guides.md S4）：單開模式，
 * 展開 0.35s easeInOutQuart，「+」旋轉 45° 變「×」。
 */
export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="mx-auto max-w-[820px]"
        >
          <p className="eyebrow text-ink-faint">FAQ · 常見問題</p>
          <h2 className="display-2 mt-4 text-ink">仲有嘢想問？</h2>
        </motion.div>

        <div className="mx-auto mt-10 max-w-[820px]">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: EASE_OUT_EXPO }}
                className="border-b"
                style={{ borderColor: "var(--line)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span
                    className={cn(
                      "font-sans text-[18px] font-bold transition-colors duration-300",
                      isOpen ? "text-red" : "text-ink",
                    )}
                  >
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                      isOpen ? "border-red text-red" : "text-ink-soft",
                    )}
                    style={isOpen ? undefined : { borderColor: "var(--line-strong)" }}
                    aria-hidden="true"
                  >
                    <Plus
                      size={16}
                      className={cn(
                        "transition-transform duration-300",
                        isOpen && "rotate-45",
                      )}
                    />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE_IN_OUT_QUART }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[38em] pb-6 text-ink-soft">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

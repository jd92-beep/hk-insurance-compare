import { useEffect } from "react";
import { useLocation, useOutlet } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareTray from "@/components/CompareTray";
import SearchPalette from "@/components/SearchPalette";
import { useCompare } from "@/providers/CompareProvider";
import { destroyLenis, getLenis, initLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

/** 頂部滾動進度條（幼紅線） */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-red"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

/**
 * 全站 Layout（nested-route pattern：呢度 render 當前頁面 outlet，
 * App.tsx 必須用 nested <Route> 配合）。
 * Navbar 係 sticky top-0 普通文檔流，頁面唔使留頂部空位。
 */
export default function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const { items } = useCompare();
  // CompareTray 係 fixed 底欄：出現時頁底要預留空間，避免遮 Footer／頁尾內容
  // （tray 高 ~60px + bottom-6 浮位；同 DisclaimerToast 嘅 spacer 做法統一）
  const trayVisible = items.length > 0 && location.pathname !== "/compare";

  // Lenis 平滑滾動（全站）
  useEffect(() => {
    const lenis = initLenis();
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
    }
    return () => {
      destroyLenis();
    };
  }, []);

  // 換頁滾回頂部
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    // 等頁面渲染＋進場動畫完成後重新計算 ScrollTrigger 位置
    const t1 = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    const t2 = window.setTimeout(() => ScrollTrigger.refresh(), 650);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-[100dvh] flex-col">
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.22, ease: [0.76, 0, 0.24, 1] } }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        {trayVisible && <div aria-hidden="true" className="h-[104px]" />}
        <CompareTray />
        <SearchPalette />
      </div>
    </MotionConfig>
  );
}

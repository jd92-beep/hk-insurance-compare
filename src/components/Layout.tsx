import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";
import { Suspense, useEffect } from "react";
import { useLocation, useOutlet } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareTray from "@/components/CompareTray";
import SearchPalette from "@/components/SearchPalette";
import { useCompare } from "@/providers/CompareProvider";
import { destroyLenis, getLenis, initLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return <motion.div className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-red" style={{ scaleX }} aria-hidden="true" />;
}
export default function Layout() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const { data, error, retry } = useInsuranceData();
  const outlet = useOutlet();
  const { items } = useCompare();
  const trayVisible = items.length > 0 && location.pathname !== "/compare";
  useEffect(() => {
    if (reduced) return;
    const lenis = initLenis();
    lenis?.on("scroll", ScrollTrigger.update);
    return () => { destroyLenis(); };
  }, [reduced]);
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const t1 = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    const t2 = window.setTimeout(() => ScrollTrigger.refresh(), 650);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [location.pathname]);
  useEffect(() => {
    const path = location.pathname;
    const title = path.startsWith("/product/") ? data?.products.find(p => p.id === path.split("/")[2])?.product_name_zh
      : path.startsWith("/category/") ? data?.categories.find(c => c.id === path.split("/")[2])?.name_zh
      : ({ "/": "香港保險比較", "/categories": "保險類別", "/compare": "並排比較", "/documents": "PDF 中心", "/data-quality": "資料核查", "/insurers": "保險公司", "/guides": "投保指南", "/vhis": "自願醫保", "/about": "關於本站" } as Record<string,string>)[path];
    document.title = `${title || "保險資料"}｜保險格價站`;
    document.documentElement.lang = "zh-Hant-HK";
  }, [location.pathname, data]);
  return <MotionConfig reducedMotion="user"><div className="flex min-h-[100dvh] flex-col">
    <ScrollProgress />
    <a href="#main-content" className="sr-only z-[100] bg-paper p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">跳到主要內容</a>
    <Navbar />
    {error && <div role="alert" className="site-container flex flex-wrap items-center gap-3 border-b border-amber py-3 text-sm"><span>{error}</span><button className="btn-ghost min-h-11" onClick={retry}>重新載入資料</button></div>}
    <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12, transition: { duration: 0.22, ease: [0.76, 0, 0.24, 1] } }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <PageErrorBoundary key={location.pathname}><Suspense fallback={<div role="status" className="site-container min-h-[50vh] py-20">正在載入頁面…</div>}>{outlet}</Suspense></PageErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </main>
    <Footer />{trayVisible && <div aria-hidden="true" className="h-[104px]" />}<CompareTray /><SearchPalette />
  </div></MotionConfig>;
}

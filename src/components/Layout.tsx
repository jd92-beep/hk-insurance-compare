import { useReducedMotion } from "@/hooks/use-reduced-motion";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";
import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareTray from "@/components/CompareTray";
import RoutePrefetch from "@/components/RoutePrefetch";
import { useCompare } from "@/providers/CompareProvider";
import { PageBackdrop, RouteCurtain } from "@/components/fx/RouteFX";
import { pageMotion } from "@/lib/route-theme";

/** Search UI is idle-loaded; Cmd+K handler lives in SearchProvider. */
const SearchPalette = lazy(() => import("@/components/SearchPalette"));

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const left = useTransform(scaleX, (v) => `calc(${v * 100}% - 9px)`);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px]" aria-hidden="true">
      <motion.div className="h-full origin-left" style={{ scaleX, background: "linear-gradient(90deg, #F2A71B, #E4573D)" }} />
      <motion.span className="absolute -top-[7px] block h-[18px] w-[18px] rounded-full" style={{ left, background: "radial-gradient(circle, #FFD36B 40%, rgba(255,211,107,0) 72%)" }} />
    </div>
  );
}

type IdleHandle = number;
function scheduleIdle(cb: () => void): IdleHandle {
  if (typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(() => cb(), { timeout: 1200 });
  }
  return window.setTimeout(cb, 200) as unknown as IdleHandle;
}
function cancelIdle(handle: IdleHandle): void {
  if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(handle);
  else window.clearTimeout(handle);
}

/** Refresh GSAP ScrollTrigger only after the motion stack is present. */
function refreshScrollTrigger(): void {
  void import("gsap/ScrollTrigger")
    .then(({ ScrollTrigger }) => ScrollTrigger.refresh())
    .catch(() => undefined);
}

export default function Layout() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const { data, error, retry } = useInsuranceData();
  const outlet = useOutlet();
  const { items } = useCompare();
  const [paletteReady, setPaletteReady] = useState(false);
  // Curtain plays on pathname change only (not on first paint / query-string updates)
  const [curtainPath, setCurtainPath] = useState<string | null>(null);
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setCurtainPath(location.pathname);
  }
  useEffect(() => {
    if (!curtainPath) return;
    const t = window.setTimeout(() => setCurtainPath(null), 1150);
    return () => window.clearTimeout(t);
  }, [curtainPath]);
  const trayVisible = items.length > 0 && location.pathname !== "/compare";

  useEffect(() => {
    if (reduced) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const idle = scheduleIdle(() => {
      void (async () => {
        const [gsapMod, scrollMod, lenisMod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("@/lib/lenis"),
        ]);
        if (disposed) return;
        const gsap = gsapMod.default;
        const { ScrollTrigger } = scrollMod;
        gsap.registerPlugin(ScrollTrigger);
        const lenis = lenisMod.initLenis();
        lenis?.on("scroll", ScrollTrigger.update);
        cleanup = () => {
          lenisMod.destroyLenis();
        };
      })();
    });
    return () => {
      disposed = true;
      cancelIdle(idle);
      cleanup?.();
    };
  }, [reduced]);

  useEffect(() => {
    const idle = scheduleIdle(() => setPaletteReady(true));
    return () => cancelIdle(idle);
  }, []);

  useEffect(() => {
    // Prefer Lenis when already initialised; otherwise native scroll is enough for shell show-up.
    void import("@/lib/lenis")
      .then(({ getLenis }) => {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
      })
      .catch(() => window.scrollTo(0, 0));
    const t1 = window.setTimeout(refreshScrollTrigger, 120);
    const t2 = window.setTimeout(refreshScrollTrigger, 650);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [location.pathname]);

  useEffect(() => {
    const path = location.pathname;
    const title = path.startsWith("/product/") ? data?.products.find(p => p.id === path.split("/")[2])?.product_name_zh
      : path.startsWith("/category/") ? data?.categories.find(c => c.id === path.split("/")[2])?.name_zh
      : path.startsWith("/insurers/") ? (() => {
          let key = path.slice("/insurers/".length);
          try { key = decodeURIComponent(key); } catch { /* keep raw */ }
          return data?.products.find(p => p.insurer === key)?.insurer_zh ?? key;
        })()
      : ({ "/": "香港保險比較", "/categories": "保險類別", "/compare": "並排比較", "/documents": "PDF 中心", "/data-quality": "資料核查", "/insurers": "保險公司", "/guides": "投保指南", "/vhis": "自願醫保", "/about": "關於本站" } as Record<string,string>)[path];
    document.title = `${title || "保險資料"}｜保險明選`;
    document.documentElement.lang = "zh-Hant-HK";
  }, [location.pathname, data]);

  return <MotionConfig reducedMotion={reduced ? "always" : "never"}><div className="flex min-h-[100dvh] flex-col">
    <ScrollProgress />
    <a href="#main-content" className="sr-only z-[100] rounded-full bg-paper p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">跳到主要內容</a>
    <Navbar />
    {error && <div role="alert" className="site-container flex flex-wrap items-center gap-3 border-b border-amber py-3 text-sm"><span>{error}</span><button className="btn-ghost min-h-11" onClick={retry}>重新載入資料</button></div>}
    <main id="main-content" tabIndex={-1} className="relative min-w-0 flex-1 outline-none">
      <PageBackdrop pathname={location.pathname} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} className="relative z-[1]" {...pageMotion(location.pathname)} style={{ transformOrigin: "50% 0%" }}>
          <PageErrorBoundary key={location.pathname}><Suspense fallback={<div role="status" className="site-container min-h-[50vh] py-20">正在載入頁面…</div>}>{outlet}</Suspense></PageErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </main>
    <Footer />{trayVisible && <div aria-hidden="true" className="h-[104px]" />}<CompareTray />
    {paletteReady && (
      <Suspense fallback={null}>
        <SearchPalette />
      </Suspense>
    )}
    <RoutePrefetch />
    <AnimatePresence>{curtainPath && <RouteCurtain key={curtainPath} pathname={curtainPath} />}</AnimatePresence>
  </div></MotionConfig>;
}

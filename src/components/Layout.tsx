import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareTray from "@/components/CompareTray";
import SearchPalette from "@/components/SearchPalette";
import { destroyLenis, getLenis, initLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * 全站 Layout（nested-route pattern：呢度 render <Outlet/>，
 * App.tsx 必須用 nested <Route> 配合）。
 * Navbar 係 sticky top-0 普通文檔流，頁面唔使留頂部空位。
 */
export default function Layout() {
  const location = useLocation();

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
    // 等頁面渲染後重新計算 ScrollTrigger 位置
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CompareTray />
      <SearchPalette />
    </div>
  );
}

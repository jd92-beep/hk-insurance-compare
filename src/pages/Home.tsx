import { lazy, Suspense } from "react";
import Hero from "@/pages/home/Hero";

/** Below-fold home sections stay out of the critical hero chunk. */
const InsurerMarquee = lazy(() => import("@/pages/home/InsurerMarquee"));
const CategoryGrid = lazy(() => import("@/pages/home/CategoryGrid"));
const MethodStory = lazy(() => import("@/pages/home/MethodStory"));
const Promises = lazy(() => import("@/pages/home/Promises"));
const GuidesTeaser = lazy(() => import("@/pages/home/GuidesTeaser"));
const FinalCTA = lazy(() => import("@/pages/home/FinalCTA"));
const DisclaimerToast = lazy(() => import("@/pages/home/DisclaimerToast"));
const FeaturedCompare = lazy(() => import("@/pages/home/FeaturedCompare"));
const VhisSchemeFacts = lazy(() => import("@/components/vhis/VhisSchemeFacts"));
const FamilyResearchPanel = lazy(() => import("@/components/research/FamilyResearchPanel"));

/** 首頁 `/`（design/home.md S0–S8）— critical path = Hero shell only */
export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="site-container py-8 text-sm text-ink-faint">載入中…</div>}>
        <InsurerMarquee />
      </Suspense>
      <Suspense fallback={<div className="site-container py-10 text-sm text-ink-faint">載入中…</div>}>
        <CategoryGrid />
      </Suspense>
      <Suspense fallback={<div className="site-container py-10 text-sm text-ink-faint">載入中…</div>}>
        <MethodStory />
      </Suspense>
      <Suspense fallback={<div className="site-container py-10 text-sm text-ink-faint">載入中…</div>}>
        <FeaturedCompare />
      </Suspense>
      <Suspense fallback={<div className="site-container py-10 text-sm text-ink-faint">載入中…</div>}>
        <Promises />
      </Suspense>
      <Suspense fallback={<div className="site-container py-8 text-sm text-ink-faint">載入中…</div>}>
        <div className="site-container pb-10">
          <VhisSchemeFacts />
        </div>
      </Suspense>
      <Suspense fallback={<div className="site-container py-8 text-sm text-ink-faint">載入中…</div>}>
        <div className="site-container pb-12">
          <FamilyResearchPanel />
        </div>
      </Suspense>
      <Suspense fallback={<div className="site-container py-10 text-sm text-ink-faint">載入中…</div>}>
        <GuidesTeaser />
      </Suspense>
      <Suspense fallback={<div className="site-container py-10 text-sm text-ink-faint">載入中…</div>}>
        <FinalCTA />
      </Suspense>
      <Suspense fallback={null}>
        <DisclaimerToast />
      </Suspense>
    </>
  );
}

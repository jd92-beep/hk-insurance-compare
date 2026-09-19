import { lazy, Suspense } from "react";
import Hero from "@/pages/home/Hero";
import InsurerMarquee from "@/pages/home/InsurerMarquee";
import CategoryGrid from "@/pages/home/CategoryGrid";
import MethodStory from "@/pages/home/MethodStory";
import Promises from "@/pages/home/Promises";
import GuidesTeaser from "@/pages/home/GuidesTeaser";
import FinalCTA from "@/pages/home/FinalCTA";
import DisclaimerToast from "@/pages/home/DisclaimerToast";

const FeaturedCompare = lazy(() => import("@/pages/home/FeaturedCompare"));
const VhisSchemeFacts = lazy(() => import("@/components/vhis/VhisSchemeFacts"));
const FamilyResearchPanel = lazy(() => import("@/components/research/FamilyResearchPanel"));

/** 首頁 `/`（design/home.md S0–S8） */
export default function Home() {
  return (
    <>
      <Hero />
      <InsurerMarquee />
      <CategoryGrid />
      <MethodStory />
      <Suspense fallback={<div className="site-container py-10 text-sm text-ink-faint">載入示範比較…</div>}>
        <FeaturedCompare />
      </Suspense>
      <Promises />
      <Suspense fallback={<div className="site-container py-8 text-sm text-ink-faint">載入制度重點…</div>}>
        <div className="site-container pb-10">
          <VhisSchemeFacts />
        </div>
      </Suspense>
      <Suspense fallback={<div className="site-container py-8 text-sm text-ink-faint">載入家庭研究清單…</div>}>
        <div className="site-container pb-12">
          <FamilyResearchPanel />
        </div>
      </Suspense>
      <GuidesTeaser />
      <FinalCTA />
      <DisclaimerToast />
    </>
  );
}

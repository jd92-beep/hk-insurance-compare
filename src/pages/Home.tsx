import Hero from "@/pages/home/Hero";
import InsurerMarquee from "@/pages/home/InsurerMarquee";
import CategoryGrid from "@/pages/home/CategoryGrid";
import MethodStory from "@/pages/home/MethodStory";
import FeaturedCompare from "@/pages/home/FeaturedCompare";
import Promises from "@/pages/home/Promises";
import GuidesTeaser from "@/pages/home/GuidesTeaser";
import FinalCTA from "@/pages/home/FinalCTA";
import DisclaimerToast from "@/pages/home/DisclaimerToast";

/** 首頁 `/`（design/home.md S0–S8） */
export default function Home() {
  return (
    <>
      <Hero />
      <InsurerMarquee />
      <CategoryGrid />
      <MethodStory />
      <FeaturedCompare />
      <Promises />
      <GuidesTeaser />
      <FinalCTA />
      <DisclaimerToast />
    </>
  );
}

import { Link } from "react-router";
import { useCategories, useInsuranceData, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";
import { FULL_VERSION_STRING } from "@/lib/version";

/**
 * 全站免責聲明橫帶（§7.2）：Footer 上方常駐。
 */
export function DisclaimerBand() {
  return (
    <div className="site-container py-6">
      <div className="relative flex gap-3 rounded-[4px_4px_20px_4px] bg-amber-wash px-5 py-4 text-small text-ink-soft shadow-card" style={{ rotate: "-0.4deg", backgroundImage: "url(/textures/paper-fiber.svg)", backgroundBlendMode: "multiply" }}>
        <span aria-hidden="true">☀</span>
        <p>
          本網站資料僅供參考，所有保障內容、保費及條款以保險公司官方文件為準。投保前請向持牌保險中介人或保險公司查詢。
        </p>
      </div>
    </div>
  );
}

/** 頁尾上方嘅保險公司跑馬燈（淡色版） */
function FooterMarquee() {
  const insurers = useInsurers();
  if (insurers.length === 0) return null;
  const row = [...insurers, ...insurers];
  return (
    <div className="py-3 marquee-mask" aria-hidden="true">
      <div className="marquee-track overflow-hidden">
        <div className="animate-marquee flex w-max items-center whitespace-nowrap">
          {row.map((ins, i) => (
            <span key={`${ins.name}-${i}`} className="inline-flex items-center gap-6 pr-6 text-[13px] text-ink-faint">
              <span>
                <span className="font-grotesk font-medium">{ins.name}</span>
                <span className="ml-1.5 font-sans">{ins.name_zh}</span>
              </span>
              <span className="text-amber/70">✿</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 全站 Footer（§7.2）：墨藍底 + 頂部 4px 紅邊 + 四欄 + 免責聲明底條。
 * Footer 上方有 DisclaimerBand + 跑馬燈。
 */
export default function Footer() {
  const categories = useCategories();
  const { generatedAt } = useInsuranceData();
  const insurers = useInsurers();
  const products = useProducts();

  return (
    <footer className="relative">
      <DisclaimerBand />
      <FooterMarquee />
      {/* dusk hills rise out of the page into the night footer */}
      <div className="relative -mb-px h-24 md:h-32" aria-hidden="true">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M0 90 C 200 40 380 110 600 70 C 820 30 1000 100 1220 60 C 1320 44 1400 60 1440 56 L1440 160 L0 160Z" fill="#4A4470" />
          <path d="M0 120 C 240 80 460 140 720 104 C 980 70 1200 130 1440 100 L1440 160 L0 160Z" fill="#2E2A45" />
          <path d="M0 120 C 240 80 460 140 720 104 C 980 70 1200 130 1440 100" fill="none" stroke="#FFD36B" strokeOpacity=".35" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="relative overflow-hidden bg-ink text-paper" style={{ backgroundImage: "radial-gradient(600px 300px at 85% 0%, rgba(255,211,107,.12), transparent 70%)" }}>
        {/* moon + fireflies */}
        <div className="pointer-events-none absolute right-[8%] top-8 h-16 w-16 rounded-full bg-[#FFE7A8] shadow-[0_0_60px_20px_rgba(255,231,168,.25)]" aria-hidden="true">
          <span className="absolute -right-5 -top-3 h-16 w-16 rounded-full bg-ink" />
        </div>
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute h-1.5 w-1.5 animate-pulse rounded-full bg-[#FFD36B] shadow-[0_0_10px_3px_rgba(255,211,107,.6)]"
            style={{ left: `${(i * 53) % 97}%`, top: `${(i * 37) % 90}%`, animationDelay: `${(i % 5) * 0.5}s`, animationDuration: `${2 + (i % 3)}s` }}
          />
        ))}
        <div className="site-container relative grid grid-cols-1 gap-10 py-16 fold:grid-cols-2 lg:grid-cols-4">
          {/* ① 品牌 */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper">
                <img src="/brand/logo-mark-sm.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
              </span>
              <span className="font-serif text-[18px] font-bold">保險格價站</span>
            </Link>
            <p className="font-serif text-[15px] font-bold text-paper/90">逐份官方文件幫你睇</p>
            <p className="font-hand text-[24px] font-bold text-amber">compare smarter, insure brighter</p>
          </div>

          {/* ② 保險類別 */}
          <div>
            <p className="eyebrow mb-4 text-amber/80">保險類別</p>
            <ul className="flex flex-col gap-2 text-[14px]">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.id}`} className="link-sweep text-paper/75 transition-colors hover:text-paper">
                    {c.name_zh}
                    <span className="ml-2 font-grotesk text-[11px] text-paper/40">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ③ 網站 */}
          <div>
            <p className="eyebrow mb-4 text-amber/80">網站</p>
            <ul className="flex flex-col gap-2 text-[14px]">
              <li><Link to="/categories" className="link-sweep text-paper/75 transition-colors hover:text-paper">全部類別</Link></li>
              <li><Link to="/compare" className="link-sweep text-paper/75 transition-colors hover:text-paper">比較工具</Link></li>
              <li><Link to="/insurers" className="link-sweep text-paper/75 transition-colors hover:text-paper">保險公司名錄</Link></li>
              <li><Link to="/guides" className="link-sweep text-paper/75 transition-colors hover:text-paper">投保指南・詞彙</Link></li>
              <li><Link to="/documents" className="link-sweep text-paper/75">PDF 中心</Link></li>
              <li><Link to="/data-quality" className="link-sweep text-paper/75">資料核查清單</Link></li>
              <li><Link to="/about" className="link-sweep text-paper/75 transition-colors hover:text-paper">關於數據</Link></li>
            </ul>
          </div>

          {/* ④ 數據聲明 */}
          <div>
            <p className="eyebrow mb-4 text-amber/80">數據聲明</p>
            <ul className="flex flex-col gap-2 text-[14px] text-paper/75">
              <li>資料快照日期：<span className="font-grotesk text-paper">{generatedAt}</span></li>
              <li>系統版本：<span className="font-mono text-paper font-semibold">{FULL_VERSION_STRING}</span></li>
              <li><span className="font-grotesk text-paper">{insurers.length}</span> 間保險公司</li>
              <li><span className="font-grotesk text-paper">{products.length}</span> 份產品檔案</li>
              <li>有來源的資料附核對入口；完整性與時效詳見核查清單</li>
            </ul>
          </div>
        </div>

        {/* 底部橫條 */}
        <div className="border-t border-paper/15">
          <div className="site-container flex flex-col gap-2 py-5 text-small text-paper/50 md:flex-row md:items-center md:justify-between">
            <p>
              本網站資料僅供參考，唔構成任何投保建議；保障、保費及條款以保險公司官方文件為準。
            </p>
            <Link to="/about#disclaimer" className="shrink-0 font-medium text-paper/75 underline-offset-4 transition-colors hover:text-paper hover:underline">
              完整免責聲明 →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

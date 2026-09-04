import { Link } from "react-router";
import { useCategories, useInsuranceData, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";
import { FULL_VERSION_STRING } from "@/lib/version";
import StampBadge from "@/components/StampBadge";
import { StampSealIcon } from "@/components/StampSealIcon";

/**
 * 全站免責聲明橫帶（§7.2）：Footer 上方常駐。
 */
export function DisclaimerBand() {
  return (
    <div className="bg-amber-wash">
      <div className="site-container flex gap-3 border-l-4 border-amber py-4 text-small text-ink-soft">
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
    <div className="border-t hairline-t bg-paper-2 py-5 marquee-mask" aria-hidden="true">
      <div className="marquee-track overflow-hidden">
        <div className="animate-marquee flex w-max items-center whitespace-nowrap">
          {row.map((ins, i) => (
            <span key={`${ins.name}-${i}`} className="inline-flex items-center gap-6 pr-6 text-[13px] text-ink-faint">
              <span>
                <span className="font-grotesk font-medium">{ins.name}</span>
                <span className="ml-1.5 font-sans">{ins.name_zh}</span>
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-red/50" />
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
    <footer>
      <DisclaimerBand />
      <FooterMarquee />
      <div className="relative overflow-hidden border-t-4 border-red bg-ink text-paper">
        {/* 低透明度水印印章慢旋（填補深色區塊空白） */}
        <div className="pointer-events-none absolute -bottom-40 -right-24" aria-hidden="true">
          <StampSealIcon size={480} className="animate-spin-slow text-paper opacity-[.06]" />
        </div>
        <div className="site-container relative grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* ① 品牌 */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-paper">
                <img src="/logo-mark.svg" alt="" width={22} height={22} />
              </span>
              <span className="font-serif text-[18px] font-bold">保險格價站</span>
            </Link>
            <p className="font-serif text-[15px] font-bold text-paper/90">逐份官方文件幫你睇</p>
            <StampBadge variant="red" size={56} className="text-red" />
          </div>

          {/* ② 保險類別 */}
          <div>
            <p className="eyebrow mb-4 text-paper/50">保險類別</p>
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
            <p className="eyebrow mb-4 text-paper/50">網站</p>
            <ul className="flex flex-col gap-2 text-[14px]">
              <li><Link to="/categories" className="link-sweep text-paper/75 transition-colors hover:text-paper">全部類別</Link></li>
              <li><Link to="/compare" className="link-sweep text-paper/75 transition-colors hover:text-paper">比較工具</Link></li>
              <li><Link to="/insurers" className="link-sweep text-paper/75 transition-colors hover:text-paper">保險公司名錄</Link></li>
              <li><Link to="/guides" className="link-sweep text-paper/75 transition-colors hover:text-paper">投保指南・詞彙</Link></li>
              <li><Link to="/about" className="link-sweep text-paper/75 transition-colors hover:text-paper">關於數據</Link></li>
            </ul>
          </div>

          {/* ④ 數據聲明 */}
          <div>
            <p className="eyebrow mb-4 text-paper/50">數據聲明</p>
            <ul className="flex flex-col gap-2 text-[14px] text-paper/75">
              <li>資料快照日期：<span className="font-grotesk text-paper">{generatedAt}</span></li>
              <li>系統版本：<span className="font-mono text-paper font-semibold">{FULL_VERSION_STRING}</span></li>
              <li><span className="font-grotesk text-paper">{insurers.length}</span> 間保險公司</li>
              <li><span className="font-grotesk text-paper">{products.length}</span> 份產品檔案</li>
              <li>全部摘自官方網站及文件，附來源連結</li>
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

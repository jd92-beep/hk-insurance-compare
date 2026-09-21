import { priceDisplay } from "@/lib/premium-display";
import { MOTION } from "@/lib/motion-runtime";
import {
  CROSS_CATEGORY_COMPARE_NOTICE,
  MULTI_TIER_COMPARE_NOTICE,
  hasMultiplePlanTiers,
  spansMultipleCategories,
} from "@/lib/evidence-status";
import ComparisonExportButton from "@/components/compare/ComparisonExportButton";
import SavedComparisons from "@/components/compare/SavedComparisons";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ExternalLink, Plus, RotateCcw, X } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import type { Product } from "@/types/insurance";
import Breadcrumbs from "@/components/Breadcrumbs";
import EvidenceChip from "@/components/EvidenceChip";
import StampBadge from "@/components/StampBadge";
import ComparisonGrid from "@/components/compare/ComparisonGrid";
import MobileCompare from "@/components/compare/MobileCompare";
import ProductPicker from "@/components/compare/ProductPicker";
import CompareShareButton from "@/components/compare/CompareShareButton";
import { PremiumStatusCell } from "@/components/compare/cells";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";
import { useCompare, COMPARE_LIMIT } from "@/providers/CompareProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { CATEGORY_META, categoryColor } from "@/lib/categories";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** 「試睇」示範：旅遊資料操作示範，唔係推薦或人氣排名 */
const DEMO_IDS = ["travel-axa", "travel-msig", "travel-zurich"];

/** 詞級標題進場（design：h1 詞級 SplitText 0.7s） */
function SplitWords({ words, className }: { words: string[]; className?: string }) {
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={word}
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: EASE_OUT_EXPO }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

/** 已填產品欄（S2）：類別色頂條 + 公司 + 產品名 + 來源欄位 chip + 保費狀態 + 官方核對 + × 移除 */
function FilledSlot({
  product,
  generatedAt,
  onRemove,
}: {
  product: Product;
  generatedAt?: string;
  onRemove: () => void;
}) {
  const color = categoryColor(product.category);
  const icon = CATEGORY_META[product.category]?.icon;
  const pricing = priceDisplay(product);
  const buyUrl = pricing.buyUrl;

  return (
    <motion.div
      layout="position"
      initial={{ scale: MOTION.enterScale, opacity: 0, rotate: -2 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ x: MOTION.exitX, opacity: 0, scale: 0.88 }}
      transition={MOTION.springy}
      className="relative min-w-0 border-x border-b bg-paper"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-2 text-small">
            <span
              className="cat-icon h-5 w-5 shrink-0"
              style={{
                color,
                WebkitMaskImage: `url(${icon ?? "/cat-home.svg"})`,
                maskImage: `url(${icon ?? "/cat-home.svg"})`,
              }}
              aria-hidden="true"
            />
            <span className="truncate">
              <span className="font-grotesk font-bold text-ink">{product.insurer}</span>
              <span className="ml-1.5 font-medium text-ink-soft">{product.insurer_zh}</span>
            </span>
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-11 w-11 items-center justify-center shrink-0 rounded-full p-1 text-ink-faint transition-colors hover:bg-red-wash hover:text-red"
            aria-label={`移除 ${product.product_name_zh || product.product_name}`}
          >
            <X size={15} />
          </button>
        </div>
        <Link
          to={`/product/${product.id}`}
          className="text-base font-medium leading-[1.5] text-ink transition-colors hover:text-red"
        >
          {product.product_name_zh || product.product_name}
        </Link>

        <EvidenceChip product={product} generatedAt={generatedAt} className="pt-0.5" />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <PremiumStatusCell product={product} />
          {buyUrl && (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-[8px] bg-red px-2.5 py-1 text-sm font-bold min-h-11 text-paper transition-all hover:bg-red/90 shadow-xs active:scale-95"
              title="前往保險公司核對條款及報價"
            >
              <span>{pricing.buyLabel ?? "官網報價"}</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** 空槽位（S2）：虛線框 +「+ 加入產品」 */
function EmptySlot({ onPick }: { onPick: () => void }) {
  return (
    <div className="border-x border-b p-3" style={{ borderColor: "var(--line)" }}>
      <button
        type="button"
        onClick={onPick}
        className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed px-4 py-5 text-ink-faint transition-colors hover:border-red hover:text-red"
        style={{ borderColor: "var(--line-strong)" }}
      >
        <Plus size={20} />
        <span className="text-small font-bold">加入產品</span>
        <span className="text-[12px]">最多 {COMPARE_LIMIT} 份並排對照</span>
      </button>
    </div>
  );
}

/** S0 空狀態 */
function EmptyStateView({ onDemo }: { onDemo: () => void }) {
  return (
    <div className="site-container flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <StampBadge variant="gray" size={96} className="opacity-40" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: EASE_OUT_EXPO }}
      >
        <h1 className="display-2 text-ink">仲未揀產品</h1>
        <p className="mx-auto mt-3 max-w-[34em] text-ink-soft">
          喺類別頁撳「+ 加入比較」，最多 3 份並排對照。
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16, ease: EASE_OUT_EXPO }}
        className="flex flex-col items-center gap-4"
      >
        <Link to="/categories" className="btn-primary">
          瀏覽所有保險類別
          <ArrowRight size={17} />
        </Link>
        <button
          type="button"
          onClick={onDemo}
          className="chip border bg-paper text-ink-soft transition-colors hover:border-red hover:text-red"
          style={{ borderColor: "var(--line-strong)" }}
        >
          試用比較：AXA · MSIG · Zurich（操作示範，唔係推薦）
        </button>
      </motion.div>
    </div>
  );
}

/** 比較工具 `/compare`（design/compare.md S0–S5） */
export default function Compare() {
  const { data, loading, error, generatedAt } = useInsuranceData();
  const compare = useCompare();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);
  const initialized = useRef(false);
  // URL ids 替換次數：作為產品欄 AnimatePresence 嘅 key，
  // 令舊 tray 產品即時消失（skip exit 動畫），唔會新舊 6 卡同屏
  const [urlSwapCount, setUrlSwapCount] = useState(0);

  const products = useMemo(
    () =>
      compare.items
        .map((id) => data?.products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [data, compare.items],
  );

  // 網址 ?ids= 載入分享連結（資料 ready 後執行一次；hash 變更時再對照）
  useEffect(() => {
    if (!data) return;
    const raw = searchParams.get("ids");
    if (raw !== null) {
      const ids = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))]
        .filter((id) => data.products.some((p) => p.id === id))
        .slice(0, COMPARE_LIMIT);
      if (ids.join(",") !== compare.items.join(",")) {
        compare.replace(ids);
        setUrlSwapCount((n) => n + 1);
      }
    }
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchParams]);

  // 產品欄變動 → 同步網址 ids 參數（保持可分享）
  useEffect(() => {
    if (!initialized.current) return;
    const current = searchParams.get("ids") ?? "";
    const next = compare.items.join(",");
    if (current !== next) {
      setSearchParams(next ? { ids: next } : {}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare.items]);

  const loadDemo = () => {
    compare.clear();
    DEMO_IDS.forEach((id) => compare.add(id));
  };

  const restoreSaved = (ids: string[]) => {
    setSearchParams({ ids: ids.join(",") });
  };

  if (loading) {
    return (
      <div className="site-container flex min-h-[60vh] items-center justify-center">
        <p className="text-small text-ink-faint">載入產品檔案中…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="site-container flex min-h-[60vh] items-center justify-center">
        <p className="text-small text-red">{error}</p>
      </div>
    );
  }

  // S0 空狀態
  if (products.length === 0) {
    return (
      <>
        <div className="site-container pt-10">
          <SavedComparisons
            selected={products}
            catalog={data?.products ?? []}
            snapshotDate={generatedAt}
            onRestore={restoreSaved}
          />
        </div>
        <EmptyStateView onDemo={loadDemo} />
        <ProductPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          selectedIds={compare.items}
          onSelect={compare.add}
        />
      </>
    );
  }

  const spare = products.length < COMPARE_LIMIT ? 1 : 0;
  /* Fluid left label column: clamp via .compare-label-col; product slots take remaining width */
  const slotColumns = `var(--compare-label-col, clamp(7.5rem, 18vw, 12.5rem)) repeat(${products.length + spare}, minmax(0, 1fr))`;
  const firstCategory = products[0]?.category;
  const multiCategory = spansMultipleCategories(products);
  const multiTier = hasMultiplePlanTiers(products);

  return (
    <div className="site-container-wide pb-24">
      {/* S1 頁首 */}
      <header className="flex flex-wrap items-end justify-between gap-6 pb-10 pt-[72px]">
        <div>
          <Breadcrumbs items={[{ label: "首頁", to: "/" }, { label: "比較工具" }]} className="mb-5" />
          <h1 className="display-2 text-ink">
            <SplitWords words={["並排對照，"]} />
            <br className="md:hidden" />
            <SplitWords words={["逐項睇真啲。"]} />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT_EXPO }}
            className="mt-3 max-w-[32em] text-ink-soft"
          >
            網站摘要，唔係報價或投保建議。
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE_OUT_EXPO }}
          className="flex flex-wrap items-center gap-3"
        >
          <button
            type="button"
            onClick={compare.clear}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border px-5 text-small font-bold text-red transition-colors hover:bg-red-wash"
            style={{ borderColor: "var(--line-strong)" }}
          >
            <RotateCcw size={14} />
            清空全部
          </button>
          <CompareShareButton ids={products.map(product => product.id)} className="inline-flex h-11 items-center gap-2 rounded-[10px] border px-5 text-small font-bold text-ink transition-colors hover:bg-paper-3" />
          <ComparisonExportButton
            key={products.map(product => product.id).join(",")}
            products={products}
            snapshotDate={generatedAt}
          />
        </motion.div>
      </header>

      <SavedComparisons
        selected={products}
        catalog={data?.products ?? []}
        snapshotDate={generatedAt}
        onRestore={restoreSaved}
      />

      {(multiCategory || multiTier) && (
        <motion.div
          initial={{ opacity: 0, y: MOTION.enterY, scale: MOTION.enterScale }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={MOTION.springy}
          className="mb-6 flex flex-col gap-3"
          role="status"
          aria-live="polite"
        >
          {multiCategory && (
            <aside className="rounded-card border-l-4 border-amber bg-amber-wash p-5">
              <h2 className="h3-style text-ink">比較基準唔一致</h2>
              <p className="mt-2 text-small leading-relaxed text-ink-soft">{CROSS_CATEGORY_COMPARE_NOTICE}</p>
            </aside>
          )}
          {multiTier && (
            <aside className="rounded-card border-l-4 border-amber bg-amber-wash p-5">
              <p className="text-small leading-relaxed text-ink-soft">{MULTI_TIER_COMPARE_NOTICE}</p>
            </aside>
          )}
        </motion.div>
      )}



      {isMobile ? (
        <MobileCompare products={products} onRemove={compare.remove} />
      ) : (
        <>
          {/* S2 產品欄頭（sticky） */}
          <div className="sticky top-16 z-30">
            <div
              className="grid bg-paper/85 backdrop-blur-[12px]"
              style={
                {
                  gridTemplateColumns: slotColumns,
                  "--compare-label-col": "clamp(7.5rem, 18vw, 12.5rem)",
                } as CSSProperties
              }
            >
              <div
                className="compare-label-col flex items-end border-b px-3 pb-3 text-[12px] text-ink-faint fold:px-4"
                style={{ borderColor: "var(--line)" }}
              >
                網站摘要與來源對照
              </div>
              <AnimatePresence mode="popLayout" key={urlSwapCount}>
                {products.map((p) => (
                  <FilledSlot
                    key={p.id}
                    product={p}
                    generatedAt={generatedAt}
                    onRemove={() => compare.remove(p.id)}
                  />
                ))}
              </AnimatePresence>
              {spare > 0 && <EmptySlot onPick={() => setPickerOpen(true)} />}
            </div>
          </div>

          {/* S3 對照表 */}
          <ComparisonGrid products={products} spare={spare > 0} generatedAt={generatedAt} />
        </>
      )}

      {/* S4 表格底操作帶 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="flex flex-wrap items-center justify-center gap-4 py-12"
      >
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={compare.isFull}
          className={cn("btn-primary", compare.isFull && "cursor-not-allowed opacity-40")}
          title={compare.isFull ? `最多比較 ${COMPARE_LIMIT} 份產品` : undefined}
        >
          <Plus size={17} />
          揀多份產品
        </button>
        {firstCategory && (
          <Link to={`/category/${firstCategory}`} className="btn-ghost">
            去類別頁繼續格價
            <ArrowRight size={17} />
          </Link>
        )}
        <CompareShareButton ids={products.map(product => product.id)} className="inline-flex h-[52px] items-center gap-2 rounded-[10px] px-4 text-small font-bold text-ink-soft transition-colors hover:text-red" />
      </motion.div>

      {/* S5 比較須知 */}
      <motion.aside
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        className="mx-auto max-w-[820px] rounded-card border-l-4 border-amber bg-amber-wash p-7"
      >
        <h2 className="h3-style text-ink">比較須知</h2>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-small text-ink-soft">
          <li>計劃層級未必一致；投保前細閱保單條款。</li>
          <li>保費以官網為準；快照 {generatedAt}；儲存／匯出唔係報價或投保建議。</li>
        </ol>
      </motion.aside>

      <ProductPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={compare.items}
        onSelect={compare.add}
      />
    </div>
  );
}

from pathlib import Path
import re

def edit(file, pairs):
 p=Path(file);s=p.read_text()
 for old,new in pairs:
  assert old in s,(file,old[:100]);s=s.replace(old,new)
 p.write_text(s)
p=Path('src/App.tsx');s='import { lazy } from "react";\n'+p.read_text()
for page in ['Categories','CategoryDetail','ProductDetail','Compare','Insurers','Guides','Vhis','About','DataQuality','Documents']:
 old=f'import {page} from "@/pages/{page}";';assert old in s;s=s.replace(old,f'const {page} = lazy(() => import("@/pages/{page}"));')
p.write_text(s)
edit('src/components/fx/TiltCard.tsx',[
 ('import { useRef, useState }','import { useRef }'),
 ('useMotionTemplate }','useMotionTemplate, useReducedMotion }'),
 ('''  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.matchMedia("(pointer: coarse)").matches,
  );''','''  const reduced = useReducedMotion();
  const enabled = !reduced && typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches;''')])
edit('src/pages/home/Hero.tsx',[
 ('import { useRef, useState }','import { useRef }'),('useTransform }','useTransform, useReducedMotion }'),
 ('''  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );''','  const reduced = useReducedMotion();'),
 ('categories.length || 9','categories.length || "—"'),('products.length || 85','products.length || "—"'),('insurers.length || 27','insurers.length || "—"'),
 ('{ scope: rootRef, dependencies: [reduced] }','{ scope: rootRef, dependencies: [reduced], revertOnUpdate: true }'),
 ('onMouseMove={onMouseMove}>','onMouseMove={onMouseMove} onMouseLeave={() => { mx.set(0); my.set(0); }}>'),
 ('<motion.div data-float-near','<div data-float-near className="pointer-events-none absolute inset-0"><motion.div'),
 ('<motion.div data-float-far','<div data-float-far className="pointer-events-none absolute inset-0"><motion.div'),
 ('''              ))}
            </motion.div>''','''              ))}
            </motion.div></div>'''),
 ('''            家居、旅遊、人壽、危疾、意外、醫療、汽車、家傭、寵物——9 大類別、85
            份真實保單，保障範圍、價錢、條款逐項並排，全部附有保險公司官方來源。''','''            由旅遊、醫療到家居保障，按你嘅需要逐項比較。
            睇清保障範圍、價錢同限制，再打開來源文件核對。'''),('瀏覽 9 大類別','瀏覽所有保險類別')])
p=Path('src/pages/home/MethodStory.tsx');s='import { useReducedMotion } from "framer-motion";\n'+p.read_text();s=s.replace('  const rootRef =','  const reduced = useReducedMotion();\n  const rootRef =',1).replace('      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n','');s=s.replace('        showScene(2);','        gsap.set(scenes, { autoAlpha: 0, y: 0 });\n        gsap.set(scenes[2], { autoAlpha: 1 });\n        gsap.set(".method-table-row, .method-source-chip, .method-stamp", { autoAlpha: 1, x: 0, scale: 1 });');s=s.replace('{ scope: rootRef },','{ scope: rootRef, dependencies: [reduced], revertOnUpdate: true },');s=s.replace('27 間保險公司官網，產品頁、保障表、保費表逐頁記錄。','先記錄產品頁、保障表同保費表來源，缺失資料明確列出。').replace('產品冊子、保單條款 PDF、自負額表——85 份產品全部註明搵到邊份文件。','產品冊子、保單條款 PDF、自負額表——分清鏡像版本、頁碼同摘錄。').replace('統一格式先好比較。每個產品附官方來源連結，你可以自己核實。','統一格式先好比較。有來源可逐條核對，未核實項目清楚提示。');p.write_text(s)
edit('src/pages/home/FinalCTA.tsx',[('9 大類別 · 85 份產品 · 27 間公司，全部有官方出處。','由保障摘要去到來源原文，睇清已知資料同待核實嘅缺口。')])
edit('src/components/Footer.tsx',[
 ('全部摘自官方網站及文件，附來源連結','有來源的資料附核對入口；完整性與時效詳見核查清單'),
 ('<li><Link to="/about"','<li><Link to="/documents" className="link-sweep text-paper/75">PDF 中心</Link></li>\n              <li><Link to="/data-quality" className="link-sweep text-paper/75">資料核查清單</Link></li>\n              <li><Link to="/about"')])
p=Path('src/pages/Insurers.tsx');p.write_text('import { safeFragment } from "@/lib/data-integrity";\n'+p.read_text())
edit('src/pages/Insurers.tsx',[
 ('decodeURIComponent(location.hash.slice(1))','safeFragment(location.hash)'),
 ('喺 9 大類別嘅產品','喺 {categories.length} 大類別嘅產品'),
 ('試下重設篩選，或者睇返全部 27 間保險公司。','試下重設篩選，或者睇返本站公司名錄。'),
 ('className="w-full bg-transparent text-small','className="min-w-0 w-full bg-transparent text-small'),
 ('className="inline-block will-change-transform"','className="inline-block max-w-full will-change-transform"')])
edit('src/components/insurers/InsurerCard.tsx',[
 ('group relative flex scroll-mt','group relative flex min-w-0 scroll-mt'),('font-grotesk text-[22px]','break-words font-grotesk text-[22px]'),
 ('睇全部 {insurer.productCount} 份產品','查看{categories.find(c => c.id === firstCategory)?.name_zh ?? "此類別"}產品'),
 ('to={`/category/${catId}`}','to={`/category/${catId}?insurer=${encodeURIComponent(insurer.name)}`}')])
p=Path('src/lib/version.ts');p.write_text(re.sub(r'BUILD_NUMBER = "[^"]+"','BUILD_NUMBER = "20260906.20"',p.read_text()))

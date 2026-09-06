"""One-shot, assertion-checked integration into the review branch; never master."""
from pathlib import Path
import json, subprocess

def replace(path, old, new):
    p=Path(path); s=p.read_text(); assert s.count(old)==1, (path, old); p.write_text(s.replace(old,new))
replace('src/App.tsx','import About from "@/pages/About";','import About from "@/pages/About";\nimport Documents from "@/pages/Documents";')
replace('src/App.tsx','<Route path="about" element={<About />} />','<Route path="about" element={<About />} />\n              <Route path="documents" element={<Documents />} />')
replace('src/components/Navbar.tsx','  { label: "投保指南",','  { label: "PDF 中心", to: "/documents", match: (p: string) => p.startsWith("/documents") },\n  { label: "投保指南",')
p=Path('src/components/Navbar.tsx');p.write_text(p.read_text().replace('min-[900px]','min-[1200px]'))
replace('src/components/product/CoverageSection.tsx','return summary.includes(c.item) || c.item.includes(summary) || quote.includes(c.item);','return entry.citation.claim_field === "coverage" && c.item.trim().length > 0 && summary.trim().length > 0 &&\n        (summary.trim() === c.item.trim() || summary.startsWith(`${c.item}：`) || quote.trim() === c.item.trim());')
p=Path('src/components/product/SourcesSection.tsx');p.write_text('import { Link } from "react-router";\n'+p.read_text())
replace('src/components/product/SourcesSection.tsx','<SectionHeading index="07" title="官方來源" />','<SectionHeading index="07" title="官方來源" />\n      <Link to={`/documents?${new URLSearchParams({ product: product.id })}`} className="btn-ghost mb-5 min-h-11">到 PDF 中心逐條核對</Link>')
p='src/components/product/citation/CitationsSection.tsx'
replace(p,'import { useEffect, useRef, useState } from "react";','import { useEffect, useRef, useState } from "react";\nimport { useParams } from "react-router";\nimport { useProduct } from "@/providers/InsuranceDataProvider";\nimport { evidenceEntries, evidenceHref, sourceTarget } from "@/lib/pdf-evidence";')
replace(p,'  const { citation, num } = entry;','  const { citation, num } = entry;\n  const { productId } = useParams();\n  const product = useProduct(productId);\n  const evidence = product && evidenceEntries(product).find(e => e.kind === "citation" && e.index === product.citations?.indexOf(citation));\n  const href = evidence ? evidenceHref(product!.id, evidence) : sourceTarget(citation.url)?.url;')
replace(p,'href={citation.url}','href={href}')
replace(p,'        飛去出處','        核對原文')
p=Path('.gitignore');p.write_text(p.read_text()+'\n/public/pdfjs/\n')
# Resolve only newly added packages; retain every previously locked package byte-for-byte.
old=json.loads(Path('package-lock.json').read_text())
subprocess.run(['npm','install','--ignore-scripts','--package-lock-only','--save-exact','pdfjs-dist@6.3.289'],check=True)
resolved=json.loads(Path('package-lock.json').read_text())
for key,value in old['packages'].items():
    if key: resolved['packages'][key]=value
resolved['packages']['']['dependencies']['pdfjs-dist']='6.3.289'
Path('package-lock.json').write_text(json.dumps(resolved,indent=2,ensure_ascii=False)+'\n')
p=Path('package.json'); package=json.loads(p.read_text());package['scripts'].update(predev='node scripts/copy_pdf_assets.mjs',prebuild='node scripts/copy_pdf_assets.mjs');p.write_text(json.dumps(package,indent=2,ensure_ascii=False)+'\n')

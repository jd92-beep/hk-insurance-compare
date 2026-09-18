"""Reproduce the September 18 documentation review; never certifies policy facts.

Historical notes retain their body, explicitly superseded by the current review.
Active manuals replace unsupported examples with reproducible workflow contracts.
"""
from pathlib import Path
import json, os, re, subprocess
ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT/'public/data/insurance-data.json').read_text())
CURRENT = ROOT/'docs/review/2026-09-18-release.md'

def write(path, text):
    p = ROOT/path; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text.strip()+'\n')
def link(p): return os.path.relpath(CURRENT, p.parent).replace(os.sep, '/')

write('README.md', '''# 保險資料比較站 · HK InsureCompare

繁體中文（香港）的保險資料比較 SPA。先睇保障同限制，再向保險公司核對條款及個別報價。

## 資料範圍與限制

目前 JSON 有 158 個資料記錄及 11 個類別；數量包括歷史／待核對記錄，唔係全市場或仍在售產品的保證。
資料快照日期仍為 2026-09-02。2026-09-18 的全庫審核核對來源連結和機械引文一致性，**並未逐份核實所有現行保障**。
HTTP 成功、PDF 存在、雜湊吻合或文字命中，都唔等於條款解讀正確。

## 使用方式

類別頁預設卡片：搜尋公司／產品名稱，按需要展開條件篩選，加入最多三份資料作比較。
桌面用有標題的比較表；手機按同一問題逐份對照，毋須在 A/B/C 分頁之間記住金額。
不保事項、計劃級別和自負額先於保費；保留逐項來源、PDF 原文、儲存／分享比較及 Markdown 匯出。
進階數值對照需主動展開，只比較可解析且計算單位一致的摘要，唔排名或評定最適合。
沒有即時報價、沒有個人適合度百分比、沒有全市場最平承諾。已過期或未有有效日期的優惠唔會當作現行優惠。

## 技術與開發

React、TypeScript、Vite、Tailwind、Radix；實際版本以 package-lock.json 為準。Node 22：

```sh
npm ci
npm run dev
npm test
npm run lint -- --max-warnings=0
npm run build
npm run test:filters
npm run check:maintenance
python -m unittest discover -s tests -p 'test_evidence_audit.py'
```

最後兩類檢查要分清「資料內容待修」與程式執行錯誤；唔好為通過檢查而填寫假金額或引文。
3D 效果使用有界傾斜、靜態立體陰影及預先投影的 Canvas 寶石圖集，並非 WebGL 物理光線追蹤。
觸控、鍵盤焦點及減少動態效果偏好會停止卡片傾斜；背景分頁與畫面外寶石暫停重繪。

## 交付與維護

master 連接部署；未經額外批准，不合併、不開 auto-merge、不更改正式部署。現有服務可能自動產生 review branch 預覽。

- [本輪實作／測試／未完成項目](docs/review/2026-09-18-release.md)
- [158 個記錄的來源覆核](docs/review/2026-09-18-evidence.md)
- [維護手冊](docs/maintenance/README.md)
- [Agent 工作契約](AGENTS.md)

本網站資料僅供參考，唔構成個人投保建議。投保前請核對現行正式條款及個別承保結果。
'''.replace('进階','進階'))
write('docs/review/2026-09-18-release.md', '''# 2026-09-18 · Evidence, plain-language comparison and optical depth

## Status and review boundary

Evidence changes are in [PR #27](https://github.com/jd92-beep/hk-insurance-compare/pull/27), head `c5f3f63c4129449f5ba597182765ac35015b1983`. The presentation/depth changes are a dependent review branch, not a production merge. Check the actual PR head/checks before release; this file is not a blanket pass certificate.

## Implemented

The first PR checks every catalogue record and source endpoint, fixes specifically reviewed Manulife annual/lifetime limits, removes 21 misassigned citations, quarantines the malformed travel-manulife site record, blocks historical purchase links, and expires strictly dated promotions using Hong Kong calendar dates. The snapshot date is deliberately unchanged. See [per-record disposition](2026-09-18-evidence.md).

The presentation changes add product/company search, cards-first browsing, optional native filters and advanced charts, concise category guidance, first-visible exclusions, neutral match counts, and desktop semantic/mobile question-by-question comparison. Difference-only affects coverage text, not exclusions or premiums. No numeric suitability scores, automatic winners or fake live quotes. Raw terms remain available. Public GitHub issue reporting warns against uploading identity, policy or medical information.

Cards have static layered shadows and bounded perspective tilt on a stable outer hit area. Focus/touch/reduced motion disable tilt. Gems project 33 real polygon faces into a 24-frame, four-colour atlas. The frame loop retains DPR, pixel and particle budgets, offscreen/tab suspension and listener cleanup. This is projected geometry, not WebGL/refraction simulation.

## Checks and known boundaries

Before delivery: Node 22 unit tests 127/127; lint zero warnings/errors; TypeScript/Vite build pass; filter boundary assertions 90,733 pass. A changed keyword contract alters the number of generated filter combinations; no coverage assertion was disabled. New logic tests were run failing before fixes. Evidence PR's browser/CI workflows completed successfully; individual reports are reviewed separately.

Local browser navigation was blocked by administrator policy. No security bypass was attempted. Browser evidence must come from GitHub Actions Chromium; retain actual head SHA, screenshots, interaction results and errors. The isolated strict presentation test supplements the existing all-product/PDF/search/saved/export suites. No Safari, physical-device performance, formal WCAG conformance or representative user study is claimed.

Remaining: the 158-record inventory is not a completed semantic/current-policy review. Mixed tiers, reused/missing quotations, sources that fail retrieval and unresolved plan identities require insurer/version-specific curation. The existing main chunk exceeds 500 KB. Do not erase warnings or label all bugs fixed. No subagents were spawned: the session exposes no subagent launcher.

## Complaint research to design decisions

[FCA, 16 July 2014, UK comparison-site study](https://www.fca.org.uk/news/press-releases/price-comparison-websites-failing-meet-fca-expectations): price-led presentation can obscure cover/excess and consumers can mistake comparison for suitability advice. Applied here: limitations-first, comparable-basis warnings, no recommendation percentages and no cheapest-product badges. This historical study is not evidence of current Hong Kong complaint prevalence.

[Hong Kong Consumer Council, 14 December 2023](https://www.consumer.org.hk/tc/press-release/p-566-virtual-insurance-companies): its virtual-insurer review identified customer-experience and privacy-disclosure shortcomings. Those were insurer interfaces, not a survey of comparison sites. Applied here as adjacent design evidence: no opaque chatbot, optional simple controls, recoverable errors and an explicit public-report privacy warning. These are design inferences, not claims that our users have been tested.

## Markdown review

Active overview, maintenance workflows, eleven category inventories and handover files are rewritten for the new evidence and UI contracts. Older review/spec/archive bodies remain historical, with explicit supersession banners. The generated PDF audit is regenerated from its generator. `markdown-review-2026-09-18.json` enumerates every reviewed Markdown file and its treatment. Historical statements are not current guarantees.

## Review order

Review evidence PR #27 first, then its dependent presentation/depth/documentation PR. Do not merge into the parent review branch as a substitute for a reviewed production integration; retarget the dependent PR to master after the evidence PR is merged by the owner. Re-run tests after any conflict resolution. Roll back by reverting the coherent change, preserving raw evidence history.
''')
write('docs/maintenance/README.md', '''# 維護入口

本手冊最後整理：2026-09-18。先讀 [本輪狀態](../review/2026-09-18-release.md) 及 [AGENTS.md](../../AGENTS.md)。
保險資料不因通過程式測試而變成現行、準確或適合個別人士。不要沿用舊手冊的示例金額、季節推測或「幾分鐘零失誤」承諾。

## 四種工作

- [新增記錄](workflows/add-new-product.md)：先核實產品及計劃身份。
- [保費及優惠](workflows/update-pricing-and-promo.md)：參考保費不等於個別報價；優惠要有日期及條件。
- [PDF／原文](workflows/update-pdf-terms-and-quotes.md)：頁碼、版本、計劃及引文逐條匹配。
- [停止銷售／資料隔離](workflows/deprecate-product.md)：渠道停售和產品停保不可混為一談。

## 類別清單

類別手冊列出 JSON 中的記錄，包含歷史／待核資料。數量不是市場覆盖率。每項的詳細問題見逐項審核頁及來源報告。

'''.replace('覆盖','覆蓋')+'\n'.join(f'- [{p.stem}](categories/{p.name})' for p in sorted((ROOT/'docs/maintenance/categories').glob('*.md'))))
common = '''\n## 共通驗證\n\nNode 22、鎖定依賴：`npm ci`。執行 `npm test`、`npm run lint -- --max-warnings=0`、`npm run build`、`npm run test:filters`。內容變更另跑對應 evidence/citation/maintenance 檢查。\nPDF 审核用 `python scripts/audit_evidence.py --as-of YYYY-MM-DD`，日期必須來自實際審核，不可冒充全面條款更新。同步更新 BUILD_NUMBER／BUILD_DATE，保留個別測試結果和未能檢查項目。只提 PR，不自動合併。\n'''.replace('审核','審核')
workflows = {
'add-new-product.md':('新增資料記錄','先從官方資料确认產品身份、保險公司、類別、銷售渠道和計劃級別。新增不代表已全面核實。逐項記錄來源、版本、頁碼、適用條件與金額單位；未有資料就標示未知，唔填零值、假頁碼或其他產品引文。不要以第一份 PDF 代替每項來源。核對產品 ID、索引、搜尋、比較和文件中心。'),
'update-pdf-terms-and-quotes.md':('更新 PDF 及引文','核對官方 URL、產品／級別、版本日期及原文，不只看檔名。比對舊新 PDF、保留差异與來源紀錄，再更新鏡像、manifest、頁碼及引文。文字命中只證明字句存在，不能證明該條款支持指定保障。重新生成 evidence ledger 並實測 PDF 跳頁、搜尋、高亮和未知狀態；空引文不能高亮成已核實。'),
'deprecate-product.md':('停止銷售或隔離問題記錄','必須區分指定渠道停止銷售、續保中止、整個產品停售和本站資料未能核實。保留正式公告、適用日期及範圍。record_status archived 是本站歷史／待核記錄，不可推斷所有同公司產品停售。停用新投保連結及 promo fallback；保留歷史條款給已投保人士參考。主清單預設隱藏歷史記錄，但可主動查看。'),
'update-pricing-and-promo.md':('更新保費與有效優惠','premium_range 是資料快照，不是可付款價格；沒有同一報價基礎就不能劃原價、算最平、年化或作保費排序。promo 需 valid_from、valid_until、reviewed_at、source_url（HTTPS）、conditions；日期要實際有效，覆核不可來自未來。用共享 promoDisplay 及 usePolicyCalendar，不在元件自行判斷。超過31日未覆核、過期、未有日期、歷史產品均隱藏優惠。香港時間到期日結束即失效，測試到期前後及已打開頁面午夜更新。不得用其他渠道優惠充當所有用戶適用，也不可把同品牌折扣套到別的計劃。')}
for name,(title,body) in workflows.items():
    body=body.replace('确认','確認').replace('差异','差異').replace('区分','區分').replace('推断','推斷').replace('隐藏','隱藏')
    write('docs/maintenance/workflows/'+name, '# '+title+'\n\n整理日期：2026-09-18。返回 [維護入口](../README.md)。\n\n'+body+common)
write('docs/maintenance/core-rules-and-architecture.md', '''# 資料與介面契約

JSON 是快照。來源、PDF mirror、機械 evidence ledger、UI 摘要、優惠及銷售渠道的狀態互相獨立。
保留 canonical insurer identity；不要因名稱近似合併公司或計劃。未知不等於不保，排除／有條件資料不能變成 positive match。
搜尋產品名稱用 catalogue-search；保障關鍵字用 feature-evidence；零自負額與全數賠償不可互換。
priceDisplay 不產生即時數字报价；promoDisplay 需要有效日期及條件；purchaseUrl 控制歷史／渠道連結。
PDF 核對失敗保留原文及錯誤，不能用第一份引文或頁1作假證据。
UI 先呈現名稱、限制、計劃差异、來源狀態；不根據最高限額選勝者。手機把同一問題下的所有公司列出。
TiltCard 用外層固定命中範圍、內層傾斜；焦點／觸控／減少動態效果不傾斜。ParticleField 有界圖集與可取消 frame loop。

完整測試及发布邊界見 [AGENTS.md](../../AGENTS.md) 及 [當次交付](../review/2026-09-18-release.md)。
'''.replace('报价','報價').replace('證据','證據').replace('差异','差異').replace('发布','發佈'))
category_ids=['travel','medical','high-end-medical','top-up-medical','life','critical-illness','accident','home','pet','motor','domestic-helper']
for path, category in zip(sorted((ROOT/'docs/maintenance/categories').glob('*.md')), category_ids):
    products=[p for p in DATA['products'] if p['category']==category]
    rows=['| 記錄 ID | 公司／產品（快照原名） | 記錄狀態 |','|---|---|---|']
    for p in products:
        escape=lambda s:str(s).replace('|','／').replace('\n',' ')
        rows.append(f"| `{p['id']}` | {escape(p.get('insurer_zh',p['insurer']))} · {escape(p.get('product_name_zh') or p['product_name'])} | {escape(p.get('record_status','未全面核實現行條款'))} |")
    text=f'''# {category} 維護清單

整理日期：2026-09-18；此類別有 {len(products)} 個 JSON 記錄，包括歷史或待核資料。這不是已核實、仍在售或全市場產品數。

## 核對次序

先核對公司、產品和級別，然後核對保障期／地區、金額單位、自負額、不保事项及銷售渠道。不要把某計劃的最高額套到整個產品家族。
未有確實証据的「全包／零自付／保證轉保」不可放在標題；類別文案和 filter label 只提供查詢方向，不能替代條款。
本輪只修正有針對性來源支持的項目，剩余問題見 [逐產品覆核](../../review/2026-09-18-evidence.md) 及網站 `/data-quality`。

{chr(10).join(rows)}

## 修改後

保持上述 ID 清單與 JSON 一致。逐項來源使用原始 document_name／page／quote；不複用別條保障引文。價格按 [優惠契約](../workflows/update-pricing-and-promo.md) 處理。
核對卡片、表格、手機比較、原文開啟和錯誤回報連結；測試完成才提交 PR。
'''.replace('事项','事項').replace('証据','證據').replace('剩余','剩餘')
    write(str(path.relative_to(ROOT)),text)
# Replace active handovers, preserving the explicit archive directory.
for path in (ROOT/'handoff').glob('*.md'):
    title=path.stem
    write(str(path.relative_to(ROOT)), f'''# {title} · 2026-09-18 handover

Read [current delivery](../docs/review/2026-09-18-release.md), [evidence disposition](../docs/review/2026-09-18-evidence.md) and [AGENTS.md](../AGENTS.md).

Navigation: [current handover](00-current-status.md) and [historical problem register](../docs/review/problem-register-2026-09-06.md). The register is historical; re-check each item against the current head.

Evidence PR #27 is open; presentation/depth changes depend on it. No merge, production release or spawned agent is claimed. Check live heads before continuing.

Implemented: non-live premium safeguards; dated promotion expiry; partial Manulife corrections; complete record/endpoint audit; search/cards-first category UI; limits-first semantic comparison; bounded card tilt and projected gems; current documentation.

Unresolved: plan/version-specific verification across the complete catalogue, malformed/reused source quotations, unavailable endpoints, and the existing bundle-size warning. Keep these visible; do not replace them with an 'all fixed' statement.

Run lockfile-based quality gates and browser evidence for the exact submitted head. Existing reports under archive/ are historical only. Local browser navigation was administrator-blocked; review actual GitHub Actions artifacts rather than claim a local visual pass.
''')
write('info.md', '# Project entry point\n\nUpdated 2026-09-18. Start with [README](README.md), [current review](docs/review/2026-09-18-release.md) and [AGENTS](AGENTS.md). The JSON is a partial, dated catalogue, not live quotes or fully verified policy advice. Do not inherit old product counts or completion claims.\n')
# All remaining Markdown is read and explicitly scoped. Historical body stays intact.
tracked=subprocess.check_output(['git','ls-files','*.md'],cwd=ROOT,text=True).splitlines()
paths=sorted(set(tracked)|{str(p.relative_to(ROOT)) for p in (ROOT/'docs/review').glob('*.md')})
manifest=[]
for name in paths:
    p=ROOT/name
    if not p.exists(): continue
    text=p.read_text()
    historical=(name.startswith('handoff/archive/') or name.startswith('docs/superpowers/') or (name.startswith('docs/review/') and '2026-09-18' not in name and name!='docs/review/05-evidence-audit.md'))
    treatment='historical-body-preserved' if historical else 'current-contract-reviewed'
    if name=='docs/review/05-evidence-audit.md': treatment='regenerated-ledger'; manifest.append({'path':name,'treatment':treatment}); continue
    if name!='docs/review/2026-09-18-release.md':
        banner=f'<!-- review-2026-09-18 -->\n> **2026-09-18 documentation review:** '+('Historical record; its old counts, screenshots, commands and completion claims are not current acceptance evidence. ' if historical else 'Current scope and remaining limitations: ')+f'[delivery review]({link(p)}). No blanket policy-currentness certificate.\n<!-- /review-2026-09-18 -->\n\n'
        text=re.sub(r'<!-- review-2026-09-18 -->.*?<!-- /review-2026-09-18 -->\n\n','',text,flags=re.S)
        p.write_text(banner+text)
    manifest.append({'path':name,'treatment':treatment})
write('docs/review/markdown-review-2026-09-18.json', json.dumps({'reviewed_at':'2026-09-18','files':manifest},ensure_ascii=False,indent=2))
print('Reviewed Markdown files:',len(manifest))

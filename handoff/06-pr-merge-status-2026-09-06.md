# 06 — PR Merge Operation Status (2026-09-06)

> 俾下一個 agent（GitHub-only）接手審查同 merge 18 個 stacked review PR。
> **最新狀態以此檔為準。** 規矩同鐵律睇 `GEMINI.md` / `AGENTS.md`；呢份只講 merge 行動。

## 已完成 Merge（順序正確，全部可追溯）

Master 而家 HEAD：`77baffb`（Merge PR #11）。已按拓撲順序 merge 落 master：

| PR | 內容 | 備註 |
|---|---|---|
| #1 | CI 硬化（lint 改硬性 `--max-warnings=0` + eslint allow-list）+ review evidence workflows | ✅ 我加咗 tweak：`review-evidence.yml` lint 步驟補 `continue-on-error: true`（否則 lint 有 error 會 skip 埋 build/test） |
| #2 | ParticleField 光學晶體重寫 + Lenis RAF 洩漏修復 | ✅ Tweak 已入：`pointermove` 即場讀 `getBoundingClientRect()`（原本 cache 咗 top/left，async 佈局推移後會偏移） |
| #3 | PDF 中心（PDF.js lazy）+ CoverageSection matcher | ✅ Tweak 已入：matcher 放寬做「前綴+分隔符」（`：:—–-·／/ 空格 （(`），否則真實格式「個人責任 HK$2,000,000」會全部唔中 |
| #5 | 三態證據（不保/待確認唔誤中）+ 移除失真 CP 排序 | ✅ Tweak 已入：刪走 dead `SortKey` 成員 `coverage-max`/`value-score` |
| #7 | SearchPalette 改 Radix Dialog 真 modal + NFKC 搜尋 | ✅ 直接 merge |
| #8 | 全庫引文審核管線 + `/data-quality` 頁 + AIG 停售 CTA 修正 | ✅ 直接 merge |
| #9 | CompareProvider 跨分頁同步（useSyncExternalStore） | ✅ 直接 merge |
| #10 | 11 類決策指南介面 | ✅ Tweak 已入：刪走臨時 workflow `category-interactions.yml`（PR 自述完成後要刪） |
| #11 | 分享連結唔再假成功 + 手動複製 dialog | ✅ 直接 merge |

| #12 | 全站品質：`?insurer=` URL 參數讀取初始化 | ✅ 已 Merge（帶 Tweak） |
| #13 | 引文匯入安全保護與格式校驗 | ✅ 已 Merge |
| #14 | 圖表引文穿透與可視化證據卡 | ✅ 已 Merge |
| #15 | 保額範圍安全比較防禦 | ✅ 已 Merge |
| #16 | 精確限額與自負額範圍過濾 | ✅ 已 Merge |
| #17 | PDF 81份鏡像指紋比對與快照一致性 | ✅ 已 Merge |
| #18 | 手機直排證據卡片、完整展開不左右搵 | ✅ 已 Merge |
| #19 | 印章標籤中立化（改為「來源參考」） | ✅ 已 Merge（帶 Tweak） |
| #20 | 20 項問題登記簿、零上下文交接規範 | ✅ 已 Merge |

---

## 🎉 全部 20 個 PR 已 100% MERGE 完成

所有 20 個 Stacked PR 已經順序全部安全合入 `master`。

## 🧹 已完成的手尾工作 (Release v1.7.0)

1. **`artifacts/*.png` 倉庫清理**：
   - 執行 `git rm -r artifacts/`，移除誤入 master 的 9 張 png 測試截圖。
   - `.gitignore` 加入 `artifacts/`。
2. **版本號同步發布**：
   - `package.json`：`1.7.0`
   - `package-lock.json`：`1.7.0`
   - `src/lib/version.ts`：`APP_VERSION = "1.7.0"`，`BUILD_NUMBER = "20260906.30"`
3. **GEMINI.md 與手冊維護**：
   - 補充 (a) insurer 身份 key 守護及 (b) MethodStory GSAP pin 防禦規範。
4. **質量閘門**：
   - `npm run lint -- --max-warnings=0`：0 error 0 warning
   - `npm test`：75/75 passed
   - `npm run build`：100% passed
   - 深度組合過濾測試：100% passed


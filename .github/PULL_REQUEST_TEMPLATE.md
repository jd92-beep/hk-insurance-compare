<!-- 多謝你嘅 PR！請跟返 GEMINI.md 嘅鐵律同質量門禁。 -->

## 改咗乜

<!-- 簡述變更內容同原因 -->

## 質量門禁 Checklist

- [ ] `src/lib/version.ts` 已遞增 `APP_VERSION` / `BUILD_NUMBER`，`package.json` `"version"` 已同步
- [ ] `npm run lint` — 維持 **17** 個 baseline errors，**新碼 0 error**
- [ ] `npm run build` — `tsc -b && vite build` 100% 通過
- [ ] 如有改動 filter / 產品數據 / 比較模組：`npx tsx scripts/verify_filter_combinations.ts` 同 `verify_filter_boundary_deep.ts` 全部 PASS
- [ ] 所有量化數據附官方引文 `{document, page, quote, url}`（鐵律 2：Citations are sacred）
- [ ] 保險公司 Latin key 100% 復用 GEMINI.md 嘅 39 個標準 key
- [ ] UI 文案為香港繁體中文；動效喺 `prefers-reduced-motion` 下有降級

## 截圖 / 演示

<!-- UI 變更請附截圖 -->

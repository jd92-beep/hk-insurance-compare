# 首頁光學粒子與動效生命週期

保留紙白／玉綠／品牌紅與現有維港插畫；不恢復已移除的大型 WebGL 圈圈。

## 已實作
- 小型六面晶體：預先繪製四款材質 atlas，切面、邊緣高光、深度比例、緩慢旋轉與彈簧排斥。
- 56 顆桌面／22 顆觸控預設，最大密度 1.5 倍；DPR 1.75 上限、畫布 200 萬像素預算。
- 粒子與 Lenis 都有可取消 RAF；背景頁、離屏粒子及減少動態效果不持續計算。

## 驗證及邊界
`npm test` 包含三個動效回歸測試（RAF 重入／取消、密度上限、固定種子）。本次本地 TypeScript、lint 通過。生產 build 與 Chromium 驗收結果見 PR Conversation。

本效果是 Canvas 2D 繪製的 perspective-depth optical particles（2.5D），不是 physically based WebGL 場景。無外加 3D 函式庫、不捕捉觸控拖曳；不以 headless Chrome 數據宣稱所有手機恆定 60fps。需要真機確認 Safari／低階 Android 的流暢度。

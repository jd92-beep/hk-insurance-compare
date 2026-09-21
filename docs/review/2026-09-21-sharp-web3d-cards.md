# 2026-09-21 · Sharp Card Text with Decoupled Web3D Gem & Optical Depth

**Branch:** `review/20260921-sharp-web3d-cards`  
**Version:** APP_VERSION **1.8.7** · BUILD_NUMBER **20260921.05** · BUILD_DATE 2026-09-21  
**Scope:** UI / Web3D presentation only. Insurance claims, policy data, zh-HK copy unchanged.

## Problem (user report)

User likes 3D depth and stereoscopic tilt effects on cards, but noticed that at rest (without pointer interaction), card typography appeared blurry/hazy. Requested keeping 3D depth and incorporating genuine Web3D elements while guaranteeing crisp, pixel-sharp text at rest.

## Root cause

1. Cards placed typography containers under `transform: translateZ(12px)`, `transform-style: preserve-3d`, and persistent `perspective: 1200px`.
2. Chromium / WebKit on high-DPI displays rasterizes 3D-transformed DOM into GPU texture layers with bilinear filtering, disabling native subpixel font smoothing.
3. An earlier PR #44 attempted to fix blur by brutally flattening cards to 2D at rest, stripping all optical depth, which caused visual regression and was reverted in PR #45.

## Solution (Decoupled Layer Architecture)

1. **Pixel-Sharp Typography at Rest**:
   - `TiltCard.tsx`: At rest, `lift` is 0 and `.tilt-face-card` resolves `transform: none`. Typography remains in 2D subpixel-antialiased layout without GPU texture scaling.
   - `ProductCard.tsx`: Removed hardcoded `translateZ(12px)` from inner content flex container.
   - `InsurerCard.tsx`: Removed `depth-z-icon` on product count numeral and untangled `chip-3d` text from GPU rasterization.
2. **Preserved Physical Depth Shell**:
   - Card shells retain layered drop shadows (`0 2px 0`, `0 8px 0`, `0 14px 28px`), specular edge (`inset 0 1px 0 rgba(255,255,255,.95)`), and 3D card borders at rest.
3. **Genuine Web3D Integration (`Card3DGem.tsx`)**:
   - Built a standalone Web3D canvas component projecting 33 polygon faces via painter's algorithm (`depth-geometry.ts`).
   - Features ambient diffuse shading, specular highlight, subtle resting breathing spin, and cursor tilt.
   - Completely isolated on its own `<canvas>` layer, completely eliminating text raster pollution.
   - Guarded with DPR capping (`min(dpr, 2)`), `prefers-reduced-motion` single-frame fallback, `IntersectionObserver` pause, and zero-leak cleanup.

## Verification

| Check | Result |
|---|---|
| `npm test` | PASS 193/193 |
| `npm run lint -- --max-warnings=0` | PASS (0 errors, 0 warnings) |
| `npm run build` | PASS (TypeScript and Vite bundle clean) |
| `npm run test:filters` | PASS (3,000 preset + 91,797 deep boundary assertions) |

# 2026-10-01 Sunlit Paper redesign (Build 20261001.01, v1.9.0)

Full visual redesign — theme: insurance comparison · healthy life · family love · sunshine.
Style: realistic light & shadow balanced with hand-drawn pencil lines and paper-fibre texture.
No insurance data, claims or citations changed.

## What changed

- **Design system** (`src/index.css`, `tailwind.config.js`, `index.html`): token names kept, values remapped
  (paper cream, ink plum, red = coral, jade = leaf, amber = sun, new `sky`); fonts LXGW WenKai TC (headings),
  Nunito + Noto Sans TC (body), Caveat (hand notes); paper-fibre texture (`public/textures/paper-fiber.svg`),
  pencil-frame cards, tactile pill buttons, marker/tape/scribble utilities.
- **3D hero** (`src/components/fx/three/sunny-hills.ts`): three.js paper-cut diorama — sun, clouds, six hill
  layers, house, trees, family under an umbrella, flowers, birds, pollen. Soft PCF shadows, generated paper
  texture + bump, jittered pencil outlines. Pointer parallax, scroll dolly, hover-to-hop family, click-sun burst.
  Lazy chunk; SVG `PaperHills` paints first and is the no-WebGL fallback; reduced motion renders a still frame;
  render loop stops off-screen.
- **Home sections**: washi-tape insurer marquee, pinned horizontal "life moments" category journey, notepad
  page-flip method story, clipboard comparison, sticky-note promises, pop-up guidebook, sunset CTA with family walk.
- **Site chrome**: floating paper navbar with hand-drawn active underline and sun-reveal mobile drawer; dusk footer
  with hills, moon and fireflies; sun scroll-progress bar.
- **Page transitions** (`src/components/fx/RouteFX.tsx`, `src/lib/route-theme.ts`): two-sheet torn-paper curtain
  per route (tint + doodle + label), route-specific enter choreography, and per-page header backdrops
  (category icons, scale, rising hearts, umbrellas, heartbeat + leaves, ruled notebook, paper stacks, sun).
- Removed unused `AuroraBackground`, `ParticleField`, `public/hero-harbour.svg`; redrew `guides-hero.svg`, `og-cover.svg`.
- `tests/anti-blur-tilt-card.test.mjs`: shadow/border literals updated to the new card stack; anti-blur
  invariants (no resting `translateZ(0)`, font smoothing, flat-at-rest, depth classes) unchanged.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | 218 pass, 0 fail |
| `npm run lint -- --max-warnings=0` | pass |
| `npm run build` | pass (three.js chunk 148 kB gzip, lazy) |
| `npm run test:filters` | pass |
| Desktop 1440×900, Claude in-app browser (Chromium) | home + all routes inspected |
| Mobile 375×812 emulation | hero, drawer inspected |
| Playwright Chromium (SwiftShader WebGL) walkthrough recording | `sunshine-redesign-walkthrough.mp4` (not committed) |

Not run: real-device iOS/Android, screen-reader pass, Lighthouse.

## Revision — realistic hand-drawn landing (Build 20261001.02)

Boss asked to drop the paper-cut look in favour of a **realistic hand-drawn** style themed on healthy living, sport and sunshine.

- Removed the paper-cut diorama (`sunny-hills.ts`, `SunnyHillsCanvas`, `PaperHills`), torn edges and washi tape.
- New WebGL "painter" (`src/components/fx/three/sketch-material.ts`, `painting.ts`): real photos rendered live as
  pencil contours (Sobel, boiling line jitter) + hatching + soft-banded watercolour washes, pigment pooling, blooms,
  deckled page edge and paper grain. Intro draws pencil first, then blooms colour; the pointer "paints" areas back
  towards the real photo; scroll/pointer give 2.5D depth parallax.
- Hero: sunlit road runner. Section 3: three.js ring of seven sketchbook pages (run, cycle, yoga, hike, dog run,
  picnic, family hike) — the page facing you is in colour, turning pages fade to pencil; each links to a category,
  followed by quick links to all categories. Final CTA: misty sunrise cyclists, painted when scrolled into view.
- Photos: Unsplash License, hot-linked from `images.unsplash.com` (CORS-enabled) — see `src/lib/landing-photos.ts`.
  No-WebGL2 / load failure falls back to the plain photo.

| Check | Result |
| --- | --- |
| `npm test` | 218 pass, 0 fail |
| `npm run lint -- --max-warnings=0` | pass |
| `npm run build` | pass |
| `npm run test:filters` | pass |
| Playwright Chromium (SwiftShader) 1440×900 + 390×844 screenshots, walkthrough recording | `sketch-landing-walkthrough.mp4` (not committed) |

## Revision — holiday destinations re-drawn by hand (Build 20261001.03)

Boss asked to base the hand-drawn art on real holiday-destination and holiday-activity photos found online.

- Searched Unsplash (free licence only) and verified every photo's location via its Unsplash location field;
  photos without a verified location were rejected. Data + credits: `src/lib/landing-photos.ts`.
- Hero is now a destination slideshow — Oía (Santorini), Positano (Amalfi Coast), Bannalpsee (Swiss Alps),
  Waikīkī (Hawai‘i), Pura Ulun Danu Bratan (Bali). Each change washes the old painting off, then re-sketches
  and re-paints the next (`PaintingHandle.setScene`). Auto-advances every 8.5 s while on screen; tabs for manual choice.
- Activity ring: cycling (Mallorca), surfing (Sunset Beach, O‘ahu), swimming (Pula, Croatia), kayaking (Thoddoo,
  Maldives), yoga (Ubud, Bali), hiking (Lenk, Switzerland), family beach day (San Diego) — each linked to a category.
- Final CTA: sunrise over the Sidemen rice terraces, Bali. Photographer credits listed under the CTA.
- Shader: `uSoftLod` keeps small carousel pages crisp; turning pages use fewer pencil strokes.

| Check | Result |
| --- | --- |
| `npm test` | 218 pass, 0 fail |
| `npm run lint -- --max-warnings=0` | pass |
| `npm run build` | pass |
| `npm run test:filters` | pass |
| Playwright Chromium (SwiftShader) 1440×900 every destination + 390×844 | inspected; `holiday-sketch-walkthrough.mp4` (not committed) |

## Revision — layered parallax, white base, 3D stickers & thick cards (Build 20261001.04)

- **White base**: paper tokens moved from cream to soft white (`--paper #FCFCFA`, cards `#FFFFFF`,
  `paper-2 #F4F3EF`, `paper-3 #E9E6DF`); paper-fibre overlay reduced to 16 %; shader paper whitened. Site-wide token change.
- **Layers** (`src/components/fx/Depth.tsx` `<Parallax>`): every landing section now has 3–5 planes moving at
  different speeds — hero painting lags (+160 px) while headline / CTA / stats peel apart, destination card and
  stickers fly faster; insurer lines slide in opposite directions; the 3D ring has a slow far layer (flight path)
  and a fast near layer (stickers); notes, clipboard, book and final CTA each have their own speeds.
- **3D stickers** (`<Sticker>`, `StickerArt.tsx`): 12 hand-drawn travel stickers (plane, suitcase, passport stamp
  with the destination's airport code, sunglasses, camera, palm, surfboard, bike, shell, sun, heart, shield) with a
  die-cut white edge, vinyl thickness, cast shadow, gloss, pointer tilt, and drag-and-snap-back (fine pointers only).
  Hero stickers also respond to pointer depth.
- **Thickness**: paper cards gain a 5–7 px stacked edge (deeper on hover); notepad shows a page block; clipboard
  is a thick board; sticky notes sit on a pad and tilt toward the pointer; guidebook has a page-block edge;
  category chips are thick pills that press down.

| Check | Result |
| --- | --- |
| `npm test` | 218 pass, 0 fail |
| `npm run lint -- --max-warnings=0` | pass |
| `npm run build` | pass |
| `npm run test:filters` | pass |
| Playwright Chromium (SwiftShader) 1440×900 + 390×844 | inspected; `layered-3d-walkthrough.mp4` (not committed) |

## Revision — themed hero, free-scroll ring, performance, VHIS premiums (Build 20261002.01)

1. **Holiday Moments ring no longer pins the page.** Wheel over the photos turns one page per notch (320 ms
   cooldown, ~60 px trackpad threshold) and releases the page at the first/last page; wheel anywhere else scrolls
   normally; touch: horizontal swipe turns, vertical scrolls (`touch-action: pan-y`). Verified with Playwright:
   3 notches over photos → page 4, scrollY unchanged; wheel at the left edge scrolls the page; at the last page the
   wheel scrolls on.
2. **Performance.** WebGL paintings and the ring now render on demand (intro/outro, pointer, brush fade, ≤2.5 s of
   pencil "boil" after activity), never because of scrolling (parallax is CSS); DPR capped at 1.25; fbm 5→4 octaves;
   removed `background-attachment: fixed`, the multiply-blended full-screen grain, hero/nav backdrop blurs and the
   extra spring on hero scroll progress; Lenis lerp 0.14→0.2. SwiftShader (CPU WebGL) idle frame time:
   hero 165→17 ms, ring 27→17 ms, lower page 173→20 ms (same as with canvases removed). Absolute numbers are
   CPU-emulated, not real-GPU timings.
3. **Hero = one slide per insurance type** (travel, pet — golden British Shorthair, home, medical, life, motor,
   accident). Eyebrow, headline, sub-copy, primary CTA (`/category/<id>`), tint, passport stamp and sticker set all
   change with the painting; copy cross-fades in one grid cell (CTA position constant: 520 px throughout a change at
   1440×900). Pauses while the pointer is over the copy. New stickers: paw, fish, house, key, medical cross, car, helmet.
4. **Nav:** 我的最愛 moved to the end (after 關於數據).
5. **Insurer cards:** product-count figure removed from the top-right.
6. **VHIS list:** hand-drawn notebook table (numbered pencil circles, dashed rows, highlighter hover, marker headers).
   生效日期 / 狀態 columns replaced by 保費範圍. A range is shown only when the product that cites the exact
   certification number states an explicit standard-plan figure (`標準計劃年繳保費（30歲）：男性約 HK$X／女性約 HK$Y`
   or the monthly equivalent) — 17 of 33 standard plans; it is labelled "30歲 · 男／女 · 本站快照" with the official
   table link. All other rows link to the official premium table; nothing is inferred. Non-active plans still carry a
   small 已終止註冊 / 只供續保 note under the name so they are not mistaken for plans on sale.
   `src/lib/vhis-premium.ts` + `tests/vhis-premium.test.mjs`.

| Check | Result |
| --- | --- |
| `npm test` | 222 pass, 0 fail |
| `npm run lint -- --max-warnings=0` | pass |
| `npm run build` | pass |
| `npm run test:filters` | pass |
| Playwright Chromium (SwiftShader) 1440×900 + 390×844 | all 7 hero themes, ring wheel behaviour, VHIS, insurers, nav |

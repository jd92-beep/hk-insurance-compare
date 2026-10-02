/**
 * Landing-page photography — one hero slide per insurance type, plus holiday activities.
 * All Unsplash License (free for commercial use; credited on the page anyway), served from
 * Unsplash's CORS-enabled CDN. Locations come from each photo's Unsplash location field.
 * The WebGL sketch shader re-draws every photo live as pencil + watercolour.
 */
const u = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&q=80&fm=jpg&fit=max`;

type Vec2 = [number, number];

/** sticker set shown on the hero for each theme */
export type StickerKind = "plane" | "suitcase" | "sunglasses" | "camera" | "paw" | "fish" | "house" | "key" | "cross" | "heart" | "sun" | "car" | "helmet" | "shield";

/**
 * Hero slides — one per insurance type. Each slide swaps the painting, headline, copy,
 * call-to-action and stickers together.
 */
export interface HeroSlide {
  id: string;
  /** insurance category this slide sells */
  category: string;
  tab: string;
  /** hand-lettered eyebrow */
  script: string;
  line1: string;
  line2: [string, string, string];
  sub: string;
  cta: string;
  stamp: string;
  stickers: [StickerKind, StickerKind, StickerKind, StickerKind];
  photo: string;
  alt: string;
  credit: string;
  /** image coordinate placed at the view centre (landscape screens put the subject right of the copy) */
  focus: { landscape: Vec2; portrait: Vec2 };
  sun: Vec2;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "travel",
    category: "travel",
    tab: "旅遊",
    script: "summer holiday",
    line1: "去到邊度玩，",
    line2: ["保障都", "跟住", "。"],
    sub: "聖托里尼睇日落、夏威夷游水、峇里做瑜伽——出發之前，逐項比較旅遊保險嘅醫療、行程取消同高危活動保障，附官方文件。",
    cta: "比較旅遊保險",
    stamp: "HKG → JTR",
    stickers: ["plane", "suitcase", "sunglasses", "camera"],
    photo: "photo-1563789031959-4c02bcb41319",
    alt: "聖托里尼伊亞嘅藍頂白教堂，望出愛琴海（Oía, Greece）",
    credit: "Dan",
    focus: { landscape: [0.36, 0.5], portrait: [0.5, 0.74] },
    sun: [0.86, 0.86],
  },
  {
    id: "pet",
    category: "pet",
    tab: "寵物",
    script: "purr-fect family",
    line1: "毛孩係屋企人，",
    line2: ["保障", "一齊", "諗。"],
    sub: "英短金漸層定唐貓唐狗，都係心肝寶貝——獸醫費賠幾多、先天疾病保唔保，逐份寵物保險條款對清楚。",
    cta: "比較寵物保險",
    stamp: "MEOW ♥",
    stickers: ["paw", "fish", "heart", "paw"],
    photo: "photo-1765603952522-d519e0fb7730",
    alt: "一隻金漸層英國短毛貓望住遠方",
    credit: "Zhen Yao",
    focus: { landscape: [0.3, 0.5], portrait: [0.45, 0.72] },
    sun: [0.88, 0.88],
  },
  {
    id: "home",
    category: "home",
    tab: "家居",
    script: "home sweet home",
    line1: "安樂窩，",
    line2: ["要保得", "穩陣", "。"],
    sub: "火險唔等於家居保——財物、責任、樓齡限制逐間比較，搵份啱你屋企嘅家居保險。",
    cta: "比較家居保險",
    stamp: "HOME ✓",
    stickers: ["house", "key", "sun", "heart"],
    photo: "photo-1580587771525-78b9dba3b914",
    alt: "陽光下有泳池嘅現代白色別墅",
    credit: "Ярослав Алексеенко",
    focus: { landscape: [0.34, 0.5], portrait: [0.5, 0.72] },
    sun: [0.84, 0.9],
  },
  {
    id: "medical",
    category: "medical",
    tab: "醫療",
    script: "stay healthy",
    line1: "健康第一，",
    line2: ["醫療保障", "睇清", "。"],
    sub: "自願醫保、高端醫療、Top-up 醫保——病房級別、自付費同分項限額並排對照，附官方文件。",
    cta: "比較醫療保險",
    stamp: "VHIS ✓",
    stickers: ["cross", "heart", "shield", "sun"],
    photo: "photo-1758691463331-2ac00e6f676f",
    alt: "醫生喺診所同媽媽一齊幫小朋友睇症",
    credit: "Vitaly Gariev",
    focus: { landscape: [0.32, 0.5], portrait: [0.55, 0.72] },
    sun: [0.86, 0.88],
  },
  {
    id: "life",
    category: "life",
    tab: "人壽",
    script: "for the ones you love",
    line1: "為最愛嘅人，",
    line2: ["諗", "長遠", "啲。"],
    sub: "同一保額同年期，核對人壽保險保費、健康申報同續保條款，為屋企人留一份安心。",
    cta: "比較人壽保險",
    stamp: "LOVE ♥",
    stickers: ["heart", "sun", "house", "heart"],
    photo: "photo-1767239650392-1f73d63b5652",
    alt: "一家人喺公園草地上開心野餐",
    credit: "Cuong Duyen Ceramics",
    focus: { landscape: [0.34, 0.5], portrait: [0.5, 0.72] },
    sun: [0.82, 0.88],
  },
  {
    id: "motor",
    category: "motor",
    tab: "汽車",
    script: "on the road",
    line1: "揸車去兜風，",
    line2: ["保障要", "坐定", "定。"],
    sub: "三保定全保？NCD、墊底費、維修限制，逐間汽車保險問清楚先上路。",
    cta: "比較汽車保險",
    stamp: "DRIVE ✓",
    stickers: ["car", "key", "sun", "shield"],
    photo: "photo-1785449890451-9208ec267582",
    alt: "一架藍色古典車停喺海邊，背後係山",
    credit: "Stepan",
    focus: { landscape: [0.34, 0.5], portrait: [0.5, 0.72] },
    sun: [0.84, 0.9],
  },
  {
    id: "accident",
    category: "accident",
    tab: "意外",
    script: "play safe",
    line1: "放膽去玩，",
    line2: ["意外", "有保障", "。"],
    sub: "小朋友踩車、大人運動，難免碰碰撞撞——意外醫療、永久傷殘賠償比例，邊份保障最全？",
    cta: "比較意外保險",
    stamp: "SAFE ✓",
    stickers: ["helmet", "shield", "heart", "sun"],
    photo: "photo-1777480011184-b2c45f9d772a",
    alt: "三個戴住頭盔嘅小朋友踩三輪車",
    credit: "Anna Khromova",
    focus: { landscape: [0.34, 0.5], portrait: [0.5, 0.72] },
    sun: [0.86, 0.88],
  },
];

export const slidePhoto = (s: HeroSlide, w = 1800) => u(s.photo, w);

export const SUNSET_PHOTO = {
  src: (w = 1800) => u("photo-1558005530-a7958896ec60", w),
  alt: "峇里 Sidemen 日出，有人行過翠綠梯田，遠處係阿貢火山",
  credit: "Geio Tischler",
  place: "Sidemen, Bali",
};

export interface Activity {
  id: string;
  photo: string;
  alt: string;
  title: string;
  note: string;
  place: string;
  credit: string;
  category: string;
  line: string;
}

export const ACTIVITIES: Activity[] = [
  { id: "cycle", photo: "photo-1665409267030-faa58dfcbcea", alt: "單車手喺馬略卡島山路踩單車", title: "海島踩單車", note: "ride the island", place: "Caimari, Mallorca", credit: "ZEIHLUND", category: "accident", line: "爬坡、落斜、轉彎——踩單車嘅意外保障睇清楚。" },
  { id: "surf", photo: "photo-1732919258486-06af4080a565", alt: "衝浪手喺夏威夷北岸駕馭大浪", title: "北岸衝浪", note: "catch a wave", place: "Sunset Beach, O‘ahu", credit: "Jonathan Caliguire", category: "travel", line: "衝浪、潛水算唔算高危活動？出發前睇清旅遊保。" },
  { id: "swim", photo: "photo-1535368294342-b2ac3bd2fa7b", alt: "有人喺克羅地亞普拉清澈海水入面游水", title: "地中海游水", note: "dive right in", place: "Pula, Croatia", credit: "David Boca", category: "high-end-medical", line: "喺外地睇醫生好貴，全球醫療保障點計？" },
  { id: "kayak", photo: "photo-1759675348333-947604617813", alt: "有人喺馬爾代夫碧綠海面划艇", title: "碧海划艇", note: "paddle slow", place: "Thoddoo, Maldives", credit: "Adam Juman", category: "home", line: "出門度假，屋企都要有人睇住——家居保險。" },
  { id: "yoga", photo: "photo-1600618528240-fb9fc964b853", alt: "女士喺峇里烏布嘅木平台上靜坐瑜伽", title: "烏布瑜伽", note: "breathe easy", place: "Ubud, Bali", credit: "Jared Rice", category: "medical", line: "身心放鬆之外，醫療開支都要有準備。" },
  { id: "hike", photo: "photo-1627551885247-f9301e1d6101", alt: "行山人士企喺瑞士倫克嘅山頂", title: "阿爾卑斯行山", note: "higher & higher", place: "Lenk, Switzerland", credit: "Dario Brönnimann", category: "critical-illness", line: "趁有體力去遠足；大病保障都要早啲睇。" },
  { id: "family", photo: "photo-1597524678053-5e6fef52d8a3", alt: "爸爸喺海灘孭住BB，媽媽喺旁邊笑", title: "海灘親子遊", note: "family time", place: "San Diego, California", credit: "Lawrence Crayton", category: "life", line: "同屋企人嘅每個假期，都值得一份長遠保障。" },
];

export const activityPhoto = (a: Activity, w = 1000) => u(a.photo, w);

/** everyone whose photo is re-drawn on the landing page */
export const PHOTO_CREDITS = [
  ...HERO_SLIDES.map((d) => `${d.credit}（${d.tab}）`),
  ...ACTIVITIES.map((a) => `${a.credit}（${a.place}）`),
  `${SUNSET_PHOTO.credit}（${SUNSET_PHOTO.place}）`,
];

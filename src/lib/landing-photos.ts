/** Original AI-generated watercolor illustrations; see docs/review/2026-10-02-illustrations.md. */
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
    photo: "/illustrations/travel.webp",
    alt: "亞洲旅伴拖住行李喼出發，海旁機場上有飛機飛過",
    credit: "AI 原創插畫",
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
    photo: "/illustrations/pet.webp",
    alt: "女士同跳起嘅哥基玩耍，金漸層貓坐喺野餐籃上",
    credit: "AI 原創插畫",
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
    photo: "/illustrations/home.webp",
    alt: "伴侶喺香港新居拆箱，接住飛起嘅咕𠱸",
    credit: "AI 原創插畫",
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
    photo: "/illustrations/medical.webp",
    alt: "女醫生喺明亮診所同成年病人傾談及檢查",
    credit: "AI 原創插畫",
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
    photo: "/illustrations/life.webp",
    alt: "一家三代喺海旁公園相聚，爸爸抱起小朋友",
    credit: "AI 原創插畫",
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
    photo: "/illustrations/motor.webp",
    alt: "伴侶喺停泊嘅汽車旁準備出發",
    credit: "AI 原創插畫",
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
    photo: "/illustrations/accident.webp",
    alt: "戴好頭盔嘅朋友喺海旁單車徑踩單車",
    credit: "AI 原創插畫",
    focus: { landscape: [0.34, 0.5], portrait: [0.5, 0.72] },
    sun: [0.86, 0.88],
  },
];

export const slidePhoto = (s: HeroSlide) => s.photo;

export const SUNSET_PHOTO = {
  src: () => "/illustrations/life.webp",
  alt: "一家人喺陽光下嘅海旁公園相聚",
};

export interface Activity {
  id: string;
  photo: string;
  alt: string;
  title: string;
  note: string;
  category: string;
  line: string;
}

/** One scene per category: artwork, caption and destination always travel together. */
export const ACTIVITIES: Activity[] = [
  {"id": "travel", "category": "travel", "photo": "/illustrations/travel.webp", "alt": "亞洲旅伴拖住行李喼出發，海旁機場上有飛機飛過", "title": "帶住安心出發", "note": "ready for take-off", "line": "出發前，對照醫療、行程取消同活動限制。"},
  {"id": "medical", "category": "medical", "photo": "/illustrations/medical.webp", "alt": "女醫生喺明亮診所同成年病人傾談及檢查", "title": "照顧每日健康", "note": "care for you", "line": "病房級別、自付費同分項限額逐項睇。"},
  {"id": "high-end-medical", "category": "high-end-medical", "photo": "/illustrations/high-end-medical.webp", "alt": "病人同家人喺私人病房與醫生傾談", "title": "多一份醫療選擇", "note": "room to recover", "line": "高端醫療要核對保障地區、醫院網絡同限額。"},
  {"id": "top-up-medical", "category": "top-up-medical", "photo": "/illustrations/top-up-medical.webp", "alt": "上班族同醫療顧問拼合兩塊醫療保障盾牌", "title": "補足醫療缺口", "note": "a little extra care", "line": "已有公司醫保？先睇自付費同補充保障點銜接。"},
  {"id": "home", "category": "home", "photo": "/illustrations/home.webp", "alt": "伴侶喺香港新居拆箱，接住飛起嘅咕𠱸", "title": "守住安樂窩", "note": "home sweet home", "line": "家居財物、漏水同第三者責任，一齊比較。"},
  {"id": "life", "category": "life", "photo": "/illustrations/life.webp", "alt": "一家三代喺海旁公園相聚，爸爸抱起小朋友", "title": "陪最愛行得更遠", "note": "for the ones you love", "line": "同一保額同年期，對照人壽保障同續保條件。"},
  {"id": "critical-illness", "category": "critical-illness", "photo": "/illustrations/critical-illness.webp", "alt": "伴侶喺家中陪伴休養人士並遞上暖茶", "title": "休養有人同行", "note": "time to recover", "line": "危疾定義、等候期同多重賠償，睇清楚先揀。"},
  {"id": "accident", "category": "accident", "photo": "/illustrations/accident.webp", "alt": "戴好頭盔嘅朋友喺海旁單車徑踩單車", "title": "放心享受活動", "note": "move with joy", "line": "踩車同運動之前，核對意外醫療同傷殘保障。"},
  {"id": "motor", "category": "motor", "photo": "/illustrations/motor.webp", "alt": "伴侶喺停泊嘅汽車旁準備出發", "title": "準備好再上路", "note": "on the road", "line": "三保、全保、NCD 同墊底費，逐間比較。"},
  {"id": "domestic-helper", "category": "domestic-helper", "photo": "/illustrations/domestic-helper.webp", "alt": "家傭同僱主及小朋友一齊照顧陽台植物", "title": "照顧屋企每一位", "note": "care goes both ways", "line": "照顧家傭嘅醫療、僱員補償同其他保障需要。"},
  {"id": "pet", "category": "pet", "photo": "/illustrations/pet.webp", "alt": "女士同跳起嘅哥基玩耍，金漸層貓坐喺野餐籃上", "title": "毛孩都係屋企人", "note": "paws together", "line": "獸醫費、自付比例同先天疾病限制逐項睇。"},
 ];

export const activityPhoto = (a: Activity) => a.photo;
export const PHOTO_CREDITS = ["11 幅 AI 原創水彩插畫；人物屬虛構，並非任何藝人或保險公司代言。", "造型參考：UNIQLO LifeWear 綾瀨遙及 New Balance IU 官方形象照。"];

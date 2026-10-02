/**
 * Landing-page photography — holiday destinations & holiday activities.
 * All Unsplash License (free for commercial use; credited on the page anyway), served from
 * Unsplash's CORS-enabled CDN. Locations come from each photo's Unsplash location field.
 * The WebGL sketch shader re-draws every photo live as pencil + watercolour.
 */
const u = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&q=80&fm=jpg&fit=max`;

type Vec2 = [number, number];

export interface Destination {
  id: string;
  photo: string;
  /** hand-lettered caption */
  script: string;
  /** nearest airport, for the passport-stamp sticker */
  iata: string;
  name: string;
  place: string;
  alt: string;
  credit: string;
  /** image coordinate placed at the view centre (landscape screens put the subject right of the copy) */
  focus: { landscape: Vec2; portrait: Vec2 };
  sun: Vec2;
}

export const DESTINATIONS: Destination[] = [
  {
    id: "oia",
    iata: "JTR",
    photo: "photo-1563789031959-4c02bcb41319",
    script: "Santorini",
    name: "聖托里尼 · 伊亞",
    place: "Oía, Greece",
    alt: "聖托里尼伊亞嘅藍頂白教堂，望出愛琴海",
    credit: "Dan",
    focus: { landscape: [0.36, 0.5], portrait: [0.5, 0.74] },
    sun: [0.86, 0.86],
  },
  {
    id: "positano",
    iata: "NAP",
    photo: "photo-1568282167464-cb0d811b05c2",
    script: "Amalfi Coast",
    name: "阿瑪菲海岸 · 波西塔諾",
    place: "Positano, Italy",
    alt: "波西塔諾依山而建嘅彩色小鎮同海灘",
    credit: "Letizia Agosta",
    focus: { landscape: [0.4, 0.5], portrait: [0.6, 0.74] },
    sun: [0.88, 0.88],
  },
  {
    id: "bannalpsee",
    iata: "ZRH",
    photo: "photo-1561963693-3099f378e3fa",
    script: "Swiss Alps",
    name: "瑞士阿爾卑斯 · 班納爾普湖",
    place: "Bannalpsee, Switzerland",
    alt: "瑞士班納爾普湖畔草坡上嘅小屋，背後係雪山",
    credit: "Josip Ivanković",
    focus: { landscape: [0.36, 0.5], portrait: [0.5, 0.74] },
    sun: [0.8, 0.88],
  },
  {
    id: "waikiki",
    iata: "HNL",
    photo: "photo-1755170517016-92ab511cef0f",
    script: "Hawai‘i",
    name: "夏威夷 · 威基基海灘",
    place: "Waikīkī Beach, Honolulu",
    alt: "威基基海灘嘅碧藍海水同鑽石頭山",
    credit: "Yu",
    focus: { landscape: [0.42, 0.5], portrait: [0.6, 0.74] },
    sun: [0.84, 0.88],
  },
  {
    id: "bratan",
    iata: "DPS",
    photo: "photo-1544644181-1484b3fdfc62",
    script: "Bali",
    name: "峇里 · 布拉坦湖水神廟",
    place: "Pura Ulun Danu Bratan, Bali",
    alt: "峇里布拉坦湖上嘅水神廟，岸邊開滿花",
    credit: "Sebastian Pena Lambarri",
    focus: { landscape: [0.36, 0.5], portrait: [0.5, 0.74] },
    sun: [0.82, 0.88],
  },
];

export const destinationPhoto = (d: Destination, w = 1800) => u(d.photo, w);

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
  ...DESTINATIONS.map((d) => `${d.credit}（${d.place}）`),
  ...ACTIVITIES.map((a) => `${a.credit}（${a.place}）`),
  `${SUNSET_PHOTO.credit}（${SUNSET_PHOTO.place}）`,
];

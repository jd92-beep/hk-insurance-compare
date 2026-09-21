/**
 * Insurer brand color mapping for visual distinction across cards
 * 每一間保險公司專屬的 highlight 顏色，讓卡片頂部與寶石圖標各具特色
 */

export const INSURER_BRAND_COLORS: Record<string, string> = {
  // 常用鍵值（小寫）與英文名稱正規化
  'aia': '#D31145',         // 友邦 AIA 經典紅
  'axa': '#003789',         // 安盛 AXA 寶藍
  'bowtie': '#E83B6D',      // 保泰 Bowtie 桃粉紅
  'bupa': '#0079C1',        // 保柏 Bupa 標誌藍
  'cigna': '#007E7A',       // 信諾 Cigna 藍綠 / Teal
  'fwd': '#E87722',         // 富衛 FWD 亮橙
  'manulife': '#009743',    // 宏利 Manulife 翠綠
  'prudential': '#ED1B2E',  // 保誠 Prudential 鮮紅
  'sun life': '#D97706',    // 永明 Sun Life 暖金黃
  'sun-life': '#D97706',
  'china life': '#00823B',  // 中國人壽 國壽綠
  'china-life': '#00823B',
  'china life (overseas)': '#00823B',
  'china taiping': '#C8102E',// 中國太平 太平紅
  'china-taiping': '#C8102E',
  'boc group insurance': '#B81C22', // 中銀集團保險 深紅
  'boc group': '#B81C22',
  'boc-group': '#B81C22',
  'zurich': '#1B4D89',      // 蘇黎世 Zurich 經典藍
  'aig': '#00A3E0',         // 美亞 AIG 水天藍
  'blue cross': '#005596',  // 藍十字 海軍藍
  'blue-cross': '#005596',
  'asia insurance': '#006F70', // 亞洲保險 青碧藍
  'asia-insurance': '#006F70',
  'avo': '#7CB305',         // 安我 Avo 活力青草綠
  'onedegree': '#6C5CE7',   // OneDegree 數碼紫
  'generali': '#C3002F',    // 忠意 Generali 經典紅
  'msig': '#002B49',        // 三井住友 MSIG 深海藍
  'hang seng': '#007D46',   // 恒生保險 墨綠
  'hang-seng': '#007D46',
  'hsbc': '#DB0011',        // 滙豐保險 滙豐紅
  'dah sing': '#185A9D',    // 大新保險 寶石藍
  'dah-sing': '#185A9D',
  'qbe': '#0083CA',         // 昆士蘭保險 天藍
  'yf life': '#004B87',     // 萬通保險 深海藍
  'yf-life': '#004B87',
  'allianz': '#0038A8',     // 安聯 Allianz 湛藍
  'chubb': '#5D2E8C',       // 安達 Chubb 尊貴紫

  // 中文名稱別名映射
  '友邦': '#D31145',
  '友邦保險': '#D31145',
  '安盛': '#003789',
  '安盛保險': '#003789',
  '保泰': '#E83B6D',
  '保泰人壽': '#E83B6D',
  '保柏': '#0079C1',
  '保柏保險': '#0079C1',
  '保柏（亞洲）': '#0079C1',
  '信諾': '#007E7A',
  '信諾環球': '#007E7A',
  '富衛': '#E87722',
  '富衛保險': '#E87722',
  '富衛人壽': '#E87722',
  '宏利': '#009743',
  '宏利人壽': '#009743',
  '保誠': '#ED1B2E',
  '保誠保險': '#ED1B2E',
  '永明': '#D97706',
  '香港永明金融': '#D97706',
  '中國人壽': '#00823B',
  '中國太平': '#C8102E',
  '中銀集團': '#B81C22',
  '中銀集團保險': '#B81C22',
  '蘇黎世': '#1B4D89',
  '藍十字': '#005596',
  '安我': '#7CB305',
  '安我保險': '#7CB305',
  '滙豐': '#DB0011',
  '滙豐保險': '#DB0011',
  '恒生': '#007D46',
  '恒生保險': '#007D46',
  '萬通': '#004B87',
  '萬通保險': '#004B87',
  '大新': '#185A9D',
  '大新保險': '#185A9D',
  '安聯': '#0038A8',
  '安達': '#5D2E8C',
};

const COLOR_PALETTE = [
  '#0E7C66', // 翡翠綠
  '#2563EB', // 皇家藍
  '#D97706', // 琥珀金
  '#DC2626', // 亮紅
  '#7C3AED', // 紫羅蘭
  '#0891B2', // 青藍
  '#E83B6D', // 桃紅
  '#4F46E5', // 靛藍
  '#059669', // 森林綠
  '#EA580C', // 珊瑚橙
];

/**
 * 取得保險公司的專屬識別顏色
 */
export function getInsurerColor(insurer: string): string {
  if (!insurer) return '#0E7C66';
  const clean = insurer.toLowerCase().trim();
  if (INSURER_BRAND_COLORS[clean]) {
    return INSURER_BRAND_COLORS[clean];
  }
  for (const [key, color] of Object.entries(INSURER_BRAND_COLORS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return color;
    }
  }
  // Deterministic fallback by string hash
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

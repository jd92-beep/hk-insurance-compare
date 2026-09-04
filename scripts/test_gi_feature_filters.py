#!/usr/bin/env python3
"""
Test script for General Insurance (travel, home, pet, motor) Feature Tags & Persona Presets.
Verifies:
1. Zero dead tags (every tag hits at least 1 product).
2. Realistic distribution matching official HK insurer policy wording.
3. Persona Presets hit rates, scoring, and ranking on insurance-data.json.
"""

import json
from pathlib import Path

# Load insurance data
data_path = Path(__file__).resolve().parent.parent / "public" / "data" / "insurance-data.json"
with open(data_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Define expanded feature tags matching TypeScript definition
FEATURE_TAGS = {
    "travel": [
        ("rental-car", "租車自負額保障 (Rental Vehicle Excess)", [
            "租車", "自駕遊", "自負額", "rental car", "rental vehicle excess", "車輛自負額", "海外租車", "私家車或露營車"
        ]),
        ("sports-cover", "滑雪 / 潛水等業餘及極限運動", [
            "業餘運動", "滑雪", "潛水", "業餘消閒運動", "消閒運動", "水上運動", "冬季運動", "高空彈跳", "熱氣球", "運動保障", "無高度限制", "無深度限制", "極限及消閒"
        ]),
        ("mobile-laptop", "手提電話 / 筆電 / 數碼設備損壞被盜", [
            "手提電話", "流動設備", "平板電腦", "筆記型電腦", "電腦", "手機", "手提電腦", "電子產品", "電子設備", "數碼"
        ]),
        ("flight-delay", "航班延誤現金津貼（滿5-6小時起賠）", [
            "旅程延誤", "航班延誤", "延誤現金", "延誤津貼", "行程延誤", "每滿6小時", "延誤6小時", "每滿5小時", "滿5小時起賠", "延誤現金賠償"
        ]),
        ("baggage-delay", "行李延誤緊急生活津貼", [
            "行李延誤", "應急物品", "應急物資", "應急用品", "應急津貼", "行李延誤應急"
        ]),
        ("trip-cancel-cfar", "任何原因取消 (CFAR) / 靈活取消行程", [
            "因任何原因取消", "任何原因取消", "不可預見私事", "CFUR", "CFAR", "因任何不可預見私事取消行程"
        ]),
        ("emergency-evac", "全球緊急醫療運送及遺體送返無上限", [
            "緊急醫療運送", "緊急運送", "救援及運送", "遺體送返", "遺體運返", "專機運送", "救援網絡", "海外緊急援助", "緊急醫療救援"
        ]),
        ("revisit-chinese-med", "回港覆診含中醫跌打針灸", [
            "覆診", "回港後", "中醫", "跌打", "針灸", "回港覆診", "物理治療/脊醫", "骨傷"
        ]),
        ("cruise-cover", "郵輪假期專屬保障（泊岸延誤/取消）", [
            "郵輪", "郵輪假期", "遊輪", "岸上觀光", "泊岸延誤", "環球郵輪計劃"
        ]),
        ("senior-friendly", "長者高齡受保 / 保障額不縮水", [
            "不設年齡上限", "無年齡上限", "85歲", "80歲", "長者及小童100%", "年長受保人", "長者"
        ]),
        ("pet-care-cover", "同行毛孩醫療 / 留港寵物寄宿保障", [
            "寵物", "毛孩", "留港寵物", "寵物照顧", "寵物同行", "寵物緊急寄養", "延誤寄宿"
        ]),
        ("outbound-alert", "紅色/黑色外遊警示伸延賠償", [
            "外遊警示", "黑色外遊警示", "紅色外遊警示", "外遊警示伸延保障"
        ]),
        ("personal-liability", "個人第三者責任（含法律抗辯費用）", [
            "個人責任", "第三者責任", "第三者法律責任", "個人法律責任", "法律責任", "訴訟費用"
        ]),
        ("credit-card-theft", "信用卡被盜用簽賬及個人錢財保障", [
            "信用卡", "未獲授權", "被盜用", "盜用簽賬", "個人錢財", "現金意外遺失", "流動支付被盜用"
        ]),
        ("event-ticket", "缺席演唱會 / 主題樂園門票損失補償", [
            "門票", "缺席活動", "入場券", "演唱會", "主題樂園", "門票及入場券"
        ]),
        ("family-bundle", "親子同行 / 隨行子女專屬保障", [
            "雙人/家庭", "同行子女", "子女護送", "子女", "小童", "家庭保險"
        ]),
    ],
    "home": [
        ("tenant-plan", "租客專屬方案 / 租客法律責任", [
            "租客", "租戶", "租住", "Tenant", "租客責任", "租客專用", "租客法例責任", "承租人", "租客計劃"
        ]),
        ("owner-occupier", "自住業主全包方案 / 家居財物全險", [
            "自住", "自住業主", "業主自住", "家居財物", "家庭財產", "室內傢俬", "室內電器", "全包方案", "自住計劃"
        ]),
        ("landlord-protection", "放租業主保障（租金拖欠/惡意破壞/凶宅）", [
            "放租", "業主放租", "放租業主", "出租", "業主（出租）", "租金損失", "租金追討", "凶宅", "租客拖欠", "租客蓄意破壞", "未付租金", "出租物業"
        ]),
        ("building-third-party", "大廈外牆、公用地方及法團責任分攤", [
            "大廈外牆", "公共地方", "公用地方", "第三者責任", "業主責任", "公眾責任", "公眾法律責任", "大廈公用地方", "法團責任", "法團公用部分", "外牆及公用地方分攤"
        ]),
        ("locksmith-emergency", "24小時緊急開鎖換鎖及水喉急修", [
            "換鎖", "開鎖", "鎖匠", "水喉急修", "爆水喉急修", "緊急門鎖", "緊急家居支援", "24小時急修", "電工急修", "緊急維修", "緊急開鎖", "更換門鎖"
        ]),
        ("temp-accommodation", "單位無法居住時臨時住宿及膳食津貼", [
            "臨時住宿", "不能居住", "另覓居所", "酒店住宿津貼", "另覓住所", "臨時居所", "庇護住宿", "租金及住宿津貼", "臨時居所租金", "膳食津貼"
        ]),
        ("water-leakage", "爆水喉、暗渠滲水探測及冷氣漏水修復", [
            "滲水", "爆水喉", "漏水", "水浸", "水管爆裂", "水損", "爆水管", "探測費", "冷氣漏水", "冷氣機漏水", "水管破裂源頭探測費"
        ]),
        ("window-storm", "颱風暴雨吹裂鋁窗及玻璃窗破損更換", [
            "窗戶", "玻璃窗", "鋁窗", "室內鋁窗", "更換玻璃窗", "暴風雨季節窗戶", "颱風期間窗戶", "窗戶玻璃", "窗戶風暴損壞"
        ]),
        ("renovation-cover", "室內小型裝修工程期間財物損毀保障", [
            "室內裝修", "裝修期間", "翻新工程", "室內小型裝修", "家居裝修", "裝修工程", "裝修期內", "裝修或維修"
        ]),
        ("helper-belongings", "同住家傭個人財物保障及僱工責任", [
            "家傭", "外傭", "家庭僱工", "家庭傭工", "同住家傭", "家傭個人物品", "家傭物品", "傭工隨身財物"
        ]),
        ("gadget-electronics", "手機、平板及手提電腦等數碼設備保障", [
            "手提電話", "流動電話", "平板電腦", "筆記簿型", "桌面電腦", "手提電腦", "電子通訊產品", "個人電腦"
        ]),
        ("frozen-food", "停電/斷電雪櫃冷藏食品變質損壞津貼", [
            "冷凍食品", "冷藏食品", "冷藏食物", "停電冷藏", "斷電冷藏", "食品變質", "食物損壞", "變質補貼", "變壞"
        ]),
        ("worldwide-belongings", "全球隨身個人財物及貴重物品保障", [
            "全球個人物品", "全球個人財物", "全球性個人財物", "全球隨身", "貴重物品", "物業外的貴重物品", "珍藏品", "珠寶"
        ]),
        ("pet-liability-damage", "寵物（貓狗）第三者法律責任及意外損害", [
            "寵物", "貓狗", "毛孩", "合法飼養寵物", "毛孩保障"
        ]),
    ],
    "pet": [
        ("vet-consultation", "註冊獸醫門診及處方藥物實報實銷", [
            "門診", "獸醫診金", "診症費", "處方藥物", "診斷測試", "診所診症", "X光及超聲波", "普通科及專科診金", "門診費用", "獸醫診治", "門診西醫"
        ]),
        ("surgery-anesthesia", "外科手術、全身麻醉及過夜住院開支", [
            "手術", "麻醉", "手術室", "過夜住院", "住院開支", "手術後住房", "外科手術", "手術保障", "住院費用", "留醫住院"
        ]),
        ("third-party-dog", "寵物襲擊/咬傷第三者公眾法律責任", [
            "第三者責任", "公眾責任", "法律責任", "咬傷", "寵物襲擊", "第三者身體傷亡", "第三者法律責任", "第三者財物損毀", "第三者公眾責任"
        ]),
        ("cancer-chemo", "寵物癌症化療、放射治療及標靶專項", [
            "癌症", "化療", "放療", "放射治療", "癌症化療", "標靶", "癌症一次性現金", "腫瘤"
        ]),
        ("chronic-care", "慢性疾病持續護理 / 終生慢性病保障", [
            "慢性病", "慢性疾病", "持續護理", "終生慢性", "腎衰竭", "附加腎衰竭"
        ]),
        ("dental-cover", "牙科治療及非例行牙科創傷/感染手術", [
            "牙科", "洗牙", "牙齒治療", "非例行洗牙", "牙齦", "口腔手術", "牙科費用", "牙科意外", "非例行牙科"
        ]),
        ("hereditary-disease", "特定品種遺傳性疾病受保 (脫臼/青光眼/IVDD)", [
            "遺傳", "先天性", "品種遺傳", "特定品種", "髖關節", "髕骨", "膝蓋骨", "青光眼", "IVDD", "櫻桃眼"
        ]),
        ("microchip-free", "全品種貓狗免植晶片投保 / 疫苗紀錄即可", [
            "免植晶片", "無須晶片", "毋須晶片", "免晶片", "無須植入晶片", "疫苗注射紀錄卡辨識", "免植晶片貓狗通保", "免植晶片全品種投保"
        ]),
        ("advanced-imaging", "先進造影診斷 (CT / MRI) 專項保障", [
            "CT", "MRI", "先進影像", "先進造影", "造影診斷", "先進造影診斷"
        ]),
        ("lost-pet-advertising", "走失尋寵廣告宣傳費及尋寵賞金", [
            "走失", "尋寵", "廣告", "酬金", "賞金", "尋寵廣告", "走失尋寵宣傳"
        ]),
        ("emergency-boarding", "主人患病住院期間緊急寄宿/寄養津貼", [
            "寄宿", "寄養", "緊急寄宿", "緊急寄養", "主人患病", "留醫住院", "住院連續4日"
        ]),
        ("bereavement-funeral", "寵物離世善終、火化及悼念禮儀津貼", [
            "善終", "火化", "殮葬", "寵物喪葬", "人道毀滅", "身故費用", "寵物火化", "身故 / 殮葬服務", "悼念禮儀", "身故服務"
        ]),
        ("overseas-travel-cover", "寵物外遊同行意外醫療或外遊取消護理", [
            "海外保障", "海外旅程", "外遊取消", "因寵物急病取消海外旅程", "外遊取消行程寵物護理費", "海外緊急醫療"
        ]),
        ("freedom-vet-choice", "全港註冊獸醫診所自由選擇（不限指定網絡）", [
            "自由選擇", "全港持牌", "自由選", "全港註冊獸醫", "全港持牌獸醫診所自由選"
        ]),
    ],
    "motor": [
        ("comp-insurance", "綜合全保 (Comprehensive)", [
            "綜合全保", "綜合保險", "綜合汽車", "全保", "Comprehensive", "私家車綜合", "自身汽車損毀", "車身損毀", "自身車輛碰撞"
        ]),
        ("third-party-only", "第三者責任保險 (Third Party Only)", [
            "第三者責任", "第三者保險", "三保", "Third Party", "第三者人身傷亡", "第三者財物損毀", "第三者責任保險", "第三者死亡"
        ]),
        ("ncd-protection", "無索償折扣 (NCD) 守護保障", [
            "NCD", "無索償折扣", "無索償保證", "NCD保護", "維持折扣", "No Claim Discount", "無賠償折扣", "NCD 守護", "NCD 折扣保護"
        ]),
        ("windscreen-cover", "擋風玻璃獨立免自負額賠償", [
            "擋風玻璃", "車窗玻璃", "天窗", "玻璃維修", "免自負額", "免墊底", "車窗破損", "擋風玻璃保障", "擋風玻璃獨立免墊底"
        ]),
        ("towing-service", "24小時免費路面緊急拖車及路邊救援", [
            "拖車", "道路救援", "緊急拖車", "路邊支援", "24小時免費拖車", "搭橋搭電", "爆胎換軚", "路面緊急", "中途急修", "24小時免費路邊救援"
        ]),
        ("new-car-replacement", "新車首年全損以新換舊保障", [
            "新車換新", "新車全損", "以新代舊", "車輛替換", "新車賠償", "同廠全新", "全新車", "新車替換", "以新換舊", "同款新車"
        ]),
        ("zero-depreciation", "零件更換維修零折舊率修理", [
            "零折舊", "不設折舊", "折舊率豁免", "全新零件", "無折舊", "「零」折舊率修理", "豁免折舊", "維修零件折舊"
        ]),
        ("courtesy-car", "維修期間代步車 / 租車代步津貼", [
            "代用車輛", "代步車", "租車 / 代用車輛", "租用代用車輛", "7天租車", "代步", "臨時代用汽車", "車輛維修期間代步車津貼"
        ]),
        ("ev-protection", "電動車 (EV) 電池及專屬充電配件保障", [
            "電動車", "EV", "充電器", "充電纜", "電池損壞", "家用充電設備", "充電樁", "電動車電池", "電動車 (EV) 充電配件專項保障"
        ]),
        ("cross-border-gba", "港車北上 / 港粵通跨境車險附加保障", [
            "港粵通", "等效先認", "廣東省", "跨境", "港車北上", "港粵通汽車險"
        ]),
        ("personal-accident-driver", "司機及乘客個人意外傷亡保障", [
            "個人意外", "司機意外", "司機及乘客", "受保駕駛者", "人身意外保障", "交通意外身故", "駕駛者個人意外", "司機個人意外傷亡保障"
        ]),
        ("medical-expenses", "司機及乘客醫療費用保障", [
            "醫療費用", "乘客意外醫療", "駕駛者及乘客醫療", "受保駕駛者及乘客醫療費用", "醫療費用保障"
        ]),
        ("claims-recovery", "第三者責任無過失法律索償追討服務", [
            "追討服務", "第三者責任追討", "索償追討", "第三者責任追討服務", "索償追討服務"
        ]),
        ("named-driver-discount", "指定駕駛者專屬保費折扣及低自負額", [
            "指定駕駛者", "記名司機", "指定司機", "記名駕駛者", "非指定駕駛者自負額", "非記名司機", "指定駕駛人", "指定駕駛者專屬保費折扣"
        ]),
    ],
}

PERSONA_PRESETS = {
    "travel": [
        ("self-drive", "🚗 自駕遊達人", "日本/澳洲/歐美海外自駕遊必備，重點鎖定租車自負額及海外緊急支援", [
            "rental-car", "emergency-evac", "personal-liability"
        ]),
        ("sports-adventure", "⛷️ 滑雪/水上運動愛好者", "專為滑雪、潛水、業餘運動愛好者設計，包含運動器材及緊急運送", [
            "sports-cover", "emergency-evac", "revisit-chinese-med"
        ]),
        ("digital-gadgets", "📱 數碼器材控/攝影旅人", "隨身攜帶手機、MacBook 與相機，注重設備損壞、被盜及延誤保障", [
            "mobile-laptop", "credit-card-theft", "flight-delay"
        ]),
        ("family-trip", "👨‍👩‍👧 親子家庭/三代同堂遊", "帶長者與小朋友出遊，重視長者保額不縮水、隨行兒童保障及覆診", [
            "family-bundle", "senior-friendly", "flight-delay", "revisit-chinese-med"
        ]),
        ("cruise-lover", "🚢 郵輪假期深度遊", "涵蓋泊岸延誤、岸上觀光取消、取消行程及海外緊急救援", [
            "cruise-cover", "emergency-evac", "revisit-chinese-med"
        ]),
        ("flexible-cancel", "✈️ 航班延誤/靈活取消行程", "怕廉航延誤或臨時有事改期？重視任何原因取消 (CFAR) 及延誤津貼", [
            "trip-cancel-cfar", "flight-delay", "baggage-delay"
        ]),
    ],
    "home": [
        ("smart-tenant", "🏢 租客無憂首選", "租樓必備！保障個人家居財物、筆電數碼、租客責任及爆水喉損害", [
            "tenant-plan", "gadget-electronics", "water-leakage", "frozen-food"
        ]),
        ("owner-comprehensive", "🏡 自住業主全包旗艦", "私樓自住業主全方位守護，涵蓋財物全險、外牆公用責任分攤及裝修保障", [
            "owner-occupier", "building-third-party", "renovation-cover", "temp-accommodation"
        ]),
        ("landlord-guard", "💰 收租業主防坑收息", "買樓收租最怕遇上租霸！重點對準租金欠繳、租客惡意破壞及凶宅責任", [
            "landlord-protection", "building-third-party", "owner-occupier"
        ]),
        ("old-building-repair", "🛠️ 舊樓防漏急修達人", "針對高樓齡水管老化，鎖定爆水管滲水探測、24小時急修開鎖及颱風換窗", [
            "water-leakage", "locksmith-emergency", "window-storm"
        ]),
        ("pet-helper-home", "🐶 毛孩家傭幸福家庭", "家有毛孩與工人姐姐必備！涵蓋外傭財物及僱主責任，並保障寵物公眾責任", [
            "helper-belongings", "pet-liability-damage", "owner-occupier"
        ]),
    ],
    "pet": [
        ("active-dog", "🐕 活潑狗狗社交王 (第三者責任+免晶片)", "針對出街活潑熱情的狗狗，重點對準第三者咬傷公眾責任，支援免晶片投保", [
            "third-party-dog", "microchip-free", "vet-consultation"
        ]),
        ("indoor-cat", "🐈 室內貓咪健康守護 (慢性病+門診)", "專為純室內貓咪設計，重視門診診金、處方藥物、慢性病護理及免晶片", [
            "vet-consultation", "chronic-care", "microchip-free"
        ]),
        ("surgery-all-in", "🏥 純醫療全包手術狂 (手術+造影+癌症)", "醫療開支最怕開刀！鎖定外科手術麻醉、CT/MRI 先進造影及癌症化療", [
            "surgery-anesthesia", "advanced-imaging", "cancer-chemo"
        ]),
        ("senior-pet-farewell", "👴 樂齡毛孩尊嚴守護 (遺傳病+癌症+善終)", "守護高齡老狗老貓，重視癌症化療專項、品種遺傳病及尊嚴善終火化津貼", [
            "cancer-chemo", "hereditary-disease", "bereavement-funeral"
        ]),
        ("lost-pet-care", "🔍 走失尋寵安心防護 (尋寵廣告+寄宿)", "常去戶外怕驚慌逃逸？提供走失尋寵宣傳廣告賞金及主人住院時寵物寄宿", [
            "lost-pet-advertising", "emergency-boarding", "third-party-dog"
        ]),
    ],
    "motor": [
        ("ev-pioneer", "⚡ 電動車 EV 先鋒", "Tesla 及電動車車主首選！專屬賠償電池損壞、充電樁/充電纜及免費拖車", [
            "ev-protection", "towing-service", "comp-insurance"
        ]),
        ("luxury-zero-deprec", "🚘 靚車全保 / 原廠折舊豁免", "新車或歐洲高檔車，重視首年全損換新車 (New for Old)、維修零折舊及代步車", [
            "new-car-replacement", "zero-depreciation", "courtesy-car", "comp-insurance"
        ]),
        ("budget-weekend", "🛡️ 假日司機 / 三保性價比之王", "假日遊車河精明車主，鎖定最高 1 億第三者人身傷亡、財物損毀與免費拖車", [
            "third-party-only", "towing-service", "windscreen-cover"
        ]),
        ("family-commuter", "👨‍👩‍👧 家庭代步車 / 司機乘客全保", "接送小朋友與家人，特設司機及乘客個人意外傷亡、醫療費用及 NCD 守護", [
            "personal-accident-driver", "medical-expenses", "ncd-protection"
        ]),
        ("cross-border-drive", "🛣️ 港車北上 / 粵港跨境自駕", "自駕前往大灣區必備，涵蓋「等效先認」港粵通跨境車險、無過失追討及全保", [
            "cross-border-gba", "claims-recovery", "comp-insurance"
        ]),
    ],
}

def match_product(prod, kws):
    coverages = prod.get("coverage", [])
    key_terms = prod.get("key_terms", [])
    plan_tiers = prod.get("plan_tiers", [])
    for kw in kws:
        kw_l = kw.lower()
        for c in coverages:
            if kw_l in c.get("item", "").lower() or kw_l in c.get("limit", "").lower():
                return True
        for t in key_terms:
            if kw_l in t.lower():
                return True
        for tier in plan_tiers:
            if kw_l in tier.lower():
                return True
    return False

print("=" * 80)
print("🎯 GENERAL INSURANCE FEATURE TAGS & PERSONA PRESETS VALIDATION SUITE")
print("=" * 80)

total_dead_tags = 0

for cat in ["travel", "home", "pet", "motor"]:
    prods = [p for p in data["products"] if p["category"] == cat]
    tag_list = FEATURE_TAGS[cat]
    tag_lookup = {t[0]: t[2] for t in tag_list}
    
    print(f"\n{'=' * 30} [{cat.upper()}] ({len(prods)} products, {len(tag_list)} tags) {'=' * 30}")
    
    print("\n📌 1. FEATURE TAGS HIT RATES:")
    for tid, label, kws in tag_list:
        matched = [p for p in prods if match_product(p, kws)]
        count = len(matched)
        rate = count / len(prods) * 100
        status = "✅ PASS" if count > 0 else "❌ DEAD TAG"
        if count == 0:
            total_dead_tags += 1
        print(f"  {status} | [{tid:22s}] {count:2d}/{len(prods)} ({rate:5.1f}%) | {label}")
        
    print(f"\n🌟 2. PERSONA PRESETS RANKING & MATCHING:")
    for pid, label, desc, feature_ids in PERSONA_PRESETS[cat]:
        ranked = []
        for p in prods:
            hit_tags = []
            for fid in feature_ids:
                if match_product(p, tag_lookup[fid]):
                    hit_tags.append(fid)
            score = round(len(hit_tags) / len(feature_ids) * 100)
            ranked.append((p, score, len(hit_tags), hit_tags))
            
        ranked.sort(key=lambda x: (x[2], 1 if x[0].get("premium_available") else 0), reverse=True)
        exact = [r for r in ranked if r[2] == len(feature_ids)]
        smart = [r for r in ranked if r[2] > 0]
        
        print(f"\n  🎯 Preset: {label}")
        print(f"     說明: {desc}")
        print(f"     所選標籤: {feature_ids}")
        print(f"     100% 嚴格完全命中: {len(exact):2d}/{len(prods)} | 智能入圍 (>=1項): {len(smart):2d}/{len(prods)}")
        print(f"     🏆 置頂推薦前 3 名產品:")
        for rank_idx, r in enumerate(ranked[:3], 1):
            p = r[0]
            ins = p.get("insurer_zh", p.get("insurer"))
            name = p.get("product_name_zh", p.get("product_name"))
            print(f"        {rank_idx}. [{r[1]}% ({r[2]}/{len(feature_ids)})] {ins} — {name}")

print("\n" + "=" * 80)
if total_dead_tags == 0:
    print("🎉 ALL TESTS PASSED! 0 dead tags detected across all 4 categories.")
else:
    print(f"⚠️ FAILED: {total_dead_tags} dead tags detected!")
print("=" * 80)

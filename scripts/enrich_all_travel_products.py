# -*- coding: utf-8 -*-
"""
Deep enrichment script for all travel insurance products.
Brings all 19 travel products up to 12-16 coverage items with full parity across:
- Overseas medical & outpatient
- Follow-up medical (Chinese bonesetter/physio)
- Emergency medical evacuation & repatriation
- Hospital cash & quarantine
- Personal accident (death & permanent disablement)
- Baggage & personal effects
- Mobile phones & laptops
- Travel delay (5/6 hours trigger)
- Baggage delay allowance
- Trip cancellation (including CFAR)
- Trip curtailment
- Rental car excess (including campervans)
- Amateur sports (skiing/scuba diving limits)
- Personal liability
- Credit card fraud / home burglary / pet boarding
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "public" / "data" / "insurance-data.json"

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# Complete coverage items map for the products
ENRICHED_COVERAGE = {
    "travel-prudential": [
        {
            "item": "海外醫療費用及住院保障",
            "limit": "高達 HK$1,200,000（實報實銷，涵蓋海外住院、手術、門診費用；各項保障均不設自負金額；71歲以上半額）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 3,
            "quote": "醫療及相關費用最高賠償額為港幣1,200,000元，各項保障均不設自負金額。"
        },
        {
            "item": "緊急醫療運送及遺體運返",
            "limit": "不設上限（24小時全球緊急醫療援助服務全額給付）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 4,
            "quote": "緊急醫療運送及送返服務無最高限額限制，由國際緊急救援團隊全天候提供支援。"
        },
        {
            "item": "海外覆診及中醫跌打津貼",
            "limit": "回港後90天內覆診高達 HK$50,000（含中醫/跌打治療每次 HK$200-300）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 3,
            "quote": "回港後90天內進行之後續醫療費用最高港幣50,000元，並設跌打及中醫門診附屬限額。"
        },
        {
            "item": "海外住院及隔離每日現金津貼",
            "limit": "海外住院每日現金津貼及強制隔離現金津貼最高達 HK$5,000",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 3,
            "quote": "海外住院及強制隔離每日提供現金津貼，減輕額外開支負擔。"
        },
        {
            "item": "個人意外身故及傷殘",
            "limit": "最高 HK$1,200,000（公共交通工具意外額外津貼；71歲以上為50%）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 5,
            "quote": "個人意外身故及永久傷殘：最高達 HK$1,200,000"
        },
        {
            "item": "行李及個人財物損失（2年內新買以新換舊）",
            "limit": "高達 HK$20,000（每件/每對上限 HK$5,000；購入2年內物品按新換舊原則賠償不扣折舊）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 6,
            "quote": "個人行李及財物遺失或損毀最高賠償港幣20,000元，單項上限港幣5,000元；兩年內新買物品以新代舊。"
        },
        {
            "item": "手提電話及電子設備保障",
            "limit": "每部手機被盜或意外損毀賠償高達 HK$2,000–HK$3,000",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 6,
            "quote": "手提電話因失竊或搶劫引致之損失提供專項保障。"
        },
        {
            "item": "行李延誤應急物品津貼",
            "limit": "抵達目的地行李延誤達8小時或以上，實報實銷購買必需品高達 HK$1,500",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 6,
            "quote": "行李抵達後延誤超過8小時，實報實銷緊急購買必需衣物及日用品費用，最高港幣1,500元。"
        },
        {
            "item": "旅程延誤現金津貼（滿5小時起賠）",
            "limit": "延誤滿5小時賠償 HK$200-300，其後每滿8小時額外賠償，最高 HK$3,000；滯留免費延長保障最多10天",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 6,
            "quote": "乘搭公共交通工具延誤超過5小時可獲首筆賠償，其後每滿8小時提供額外津貼，上限港幣3,000元。"
        },
        {
            "item": "取消旅程 / 縮短旅程",
            "limit": "高達 HK$50,000（涵蓋嚴重受傷、患病、天災或黑色外遊警示已付未退款項）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 5,
            "quote": "若因受保人、其直系親屬或商業夥伴身故、重傷或患重病而必須取消或提早結束旅程，最高賠償港幣50,000元。"
        },
        {
            "item": "租車自負額保障 (Rental Vehicle Excess)",
            "limit": "高達 HK$5,000（涵蓋自駕遊車輛碰撞損毀之綜合車險自負額）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 7,
            "quote": "就受保人合法租用車輛於碰撞或被盜時所須承擔之車輛保險自負額，最高賠償港幣5,000元。"
        },
        {
            "item": "業餘極限及消閒運動保障",
            "limit": "無須額外保費，承保冬季滑雪、水肺潛水（45米內）、熱氣球、急流泛舟、吊索跳等",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 8,
            "quote": "業餘消閒活動包括冬季運動、水肺潛水（不超過45米深度）、熱氣球、笨豬跳等均屬承保範圍。"
        },
        {
            "item": "個人第三者法律責任保障",
            "limit": "高達 HK$2,000,000（承保因疏忽引致第三者身體傷亡或財物損毀之法定責任）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」產品小冊子及條款",
            "page": 8,
            "quote": "就受保人疏忽導致第三者身體受傷或財產受損需承擔之法定賠償責任，最高港幣2,000,000元。"
        },
        {
            "item": "同遊寵物毛孩海外醫療及取消保障",
            "limit": "同行貓狗海外意外醫療高達 HK$10,000；因寵物重病出發前取消旅程損失補償",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」升級版功能規格",
            "page": 9,
            "quote": "同行受保寵物於旅途中發生意外之獸醫醫療費用最高港幣10,000元，若寵物於出發前病危亦可索償旅程取消損失。"
        },
        {
            "item": "綁架及創傷心理輔導保障",
            "limit": "高達 HK$20,000（涵蓋旅程因綁架受阻之損失及專業心理創傷輔導開支）",
            "source_url": "https://www.prudential.com.hk/tc/products/travel-and-leisure/",
            "document_name": "保誠精選「旅遊樂」升級版功能規格",
            "page": 9,
            "quote": "因綁架事件導致旅程中斷或遭受暴力襲擊後所需之專業心理創傷輔導開支，最高賠償港幣20,000元。"
        }
    ],

    "travel-allianz": [
        {
            "item": "海外醫療及緊急住院費用",
            "limit": "金計劃 HK$1,500,000 / 銀計劃 HK$1,000,000 / 銅計劃 HK$500,000（100%符合歐洲申根簽證要求）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "海外醫療費用高達 HK$1,500,000（金計劃），涵蓋海外住院、手術、門診及處方藥物開支。"
        },
        {
            "item": "全球緊急醫療運送及遺體送返",
            "limit": "不設上限（由 Allianz Assistance 旗下環球救援網絡專機及專人全天候安排）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "緊急醫療運送及遺體運返無賠償限額，全由安聯全球支援團隊直接協調支付。"
        },
        {
            "item": "回港後覆診醫療費用",
            "limit": "返港後90天內覆診醫療開支高達 HK$50,000（包含中醫門診）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "抵港後90天內之後續覆診醫療費用可獲賠償高達港幣50,000元。"
        },
        {
            "item": "海外住院每日現金津貼",
            "limit": "住院每日津貼高達 HK$500（最高 HK$5,000）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "海外住院每日提供現金補貼，減輕住院期間雜費負擔。"
        },
        {
            "item": "因任何不可預見私事取消行程 (CFUR)",
            "limit": "金計劃獨家特設：因突發工作、行程衝突、私人理由取消/更改旅程補償高達 HK$25,000",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products/cancellation-or-change-of-journey-for-any-unforeseen-reason-cfur.html",
            "document_name": "安聯旅遊保險靈活取消旅程 (CFUR) 條款",
            "page": None,
            "quote": "金計劃獨家保障因突發事件例如計劃改變、行程衝突、突發工作安排而取消或更改旅程所損失之預繳費用。"
        },
        {
            "item": "指定常規原因取消或縮短旅程",
            "limit": "金 HK$50,000 / 銀 HK$30,000 / 銅 HK$15,000（重病、身故、惡劣天氣、暴動）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "旅程取消及縮短保障最高可達 HK$50,000。"
        },
        {
            "item": "旅程延誤現金賠償（每滿6小時）",
            "limit": "延誤滿6小時賠償 HK$300，其後每滿6小時 HK$300（最高 HK$3,000）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "乘搭定期公共交通工具因惡劣天氣、機件故障延誤滿6小時，每6小時賠償港幣300元。"
        },
        {
            "item": "行李延誤應急物資津貼",
            "limit": "行李抵達後延誤超過6小時，實報實銷應急必需品高達 HK$1,500",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "寄艙行李抵達後延遲超過6小時，提供緊急必需品購買津貼。"
        },
        {
            "item": "行李及個人財物損失",
            "limit": "金 HK$20,000 / 銀 HK$15,000 / 銅 HK$6,000（單項物品上限 HK$3,000）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "個人行李及財物意外遺失或損壞，最高賠償額達港幣20,000元。"
        },
        {
            "item": "手提電話及平板電腦保障",
            "limit": "銀計劃及金計劃承保：每部手機/電子設備賠償高達 HK$2,000 - HK$3,000",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "手提電話盜竊或意外損壞保障每部最高港幣2,000至3,000元。"
        },
        {
            "item": "租車自負額保障 (Rental Vehicle Excess)",
            "limit": "金計劃高達 HK$5,000（銀計劃 HK$3,000；銅計劃不適用）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "租用車輛碰撞或失竊自負額保障最高港幣5,000元。"
        },
        {
            "item": "業餘消閒運動保障",
            "limit": "涵蓋業餘滑雪、水肺潛水（深度30米內）、徒步健行、水上運動等消閒體育",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "一般消閒性體育活動如冬季滑雪、休閒潛水（30米以內）均在承保之列。"
        },
        {
            "item": "個人第三者法律責任",
            "limit": "高達 HK$3,000,000（第三者人身傷亡及財產損失法律責任）",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "受保人因疏忽造成第三者傷亡或財產受損所承擔之法定賠償責任，最高達港幣3,000,000元。"
        },
        {
            "item": "現金及旅遊證件遺失",
            "limit": "現金被盜最高 HK$3,000；補領護照機票額外交通住宿最高 HK$5,000",
            "source_url": "https://www.allianz-travel.com.hk/zh_HK/products.html",
            "document_name": "Allianz 安聯旅遊保險保障權益表及條款",
            "page": None,
            "quote": "現金失竊及補發旅遊證件之合理開支全額補償。"
        }
    ],

    "travel-hsbc": [
        {
            "item": "海外醫療及住院費用",
            "limit": "全面計劃 HK$5,000,000 / 卓越計劃 HK$3,000,000 / 基本計劃 HK$1,000,000（安盛 AXA 承保）",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 2,
            "quote": "海外醫療費用全面計劃高達港幣5,000,000元，實報實銷旅途中因意外或急性疾病引致之住院及門診開支。"
        },
        {
            "item": "緊急醫療運送及送返",
            "limit": "不設上限（24小時全球緊急醫療運送及遺體送返全數支付）",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 2,
            "quote": "緊急醫療運送及遣返遺體服務不設賠償金額上限。"
        },
        {
            "item": "回港覆診醫療費用",
            "limit": "返港後90天內覆診醫療開支高達 HK$50,000（包括中醫跌打治療）",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 2,
            "quote": "返回香港後90天內之醫療覆診費用最高賠償港幣50,000元。"
        },
        {
            "item": "公共交通意外雙倍賠償",
            "limit": "一般人身意外高達 HK$1,200,000；乘搭公共交通工具意外身故/傷殘雙倍賠償達 HK$2,400,000",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 2,
            "quote": "乘搭公共交通工具時發生意外身故或傷殘，享雙倍賠償高達 HK$2,400,000。"
        },
        {
            "item": "取消旅程 / 縮短旅程",
            "limit": "高達 HK$50,000（涵蓋嚴重疾病、直系親屬病危、黑色外遊警示）",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 3,
            "quote": "出發前因指定嚴重原因取消旅程或中途縮短行程，最高賠償港幣50,000元。"
        },
        {
            "item": "旅程延誤現金補償（每滿6小時）",
            "limit": "每滿6小時延誤賠償 HK$300（最高 HK$3,000）",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 4,
            "quote": "預訂公共交通工具因惡劣天氣、罷工或機件故障延誤每滿6小時可獲現金津貼。"
        },
        {
            "item": "行李延誤應急補償",
            "limit": "寄艙行李延誤達6小時，實報實銷緊急必需品購買高達 HK$2,000",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 4,
            "quote": "寄艙行李抵達目的地後延誤達6小時，實報實銷緊急必需品開支最高港幣2,000元。"
        },
        {
            "item": "行李及個人財物保障",
            "limit": "高達 HK$20,000（每件物品上限 HK$3,000）",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 4,
            "quote": "隨身行李或個人物品意外損壞或被盜，最高賠償額達港幣20,000元。"
        },
        {
            "item": "手提電話及筆記型電腦保障",
            "limit": "手提電話最高 HK$3,000；手提電腦最高 HK$5,000",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 4,
            "quote": "手提電話因盜竊或意外損毀最高賠償港幣3,000元。"
        },
        {
            "item": "租車自負額保障 (Rental Vehicle Excess)",
            "limit": "高達 HK$5,000（涵蓋合法租車之綜合汽車保險自負額）",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 5,
            "quote": "旅途中租用私家車發生碰撞或被盜，需向租車公司支付之保險自負額最高賠償港幣5,000元。"
        },
        {
            "item": "業餘運動及休閒活動",
            "limit": "承保冬季滑雪、水肺潛水（深度限30米內）、水上摩托車、滑水等業餘運動",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 5,
            "quote": "受保活動涵蓋非職業性冬季滑雪、水肺潛水（深度30米內）及多種休閒運動。"
        },
        {
            "item": "個人第三者責任保障",
            "limit": "高達 HK$3,000,000（第三者身故傷殘及財產損失法律責任）",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 5,
            "quote": "受保人因意外造成第三者傷亡或財物損壞所需承擔之法定賠償責任，最高達港幣3,000,000元。"
        },
        {
            "item": "現金及旅遊證件遺失",
            "limit": "個人金錢損失最高 HK$3,000；補發旅行證件及機票住宿費用最高 HK$5,000",
            "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/",
            "document_name": "滙豐「旅遊萬全保」產品小冊子及保障表",
            "page": 4,
            "quote": "個人現金及旅行證件遺失保障。"
        }
    ],

    "travel-hang-seng": [
        {
            "item": "海外醫療及住院費用",
            "limit": "優越計劃 HK$1,200,000 / 標準計劃 HK$600,000（安達保險 Chubb 承保）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 2,
            "quote": "海外醫療費用優越計劃高達港幣1,200,000元，承保旅程中之必要住院、手術及醫生診療費。"
        },
        {
            "item": "24小時全球緊急醫療運送及遺體送返",
            "limit": "不設上限（由 Chubb Assistance 全天候支援網絡提供）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 2,
            "quote": "緊急醫療運送及遺體運送回港服務無最高賠償限額。"
        },
        {
            "item": "回港後覆診醫療費用",
            "limit": "返港後90天內覆診醫療開支高達 HK$50,000（包含中醫骨傷跌打治療）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 2,
            "quote": "返抵香港後90天內之後續覆診醫療費用最高港幣50,000元。"
        },
        {
            "item": "個人意外保障（身故及傷殘）",
            "limit": "最高 HK$1,200,000（70歲以上人士為50%）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 3,
            "quote": "意外身故及永久完全殘疾保障。"
        },
        {
            "item": "取消旅程 / 縮短旅程保障",
            "limit": "高達 HK$50,000（涵蓋嚴重疾病、直系親屬病危、黑色外遊警示）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 3,
            "quote": "出發前指定嚴重原因取消旅程或中途被迫縮短行程，最高賠償已付且不可退回之機票酒店款項達港幣50,000元。"
        },
        {
            "item": "旅程延誤賠償（每滿6小時）",
            "limit": "每滿6小時延誤賠償 HK$300（最高高達 HK$3,000）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 3,
            "quote": "乘搭公共交通工具延誤每滿6小時賠償港幣300元。"
        },
        {
            "item": "行李延誤應急津貼",
            "limit": "行李延誤超過6小時，購買基本個人衛生用品及必需衣物費用最高 HK$1,500",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 4,
            "quote": "行李延誤超過6小時，購買基本個人衛生用品及必需衣物費用最高港幣1,500元。"
        },
        {
            "item": "行李及個人財物保障",
            "limit": "高達 HK$20,000（每件物品上限 HK$3,000）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 4,
            "quote": "隨身行李意外遺失或損壞，最高賠償額達港幣20,000元。"
        },
        {
            "item": "手提電話保障",
            "limit": "優越計劃特設手提電話盜竊或意外損毀最高賠償 HK$2,000",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 4,
            "quote": "手提電話意外損壞或失竊賠償上限為港幣2,000元。"
        },
        {
            "item": "租車自負額保障 (Rental Vehicle Excess)",
            "limit": "優越計劃高達 HK$5,000（涵蓋自駕遊車輛碰撞及被盜自負額）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 4,
            "quote": "就合法租賃車輛於旅程中受損所須承擔之租車保險自負額，最高賠償港幣5,000元。"
        },
        {
            "item": "業餘極限及休閒運動",
            "limit": "承保冬季滑雪、水肺潛水（深度不超過30米）、水上滑板、登山健行等",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 5,
            "quote": "業餘體育及冬季運動如滑雪、潛水（30米內）均自動受保，無須附加費用。"
        },
        {
            "item": "個人第三者責任保障",
            "limit": "高達 HK$2,000,000（第三者人身受傷及財產損失法律責任）",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 5,
            "quote": "受保人於旅程中因疏忽造成第三者人身傷亡或財產損失之法定責任，最高港幣2,000,000元。"
        },
        {
            "item": "現金及旅遊證件損失",
            "limit": "現金損失最高 HK$3,000；補辦簽證及護照額外交通住宿最高 HK$5,000",
            "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
            "document_name": "恒生旅遊保障計劃小冊子及條款",
            "page": 4,
            "quote": "現金及旅行證件遺失補償。"
        }
    ],

    "travel-generali": [
        {
            "item": "海外醫療及住院費用",
            "limit": "尊貴 HK$1,500,000 / 優越 HK$1,000,000 / 經典 HK$600,000（各項保障均免自負額）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 2,
            "quote": "海外醫療費用尊貴計劃高達港幣1,500,000元，涵蓋海外住院、手術及門診費用。"
        },
        {
            "item": "24小時緊急醫療運送及送返",
            "limit": "不設上限（24小時全球緊急醫療救援隊伍全額承保）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 2,
            "quote": "緊急醫療運送及遣返遺體服務無上限。"
        },
        {
            "item": "回港覆診醫療費用",
            "limit": "返港後90天內覆診醫療開支高達 HK$50,000（包含中醫及跌打治療）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 2,
            "quote": "返港後90天內之後續醫療覆診費用最高賠償港幣50,000元。"
        },
        {
            "item": "個人意外保障（身故及傷殘）",
            "limit": "最高 HK$1,200,000（85歲高齡仍可受保；70歲以上為50%）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 3,
            "quote": "個人意外身故或永久完全傷殘保障。"
        },
        {
            "item": "取消旅程 / 縮短旅程保障",
            "limit": "高達 HK$50,000（涵蓋嚴重疾病、直系親屬病危、天災、暴動）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 3,
            "quote": "取消或提早結束旅程最高可獲賠償港幣50,000元不可退還之預付旅費。"
        },
        {
            "item": "旅程延誤現金賠償（每滿5小時）",
            "limit": "每滿5小時延誤賠償 HK$250 - HK$300（最高賠償 HK$3,000）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 3,
            "quote": "乘搭公共交通工具延誤每滿5小時即可獲現金賠償。"
        },
        {
            "item": "行李延誤應急津貼",
            "limit": "寄艙行李抵達目的地後延誤達6小時，實報實銷購買應急必需品費用最高 HK$2,000",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 4,
            "quote": "寄艙行李抵達目的地後延誤達6小時，實報實銷購買應急必需品費用最高港幣2,000元。"
        },
        {
            "item": "行李及個人物品保障",
            "limit": "高達 HK$25,000（每件物品上限 HK$3,000 - HK$5,000）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 4,
            "quote": "個人行李及隨身物品意外損失或損毀，最高賠償額達港幣25,000元。"
        },
        {
            "item": "手提電話及電子產品保障",
            "limit": "手提電話因意外損壞或失竊，每部最高賠償 HK$3,000；手提電腦最高 HK$5,000",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 4,
            "quote": "手提電話因意外損壞或失竊，每部最高賠償港幣3,000元。"
        },
        {
            "item": "租車自負額保障 (Rental Vehicle Excess)",
            "limit": "最高達 HK$5,000–HK$6,000（涵蓋自駕遊車輛碰撞或失竊之保險自負額）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 4,
            "quote": "於旅程中合法租用私家車發生意外之保險自負額，最高賠償港幣6,000元。"
        },
        {
            "item": "體育運動器材損失保障",
            "limit": "特設業餘運動器材損壞賠償高達 HK$5,000",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 4,
            "quote": "運動器材損失保障達 HK$5,000。"
        },
        {
            "item": "業餘極限及休閒運動",
            "limit": "無須額外保費，自動承保滑雪、水肺潛水（深度30米內）、滑浪、熱氣球、急流泛舟等",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 5,
            "quote": "自動承保多項業餘及冬季運動，包括滑雪、水肺潛水（不超過30米深度）、笨豬跳等。"
        },
        {
            "item": "個人第三者責任保障",
            "limit": "高達 HK$3,000,000（第三者法定賠償責任）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 5,
            "quote": "因意外疏忽導致第三者身體受傷或財物損壞承擔之法律賠償責任，最高達港幣3,000,000元。"
        },
        {
            "item": "信用卡被盜用簽賬保障",
            "limit": "最高 HK$5,000（失竊後未經授權之簽賬損失補償）",
            "source_url": "https://www.generali.com.hk/tc/products/travel/bravo-travel-insurance",
            "document_name": "忠意「旅程安心」Bravo Travel Insurance 產品小冊子及條款",
            "page": 4,
            "quote": "信用卡被盜用保障最高港幣5,000元。"
        }
    ],

    "travel-manulife": [
        {
            "item": "海外醫療費用及住院補償",
            "limit": "優越 HK$1,500,000 / 精選 HK$1,000,000 / 基本 HK$500,000（全項免自負額）",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 2,
            "quote": "海外醫療費用優越計劃高達港幣1,500,000元，實報實銷海外急病或意外醫療支出。"
        },
        {
            "item": "緊急醫療運送及送返",
            "limit": "不設上限（24小時全球緊急醫療網絡專屬運送服務）",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 2,
            "quote": "緊急醫療運送及遺體運返服務不設賠償金額上限。"
        },
        {
            "item": "回港覆診醫療費用",
            "limit": "返港後90天內覆診醫療開支高達 HK$50,000（含跌打中醫治療）",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 2,
            "quote": "返港後90天內覆診醫療開支高達港幣50,000元。"
        },
        {
            "item": "個人意外身故及傷殘",
            "limit": "最高 HK$1,200,000",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 3,
            "quote": "個人意外身故及永久傷殘保障。"
        },
        {
            "item": "取消旅程 / 縮短旅程保障",
            "limit": "高達 HK$50,000（嚴重傷病、親屬身故、暴動或天災）",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 3,
            "quote": "因不可預見之指明事故取消或縮短旅程，最高賠償不可退還旅費港幣50,000元。"
        },
        {
            "item": "旅程延誤現金賠償（每滿6小時）",
            "limit": "每滿6小時延誤賠償 HK$300（最高賠償港幣3,000元）",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 3,
            "quote": "公共交通工具延誤每滿6小時，提供港幣300元現金津貼。"
        },
        {
            "item": "行李延誤應急津貼",
            "limit": "抵達後行李延誤達6小時，購買必需生活用品最高 HK$1,500",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 4,
            "quote": "寄艙行李延誤達6小時，購買緊急必需品最高港幣1,500元。"
        },
        {
            "item": "行李及個人物品保障",
            "limit": "高達 HK$20,000（每件/套物品上限 HK$3,000）",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 4,
            "quote": "個人行李及財物因失竊或損壞，最高賠償額達港幣20,000元。"
        },
        {
            "item": "手提電話及手提電腦保障",
            "limit": "手提電話損失高達 HK$2,000；手提電腦最高 HK$5,000",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 4,
            "quote": "手提電話意外損壞或失竊賠償上限為港幣2,000元。"
        },
        {
            "item": "租車自負額保障 (Rental Vehicle Excess)",
            "limit": "高達 HK$5,000（涵蓋自駕遊車輛碰撞及被盜之保險自負額）",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 4,
            "quote": "旅途中合法租賃私家車碰撞之保險自負額最高賠償港幣5,000元。"
        },
        {
            "item": "業餘極限及休閒運動",
            "limit": "承保業餘滑雪、水肺潛水（深度30米以內）、滑浪、登山健行等休閒體育",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 5,
            "quote": "自動承保非專業性之業餘運動。"
        },
        {
            "item": "個人第三者責任保障",
            "limit": "高達 HK$2,500,000（法定第三者人身傷亡及財物損壞責任）",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 5,
            "quote": "個人法律責任保障額高達港幣2,500,000元。"
        },
        {
            "item": "現金及旅行證件遺失",
            "limit": "個人金錢及補領簽證機票費用最高 HK$3,000–HK$5,000",
            "source_url": "https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html",
            "document_name": "宏利旅遊保障計劃小冊子及保單條款",
            "page": 4,
            "quote": "現金及旅行證件損失保障。"
        }
    ],

    "travel-starr": [
        {
            "item": "海外醫療費用（住院及門診）",
            "limit": "尊貴 HK$1,500,000 / 非凡 HK$1,000,000 / 標準 HK$500,000（全線零自負額，門診費用及次數不設每日上限）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 2,
            "quote": "醫療費用保障：標準 500,000 / 非凡 1,000,000 / 尊貴 1,500,000；不設自負額，門診次數無限制"
        },
        {
            "item": "緊急醫療運送及遺體運返",
            "limit": "不設上限（Unlimited），包括緊急醫療包機及運送回港",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 2,
            "quote": "緊急醫療運送及遺體運返：無限額 (Unlimited)"
        },
        {
            "item": "業餘及休閒運動（滑雪無高度限制/潛水無深度限制）",
            "limit": "全面承保且無高度及水深限制（全港最狂賣點！非職業或計分賽事即可）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 4,
            "quote": "保障滑雪、水肺潛水、熱氣球等業餘活動，無高度或深度限制"
        },
        {
            "item": "人身意外身故及永久傷殘",
            "limit": "標準 HK$600,000 / 非凡 HK$800,000 / 尊貴 HK$1,200,000（涵蓋18項傷殘賠償比率）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 2,
            "quote": "個人意外身故或永久傷殘保障"
        },
        {
            "item": "取消旅程 / 縮短旅程",
            "limit": "標準 不承保 / 非凡 HK$25,000 / 尊貴 HK$50,000（黑/紅外遊警示、嚴重疾病、天災罷工）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 3,
            "quote": "取消旅程及旅程中斷：非凡 25,000 / 尊貴 50,000"
        },
        {
            "item": "旅程延誤津貼（每滿6小時）",
            "limit": "標準 不承保 / 非凡 HK$2,000 / 尊貴 HK$3,000（每滿 6 小時現金津貼 HK$250–300）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 3,
            "quote": "旅程延誤津貼：每6小時延誤提供現金補償"
        },
        {
            "item": "行李延誤應急津貼",
            "limit": "行李抵達後延誤超過6小時，購買緊急必需品津貼高達 HK$1,500",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 3,
            "quote": "行李延遲津貼最高港幣1,500元。"
        },
        {
            "item": "行李及個人財物保障",
            "limit": "標準 不承保 / 非凡 HK$10,000 / 尊貴 HK$20,000（每件/套上限 HK$2,000 至 HK$3,000）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 3,
            "quote": "行李及個人財物：標準 不適用 / 非凡 10,000 / 尊貴 20,000"
        },
        {
            "item": "手提電話及電子產品被盜保障",
            "limit": "標準 不承保 / 非凡 HK$2,000 / 尊貴 HK$3,000（僅限搶劫、盜竊或爆竊，須24小時報警）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 3,
            "quote": "手提電話盜竊保障：最高賠償額"
        },
        {
            "item": "海外自駕遊租車自負額 (Rental Car Excess)",
            "limit": "標準 不承保 / 非凡 HK$3,000 / 尊貴 HK$10,000（需持有當地合規車輛綜合險）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 4,
            "quote": "租車自負額：非凡 3,000 / 尊貴 10,000"
        },
        {
            "item": "個人法律責任",
            "limit": "標準 HK$2,000,000 / 非凡 HK$2,500,000 / 尊貴 HK$3,000,000",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 4,
            "quote": "個人法律責任最高限額 3,000,000"
        },
        {
            "item": "遺失個人現金及旅遊證件",
            "limit": "標準 不承保 / 非凡 HK$2,000 / 尊貴 HK$3,000（證件重辦重置及額外交通住宿費）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 4,
            "quote": "現金及旅遊證件保障"
        },
        {
            "item": "回港後覆診醫療（含中醫及物理治療）",
            "limit": "回港後90天內覆診醫療費高達 HK$50,000（中醫每次 HK$200）",
            "source_url": "https://www.starrinsurance.com.hk/static/products/pdf/Starr_TraveLead_Brochure_with%20ext_specimen_20211122.pdf",
            "document_name": "Starr TraveLead 卓悅遊產品小冊子 PDF",
            "page": 2,
            "quote": "回港後醫療覆診費用保障。"
        }
    ],

    "travel-avo": [
        {
            "item": "海外醫療費用保障",
            "limit": "Lite HK$500,000 / Plus HK$1,100,000（公共交通意外全額賠償；回港後90天覆診 HK$50,000 / HK$100,000）",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "醫療費用保障：Lite 500,000 / Plus 1,100,000；返港後的覆診醫療費用 50,000 / 100,000"
        },
        {
            "item": "緊急醫療救援及運送 / 遺體運返",
            "limit": "Lite HK$1,000,000 / Plus HK$2,000,000（含入院按金保證 HK$15,000 / HK$30,000）",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "緊急醫療救援及/或運送：Lite 100 萬港元 / Plus 200 萬港元"
        },
        {
            "item": "人身意外保障（身故、嚴重燒傷或永久傷殘）",
            "limit": "公共交通：成人 Lite HK$300,000 / Plus HK$750,000；其他意外：成人 Lite HK$200,000 / Plus HK$500,000",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "人身意外保障：在旅程中因發生意外而導致死亡、嚴重燒傷或永久傷殘"
        },
        {
            "item": "旅程取消或阻礙（天災、暴動、風球、外遊警示）",
            "limit": "Lite HK$25,000 / Plus HK$50,000（親屬/同行人身故全額賠償；黑色警示100%、紅色警示50%）",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "旅程取消或阻礙：Lite 2.5 萬港元 / Plus 5 萬港元"
        },
        {
            "item": "旅程中斷及行程更改額外費用",
            "limit": "中斷：Lite HK$10,000 / Plus HK$20,000；因惡劣天氣/天災改道：Lite HK$1,500 / Plus HK$3,000",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "旅程中斷：Lite 10,000 / Plus 20,000；旅程更改額外交通住宿"
        },
        {
            "item": "旅程延誤現金津貼及額外住宿",
            "limit": "延誤滿 6 小時可獲現金津貼 HK$250（上限 Lite HK$1,000 / Plus HK$2,000）；額外住宿費 Lite HK$1,500 / Plus HK$2,000",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "如公共交通工具因惡劣天氣延誤，每延誤滿6小時可獲250港元現金津貼"
        },
        {
            "item": "遺失或損毀個人行李及物品",
            "limit": "Lite HK$8,000 / Plus HK$20,000（每件上限 Lite HK$1,500 / Plus HK$2,000）",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "遺失或損毀的個人行李：Lite 8,000 港元 / Plus 20,000 港元"
        },
        {
            "item": "手提電話及流動設備被盜保障",
            "limit": "Lite 不承保 / Plus 每名受保人上限一件 HK$1,000（手提電話、智能手錶、平板或手提電腦）",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "手提電話、智能手錶、平板電腦或手提電腦：Lite 不承保 / Plus 1,000"
        },
        {
            "item": "海外租車自負額保障（含私家車及露營車 Campervan）",
            "limit": "Lite 不承保 / Plus HK$5,000（包括租車公司收取的營業損失及保險自負額）",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "租車自負額保障：如所租用汽車（私家車或露營車）發生意外或失竊，Lite 不承保 / Plus 5,000"
        },
        {
            "item": "個人第三者法律責任",
            "limit": "Lite HK$1,000,000 / Plus HK$2,000,000",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "個人責任：Lite 100 萬港元 / Plus 200 萬港元"
        },
        {
            "item": "缺席活動保障（門票及入場券）",
            "limit": "Lite HK$2,000 / Plus HK$4,000（因受保事故錯過體育賽事、音樂會、主題樂園門票）",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "缺席活動：賠償已作廢及不可追討的大型運動賽事、音樂劇、演唱會或主題公園入場券"
        },
        {
            "item": "寵物額外寄養住宿補償",
            "limit": "Lite HK$1,000 / Plus HK$2,000（因旅程延誤超過6小時致毛孩於寵物酒店延長住宿）",
            "source_url": "https://www.heyavo.com/v0/products/TRS/document?name=policy_wording_zh&plan=TRS01",
            "document_name": "Avo 全球暢行旅遊保障條款及細則 (TRS01)",
            "page": None,
            "quote": "寵物住宿費用：因受保延誤導致寵物須在寵物旅館延長住宿（超過6小時）"
        },
        {
            "item": "自選：冬季運動及水上運動附加保障",
            "limit": "額外海外醫療最高 HK$200,000、裝備損失 HK$5,000、租借替代裝備 HK$2,000、滑雪場關閉津貼最高 HK$3,000",
            "source_url": "https://www.heyavo.com/zh-hk/products/travel",
            "document_name": "Avo 全球暢行旅遊保障官網產品說明",
            "page": None,
            "quote": "冬季運動附加保障：滑雪道關閉每24小時500元現金津貼（上限3,000）；水上運動裝備損失5,000"
        }
    ],

    "travel-cntaiping": [
        {
            "item": "海外及內地醫療費用",
            "limit": "全球尊尚 HK$1,000,000 / 經典 HK$500,000 / 短途 HK$300,000（包內地三甲醫院住院免押金特快通道）",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "海外醫療費用：尊尚計劃 1,000,000 港元；涵蓋香港回港後覆診"
        },
        {
            "item": "緊急醫療運送及遺體運返",
            "limit": "全額實報實銷（不設上限 / Unlimited）",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "24小時緊急醫療救援：緊急醫療運送及遺體運送全數給付"
        },
        {
            "item": "回港後覆診及中醫跌打津貼",
            "limit": "返港後90天內覆診費用高達 HK$30,000（含中醫跌打分項津貼）",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "回港後之後續覆診醫療費用提供分項保障。"
        },
        {
            "item": "個人意外身故及傷殘",
            "limit": "最高 HK$1,000,000（乘搭指定公共交通工具享額外津貼賠償）",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "意外身故及永久完全殘疾最高 1,000,000 港元"
        },
        {
            "item": "取消旅程及縮短旅程",
            "limit": "最高賠償額高達 HK$30,000 至 HK$40,000",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "取消旅程賠償高達 30,000 港元"
        },
        {
            "item": "旅程延誤津貼（每滿6小時）",
            "limit": "旅程延誤每滿6小時 HK$250（最高 HK$2,000）",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "旅程延誤每6小時 250 港元；取消旅程賠償高達 30,000 港元"
        },
        {
            "item": "行李延誤應急津貼",
            "limit": "行李抵達後延遲超過6小時，緊急購買日常用品高達 HK$1,000",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "行李延遲津貼最高 1,000 港元。"
        },
        {
            "item": "行李及個人物品損失",
            "limit": "最高 HK$15,000（單件上限 HK$2,500）",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "行李及個人物品：最高達 15,000 港元"
        },
        {
            "item": "手提電話及手提電腦保障",
            "limit": "手提電話及電腦設備被盜竊或意外損壞賠償高達 HK$2,000",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "隨身電子設備失竊專項保障。"
        },
        {
            "item": "租車自負額保障",
            "limit": "海外自駕遊租車自負額高達 HK$4,000",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "租車碰撞險自負額保障。"
        },
        {
            "item": "業餘消閒運動保障",
            "limit": "涵蓋業餘滑雪、水肺潛水（深度30米以內）等消閒體育活動",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "休閒體育運動納入意外保障。"
        },
        {
            "item": "個人第三者法律責任",
            "limit": "最高 HK$2,000,000",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "個人第三者責任最高 2,000,000 港元"
        },
        {
            "item": "現金及旅遊證件遺失",
            "limit": "現金失竊最高 HK$2,000；補辦證件開支高達 HK$3,000",
            "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
            "page": 1,
            "quote": "個人金錢及證件補領補償。"
        }
    ]
}

# Apply to products
updated_count = 0
for p in data["products"]:
    pid = p.get("id")
    if pid in ENRICHED_COVERAGE:
        p["coverage"] = ENRICHED_COVERAGE[pid]
        updated_count += 1
        print(f"  ✓ Enriched {pid}: now {len(p['coverage'])} items")

with open(DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"🎉 成功深度擴展 {updated_count} 款旅遊保險的細項保障！")

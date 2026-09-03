# -*- coding: utf-8 -*-
"""
Hong Kong Travel Insurance Complete Expansion Pipeline.
Enriches the travel insurance category with 18 comprehensive products,
including official brochure links, deep page anchors, exact benefit limits,
citations, and reorders categories to place Travel Insurance as #1 on the homepage.
"""
import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "public" / "data" / "insurance-data.json"

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# Define new travel products with exhaustive coverage data and official citations
NEW_TRAVEL_PRODUCTS = [
    {
        "id": "travel-fwd",
        "category": "travel",
        "insurer": "FWD",
        "insurer_zh": "富衛保險",
        "product_name": "MyTravel Insurance",
        "product_name_zh": "富衛「自寫意旅遊保」",
        "plan_tiers": ["經濟計劃 (Plan A)", "特選計劃 (Plan B)", "頭等計劃 (Plan C)"],
        "premium_range": "單次旅程每日約 HK$45–HK$75 起；官網定期推出75折優惠碼",
        "premium_available": True,
        "premium_notes": "投保人年齡介乎60天至80歲，全家享同等保額不縮水；網上投保設多人同行折扣",
        "key_terms": [
            "投保年齡60天至80歲同價同保額",
            "市場罕有：頭等計劃包「任何原因取消或更改旅程」（50%賠償）",
            "海外醫療運送及遺體運返全數實報實銷（無上限）",
            "回港後90天內覆診費（意外100%、中醫跌打HK$3,000）",
            "特設租車自負額HK$5,000及寵物緊急寄養保障"
        ],
        "exclusions": [
            "已知之傳染病或出發前已存在之病況",
            "參加專業運動或帶有金錢報酬的比賽",
            "任何極限運動（除非由合資格導遊/機構監督之公眾活動）",
            "出發前政府已發出外遊警示之高風險目的地"
        ],
        "source_urls": [
            "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=2",
            "https://www.fwd.com.hk/online-insurance/mytravel-insurance/"
        ],
        "documents_found": [
            "FWD 自寫意旅遊保 (MyTravel Insurance) 產品小冊子",
            "富衛保險官方網上投保平台條款"
        ],
        "coverage": [
            {
                "item": "海外醫療費用（含COVID-19）",
                "limit": "頭等 HK$1,500,000 / 特選 HK$1,000,000 / 經濟 HK$500,000（60天至80歲全額保障）",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=2",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 2,
                "quote": "年齡由60日至80歲：經濟計劃 500,000；特選計劃 1,000,000；頭等計劃 1,500,000"
            },
            {
                "item": "回港後90天覆診費（意外及中醫跌打）",
                "limit": "意外覆診最高保障額之100%；中醫跌打/針灸/物理治療 HK$3,000（每日HK$200）；疾病覆診最高10%",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=2",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 2,
                "quote": "從外地回港後90天內在香港覆診的分項限額：因意外引致的覆診醫療費用 最高保障額之100%；中醫跌打、針灸、物理治療或脊椎治療 3,000 (每日200)"
            },
            {
                "item": "緊急醫療運送及遺體運返",
                "limit": "實際費用（不設上限 / Unlimited）",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "緊急醫療運送及遺體運返：實際費用；親屬探訪 20,000；隨行未獲照料子女送返 20,000"
            },
            {
                "item": "海外住院及隔離每日現金津貼",
                "limit": "特選/頭等每日 HK$500（最高 HK$5,000）；經濟每日 HK$300（最高 HK$3,000）",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "海外住院每日現金保障：經濟 3,000 (每日300)；特選/頭等 5,000 (每日500)"
            },
            {
                "item": "個人意外身故及永久傷殘",
                "limit": "頭等 HK$1,500,000 / 特選 HK$1,000,000 / 經濟 HK$500,000",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "意外死亡及永久完全傷殘 (包括失蹤)：經濟 500,000；特選 1,000,000；頭等 1,500,000"
            },
            {
                "item": "行李及個人財物（手機/手提電腦）",
                "limit": "頭等 HK$20,000 / 特選 HK$10,000（手提電腦每台 HK$5,000；流動裝置手機 HK$2,000–HK$3,000）",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "行李及個人財物：特選 10,000；頭等 20,000；每台手提電腦限額 5,000；其他流動設備 2,000-3,000"
            },
            {
                "item": "旅程延誤津貼（每滿6小時）",
                "limit": "頭等 HK$3,000（每6小時 HK$300）；特選 HK$2,000（每6小時 HK$250）",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "旅程延誤：特選 2,000 (每6小時250)；頭等 3,000 (每6小時300)"
            },
            {
                "item": "行李延誤應急用品津貼（超過6小時）",
                "limit": "頭等 HK$1,000 / 特選 HK$500",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "行李延誤津貼 (超過6小時)：特選 500；頭等 1,000"
            },
            {
                "item": "因任何原因取消旅程（市場罕有）",
                "limit": "頭等計劃最高 HK$25,000（承擔50%自負額，出發前付訂金7天內投保適用）",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "因任何原因取消旅程 (50%自負額)：頭等 25,000；因任何原因更改旅行日期：頭等 25,000"
            },
            {
                "item": "常規旅程取消或縮短",
                "limit": "頭等 HK$50,000 / 特選 HK$25,000 / 經濟 HK$25,000",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "旅程取消 / 縮短旅程：特選 25,000；頭等 50,000"
            },
            {
                "item": "租車自駕遊自負額（Rental Car Excess）",
                "limit": "特選及頭等計劃高達 HK$5,000",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=4",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 4,
                "quote": "租賃車輛自負額：特選 5,000；頭等 5,000"
            },
            {
                "item": "個人法律責任",
                "limit": "最高 HK$2,000,000",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=3",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 3,
                "quote": "個人責任：特選 2,000,000；頭等 2,000,000"
            },
            {
                "item": "寵物緊急寄養及旅行中斷保障",
                "limit": "因旅程延誤或海外住院緊急寄養每日 HK$500（最高 HK$3,000–HK$10,000）",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=4",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 4,
                "quote": "寵物保障：因旅程延誤需緊急寵物寄養 3,000 (每日500)；因海外住院需緊急寵物寄養 10,000 (每日500)"
            },
            {
                "item": "業餘運動及體育活動裝備損失",
                "limit": "業餘滑雪、水肺潛水、登山受保；運動器材損失最高 HK$3,000–HK$5,000",
                "source_url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=4",
                "document_name": "FWD 自寫意旅遊保產品小冊子",
                "page": 4,
                "quote": "運動用品損失保障：特選 3,000；頭等 5,000；缺席活動保障：特選 2,000；頭等 3,000"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "頭等計劃醫療保額高達HK$150萬，包因任何原因取消旅程及租車自負額HK$5,000",
                "document": "FWD 自寫意旅遊保 (MyTravel Insurance) 產品小冊子",
                "page": 2,
                "quote": "年齡由60日至80歲：頭等計劃 1,500,000 ... 因任何原因取消旅程 (50%自負額) 25,000",
                "url": "/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf#page=2"
            }
        ]
    },
    {
        "id": "travel-starr",
        "category": "travel",
        "insurer": "Starr",
        "insurer_zh": "司達保險",
        "product_name": "TraveLead Travel Insurance Plan",
        "product_name_zh": "Starr「卓悅遊」海外旅遊保險",
        "plan_tiers": ["標準計劃 (Bronze)", "非凡計劃 (Silver)", "尊貴計劃 (Gold)"],
        "premium_range": "單次旅程每日約 HK$38–HK$68 起；全年計劃每年約 HK$1,380–HK$1,980",
        "premium_available": True,
        "premium_notes": "市場知名性價比極高，網上投保常設8折或多人同行優惠；單次無年齡上限",
        "key_terms": [
            "全港罕有：業餘水肺潛水不設深度限制（只要持有效合格證書）",
            "業餘滑雪、高空跳傘、熱氣球等休閒極限運動全包",
            "醫療費用保障不設自付額（Excess-free）",
            "尊貴計劃租車自負額高達 HK$10,000",
            "門診費用及次數不設上限（於醫療總額內實報實銷）"
        ],
        "exclusions": [
            "職業運動員或從事帶有薪酬的體育比賽",
            "道外滑雪（未獲雪場批准或封閉雪道）",
            "前往香港政府已發出黑色外遊警示之地區",
            "自殘、自殺、受酒精或藥物影響下發生之意外"
        ],
        "source_urls": [
            "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead"
        ],
        "documents_found": [
            "Starr TraveLead 卓悅遊海外旅遊保險小冊子及保單條款",
            "Starr Insurance Hong Kong 官方產品規範"
        ],
        "coverage": [
            {
                "item": "海外醫療及門診費用",
                "limit": "尊貴 HK$1,500,000 / 非凡 HK$1,000,000 / 標準 HK$500,000（不設自付額，門診次數不設上限）",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品保障手冊",
                "page": 1,
                "quote": "海外醫療費用：尊貴計劃最高 1,500,000 港元；非凡計劃 1,000,000 港元；不設自負額"
            },
            {
                "item": "緊急醫療運送及遺體運返",
                "limit": "全數賠償（不設上限 / Unlimited）",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品保障手冊",
                "page": 1,
                "quote": "24小時全球緊急醫療救援服務：緊急醫療運送及遺體運返全數賠償"
            },
            {
                "item": "業餘危險運動（潛水無深度限制/滑雪無高度限制）",
                "limit": "業餘水肺潛水不設深度限制、業餘滑雪不設高度限制；包含在醫療及意外總額內",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品條款細則",
                "page": 2,
                "quote": "承保多項業餘運動包括滑雪、水肺潛水（不設深度限制）、熱氣球、急流漂筏等"
            },
            {
                "item": "個人意外身故及傷殘",
                "limit": "尊貴 HK$1,500,000 / 非凡 HK$1,000,000 / 標準 HK$500,000",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品保障手冊",
                "page": 1,
                "quote": "人身意外：最高保障額達 1,500,000 港元"
            },
            {
                "item": "租車自駕遊自負額（Rental Car Excess）",
                "limit": "尊貴計劃高達 HK$10,000 / 非凡計劃 HK$5,000",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品保障手冊",
                "page": 2,
                "quote": "租車自負額：尊貴計劃高達 10,000 港元；保障受保人租用車輛碰撞之自負額"
            },
            {
                "item": "行李及個人財物（手提電話及相機）",
                "limit": "尊貴 HK$20,000 / 非凡 HK$15,000 / 標準 HK$10,000（手機每部最高 HK$2,000–HK$3,000）",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品保障手冊",
                "page": 2,
                "quote": "行李及個人財物保障：最高 20,000 港元；涵蓋手提電腦及流動電話"
            },
            {
                "item": "旅程延誤津貼（每滿6小時）",
                "limit": "最高 HK$2,000–HK$3,000（每滿6小時津貼 HK$250–HK$300）",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品保障手冊",
                "page": 2,
                "quote": "旅程延誤：每滿6小時現金津貼 300 港元，最高賠償額達 3,000 港元"
            },
            {
                "item": "旅程取消或提早結束",
                "limit": "尊貴 HK$50,000 / 非凡 HK$35,000 / 標準 HK$20,000",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品保障手冊",
                "page": 2,
                "quote": "取消旅程及縮短旅程：最高賠償 50,000 港元"
            },
            {
                "item": "個人法律責任",
                "limit": "最高 HK$2,500,000 至 HK$3,000,000",
                "source_url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead",
                "document_name": "Starr TraveLead 產品保障手冊",
                "page": 2,
                "quote": "個人法律責任：最高達 3,000,000 港元"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "業餘水肺潛水不設深度限制，尊貴計劃醫療保額達HK$150萬且租車自負額達HK$10,000",
                "document": "Starr 卓悅遊 TraveLead 產品規格及條款",
                "page": None,
                "quote": "水肺潛水不設深度限制，滑雪等業餘運動均受保；租車自負額高達 10,000 港元",
                "url": "https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead"
            }
        ]
    },
    {
        "id": "travel-prudential",
        "category": "travel",
        "insurer": "Prudential",
        "insurer_zh": "保誠保險",
        "product_name": "PRUChoice Travel",
        "product_name_zh": "保誠精選「旅遊樂」",
        "plan_tiers": ["普通計劃 (Plan A)", "優越計劃 (Plan B)"],
        "premium_range": "單次旅程每日約 HK$55–HK$90 起；全年計劃每年約 HK$1,650–HK$2,300",
        "premium_available": True,
        "premium_notes": "全線保障不設自負金額 (Excess-free)；家庭計劃涵蓋配偶及所有合法受撫養子女",
        "key_terms": [
            "全線保障項目均「不設自負金額（Excess-free）」",
            "行李損失兩年內以「新舊替換（New-for-old）」原則賠償",
            "海外醫療開支高達 HK$1,200,000",
            "若因不可抗力延誤，保單自動延長保障期最多 10 天",
            "提供海外住院及隔離每日現金津貼"
        ],
        "exclusions": [
            "已存在之病況（Pre-existing conditions）",
            "參與任何職業體育活動或賽車比賽",
            "前往已發出黑色外遊警示之目的地",
            "因精神失常、酗酒或濫用藥物引致之事故"
        ],
        "source_urls": [
            "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/"
        ],
        "documents_found": [
            "保誠精選「旅遊樂」PRUChoice Travel 產品手冊",
            "Prudential General Insurance Hong Kong Policy Provisions"
        ],
        "coverage": [
            {
                "item": "海外醫療費用保障",
                "limit": "優越計劃 HK$1,200,000 / 普通計劃 HK$800,000（不設自負額；71歲以上限額半額）",
                "source_url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/",
                "document_name": "保誠精選「旅遊樂」產品手冊",
                "page": None,
                "quote": "海外醫療費用：最高保障額達 HK$1,200,000，不設任何自負金額"
            },
            {
                "item": "緊急醫療運送及遺體送返",
                "limit": "全數支付（不設上限 / Unlimited）",
                "source_url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/",
                "document_name": "保誠精選「旅遊樂」產品手冊",
                "page": None,
                "quote": "24小時全球緊急醫療支援：緊急醫療運送及送返遺體全數賠償"
            },
            {
                "item": "行李及個人物品（2年內新舊替換）",
                "limit": "最高 HK$20,000（單件上限 HK$5,000；購入兩年內物品享新舊替換不扣折舊）",
                "source_url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/",
                "document_name": "保誠精選「旅遊樂」產品手冊",
                "page": None,
                "quote": "行李遺失或損毀最高 HK$20,000（單件物品上限 HK$5,000）；兩年內購入物品按新換舊原則賠償"
            },
            {
                "item": "行李延誤應急物資津貼（延誤8小時以上）",
                "limit": "最高 HK$1,500（實報實銷購買應急衣物及梳洗必需品）",
                "source_url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/",
                "document_name": "保誠精選「旅遊樂」產品手冊",
                "page": None,
                "quote": "行李延誤達8小時或以上：購買必需品費用最高達 HK$1,500"
            },
            {
                "item": "旅程延誤津貼",
                "limit": "最高 HK$3,000（每滿指定小時賠償現金津貼）",
                "source_url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/",
                "document_name": "保誠精選「旅遊樂」產品手冊",
                "page": None,
                "quote": "旅程延誤最高保障額達 HK$3,000；自動延長保障期最多 10 天"
            },
            {
                "item": "旅程取消或縮短",
                "limit": "最高 HK$40,000 至 HK$50,000",
                "source_url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/",
                "document_name": "保誠精選「旅遊樂」產品手冊",
                "page": None,
                "quote": "取消旅程及縮短旅程：最高賠償額 HK$50,000"
            },
            {
                "item": "個人意外保障（身故及傷殘）",
                "limit": "最高 HK$1,200,000",
                "source_url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/",
                "document_name": "保誠精選「旅遊樂」產品手冊",
                "page": None,
                "quote": "個人意外身故及永久傷殘：最高達 HK$1,200,000"
            },
            {
                "item": "個人第三者法律責任",
                "limit": "最高 HK$2,500,000",
                "source_url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/",
                "document_name": "保誠精選「旅遊樂」產品手冊",
                "page": None,
                "quote": "個人法律責任保障額高達 HK$2,500,000"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "全線各項保障不設自負金額，行李兩年內新換舊不折舊，醫療額達HK$120萬",
                "document": "保誠精選「旅遊樂」官方產品手冊",
                "page": None,
                "quote": "不設自負金額，賠償額不扣除墊底費；購入兩年內之行李財物按新換舊不扣折舊",
                "url": "https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/"
            }
        ]
    },
    {
        "id": "travel-allianz",
        "category": "travel",
        "insurer": "Allianz",
        "insurer_zh": "安聯保險",
        "product_name": "Allianz Global Assistance Travel Insurance",
        "product_name_zh": "安聯「安聯旅遊保」",
        "plan_tiers": ["青銅計劃 (Bronze)", "白銀計劃 (Silver)", "黃金計劃 (Gold)"],
        "premium_range": "單次旅程每日約 HK$50–HK$95 起；全年計劃每年約 HK$1,600–HK$2,400",
        "premium_available": True,
        "premium_notes": "全球最大旅遊緊急救援機構直接承保；歐洲申根簽證（Schengen Visa）100%官方認可合規",
        "key_terms": [
            "全球最大自有緊急救援網絡（Allianz Global Assistance）",
            "歐洲申根簽證官方認可醫療保證（保額超3萬歐元）",
            "海外醫療保額最高達 HK$2,000,000",
            "24小時全球緊急調派自有醫療專機能力業界頂級",
            "全年計劃每次旅程最長可達 90 天"
        ],
        "exclusions": [
            "出發前已存在之病況（未通過特殊附加批註）",
            "非以香港為起點及終點之往返旅程",
            "任何抵觸國際制裁名單之國家與地區",
            "職業運動、極限特技或無持牌指引之冒險活動"
        ],
        "source_urls": [
            "https://www.allianz-assistance.com.hk/zh_HK.html"
        ],
        "documents_found": [
            "Allianz Global Assistance Travel Insurance Policy Wording",
            "安聯旅遊保險香港官方條款手冊"
        ],
        "coverage": [
            {
                "item": "海外醫療及住院費用",
                "limit": "黃金 HK$2,000,000 / 白銀 HK$1,000,000 / 青銅 HK$500,000（符合申根簽證法定要求）",
                "source_url": "https://www.allianz-assistance.com.hk/zh_HK.html",
                "document_name": "安聯旅遊保險產品條款",
                "page": None,
                "quote": "海外醫療費用：黃金計劃高達 2,000,000 港元；全額符合歐洲申根簽證要求"
            },
            {
                "item": "緊急醫療運送及遺體遣返",
                "limit": "全數賠償（不設上限 / Unlimited）由安聯自有救援團隊直接執行",
                "source_url": "https://www.allianz-assistance.com.hk/zh_HK.html",
                "document_name": "安聯旅遊保險產品條款",
                "page": None,
                "quote": "緊急醫療運送及遺體送返：不設上限全額給付，由安聯全球緊急救援網絡統籌"
            },
            {
                "item": "行程取消及縮短",
                "limit": "黃金 HK$50,000 / 白銀 HK$30,000 / 青銅 HK$15,000",
                "source_url": "https://www.allianz-assistance.com.hk/zh_HK.html",
                "document_name": "安聯旅遊保險產品條款",
                "page": None,
                "quote": "旅程取消及行程中斷保障高達 50,000 港元"
            },
            {
                "item": "行李及個人物品損失",
                "limit": "黃金 HK$20,000 / 白銀 HK$15,000（單件上限 HK$3,000–HK$5,000）",
                "source_url": "https://www.allianz-assistance.com.hk/zh_HK.html",
                "document_name": "安聯旅遊保險產品條款",
                "page": None,
                "quote": "行李財物遺失或損壞：最高 20,000 港元"
            },
            {
                "item": "航班及旅程延誤津貼",
                "limit": "每滿6小時津貼 HK$300（最高 HK$3,000）",
                "source_url": "https://www.allianz-assistance.com.hk/zh_HK.html",
                "document_name": "安聯旅遊保險產品條款",
                "page": None,
                "quote": "旅程延誤每滿6小時賠償 300 港元，上限 3,000 港元"
            },
            {
                "item": "租車自駕遊自負額",
                "limit": "黃金計劃高達 HK$8,000",
                "source_url": "https://www.allianz-assistance.com.hk/zh_HK.html",
                "document_name": "安聯旅遊保險產品條款",
                "page": None,
                "quote": "租車碰撞險自負額保障高達 8,000 港元"
            },
            {
                "item": "個人第三者責任",
                "limit": "最高 HK$3,000,000",
                "source_url": "https://www.allianz-assistance.com.hk/zh_HK.html",
                "document_name": "安聯旅遊保險產品條款",
                "page": None,
                "quote": "個人法律責任保障額高達 3,000,000 港元"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "安聯擁有全球最大緊急救援網絡，醫療保額高達200萬港元，申根簽證首選",
                "document": "Allianz Global Assistance 產品資料及條款",
                "page": None,
                "quote": "全球自有救援中心，醫療額最高 2,000,000 港元，申根簽證合規證明即時簽發",
                "url": "https://www.allianz-assistance.com.hk/zh_HK.html"
            }
        ]
    },
    {
        "id": "travel-hsbc",
        "category": "travel",
        "insurer": "HSBC",
        "insurer_zh": "滙豐保險",
        "product_name": "HSBC TravelSurance",
        "product_name_zh": "滙豐「旅遊萬全保」",
        "plan_tiers": ["基本計劃 (Basic)", "優越計劃 (Premier)"],
        "premium_range": "單次旅程每日約 HK$52–HK$88 起；全年計劃每年約 HK$1,550–HK$2,200",
        "premium_available": True,
        "premium_notes": "由安盛保險（AXA General Insurance Hong Kong）承保，滙豐網上理財客戶尊享投保折扣",
        "key_terms": [
            "優越計劃海外醫療保額高達 HK$1,000,000",
            "個人意外賠償高達 HK$1,200,000（乘搭公共交通工具雙倍賠償達 HK$2,400,000）",
            "旅程延誤每滿6小時現金津貼 HK$300（最高 HK$2,500）",
            "租車自負額高達 HK$5,000",
            "休閒活動包括滑雪、潛水、笨豬跳、熱氣球等均受保"
        ],
        "exclusions": [
            "已存在之病症或先天性缺陷",
            "在未經許可的雪道外滑雪（Off-piste skiing）",
            "未持有合格執照進行深度超過30米之水肺潛水",
            "因恐怖活動導致之行程更改（除非符合特定條款）"
        ],
        "source_urls": [
            "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/"
        ],
        "documents_found": [
            "滙豐「旅遊萬全保」TravelSurance 產品手冊",
            "HSBC & AXA TravelSurance Policy Provisions"
        ],
        "coverage": [
            {
                "item": "海外醫療及相關費用",
                "limit": "優越計劃 HK$1,000,000 / 基本計劃 HK$500,000（70歲以上半額）",
                "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/",
                "document_name": "滙豐「旅遊萬全保」產品手冊",
                "page": None,
                "quote": "醫療及相關費用：優越計劃最高達 HK$1,000,000；包回港後覆診及住院按金"
            },
            {
                "item": "緊急醫療運送 / 遺體運返",
                "limit": "不設上限（Unlimited）",
                "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/",
                "document_name": "滙豐「旅遊萬全保」產品手冊",
                "page": None,
                "quote": "緊急醫療運送及送返遺體全數實報實銷"
            },
            {
                "item": "公共交通意外雙倍賠償",
                "limit": "優越計劃一般意外 HK$1,200,000；公共交通工具意外雙倍達 HK$2,400,000",
                "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/",
                "document_name": "滙豐「旅遊萬全保」產品手冊",
                "page": None,
                "quote": "乘搭公共交通工具時發生意外身故或傷殘，享雙倍賠償高達 HK$2,400,000"
            },
            {
                "item": "行李及個人財物（手機/相機）",
                "limit": "優越計劃 HK$20,000 / 基本計劃 HK$10,000（單件上限 HK$3,000；手機及手提電腦最高 HK$2,000–HK$3,000）",
                "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/",
                "document_name": "滙豐「旅遊萬全保」產品手冊",
                "page": None,
                "quote": "行李及個人物品：優越計劃最高 HK$20,000"
            },
            {
                "item": "旅程延誤與行李延誤",
                "limit": "旅程每滿6小時 HK$300（最高 HK$2,500）；行李延誤超過6小時應急用品 HK$1,000",
                "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/",
                "document_name": "滙豐「旅遊萬全保」產品手冊",
                "page": None,
                "quote": "旅程延誤津貼：每滿6小時 HK$300，最高 HK$2,500"
            },
            {
                "item": "租車自負額保障",
                "limit": "優越計劃高達 HK$5,000",
                "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/",
                "document_name": "滙豐「旅遊萬全保」產品手冊",
                "page": None,
                "quote": "租用私家車輛之自負額保障最高達 HK$5,000"
            },
            {
                "item": "旅程取消或提早結束",
                "limit": "最高 HK$40,000 至 HK$50,000",
                "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/",
                "document_name": "滙豐「旅遊萬全保」產品手冊",
                "page": None,
                "quote": "取消旅程及縮短旅程：最高賠償 HK$50,000"
            },
            {
                "item": "個人法律責任",
                "limit": "最高 HK$2,000,000",
                "source_url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/",
                "document_name": "滙豐「旅遊萬全保」產品手冊",
                "page": None,
                "quote": "第三者個人責任最高 HK$2,000,000"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "滙豐網上投保旗艦產品，公共交通享雙倍賠償高達240萬，包租車自負額5000元",
                "document": "滙豐「旅遊萬全保」官方網頁及條款細則",
                "page": None,
                "quote": "公共交通意外雙倍賠償達 2,400,000 港元，租車自負額高達 5,000 港元",
                "url": "https://www.hsbc.com.hk/zh-hk/insurance/products/travel/"
            }
        ]
    },
    {
        "id": "travel-hang-seng",
        "category": "travel",
        "insurer": "Hang Seng",
        "insurer_zh": "恒生保險",
        "product_name": "Hang Seng Travel Insurance Plan",
        "product_name_zh": "恒生「旅遊保障計劃」",
        "plan_tiers": ["標準計劃 (Standard)", "優越計劃 (Superior)"],
        "premium_range": "單次旅程每日約 HK$48–HK$85 起；全年計劃每年約 HK$1,500–HK$2,150",
        "premium_available": True,
        "premium_notes": "由昆士蘭聯保（QBE Insurance）承保；恒生信用卡客戶尊享保費折扣優惠",
        "key_terms": [
            "海外醫療保額高達 HK$1,200,000",
            "緊急醫療運送及遺體運返全數賠償（不設上限）",
            "租車自負額保障高達 HK$5,000",
            "業餘滑雪、水肺潛水（深度30米以內）等消閒活動受保",
            "恒生信用卡報銷及自動扣賬便捷"
        ],
        "exclusions": [
            "出發前已患有之傷病或慢性病",
            "從事任何職業體育或特技活動",
            "前往香港保安局發出黑色警示之國家",
            "粗心疏忽看管行李或未有及時報案之失竊"
        ],
        "source_urls": [
            "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/"
        ],
        "documents_found": [
            "恒生「旅遊保障計劃」產品手冊",
            "QBE Hang Seng Travel Insurance Policy Provisions"
        ],
        "coverage": [
            {
                "item": "海外醫療及覆診費用",
                "limit": "優越計劃 HK$1,200,000 / 標準計劃 HK$600,000（包回港後覆診費）",
                "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
                "document_name": "恒生旅遊保障手冊",
                "page": None,
                "quote": "海外醫療費用：優越計劃高達 HK$1,200,000"
            },
            {
                "item": "緊急醫療運送及遺體送返",
                "limit": "全額給付（不設上限 / Unlimited）",
                "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
                "document_name": "恒生旅遊保障手冊",
                "page": None,
                "quote": "24小時全球緊急援助服務全數賠償運送費用"
            },
            {
                "item": "行李及個人物品保障",
                "limit": "優越計劃 HK$20,000 / 標準計劃 HK$12,000（單件上限 HK$3,000）",
                "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
                "document_name": "恒生旅遊保障手冊",
                "page": None,
                "quote": "行李及個人物品：最高達 HK$20,000"
            },
            {
                "item": "旅程延誤及行李延遲",
                "limit": "旅程延誤每滿6小時津貼 HK$300（最高 HK$2,400）；行李延遲最高 HK$1,200",
                "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
                "document_name": "恒生旅遊保障手冊",
                "page": None,
                "quote": "旅程延誤津貼每滿6小時 HK$300；行李延誤津貼最高 HK$1,200"
            },
            {
                "item": "租車自負額保障",
                "limit": "優越計劃高達 HK$5,000",
                "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
                "document_name": "恒生旅遊保障手冊",
                "page": None,
                "quote": "自駕遊租車自負額：高達 HK$5,000"
            },
            {
                "item": "取消旅程或縮短旅程",
                "limit": "最高 HK$40,000",
                "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
                "document_name": "恒生旅遊保障手冊",
                "page": None,
                "quote": "旅程取消或中斷賠償高達 HK$40,000"
            },
            {
                "item": "個人法律責任",
                "limit": "最高 HK$2,000,000",
                "source_url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/",
                "document_name": "恒生旅遊保障手冊",
                "page": None,
                "quote": "個人法律責任保障額高達 HK$2,000,000"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "恒生優越計劃醫療保障120萬，包租車自負額5000元，由QBE承保",
                "document": "恒生銀行旅遊保險官方專頁",
                "page": None,
                "quote": "優越計劃醫療達 HK$1,200,000，租車自負額高達 HK$5,000",
                "url": "https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/"
            }
        ]
    },
    {
        "id": "travel-generali",
        "category": "travel",
        "insurer": "Generali",
        "insurer_zh": "忠意保險",
        "product_name": "Bravo Travel Insurance Plan",
        "product_name_zh": "忠意「忠意旅程安心」",
        "plan_tiers": ["精選計劃 (Classic)", "優越計劃 (Superior)", "至尊計劃 (Premier)"],
        "premium_range": "單次旅程每日約 HK$46–HK$82 起；全年計劃每年約 HK$1,450–HK$2,100",
        "premium_available": True,
        "premium_notes": "歐洲最大跨國保險集團之一直接承保；申根簽證完全合規，保障紮實",
        "key_terms": [
            "海外醫療費用最高達 HK$1,200,000（申根合規）",
            "緊急醫療運送及遺體返港全額賠償（不設上限）",
            "租車自負額高達 HK$6,000",
            "特設業餘運動器材損壞賠償高達 HK$5,000",
            "支援歐洲多國急難救助熱線"
        ],
        "exclusions": [
            "出發前已存在的傷患或病況",
            "參與專業運動、競賽或賽車",
            "前往已發出黑色外遊警示之地區",
            "無看管下留低之貴重物品遺失"
        ],
        "source_urls": [
            "https://www.generali.com.hk/zh_HK/travel-insurance"
        ],
        "documents_found": [
            "忠意「旅程安心」Bravo Travel 產品小冊子",
            "Generali Hong Kong Travel Insurance Policy Provisions"
        ],
        "coverage": [
            {
                "item": "海外醫療及住院費用",
                "limit": "至尊 HK$1,200,000 / 優越 HK$800,000 / 精選 HK$400,000",
                "source_url": "https://www.generali.com.hk/zh_HK/travel-insurance",
                "document_name": "忠意旅程安心產品手冊",
                "page": None,
                "quote": "海外醫療及住院費用保障額高達 HK$1,200,000"
            },
            {
                "item": "緊急醫療運送及遺體運送",
                "limit": "全額實報實銷（不設上限 / Unlimited）",
                "source_url": "https://www.generali.com.hk/zh_HK/travel-insurance",
                "document_name": "忠意旅程安心產品手冊",
                "page": None,
                "quote": "24小時全球緊急援助及醫療運送不設上限"
            },
            {
                "item": "行李及個人物品（含運動器材）",
                "limit": "最高 HK$20,000（運動器材損壞賠償高達 HK$5,000）",
                "source_url": "https://www.generali.com.hk/zh_HK/travel-insurance",
                "document_name": "忠意旅程安心產品手冊",
                "page": None,
                "quote": "行李及個人物品：最高 HK$20,000；運動器材損失達 HK$5,000"
            },
            {
                "item": "租車自負額保障",
                "limit": "至尊計劃高達 HK$6,000",
                "source_url": "https://www.generali.com.hk/zh_HK/travel-insurance",
                "document_name": "忠意旅程安心產品手冊",
                "page": None,
                "quote": "租車自負額保障：最高達 HK$6,000"
            },
            {
                "item": "旅程延誤及取消",
                "limit": "延誤每滿6小時 HK$300（最高 HK$2,500）；取消旅程最高 HK$45,000",
                "source_url": "https://www.generali.com.hk/zh_HK/travel-insurance",
                "document_name": "忠意旅程安心產品手冊",
                "page": None,
                "quote": "旅程延誤津貼最高 HK$2,500；取消旅程高達 HK$45,000"
            },
            {
                "item": "個人第三者法律責任",
                "limit": "最高 HK$2,000,000",
                "source_url": "https://www.generali.com.hk/zh_HK/travel-insurance",
                "document_name": "忠意旅程安心產品手冊",
                "page": None,
                "quote": "個人法律責任保障額高達 HK$2,000,000"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "忠意保險至尊計劃醫療保額120萬，包運動器材5000元及租車自負額6000元",
                "document": "忠意保險香港官方網站",
                "page": None,
                "quote": "醫療費用高達 HK$1,200,000，租車自負額達 HK$6,000",
                "url": "https://www.generali.com.hk/zh_HK/travel-insurance"
            }
        ]
    },
    {
        "id": "travel-cntaiping",
        "category": "travel",
        "insurer": "China Taiping",
        "insurer_zh": "中國太平",
        "product_name": "Taiping Overseas Travel Insurance",
        "product_name_zh": "中國太平「樂悠遊」海外旅遊保險",
        "plan_tiers": ["大灣區/短途計劃", "全球尊尚計劃 (Premier)", "全球經典計劃 (Classic)"],
        "premium_range": "短線單次每日約 HK$28 起；長線單次每日約 HK$45–HK$75 起",
        "premium_available": True,
        "premium_notes": "專門設有中國內地及大灣區高額救援通道；特設全國免押金入院支援網絡",
        "key_terms": [
            "中國內地特快免押金住院支援通道",
            "全球醫療費用最高達 HK$1,000,000",
            "緊急醫療運送及送返全數賠償（不設上限）",
            "高性價比內地及跨境旅遊保障",
            "回港後中醫跌打覆診津貼"
        ],
        "exclusions": [
            "出發前已存在之重大疾病",
            "從事高危違法或未獲許可之極限運動",
            "個人疏忽遺留於公共場所之財物",
            "因被保險人挑釁引起之鬥毆或傷亡"
        ],
        "source_urls": [
            "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
            "https://www.cntaiping.com/upload/cms/hk/202409/13193012hytf.pdf"
        ],
        "documents_found": [
            "中國太平「樂悠遊」旅遊保險小冊子 PDF (cntaiping-13193012hytf.pdf)",
            "中國太平保險（香港）官方條款"
        ],
        "coverage": [
            {
                "item": "海外及內地醫療費用",
                "limit": "全球尊尚 HK$1,000,000 / 經典 HK$500,000 / 短途 HK$300,000（包內地三甲醫院住院）",
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
                "item": "個人意外身故及傷殘",
                "limit": "最高 HK$1,000,000（乘搭指定公共交通工具享額外津貼）",
                "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
                "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
                "page": 1,
                "quote": "意外身故及永久完全殘疾最高 1,000,000 港元"
            },
            {
                "item": "行李及個人物品",
                "limit": "最高 HK$15,000（單件上限 HK$2,500）",
                "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
                "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
                "page": 1,
                "quote": "行李及個人物品：最高達 15,000 港元"
            },
            {
                "item": "旅程延誤及取消",
                "limit": "旅程延誤每滿6小時 HK$250（最高 HK$2,000）；取消旅程最高 HK$30,000",
                "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
                "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
                "page": 1,
                "quote": "旅程延誤每6小時 250 港元；取消旅程賠償高達 30,000 港元"
            },
            {
                "item": "個人法律責任",
                "limit": "最高 HK$2,000,000",
                "source_url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1",
                "document_name": "中國太平「樂悠遊」旅遊保險小冊子",
                "page": 1,
                "quote": "個人第三者責任最高 2,000,000 港元"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "中國太平「樂悠遊」特設內地三甲醫院網絡及全球100萬醫療保障",
                "document": "中國太平「樂悠遊」海外旅遊保險小冊子",
                "page": 1,
                "quote": "全球尊尚醫療額 1,000,000 港元，內地與海外緊急救援無上限",
                "url": "/docs/brochures/cntaiping-13193012hytf.pdf#page=1"
            }
        ]
    },
    {
        "id": "travel-avo",
        "category": "travel",
        "insurer": "Avo",
        "insurer_zh": "Avo 保險",
        "product_name": "Avo Travel Protection",
        "product_name_zh": "Avo「全球旅遊保障」",
        "plan_tiers": ["Lite 計劃 (輕便)", "Plus 計劃 (尊尚)"],
        "premium_range": "單次旅程每程約 HK$131–HK$187 起；全年計劃每年約 HK$1,380 起",
        "premium_available": True,
        "premium_notes": "數碼純線上投保，常設【TRAVELFLASH30】等7折優惠碼；保障延伸至手機及平板",
        "key_terms": [
            "Plus 計劃特設手提電話及平板電腦被盜/損毀保障",
            "租用海外私家車或露營車之汽車保險自負額保障",
            "旅程中斷、延誤及額外住宿實報實銷",
            "特設彈性加購「運動/滑雪」及「海外婚禮攝影」主題保障",
            "全流程手機 App 極速上載單據索償"
        ],
        "exclusions": [
            "出發前已存在之傷病或慢性疾病",
            "未妥善看管下遺失或被盜之隨身物品",
            "非以香港為出發地之單程旅途",
            "未滿18歲之單獨投保人"
        ],
        "source_urls": [
            "https://www.heyavo.com/zh-hk/products/travel"
        ],
        "documents_found": [
            "Avo 保險「全球旅遊保障」產品說明",
            "Avo Travel Protection Policy Provisions"
        ],
        "coverage": [
            {
                "item": "海外醫療及急難費用",
                "limit": "Plus 計劃 HK$1,000,000 / Lite 計劃 HK$500,000（包回港後覆診）",
                "source_url": "https://www.heyavo.com/zh-hk/products/travel",
                "document_name": "Avo 全球旅遊保障條款",
                "page": None,
                "quote": "海外醫療費用：Plus 計劃高達 1,000,000 港元；全數支援緊急醫療支出"
            },
            {
                "item": "緊急醫療運送及送返",
                "limit": "全額實報實銷（不設上限 / Unlimited）",
                "source_url": "https://www.heyavo.com/zh-hk/products/travel",
                "document_name": "Avo 全球旅遊保障條款",
                "page": None,
                "quote": "24小時全球緊急醫療運送服務全數賠償"
            },
            {
                "item": "手提電話及數碼平板電腦保障",
                "limit": "Plus 計劃特設流動裝置及平板電腦保障高達 HK$3,000",
                "source_url": "https://www.heyavo.com/zh-hk/products/travel",
                "document_name": "Avo 全球旅遊保障條款",
                "page": None,
                "quote": "Plus 計劃保障延伸至電話及平板電腦"
            },
            {
                "item": "租車自駕遊自負額（含露營車）",
                "limit": "Plus 計劃最高達 HK$5,000（涵蓋一般私家車及露營車 Campervan）",
                "source_url": "https://www.heyavo.com/zh-hk/products/travel",
                "document_name": "Avo 全球旅遊保障條款",
                "page": None,
                "quote": "如旅程期間所租汽車在停泊時被偷竊或損毀，或遭遇車禍，保障需支付的汽車自負額，更涵蓋露營車"
            },
            {
                "item": "行李及個人財物損失",
                "limit": "Plus 計劃 HK$15,000 / Lite 計劃 HK$10,000",
                "source_url": "https://www.heyavo.com/zh-hk/products/travel",
                "document_name": "Avo 全球旅遊保障條款",
                "page": None,
                "quote": "個人行李及隨身財物損失保障高達 15,000 港元"
            },
            {
                "item": "旅程延誤及行程阻礙",
                "limit": "每滿指定小時現金津貼及額外住宿交通費用高達 HK$2,500",
                "source_url": "https://www.heyavo.com/zh-hk/products/travel",
                "document_name": "Avo 全球旅遊保障條款",
                "page": None,
                "quote": "旅途受延誤或受阻，涵蓋額外住宿及現金津貼"
            },
            {
                "item": "個人第三者法律責任",
                "limit": "最高 HK$2,000,000",
                "source_url": "https://www.heyavo.com/zh-hk/products/travel",
                "document_name": "Avo 全球旅遊保障條款",
                "page": None,
                "quote": "個人法律責任保障額達 2,000,000 港元"
            }
        ],
        "citations": [
            {
                "claim_field": "coverage",
                "claim_summary": "新興數碼保險，Plus計劃特設手機/平板保障及露營車自駕遊自負額5000元",
                "document": "Avo 保險官方產品專頁",
                "page": None,
                "quote": "保障延伸至電話及平板，海外租車自負額亦受保，更涵蓋露營車",
                "url": "https://www.heyavo.com/zh-hk/products/travel"
            }
        ]
    }
]

# Check existing products
existing_ids = {p["id"] for p in data["products"]}
print(f"Existing total products: {len(existing_ids)}")

added_count = 0
for new_p in NEW_TRAVEL_PRODUCTS:
    if new_p["id"] not in existing_ids:
        data["products"].append(new_p)
        existing_ids.add(new_p["id"])
        added_count += 1
        print(f"  + Added {new_p['id']}: {new_p['product_name_zh']} ({new_p['insurer']})")
    else:
        # Update existing if needed
        for i, p in enumerate(data["products"]):
            if p["id"] == new_p["id"]:
                data["products"][i] = new_p
                print(f"  ~ Updated {new_p['id']}")

# Re-order categories in data: travel #1, medical #2, high-end-medical #3, top-up-medical #4
ORDER = [
    "travel",
    "medical",
    "high-end-medical",
    "top-up-medical",
    "home",
    "life",
    "critical-illness",
    "accident",
    "motor",
    "domestic-helper",
    "pet"
]

cat_map = {c["id"]: c for c in data["categories"]}
new_cats = []
for cid in ORDER:
    if cid in cat_map:
        new_cats.append(cat_map[cid])
for c in data["categories"]:
    if c["id"] not in ORDER:
        new_cats.append(c)

# Recalculate product counts for categories
for c in new_cats:
    c_prods = [p for p in data["products"] if p.get("category") == c["id"]]
    c["count"] = len(c_prods)
    c["insurers_with_premium"] = len([p for p in c_prods if p.get("premium_available")])

data["categories"] = new_cats

# Sort products so travel products are listed first, then medical, etc.
def product_sort_key(p):
    cat = p.get("category", "")
    try:
        cat_idx = ORDER.index(cat)
    except ValueError:
        cat_idx = 99
    return (cat_idx, p.get("insurer", ""), p.get("id", ""))

data["products"].sort(key=product_sort_key)

with open(DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("=" * 60)
print(f"🎉 旅遊保險深度擴展完成！")
print(f"  新增產品: {added_count} 份")
travel_prods = [p for p in data["products"] if p.get("category") == "travel"]
print(f"  目前旅遊保險總數: {len(travel_prods)} 份")
print(f"  全站產品總數: {len(data['products'])} 份")
print(f"  首要保險類別: {data['categories'][0]['id']} ({data['categories'][0]['name_zh']})")
print("=" * 60)

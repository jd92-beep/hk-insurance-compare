import json

path = 'public/data/insurance-data.json'
with open(path, 'r', encoding='utf-8') as f:
    d = json.load(f)

promo_updates = {
    "travel-allianz": {
        "tag": "限時 6 折 + 同行 9 折",
        "code": "AZSPECIAL40",
        "discount": "高達 40% OFF",
        "note": "輸入優惠碼享 6 折；2人同行再享折上折額外 9 折（低至 54 折）；歐洲申根官方 100% 認可"
    },
    "travel-zurich": {
        "tag": "網上投保 8 折",
        "code": "MSTRAVEL20",
        "discount": "20% OFF",
        "note": "網上投保常設 8 折至 85 折；長幼醫療全額賠償，電動車租車自負額額外提升 20%"
    },
    "travel-axa": {
        "tag": "網上特惠 8 折至 65 折",
        "code": "AXATRAVEL20",
        "discount": "最高 35% OFF",
        "note": "官網優惠 8 折至 85 折（限時優惠碼可達 65 折）；單次旅程父母投保同行子女免費"
    },
    "travel-dah-sing": {
        "tag": "網上 7 折 + 買二送全家",
        "code": "DS70",
        "discount": "30% OFF",
        "note": "網上投保輸入優惠碼享高達 7 折；家庭計劃收 2 名大人保費即全包隨行所有 18 歲以下子女"
    },
    "travel-generali": {
        "tag": "網上投保 8 折至 85 折",
        "code": "BRAVO20",
        "discount": "最高 20% OFF",
        "note": "官網網上直接投保享 8 折至 85 折；申根簽證完全合規，運動器材賠償達 5,000 港元"
    },
    "travel-aig": {
        "tag": "網上直購 85 折起",
        "code": None,
        "discount": "15% OFF",
        "note": "官網直接網上投保常設 85 折（單次低至 HK$40 起）；特設中國內地及澳門計劃"
    },
    "travel-chubb": {
        "tag": "網上投保 85 折",
        "code": None,
        "discount": "15% OFF",
        "note": "官網投保享 8 折至 85 折；涵蓋廣東及澳門計劃與郵輪專項保障，家庭計劃 2.5 倍包全家"
    },
    "travel-blue-cross": {
        "tag": "至醒會 8 折 / 限時 65 折",
        "code": "RUNHOTEL65",
        "discount": "高達 35% OFF",
        "note": "至醒會會員常設 8 折（碼 BC80），指定推廣碼單次達 65 折、全年 75 折；全球單一收費不分亞洲全球"
    }
}

count = 0
for p in d['products']:
    pid = p.get('id')
    if pid in promo_updates:
        p['promo'] = promo_updates[pid]
        count += 1
        print(f"Updated promo for {pid}: {p['promo']['tag']} | {p['promo']['code']}")

with open(path, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

print(f"Enriched {count} products with verified market codes.")

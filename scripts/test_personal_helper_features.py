import json
import sys

with open('public/data/insurance-data.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

products = db['products']

def match_single_feature(product, keywords):
    kw_lower = [k.lower() for k in keywords]
    covs = product.get('coverage', [])
    key_terms = product.get('key_terms', [])
    plan_tiers = product.get('plan_tiers', [])
    
    for kw in kw_lower:
        for c in covs:
            item = c.get('item', '').lower()
            limit = (c.get('limit') or '').lower()
            if kw in item or kw in limit:
                return True, kw
        for term in key_terms:
            if kw in term.lower():
                return True, kw
        for tier in plan_tiers:
            if kw in tier.lower():
                return True, kw
    return False, None

def check_product_match(product, tags):
    matched_tags = []
    matched_keywords = []
    for tid, label, kws in tags:
        ok, kw = match_single_feature(product, kws)
        if ok:
            matched_tags.append(tid)
            matched_keywords.append(kw)
    score = round(len(matched_tags) / len(tags) * 100) if tags else 100
    return {
        'score': score,
        'matched_count': len(matched_tags),
        'total_selected': len(tags),
        'matched_tags': matched_tags,
        'matched_keywords': matched_keywords
    }

def rank_products(products_list, selected_tag_ids, category_tags):
    valid_tags = [t for t in category_tags if t[0] in selected_tag_ids]
    if not valid_tags:
        return products_list
    
    scored = []
    for p in products_list:
        match_res = check_product_match(p, valid_tags)
        scored.append((p, match_res))
    
    def sort_key(item):
        p, m = item
        prem = 1 if p.get('premium_available') else 0
        return (m['matched_count'], prem)
    
    scored.sort(key=sort_key, reverse=True)
    return scored

# ----------------- ACCIDENT DEFINITIONS (14 TAGS) -----------------
ACCIDENT_TAGS = [
    ('amateur-sports', '業餘及消閒運動受保 (滑雪/潛水/馬拉松)', [
        '業餘及消閒運動', '業餘運動', '消閒運動', '消閒及業餘', '滑雪', '潛水', '高空彈跳', '馬拉松',
        '水上運動', '危險運動', '休閒運動', '冬季運動', '無休閒運動除外', '運動保障', '運動服裝及器材'
    ]),
    ('double-indemnity', '公共交通/特定事故雙倍至三倍賠償', [
        '雙倍', '三倍', '公共交通', '公共交通工具', '定期航班', '客機', '升降機', '火警', '雙倍賠償',
        '三倍賠償', '交通意外', '水浸或山泥傾瀉'
    ]),
    ('medical-reimburse', '意外門診及住院手術實報實銷', [
        '意外醫療', '醫療費用', '實報實銷', '醫療保障', '門診醫療', '急症室', '救護車', '門診及手術',
        '意外醫療費用', '門診開支', '意外醫療費用實報實銷'
    ]),
    ('bone-fracture', '骨折及關節脫臼專項現金津貼', [
        '骨折', '脫臼', '斷骨', '完全骨折', '不完全骨折', '骨裂', '關節脫臼', '骨折保障', '骨折及脫臼'
    ]),
    ('chinese-bonesetter', '中醫跌打及針灸專項門診', [
        '跌打', '中醫', '針灸', '中醫治療', '中醫跌打', '骨傷', '中醫師', '骨傷科', '草藥'
    ]),
    ('physio-chiropractor', '物理治療/脊醫/專職復康門診', [
        '物理治療', '脊醫', '脊椎', '脊椎治療', '物理治療師', '職業治療', '專職醫療', '脊骨神經'
    ]),
    ('accidental-disability', '永久傷殘分級/完全殘廢 100-150% 賠償', [
        '永久傷殘', '完全殘廢', '永久完全傷殘', '喪失肢體', '失明', '雙目失明', '100%', '150%',
        '斷肢', '完全及永久', '永久部分傷殘', '分級賠償', '失聰'
    ]),
    ('daily-hospital-cash', '意外住院每日現金津貼', [
        '住院現金', '每日津貼', '每日現金', '每日住院', '住院入息', '每日意外住院', '住院津貼', '額外每日住院現金'
    ]),
    ('weekly-income-benefit', '暫時傷殘/停工每週意外入息保障', [
        '每週入息', '每週意外入息', '暫時傷殘', '暫時性傷殘', '每週賠償', '收入或付款保障', '轉工津貼',
        '完全暫時傷殘', '局部暫時傷殘', '收入保障'
    ]),
    ('burn-scar-cosmetic', '重大燒傷/意外面部整容修復/疤痕保障', [
        '燒傷', '嚴重燒傷', '三級嚴重燒傷', '疤痕', '面部毀容', '整容手術', '意外整容', '疤痕保障', '重大創傷整容'
    ]),
    ('mobility-appliances', '輪椅/助行拐杖等輔助復康器材租購', [
        '輪椅', '拐杖', '醫療器具', '復康器具', '助行拐杖', '輔助醫療器材', '家居改裝', '指定醫療器具'
    ]),
    ('family-extension', '家庭延伸保障 (子女校內意外/家中看護/年假補償)', [
        '家中看護', '年假補償', '子女校內', '配偶延伸', '父母/配偶年假', '受虐保障', '學校實驗室', '家庭看護費'
    ]),
    ('no-medical-exam', '免體檢極速核保 / 手機即時拍照理賠', [
        '免驗身', '免體檢', '免核保', '毋須驗身', '毋須體檢', '線上極速理賠', '一鍵線上拍照', '網上投保',
        '即時生效', '免驗身免核保'
    ]),
    ('worldwide-emergency', '全球 24 小時緊急救援/醫療運送及送返', [
        '全球', '24小時', '世界各地', '環球', '緊急醫療撤離', '遺體運返', '入院按金', '近親探望',
        '全球緊急支援', '蘇黎世緊急支援', '24小時全球支援'
    ]),
]

ACCIDENT_PRESETS = [
    {
        'id': 'outdoor-sports',
        'title': '戶外運動達人',
        'subtitle': '熱愛滑雪、潛水、馬拉松及水上運動',
        'tag_ids': ['amateur-sports', 'bone-fracture', 'physio-chiropractor', 'worldwide-emergency']
    },
    {
        'id': 'urban-commuter',
        'title': '通勤族 / 白領防傷',
        'subtitle': '日常搭車搭地鐵、跌倒扭傷睇中醫跌打',
        'tag_ids': ['double-indemnity', 'chinese-bonesetter', 'medical-reimburse', 'burn-scar-cosmetic']
    },
    {
        'id': 'senior-fall-care',
        'title': '長者跌倒骨傷防護',
        'subtitle': '預防雨天滑倒骨折、家中看護及助行器材',
        'tag_ids': ['bone-fracture', 'mobility-appliances', 'family-extension', 'chinese-bonesetter']
    },
    {
        'id': 'freelancer-income-shield',
        'title': '自由工作者日常保障',
        'subtitle': '手停口停，重視每日住院津貼及每週入息',
        'tag_ids': ['weekly-income-benefit', 'daily-hospital-cash', 'medical-reimburse', 'no-medical-exam']
    }
]

# ----------------- LIFE DEFINITIONS (14 TAGS) -----------------
LIFE_TAGS = [
    ('term-life', '定期壽險 (Term Life 純保障高槓桿)', [
        '定期壽險', '定期保險', '定期人壽', 'Term Life', '自主保', '純人壽', '純保障', '純人壽保障',
        '消費型定期', '一年定期', '五年定期', '每年續保', '定期保障', '精選定期', '定期'
    ]),
    ('whole-life-savings', '終身壽險 / 儲蓄分紅與現金價值', [
        '儲蓄分紅', '保證現金價值', '非保證紅利', '保證可支取現金', '盈豐寶', '終身人壽', 'Whole Life',
        '保單現金價值', '退保價值', '期滿利益', '週年紅利', '終期紅利'
    ]),
    ('no-medical-exam', '免體檢極速投保 (最高達 400-1,000 萬保額)', [
        '免驗身', '免體檢', '免核保', '簡易核保', '毋須體檢', '免身體檢查', '網上核保', '簡易健康申報',
        '毋須健康申報', '不需體檢', '無需身體檢查', '毋須核保', '免體驗極速核保'
    ]),
    ('terminal-illness', '末期疾病提前預支 100% 身故保額', [
        '末期疾病', '提前給付', '預先給付', '預支身故權益', '末期絕症', '末期保障', '預支身故賠償',
        '預先支付', '提前支付', '預支發放', '提前賠償'
    ]),
    ('double-accidental-death', '交通/突發意外雙倍身故賠償 (200%)', [
        '意外身故雙倍賠償', '雙倍身故', '額外身故', '意外身故', '雙倍賠償', '公共交通意外身故',
        '交通意外身故', '雙倍意外身故'
    ]),
    ('conversion-privilege', '保證免核保轉換終身壽險權 (Guaranteed Conversion)', [
        '轉換權益', '轉換權', '免核保轉換', '保證轉換', '轉為終身', '轉換為終身', '可轉換',
        'Conversion', '轉換為終身保險', '保證免體檢轉換權', '轉換終身壽險', '終身保障計劃'
    ]),
    ('premium-waiver', '完全永久傷殘豁免後續所有保費', [
        '豁免保費', '保費豁免', '免繳保費', '完全及永久傷殘', '永久完全傷殘', '豁免後續所有未繳保費',
        '豁免保費附加保障', '豁免保費保障'
    ]),
    ('life-milestone-increase', '人生里程碑免體檢加保 (結婚/生仔/買樓)', [
        '人生里程碑', '免核保加保', '靈活增加保障選項', '伴你成長', '加保', '買樓等人生里程碑'
    ]),
    ('mortgage-protection', '按揭供樓 / 房貸負債抵押專項保障', [
        '供樓保障', '樂安居', '按揭', '房貸', '負債', '信用卡欠款', '供樓'
    ]),
    ('income-support-benefit', '傷殘或重疾每月入息生活津貼補助', [
        '入息及生活津貼', '生活津貼', '每月發放特定生活津貼', '入息補助', '每月生活津貼'
    ]),
    ('smoker-friendly', '非吸煙者專屬優越健康費率折扣', [
        '非吸煙', '非吸煙者', '優質非吸煙', '優越非吸煙', '標準非吸煙', 'Non-smoker', '健康折扣',
        '非吸煙特惠', '優待費率', '特優保費等級', '專屬特惠費率'
    ]),
    ('compassionate-death', '恩恤身故數日內即時應急撫恤現金', [
        '恩恤身故', '即時援助', '身故體恤', '恩恤保障', '撫恤金', '應急現金', '恩恤撫恤金', '身亡撫恤金'
    ]),
    ('guaranteed-renewable', '保證續保至 80/85/100 歲無須重驗', [
        '保證續保', '續保至80歲', '續保至85歲', '續保至100歲', '可續保至', '終身續保', '保證可續保',
        '85歲', '100歲', '保證續保權益', '80歲'
    ]),
    ('suicide-clause', '保單生效滿 1 年後自殺受保全額賠償', [
        '自殺', '自殺條款', '一年後自殺', '首年不保自殺', '13個月', '一年內自殺', '滿1年後自殺',
        '自殺受保', '首年後自殺涵蓋條款'
    ]),
]

LIFE_PRESETS = [
    {
        'id': 'young-family-pillar',
        'title': '家庭經濟支柱 (高額純定期)',
        'subtitle': '以最低保費撬動千萬身故保障，守護妻兒',
        'tag_ids': ['term-life', 'terminal-illness', 'double-accidental-death', 'premium-waiver', 'smoker-friendly']
    },
    {
        'id': 'instant-no-exam',
        'title': '簡易免體檢極速投保',
        'subtitle': '全網上投保，3分鐘批核，無須驗身',
        'tag_ids': ['no-medical-exam', 'term-life', 'guaranteed-renewable', 'suicide-clause']
    },
    {
        'id': 'mortgage-shield',
        'title': '房貸抵押保障 (供樓無憂)',
        'subtitle': '抵禦上會按揭負債風險，買樓免驗身加保',
        'tag_ids': ['mortgage-protection', 'term-life', 'life-milestone-increase', 'terminal-illness']
    },
    {
        'id': 'wealth-legacy',
        'title': '終身傳承與儲蓄分紅',
        'subtitle': '累積現金價值與紅利，兼享轉換終身權',
        'tag_ids': ['whole-life-savings', 'conversion-privilege', 'guaranteed-renewable', 'compassionate-death']
    }
]

# ----------------- DOMESTIC HELPER DEFINITIONS (14 TAGS) -----------------
HELPER_TAGS = [
    ('statutory-ec', '法定僱員補償 1 億責任保障 (勞保標配)', [
        '僱員補償', '100,000,000', '1億', '僱主法定責任', '勞工保險', '勞保', '僱主責任', '僱主法律責任',
        '法定僱員補償責任'
    ]),
    ('medical-surgery', '外傭外科手術及住院醫療開支全包', [
        '住院及手術', '外科手術', '住院費用', '嚴重疾病住院', '手術及住院', '住院醫療', '大手術',
        '外科手術及住院', '入住醫院費用', '住院及外科手術'
    ]),
    ('clinical-outpatient', '網絡西醫及臨床門診診治費用', [
        '門診費用', '門診臨床', '網絡西醫', '西醫網絡', '診症費', '門診保障', '門診醫療', '家傭門診',
        '西醫臨床', '診所診症'
    ]),
    ('dental-care', '牙科急症止痛 / 補牙拔牙專項護理', [
        '牙科費用', '牙科', '牙醫費用', '牙科保障', '牙科醫療', '牙齒護理', '牙科保健', '牙科重大意外',
        '緊急牙科', '拔牙或補牙', '口腔手術'
    ]),
    ('clinical-bonesetter', '中醫跌打骨傷及針灸專項門診', [
        '中醫', '跌打', '針灸', '骨傷', '中醫骨傷', '中醫跌打', '中醫骨傷跌打針灸門診'
    ]),
    ('helper-fraud-theft', '外傭誠信盜竊 / 擅自挪用僱主金錢財物', [
        '誠信保障', '忠誠保障', '誠實保障', '欺詐', '盜竊', '挪用財物', '擅自挪用', '金錢損失',
        '家傭誠信', '不誠實行為', '不誠實挪用', '誠信盜竊', '家傭忠誠', '珠寶失竊'
    ]),
    ('re-hiring-expenses', '外傭失蹤 / 中途不辭而別補聘津貼', [
        '補聘', '重新招聘', '重聘費用', '更換家傭', '補聘新家傭', '重新聘用', '補聘家傭費用',
        '補聘費用', '更換新外傭', '不辭而別', '簽證費', '招聘及簽證費'
    ]),
    ('anti-loan-locksmith', '僱主防借貸追債 / 更換大門門鎖急修保障', [
        '借貸', '借款', '更換及安裝大門門鎖', '大門門鎖', '換鎖', '未經授權款項', '財務公司',
        '僱主借貸保障', '門鎖或鐵閘鎖'
    ]),
    ('critical-illness-helper', '外傭癌症 / 嚴重疾病一次性心意金', [
        '癌症', '心臟病', '心意金', '嚴重疾病', '危疾保障', '重大疾病', '癌症及心臟病', '嚴重疾病保障',
        '外傭癌症', '慰問金'
    ]),
    ('repatriation-service', '外傭重傷重病或身故遣送原居地保障', [
        '送返', '遣返', '遺體送返', '遺體運返', '遺體運送', '醫療遣返', '醫療送返', '遣返原居地',
        '送返原居地', '運送（遣返）', '遣送費用', '醫療專機', '重病或受傷遣返'
    ]),
    ('service-interruption', '服務中斷 / 聘請本地臨時家務替工津貼', [
        '服務中斷', '中斷服務', '臨時工津貼', '病假津貼', '住院津貼', '臨時替工津貼', '臨時本地家務',
        '臨時家務替代', '替換外傭臨時家務', '家務助理津貼', '替代津貼'
    ]),
    ('rest-day-accident', '外傭休假 / 休息日個人非因工意外保障', [
        '休假期間', '休息日', '個人意外', '休假', '非因工意外', '個人意外保障', '個人意外賠償'
    ]),
    ('family-abuse-protection', '幼兒及長者家庭成員受虐醫療及創傷輔導', [
        '受虐', '蓄意傷害', '惡意行為', '故意/惡意', '家庭成員醫療費用', '家庭成員受虐', '創傷輔導', '故意傷害'
    ]),
    ('free-replacement-name', '合約期內免費更換外傭手續登記一次', [
        '免費更換', '更換外傭', '免費更改受保家傭', '免費更換外傭保單', '免費更換外傭一次',
        '更換外傭免費登記', '免費轉換受保家傭', '更換受保'
    ]),
]

HELPER_PRESETS = [
    {
        'id': 'new-helper-full',
        'title': '新聘菲印傭全方位保障',
        'subtitle': '初到港適應期，防失蹤、補聘及法例勞保',
        'tag_ids': ['statutory-ec', 're-hiring-expenses', 'free-replacement-name', 'clinical-outpatient', 'repatriation-service']
    },
    {
        'id': 'anti-fraud-loan',
        'title': '防詐騙 / 借貸誠信保障',
        'subtitle': '防外傭偷竊挪用、財仔借貸追債及換鎖',
        'tag_ids': ['helper-fraud-theft', 'anti-loan-locksmith', 're-hiring-expenses', 'free-replacement-name']
    },
    {
        'id': 'critical-illness-surgery',
        'title': '外傭大病住院手術無憂',
        'subtitle': '防範外傭患癌、盲腸炎手術巨額私家醫療費',
        'tag_ids': ['medical-surgery', 'critical-illness-helper', 'repatriation-service', 'service-interruption']
    },
    {
        'id': 'practical-basic',
        'title': '性價比實用基礎方案',
        'subtitle': '滿足法定要求，兼備外傭休假意外及牙科',
        'tag_ids': ['statutory-ec', 'rest-day-accident', 'dental-care', 'clinical-bonesetter']
    },
    {
        'id': 'family-guard-infant-elderly',
        'title': '幼兒與長者家庭守護',
        'subtitle': '照顧初生嬰兒或患病老人家，防虐待與疏忽',
        'tag_ids': ['family-abuse-protection', 'helper-fraud-theft', 'clinical-outpatient', 'service-interruption']
    }
]

def run_test(cat_id, category_name, tag_defs, preset_defs):
    cat_prods = [p for p in products if p['category'] == cat_id]
    total = len(cat_prods)
    print(f"\n=======================================================")
    print(f"📊 類別：{category_name} ({cat_id}) — 共 {total} 款產品")
    print(f"=======================================================")
    
    print(f"\n【1. Feature Tags 命中率分析 (共 {len(tag_defs)} 個標籤)】")
    print(f"{'標籤 ID':24} | {'命中數':6} | {'命中率':7} | {'標籤名稱'}")
    print("-" * 75)
    for tid, label, kws in tag_defs:
        matched = []
        for p in cat_prods:
            ok, _ = match_single_feature(p, kws)
            if ok:
                matched.append(p['id'])
        pct = len(matched) / total * 100
        print(f"{tid:24} | {len(matched):2}/{total:2} | {pct:5.1f}% | {label}")
        
    print(f"\n【2. Persona Presets 排序與推薦測試 (共 {len(preset_defs)} 個畫像)】")
    for preset in preset_defs:
        pid = preset['id']
        title = preset['title']
        tags_needed = preset['tag_ids']
        print(f"\n🎯 畫像：【{title}】({preset['subtitle']})")
        print(f"   挑選條件 ({len(tags_needed)} 項): {', '.join(tags_needed)}")
        
        ranked = rank_products(cat_prods, tags_needed, tag_defs)
        
        perfect_matches = [r for r in ranked if r[1]['matched_count'] == len(tags_needed)]
        print(f"   完全滿足 (100% 命中) 產品數: {len(perfect_matches)}/{total}")
        
        print(f"   前 3 名智能推薦方案:")
        for idx, (p, m) in enumerate(ranked[:3], 1):
            p_name = p.get('product_name_zh') or p.get('product_name')
            ins = p.get('insurer_zh') or p.get('insurer')
            prem = p.get('premium_range', '即時報價')
            print(f"     #{idx} [{ins}] {p_name} — 契合度: {m['matched_count']}/{len(tags_needed)} ({m['score']}分) | 保費: {prem}")
            print(f"        命中項目: {', '.join(m['matched_tags'])}")

if __name__ == '__main__':
    cat_arg = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if cat_arg in ('all', 'accident'):
        run_test('accident', '個人意外保險', ACCIDENT_TAGS, ACCIDENT_PRESETS)
    if cat_arg in ('all', 'life'):
        run_test('life', '人壽保險', LIFE_TAGS, LIFE_PRESETS)
    if cat_arg in ('all', 'domestic-helper'):
        run_test('domestic-helper', '家傭保險', HELPER_TAGS, HELPER_PRESETS)

import { useId, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { MOTION } from "@/lib/motion-runtime";
import {
  DEFAULT_FAMILY_PROFILES,
  FAMILY_RESEARCH_CHECKLIST,
  type FamilyMemberProfile,
} from "@/lib/vhis-facts";

const AGE_BANDS: FamilyMemberProfile["ageBand"][] = ["0-17", "18-39", "40-59", "60+"];

/** UI checklist copy — research prompts only, never suitability. */
const SHORT_CHECKLIST: Record<string, { title: string; body: string }> = {
  "existing-cover": { title: "已有咩保障？", body: "公司醫保／個人醫保／危疾；唔好假設自動雙重賠償。" },
  "vhis-type": { title: "標準定靈活？", body: "按年齡、病房需要分開研究；唔好用同一把金額尺。" },
  deductible: { title: "自付費承受幾多？", body: "自付愈高公開保費通常愈低，出資責任愈大。" },
  exclusions: { title: "不保事項／等候期", body: "逐份睇已有病症等限制；等候期影響幾時用到。" },
  evidence: { title: "保存官方文件", body: "存好條款、保費表同收據；快照唔等於現行合約。" },
};

/**
 * Local-only family research workspace.
 * No health data, no accounts, no suitability score, no product ranking.
 */
export default function FamilyResearchPanel() {
  const uid = useId();
  const [profiles, setProfiles] = useState<FamilyMemberProfile[]>(() => DEFAULT_FAMILY_PROFILES.map((p) => ({ ...p })));
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const done = useMemo(() => FAMILY_RESEARCH_CHECKLIST.filter((i) => checked[i.id]).length, [checked]);

  return (
    <section aria-labelledby={`${uid}-title`} className="rounded-card border border-line bg-paper p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-jade">FAMILY RESEARCH · 家庭研究清單</p>
          <h2 id={`${uid}-title`} className="mt-2 font-serif text-2xl font-bold text-ink">
            家庭成員分開研究
          </h2>
        </div>
        <Link to="/guides#vhis" className="inline-flex min-h-11 items-center text-sm font-semibold text-jade underline">
          VHIS 制度重點
        </Link>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
        整理比較前準備事項；資料只存本機。請勿輸入身份證／病歷。非報價、非適合度評分。
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 fold:grid-cols-2 lg:grid-cols-4">
        {profiles.map((profile, index) => (
          <motion.article
            key={profile.id}
            initial={{ opacity: 0, y: MOTION.enterY / 2, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ ...MOTION.springSoft, delay: index * 0.04 }}
            className="rounded-xl border border-line bg-paper-2 p-4"
          >
            <label className="block text-sm font-bold text-ink" htmlFor={`${uid}-${profile.id}-label`}>
              稱呼
            </label>
            <input
              id={`${uid}-${profile.id}-label`}
              value={profile.label}
              maxLength={20}
              onChange={(e) =>
                setProfiles((rows) => rows.map((r) => (r.id === profile.id ? { ...r, label: e.target.value } : r)))
              }
              className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-paper px-3 text-base"
            />
            <label className="mt-3 block text-sm font-bold text-ink" htmlFor={`${uid}-${profile.id}-age`}>
              年齡組別
            </label>
            <select
              id={`${uid}-${profile.id}-age`}
              value={profile.ageBand}
              onChange={(e) =>
                setProfiles((rows) =>
                  rows.map((r) =>
                    r.id === profile.id ? { ...r, ageBand: e.target.value as FamilyMemberProfile["ageBand"] } : r,
                  ),
                )
              }
              className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-paper px-3 text-base"
            >
              {AGE_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
            <label className="mt-3 block text-sm font-bold text-ink" htmlFor={`${uid}-${profile.id}-notes`}>
              備註（勿填敏感資料）
            </label>
            <textarea
              id={`${uid}-${profile.id}-notes`}
              value={profile.notes}
              maxLength={160}
              rows={2}
              onChange={(e) =>
                setProfiles((rows) => rows.map((r) => (r.id === profile.id ? { ...r, notes: e.target.value } : r)))
              }
              placeholder="例如：已有公司醫保"
              className="mt-2 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm"
            />
          </motion.article>
        ))}
      </div>

      <div className="mt-7 rounded-xl border border-line bg-paper-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-ink">比較前檢查清單</h3>
          <p className="font-grotesk text-sm text-ink-soft">
            已整理 {done}/{FAMILY_RESEARCH_CHECKLIST.length} 項 · 非適合度
          </p>
        </div>
        <ul className="mt-3 space-y-3">
          {FAMILY_RESEARCH_CHECKLIST.map((item) => {
            const short = SHORT_CHECKLIST[item.id] ?? { title: item.title, body: item.body };
            return (
              <li key={item.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-line bg-paper px-3 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(checked[item.id])}
                    onChange={() => setChecked((s) => ({ ...s, [item.id]: !s[item.id] }))}
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--jade)]"
                  />
                  <span>
                    <span className="block text-base font-bold text-ink">{short.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{short.body}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-ink-faint">
        制度資料整理 · 非中介人 · 唔提供個人投保建議。
      </p>
    </section>
  );
}

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { MOTION } from "@/lib/motion-runtime";
import {
  COMPLAINT_DATA_NOTE,
  OFFICIAL_EDU_LINKS,
  TRUST_PANEL,
  VHIS_FRAUD_WARNING,
  isOfficialEduHref,
} from "@/lib/trust-methodology";

/** UI bullets only — honesty keywords stay; source of truth remains trust-methodology. */
const SHORT_PROMISES = [
  { id: "no-account", title: "唔使開戶口", body: "瀏覽、搜尋、比較都唔使註冊。" },
  { id: "no-phone", title: "唔收電話／電郵", body: "冇 lead form，唔會轉介 agent。" },
  { id: "official-only", title: "只列官方連結", body: "唔代辦投保、唔代收投訴。" },
  { id: "no-sell", title: "唔賣資料", body: "唔賣保險、唔收轉介費。" },
];

/**
 * Site trust boundary: no accounts, no phone capture, official links only.
 * Not a broker; never invents complaint or claim statistics.
 */
export default function TrustPanel({ snapshotDate }: { snapshotDate?: string }) {
  return (
    <motion.section
      aria-labelledby="trust-panel-title"
      data-testid="trust-panel"
      initial={{ opacity: 0, y: MOTION.enterY, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={MOTION.springSoft}
      className="rounded-card border border-line bg-paper p-5 md:p-7"
    >
      <p className="eyebrow text-red">TRUST · 本站邊界</p>
      <h2 id="trust-panel-title" className="mt-2 font-serif text-2xl font-bold text-ink md:text-3xl">
        {TRUST_PANEL.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
        資料整理同比較工具，唔係中介人。自己研究、自己改排序、自己對官方文件。
      </p>
      {snapshotDate ? (
        <p className="mt-2 text-xs text-ink-faint">快照 {snapshotDate} · 非報價</p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 fold:grid-cols-2">
        {SHORT_PROMISES.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: MOTION.enterY / 2 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...MOTION.springSoft, delay: index * 0.05 }}
            className="rounded-xl border border-line bg-paper-2 p-4"
            data-testid={`trust-promise-${item.id}`}
          >
            <h3 className="text-base font-bold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </motion.article>
        ))}
      </div>

      <div
        className="mt-6 rounded-xl border-l-4 border-red bg-red-wash/40 p-4"
        data-testid="vhis-fraud-warning"
      >
        <h3 className="text-base font-bold text-ink">{VHIS_FRAUD_WARNING.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          認可名單同稅務只信 www.vhis.gov.hk 同保監局官方域名；非官方連結要求填身份證／信用卡要提高警覺。
        </p>
        <p className="mt-2 text-sm font-semibold text-ink">
          只信：www.vhis.gov.hk · 保監局官方域名
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {VHIS_FRAUD_WARNING.trustedHrefs.map((href) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-jade underline"
            >
              {href.replace("https://", "")}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-amber/30 bg-amber/5 p-4" data-testid="complaint-data-note">
        <h3 className="text-base font-bold text-ink">{COMPLAINT_DATA_NOTE.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          投訴數字請查官方；本站唔編造或排名投訴統計。
        </p>
        <p className="mt-2 text-sm font-bold text-ink" data-testid="complaint-not-denial">
          投訴宗數 ≠ 拒賠率。
        </p>
        {isOfficialEduHref(COMPLAINT_DATA_NOTE.officialLink.href) ? (
          <a
            href={COMPLAINT_DATA_NOTE.officialLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-jade underline"
          >
            {COMPLAINT_DATA_NOTE.officialLink.label}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-bold text-ink">官方入口</h3>
        <p className="mt-1 text-sm text-ink-soft">只列官方公開網站；唔代辦投保、唔代收投訴。</p>
        <ul className="mt-3 flex flex-col gap-2">
          {OFFICIAL_EDU_LINKS.filter((link) => isOfficialEduHref(link.href)).map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`official-link-${link.id}`}
                className="group inline-flex min-h-11 max-w-full flex-wrap items-center gap-2 text-base"
              >
                <span className="chip shrink-0 bg-jade-wash font-bold text-jade">{link.org}</span>
                <span className="font-medium text-ink transition-colors group-hover:text-jade group-hover:underline">
                  {link.label}
                </span>
                <ExternalLink
                  size={12}
                  className="shrink-0 text-ink-faint transition-colors group-hover:text-jade"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-ink-faint">
        非持牌中介人 · 唔提供個人投保建議 · 唔保證賠償結果。
      </p>
    </motion.section>
  );
}

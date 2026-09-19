import { motion } from "framer-motion";
import { ExternalLink, FileCheck2, FolderOpen, ShieldAlert } from "lucide-react";
import { CLAIM_RESOURCES } from "@/components/guides/guides-data";
import { GlossaryMoreLink } from "@/components/guides/GlossaryTerm";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const BLOCK_ICONS = [FolderOpen, FileCheck2] as const;

/**
 * 投保／索償教育資源區。
 * 只提供一般資訊同官方教育入口連結，唔係中介人、唔提供投保建議、唔保證賠償。
 */
export default function ClaimResourcesSection() {
  return (
    <section className="py-20 md:py-28" aria-labelledby="claim-resources-heading">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <p className="eyebrow text-red">CLAIM · 投保與索償資訊</p>
          <h2 id="claim-resources-heading" className="display-2 mt-4 text-ink">
            買之前、索償時，先對清楚啲嘢。
          </h2>
          <p className="mt-5 max-w-[38em] text-ink-soft">{CLAIM_RESOURCES.intro}</p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-4 fold:grid-cols-2">
          {CLAIM_RESOURCES.blocks.map((block, index) => {
            const Icon = BLOCK_ICONS[index] ?? FolderOpen;
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: EASE_OUT_EXPO }}
                className="rounded-card border bg-paper-2 p-6"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className="text-red" aria-hidden="true" />
                  <h3 className="text-[18px] font-bold text-ink">{block.title}</h3>
                </div>
                <ul className="mt-4 flex flex-col gap-2">
                  {block.points.map((point) => (
                    <li key={point} className="flex gap-2 text-base leading-relaxed text-ink-soft">
                      <span
                        className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-jade"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.55, delay: 0.12, ease: EASE_OUT_EXPO }}
          className="mt-8 rounded-card border bg-paper p-6"
          style={{ borderColor: "var(--line)" }}
        >
          <h3 className="text-[18px] font-bold text-ink">官方教育同投訴入口</h3>
          <p className="mt-2 text-base text-ink-soft">
            以下只係連結去官方教育／投訴機構網站，方便你自己做功課。本站唔代表、唔代辦、唔代收投訴。
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {CLAIM_RESOURCES.officialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 max-w-full flex-wrap items-center gap-2 text-base"
                >
                  <span className="chip shrink-0 bg-jade-wash font-bold text-jade">
                    {link.org}
                  </span>
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
        </motion.div>

        <div
          className={cn(
            "mt-6 rounded-card border-l-4 bg-amber-wash p-6",
          )}
          style={{ borderLeftColor: "var(--amber)" }}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-[2px] shrink-0 text-amber" aria-hidden="true" />
            <div>
              <p className="text-base font-bold text-ink">{CLAIM_RESOURCES.notAdvisor}</p>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                {CLAIM_RESOURCES.disclaimer}
              </p>
              <GlossaryMoreLink className="mt-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

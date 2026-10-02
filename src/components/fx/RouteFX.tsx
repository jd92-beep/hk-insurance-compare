import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CATEGORY_META } from "@/lib/categories";
import { themeFor, type Theme } from "@/lib/route-theme";
import { DoodleCloud, DoodleHeart, DoodleLeaf, SunMark, WashEdge } from "@/components/fx/Sketch";

/**
 * Route-aware motion: every section of the site gets its own curtain colour, doodle,
 * page-enter choreography and header backdrop, so moving between pages feels like
 * turning to a different hand-made page of the same sunny scrapbook.
 */
function Doodle({ kind, className }: { kind: Theme["doodle"]; className?: string }) {
  switch (kind) {
    case "sun":
      return <SunMark className={className} />;
    case "leaf":
      return <DoodleLeaf className={className} style={{ color: "#6DB35E" }} />;
    case "heart":
      return <DoodleHeart className={className} style={{ color: "#E4573D" }} />;
    case "cloud":
      return <DoodleCloud className={className} />;
    case "umbrella":
      return <Umbrella className={className} />;
    case "scale":
      return <Scale className={className} />;
    case "book":
      return <Book className={className} />;
    case "paper":
      return <Sheets className={className} />;
  }
}

function Umbrella({ className, color = "#E4573D", size }: { className?: string; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 80 80" className={className} width={size ? size * 1.4 : undefined} height={size ? size * 1.4 : undefined} aria-hidden="true">
      <path d="M8 38 A32 30 0 0 1 72 38 Q64 32 56 38 Q48 32 40 38 Q32 32 24 38 Q16 32 8 38Z" fill={color} stroke="#2E2A45" strokeOpacity=".4" strokeWidth="1.6" />
      <path d="M40 8 Q34 22 40 38 M40 8 Q46 22 40 38" fill="none" stroke="#FFF1DC" strokeWidth="2" />
      <path d="M40 38 V66 Q40 72 34 72 Q29 72 29 67" fill="none" stroke="#2E2A45" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Scale({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden="true">
      <path d="M50 10 V70 M34 72 H66" stroke="#2E2A45" strokeWidth="3" strokeLinecap="round" />
      <g className="animate-sway" style={{ transformOrigin: "50px 14px" }}>
        <path d="M14 16 H86" stroke="#2E2A45" strokeWidth="3" strokeLinecap="round" />
        <path d="M14 16 L4 42 H24Z M86 16 L76 42 H96Z" fill="none" stroke="#2E2A45" strokeWidth="2" strokeLinejoin="round" />
        <path d="M4 42 Q14 52 24 42Z" fill="#4E9EDB" stroke="#2E2A45" strokeWidth="1.6" />
        <path d="M76 42 Q86 52 96 42Z" fill="#F2A71B" stroke="#2E2A45" strokeWidth="1.6" />
      </g>
      <circle cx="50" cy="10" r="4" fill="#E4573D" />
    </svg>
  );
}

function Book({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" className={className} aria-hidden="true">
      <path d="M50 14 Q30 4 6 10 V62 Q30 56 50 64 Q70 56 94 62 V10 Q70 4 50 14Z" fill="#FCFCFA" stroke="#2E2A45" strokeWidth="2" strokeLinejoin="round" />
      <path d="M50 14 V64" stroke="#2E2A45" strokeWidth="2" />
      <path d="M14 22 Q28 18 42 22 M14 32 Q28 28 42 32 M14 42 Q28 38 42 42 M58 22 Q72 18 86 22 M58 32 Q72 28 86 32" stroke="#8A6BC4" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Sheets({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 90" className={className} aria-hidden="true">
      <rect x="22" y="12" width="46" height="60" rx="4" fill="#F4F3EF" stroke="#2E2A45" strokeOpacity=".5" strokeWidth="1.6" transform="rotate(-10 45 42)" />
      <rect x="22" y="14" width="46" height="60" rx="4" fill="#FCFCFA" stroke="#2E2A45" strokeOpacity=".5" strokeWidth="1.6" transform="rotate(6 45 44)" />
      <path d="M32 32 H60 M32 42 H58 M32 52 H50" stroke="#F2A71B" strokeWidth="3" strokeLinecap="round" transform="rotate(6 45 44)" />
    </svg>
  );
}

/* ───────────────────────── route curtain ───────────────────────── */

/** Two paper sheets (tinted + cream) sweep up over the old page and lift off the new one. */
export function RouteCurtain({ pathname }: { pathname: string }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  const t = themeFor(pathname);
  const sheet = {
    initial: { y: "105%" },
    animate: { y: ["105%", "0%", "0%", "-105%"] },
  };
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
      <motion.div
        {...sheet}
        transition={{ duration: 1.0, times: [0, 0.3, 0.48, 1], ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-x-0 -bottom-10 -top-10"
        style={{ background: t.tint }}
      >
        <WashEdge className="absolute -top-14 left-0 h-16 md:-top-20 md:h-24" fill={t.tint} />
      </motion.div>
      <motion.div
        {...sheet}
        transition={{ duration: 1.0, delay: 0.06, times: [0, 0.3, 0.46, 1], ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-x-0 -bottom-10 -top-10 flex items-center justify-center"
        style={{ background: "var(--paper)", backgroundImage: "url(/textures/paper-fiber.svg)" }}
      >
        <WashEdge className="absolute -top-14 left-0 h-16 md:-top-20 md:h-24" />
        <motion.div
          initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
          animate={{ scale: [0.4, 1.08, 1, 0.9], rotate: [-30, 6, 0, 10], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.95, times: [0, 0.35, 0.55, 0.85] }}
          className="flex flex-col items-center gap-3"
        >
          <Doodle kind={t.doodle} className="h-24 w-24 drop-shadow-md" />
          <span className="font-serif text-2xl font-bold text-ink">{t.label}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── header backdrops ───────────────────────── */

const FLOAT_SPOTS = [
  { left: "50%", top: "8%", s: 30, d: "11s", delay: "0s" },
  { left: "60%", top: "54%", s: 26, d: "9s", delay: "-3s" },
  { left: "70%", top: "14%", s: 44, d: "13s", delay: "-6s" },
  { left: "79%", top: "60%", s: 34, d: "10s", delay: "-2s" },
  { left: "87%", top: "22%", s: 52, d: "12s", delay: "-5s" },
  { left: "95%", top: "58%", s: 28, d: "8s", delay: "-1s" },
];

function Floaters({ render }: { render: (i: number, size: number) => React.ReactNode }) {
  return (
    <>
      {FLOAT_SPOTS.map((p, i) => (
        <span key={i} className="animate-float absolute" style={{ left: p.left, top: p.top, animationDuration: p.d, animationDelay: p.delay }}>
          {render(i, p.s)}
        </span>
      ))}
    </>
  );
}

function Backdrop({ theme }: { theme: Theme }) {
  switch (theme.key) {
    case "categories":
      return (
        <>
          <Floaters
            render={(i, s) => {
              const meta = Object.values(CATEGORY_META)[i * 2 % 11];
              return (
                <span className="cat-icon block opacity-60" style={{ width: s, height: s, color: meta.color, WebkitMaskImage: `url(${meta.icon})`, maskImage: `url(${meta.icon})` }} />
              );
            }}
          />
        </>
      );
    case "category":
      return (
        <>
          <div className="absolute inset-0" style={{ background: `radial-gradient(900px 380px at 85% 0%, ${theme.tint}33, transparent 70%)` }} />
          <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[20%] h-40 w-full opacity-40">
            <path d="M0 200 C 240 140 420 230 720 180 C 1000 132 1200 220 1440 170 L1440 300 L0 300Z" fill={theme.tint} />
          </svg>
          <Floaters render={(_, s) => <DoodleLeaf className="opacity-50" style={{ width: s * 0.7, height: s * 0.7, color: theme.tint }} />} />
        </>
      );
    case "compare":
      return (
        <>
          <Scale className="absolute right-[6%] top-10 hidden h-44 w-56 opacity-70 md:block" />
          <Floaters render={(i, s) => <DoodleCloud className="opacity-80" style={{ width: s * 2, height: s, transform: `translateX(${i % 2 ? 0 : 20}px)` }} />} />
        </>
      );
    case "favorites":
      return (
        <div className="absolute inset-x-0 bottom-0 h-full">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="animate-rise absolute bottom-0"
              style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-i * 0.6}s`, animationDuration: `${6 + (i % 4)}s`, ["--dx" as string]: `${(i % 3) * 20 - 20}px` }}
            >
              <DoodleHeart style={{ width: 18 + (i % 4) * 8, height: 18 + (i % 4) * 8, color: i % 3 ? "#E4573D" : "#F59AB0" }} />
            </span>
          ))}
        </div>
      );
    case "insurers":
      return <Floaters render={(i, s) => <Umbrella className="opacity-70" size={s} color={["#E4573D", "#4E9EDB", "#F2A71B", "#3F9A5B"][i % 4]} />} />;
    case "vhis":
    case "product":
      return (
        <>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 top-[38%] h-24 w-full opacity-40">
            <motion.path
              d="M0 60 H420 L450 60 L470 20 L495 100 L520 40 L540 60 H900 L930 60 L950 25 L975 95 L1000 45 L1020 60 H1440"
              fill="none"
              stroke="#3F9A5B"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1] }}
              transition={{ duration: 4, times: [0, 0.7, 1], repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
          <Floaters render={(i, s) => <DoodleLeaf className="opacity-60" style={{ width: s * 0.8, height: s * 0.8, color: i % 2 ? "#6DB35E" : "#A9D28F" }} />} />
        </>
      );
    case "guides":
      return (
        <>
          <div
            className="absolute inset-0 opacity-60"
            style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 31px, rgba(78,158,219,.22) 31px 32px)" }}
          />
          <div className="absolute inset-y-0 left-[clamp(12px,5vw,72px)] w-px bg-red/30" />
          <Book className="absolute right-[7%] top-12 hidden h-36 w-48 -rotate-6 opacity-80 md:block" />
        </>
      );
    case "documents":
      return (
        <>
          <Sheets className="absolute right-[6%] top-8 hidden h-48 w-48 rotate-6 opacity-80 md:block" />
          <Sheets className="absolute right-[18%] top-24 hidden h-32 w-32 -rotate-12 opacity-50 md:block" />
        </>
      );
    case "about":
      return <SunMark className="absolute -right-16 -top-16 h-80 w-80 opacity-70" />;
    default:
      return <SunMark className="absolute -right-10 -top-10 h-56 w-56 opacity-50" />;
  }
}

/** Decorative header scenery behind each page (parallax on scroll, faded at the bottom). */
export function PageBackdrop({ pathname }: { pathname: string }) {
  const theme = themeFor(pathname);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 140]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.2]);
  if (theme.key === "home") return null;
  return (
    <motion.div
      key={pathname}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.8 } }}
      style={{ WebkitMaskImage: "linear-gradient(180deg, black 55%, transparent)", maskImage: "linear-gradient(180deg, black 55%, transparent)" }}
    >
      <motion.div className="absolute inset-0" style={{ y, opacity }}>
        <Backdrop theme={theme} />
      </motion.div>
    </motion.div>
  );
}

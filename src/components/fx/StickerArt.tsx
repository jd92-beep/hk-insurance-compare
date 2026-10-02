/**
 * Hand-drawn travel stickers (ink outline + flat watercolour-ish fills).
 * Used inside <Sticker>, which adds the die-cut white border, thickness and 3D tilt.
 */
const INK = "#2E2A45";
const S = { stroke: INK, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

type P = { className?: string };

export function PlaneArt({ className }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className}>
      <path d="M8 46 L96 22 Q112 18 112 28 Q112 36 98 40 L24 60 Z" fill="#FFFFFF" {...S} />
      <path d="M52 36 L70 8 L82 6 L74 32 Z" fill="#4E9EDB" {...S} />
      <path d="M44 50 L58 72 L70 70 L66 46 Z" fill="#4E9EDB" {...S} />
      <path d="M12 46 L6 30 L16 30 L26 42 Z" fill="#E4573D" {...S} />
      <circle cx="84" cy="30" r="2.6" fill={INK} />
      <circle cx="74" cy="33" r="2.6" fill={INK} />
      <circle cx="64" cy="36" r="2.6" fill={INK} />
    </svg>
  );
}

export function PalmArt({ className }: P) {
  return (
    <svg viewBox="0 0 100 120" className={className}>
      <path d="M50 112 Q46 80 52 44" fill="none" stroke="#8A5A3B" strokeWidth="9" strokeLinecap="round" />
      <path d="M50 112 Q46 80 52 44" fill="none" {...S} strokeWidth="2" />
      <path d="M52 44 Q30 20 6 34 Q30 30 52 44Z" fill="#5FA55A" {...S} />
      <path d="M52 44 Q74 16 96 30 Q72 28 52 44Z" fill="#3F9A5B" {...S} />
      <path d="M52 44 Q44 12 60 4 Q56 26 52 44Z" fill="#82BE6D" {...S} />
      <path d="M52 44 Q24 48 14 66 Q34 50 52 44Z" fill="#3F9A5B" {...S} />
      <path d="M52 44 Q80 48 90 66 Q70 50 52 44Z" fill="#5FA55A" {...S} />
      <circle cx="48" cy="48" r="5" fill="#8A5A3B" {...S} strokeWidth="2" />
      <path d="M20 114 Q50 104 80 114" fill="#F2C77A" {...S} />
    </svg>
  );
}

export function SuitcaseArt({ className }: P) {
  return (
    <svg viewBox="0 0 110 100" className={className}>
      <path d="M40 22 V12 Q40 8 44 8 H66 Q70 8 70 12 V22" fill="none" {...S} />
      <rect x="10" y="22" width="90" height="66" rx="10" fill="#F2A71B" {...S} />
      <path d="M32 22 V88 M78 22 V88" {...S} />
      <rect x="44" y="40" width="22" height="16" rx="3" fill="#FFFFFF" {...S} transform="rotate(-8 55 48)" />
      <circle cx="26" cy="92" r="4" fill={INK} />
      <circle cx="84" cy="92" r="4" fill={INK} />
      <path d="M16 34 Q22 30 26 36" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function CameraArt({ className }: P) {
  return (
    <svg viewBox="0 0 110 86" className={className}>
      <path d="M36 18 L42 8 H68 L74 18" fill="#5A6680" {...S} />
      <rect x="8" y="18" width="94" height="60" rx="10" fill="#4E9EDB" {...S} />
      <rect x="8" y="30" width="94" height="10" fill="#2F6E8F" {...S} />
      <circle cx="55" cy="48" r="20" fill="#FFFFFF" {...S} />
      <circle cx="55" cy="48" r="12" fill="#2E2A45" />
      <circle cx="50" cy="43" r="3.5" fill="#fff" />
      <rect x="80" y="22" width="12" height="6" rx="2" fill="#FFD36B" {...S} strokeWidth="2" />
    </svg>
  );
}

export function StampArt({ className, text = "HKG → BALI" }: P & { text?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <circle cx="60" cy="60" r="54" fill="#FFFFFF" stroke="#E4573D" strokeWidth="3" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="#E4573D" strokeWidth="2" strokeDasharray="4 4" />
      <text x="60" y="56" textAnchor="middle" fontFamily="Caveat, cursive" fontWeight="700" fontSize="20" fill="#E4573D">
        {text}
      </text>
      <text x="60" y="78" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="11" fill="#E4573D" letterSpacing="2">
        INSURED ✓
      </text>
      <path d="M22 92 Q60 104 98 92" fill="none" stroke="#E4573D" strokeWidth="2" />
    </svg>
  );
}

export function SunglassesArt({ className }: P) {
  return (
    <svg viewBox="0 0 120 56" className={className}>
      <path d="M6 14 Q60 4 114 14" fill="none" {...S} />
      <path d="M10 16 H52 Q54 44 32 46 Q10 46 10 16Z" fill="#E4573D" {...S} />
      <path d="M68 16 H110 Q110 46 88 46 Q66 44 68 16Z" fill="#E4573D" {...S} />
      <path d="M52 20 Q60 14 68 20" fill="none" {...S} />
      <path d="M18 22 Q24 20 28 26 M76 22 Q82 20 86 26" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function ShellArt({ className }: P) {
  return (
    <svg viewBox="0 0 100 92" className={className}>
      <path d="M50 86 Q10 84 8 46 Q10 10 50 6 Q90 10 92 46 Q90 84 50 86Z" fill="#F59AB0" {...S} />
      <path d="M50 86 L50 10 M50 86 L22 18 M50 86 L78 18 M50 86 L10 42 M50 86 L90 42" fill="none" {...S} strokeWidth="2" />
      <path d="M36 86 Q50 94 64 86" fill="#F2A71B" {...S} />
    </svg>
  );
}

export function BikeArt({ className }: P) {
  return (
    <svg viewBox="0 0 130 80" className={className}>
      <circle cx="28" cy="54" r="20" fill="#FFFFFF" {...S} />
      <circle cx="102" cy="54" r="20" fill="#FFFFFF" {...S} />
      <path d="M28 54 L52 24 L88 24 L102 54 M52 24 L64 54 L88 24 M64 54 L28 54" fill="none" stroke="#3F9A5B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 54 L52 24 L88 24 L102 54 M52 24 L64 54 L88 24 M64 54 L28 54" fill="none" {...S} strokeWidth="1.6" />
      <path d="M46 16 H60 M86 16 Q92 10 98 16" {...S} />
      <path d="M86 16 L88 24 M52 16 L52 24" {...S} />
      <path d="M92 66 Q96 72 100 66" fill="none" stroke="#FFD36B" strokeWidth="3" />
    </svg>
  );
}

export function SurfboardArt({ className }: P) {
  return (
    <svg viewBox="0 0 60 130" className={className}>
      <path d="M30 4 Q54 40 48 96 Q44 124 30 126 Q16 124 12 96 Q6 40 30 4Z" fill="#4E9EDB" {...S} />
      <path d="M30 8 Q30 70 30 122" fill="none" stroke="#FFFFFF" strokeWidth="5" />
      <path d="M14 60 Q30 54 46 60" fill="none" stroke="#FFD36B" strokeWidth="5" />
      <path d="M30 8 Q30 70 30 122" fill="none" {...S} strokeWidth="1.4" />
    </svg>
  );
}

export function SunArt({ className }: P) {
  return (
    <svg viewBox="-60 -60 120 120" className={className}>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M-6 -36 L0 -56 L6 -36Z" fill={i % 2 ? "#FFD66B" : "#F2A71B"} {...S} strokeWidth="2" transform={`rotate(${i * 30})`} />
      ))}
      <circle r="30" fill="#FFC93C" {...S} />
      <path d="M-11 6 Q0 16 11 6" fill="none" {...S} />
      <circle cx="-10" cy="-6" r="3" fill={INK} />
      <circle cx="10" cy="-6" r="3" fill={INK} />
      <circle cx="-18" cy="6" r="4" fill="#F59AB0" opacity=".7" />
      <circle cx="18" cy="6" r="4" fill="#F59AB0" opacity=".7" />
    </svg>
  );
}

export function HeartArt({ className }: P) {
  return (
    <svg viewBox="0 0 80 72" className={className}>
      <path d="M40 66 C 12 48, 4 32, 8 20 C 12 6, 30 4, 40 18 C 50 4, 68 6, 72 20 C 76 32, 68 48, 40 66Z" fill="#E4573D" {...S} />
      <path d="M18 18 Q22 12 28 14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function ShieldArt({ className }: P) {
  return (
    <svg viewBox="0 0 90 104" className={className}>
      <path d="M45 6 L82 18 V50 Q82 82 45 98 Q8 82 8 50 V18 Z" fill="#3F9A5B" {...S} />
      <path d="M45 16 L72 25 V50 Q72 74 45 87 Z" fill="#82BE6D" />
      <path d="M28 52 L40 64 L64 38" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 6 L82 18 V50 Q82 82 45 98 Q8 82 8 50 V18 Z" fill="none" {...S} />
    </svg>
  );
}

export function PawArt({ className }: P) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M50 54 C 32 54 22 72 28 82 C 34 92 44 86 50 86 C 56 86 66 92 72 82 C 78 72 68 54 50 54Z" fill="#F2A71B" {...S} />
      <ellipse cx="24" cy="44" rx="9" ry="12" fill="#F2A71B" {...S} transform="rotate(-20 24 44)" />
      <ellipse cx="40" cy="26" rx="9" ry="12" fill="#F2A71B" {...S} transform="rotate(-6 40 26)" />
      <ellipse cx="60" cy="26" rx="9" ry="12" fill="#F2A71B" {...S} transform="rotate(6 60 26)" />
      <ellipse cx="76" cy="44" rx="9" ry="12" fill="#F2A71B" {...S} transform="rotate(20 76 44)" />
      <path d="M40 66 Q44 62 48 64" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function FishArt({ className }: P) {
  return (
    <svg viewBox="0 0 120 70" className={className}>
      <path d="M14 35 Q40 6 78 20 Q92 26 98 35 Q92 44 78 50 Q40 64 14 35Z" fill="#7FB9E6" {...S} />
      <path d="M96 35 L116 18 L114 52 Z" fill="#4E9EDB" {...S} />
      <circle cx="34" cy="31" r="4" fill={INK} />
      <path d="M52 22 Q60 35 52 48 M64 24 Q72 35 64 46" fill="none" {...S} strokeWidth="2" />
      <path d="M22 44 Q28 46 34 44" fill="none" {...S} strokeWidth="2" />
    </svg>
  );
}

export function HouseArt({ className }: P) {
  return (
    <svg viewBox="0 0 110 100" className={className}>
      <path d="M10 48 L55 10 L100 48" fill="#E4573D" {...S} />
      <rect x="20" y="44" width="70" height="48" rx="4" fill="#FFFFFF" {...S} />
      <rect x="46" y="62" width="18" height="30" rx="3" fill="#8A5A3B" {...S} />
      <rect x="28" y="54" width="14" height="14" rx="2" fill="#FFD36B" {...S} />
      <rect x="70" y="54" width="14" height="14" rx="2" fill="#FFD36B" {...S} />
      <rect x="74" y="16" width="10" height="20" fill="#C2412A" {...S} />
      <path d="M8 94 Q55 86 102 94" fill="none" stroke="#3F9A5B" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function KeyArt({ className }: P) {
  return (
    <svg viewBox="0 0 120 60" className={className}>
      <circle cx="28" cy="30" r="20" fill="#F2A71B" {...S} />
      <circle cx="28" cy="30" r="7" fill="#FFFFFF" {...S} />
      <path d="M48 30 H110 V40 H100 V34 H90 V42 H80 V34 H48 Z" fill="#F2A71B" {...S} />
    </svg>
  );
}

export function CrossArt({ className }: P) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="8" y="8" width="84" height="84" rx="22" fill="#FFFFFF" {...S} />
      <path d="M40 22 H60 V40 H78 V60 H60 V78 H40 V60 H22 V40 H40 Z" fill="#3F9A5B" {...S} />
      <path d="M44 26 H50" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function CarArt({ className }: P) {
  return (
    <svg viewBox="0 0 140 80" className={className}>
      <path d="M10 56 V44 Q10 36 20 34 L36 30 L52 14 Q56 10 64 10 H92 Q100 10 106 16 L120 32 Q132 34 132 44 V56 Z" fill="#4E9EDB" {...S} />
      <path d="M56 18 H72 V32 H44 Z M78 18 H96 L108 32 H78 Z" fill="#E2F0FB" {...S} strokeWidth="2" />
      <circle cx="38" cy="58" r="12" fill={INK} />
      <circle cx="38" cy="58" r="5" fill="#fff" />
      <circle cx="104" cy="58" r="12" fill={INK} />
      <circle cx="104" cy="58" r="5" fill="#fff" />
      <rect x="122" y="40" width="10" height="6" rx="2" fill="#FFD36B" {...S} strokeWidth="2" />
    </svg>
  );
}

export function HelmetArt({ className }: P) {
  return (
    <svg viewBox="0 0 120 90" className={className}>
      <path d="M12 62 Q12 14 62 12 Q110 14 110 58 L96 64 Q60 70 12 62Z" fill="#E4573D" {...S} />
      <path d="M30 22 Q40 40 36 62 M62 12 V66 M92 22 Q84 40 88 64" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".85" />
      <path d="M12 62 Q12 14 62 12 Q110 14 110 58 L96 64 Q60 70 12 62Z" fill="none" {...S} />
      <path d="M26 66 Q20 82 34 84 M96 64 Q102 80 88 84" fill="none" {...S} />
    </svg>
  );
}

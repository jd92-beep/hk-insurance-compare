/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /**
       * Foldable / mid-width screens (single source of truth).
       * Half-open ~560–717 → multi-col early; unfolded ~840–904 → denser grids.
       * Aliases: unfold === fold-wide; widefold is the mobile-compare boundary.
       */
      screens: {
        fold: "560px",
        "fold-wide": "840px",
        unfold: "840px",
        widefold: "900px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* ── 保險明選 design tokens ─────────────────────── */
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        paper: {
          DEFAULT: "#FCFCFA",
          2: "#F4F3EF",
          3: "#E9E6DF",
        },
        ink: {
          DEFAULT: "#2E2A45",
          soft: "#5F5A72",
          faint: "#958FA3",
        },
        /* "red" token = coral sunset (primary action) */
        red: {
          DEFAULT: "#E4573D",
          deep: "#C2412A",
          wash: "#FDE7DE",
        },
        /* "jade" token = leaf green (health) */
        jade: {
          DEFAULT: "#3F9A5B",
          wash: "#E4F3E1",
        },
        /* "amber" token = sunshine gold */
        amber: {
          DEFAULT: "#F2A71B",
          wash: "#FFF2D2",
        },
        sky: {
          DEFAULT: "#4E9EDB",
          wash: "#E2F0FB",
        },
        cat: {
          home: "#D9733F",
          travel: "#3D8FD1",
          life: "#8A6BC4",
          "critical-illness": "#E25B5B",
          accident: "#E39A12",
          medical: "#3F9A5B",
          motor: "#5A6680",
          "domestic-helper": "#C46BA8",
          pet: "#F0843F",
        },
      },
      fontFamily: {
        serif: ["'LXGW WenKai TC'", "'Noto Sans TC'", "serif"],
        sans: ["'Nunito'", "'Noto Sans TC'", "system-ui", "sans-serif"],
        grotesk: ["'Nunito'", "'Noto Sans TC'", "sans-serif"],
        hand: ["'Caveat'", "'LXGW WenKai TC'", "cursive"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        card: "22px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 1px 0 rgba(120,80,30,.06), 0 10px 24px -14px rgba(120,80,30,.28)",
        lift: "0 2px 0 rgba(120,80,30,.06), 0 22px 44px -18px rgba(120,80,30,.36)",
        sun: "0 0 0 6px rgba(242,167,27,.18), 0 14px 34px -10px rgba(228,87,61,.45)",
      },
      maxWidth: {
        site: "1280px",
        wide: "1440px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        marquee: "marquee 40s linear infinite",
        "spin-slow": "spin-slow 120s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
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
        /* ── 保險格價站 design tokens ─────────────────────── */
        paper: {
          DEFAULT: "#F7F4EE",
          2: "#EFEAE0",
          3: "#E7E1D4",
        },
        ink: {
          DEFAULT: "#181D2E",
          soft: "#4B5165",
          faint: "#8A8FA0",
        },
        red: {
          DEFAULT: "#C8102E",
          deep: "#9E0C24",
          wash: "#FBEAEC",
        },
        jade: {
          DEFAULT: "#0E7C66",
          wash: "#E4F2EE",
        },
        amber: {
          DEFAULT: "#D98E04",
          wash: "#FBF1DC",
        },
        cat: {
          home: "#B5533C",
          travel: "#2E6FDB",
          life: "#5B4FA6",
          "critical-illness": "#C8102E",
          accident: "#D98E04",
          medical: "#0E7C66",
          motor: "#3C4A63",
          "domestic-helper": "#7A4FB5",
          pet: "#E0662B",
        },
      },
      fontFamily: {
        serif: ["'Noto Serif TC'", "Georgia", "serif"],
        sans: ["'Space Grotesk'", "'Noto Sans TC'", "system-ui", "sans-serif"],
        grotesk: ["'Space Grotesk'", "'Noto Sans TC'", "sans-serif"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        card: "14px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 1px 0 rgba(24,29,46,.06)",
        lift: "0 12px 32px -12px rgba(24,29,46,.18)",
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

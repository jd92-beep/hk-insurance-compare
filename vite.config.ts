import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Critical path is the shell entry + CSS; large route/pdf chunks stay lazy.
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        /**
         * Split long-lived vendors so the shell entry stays small and browsers
         * can cache motion/pdf code independently across releases.
         * Dynamic imports (pages, pdfjs) still create their own chunks.
         */
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("pdfjs-dist")) return "pdfjs";
          if (
            id.includes("framer-motion") ||
            id.includes("motion-dom") ||
            id.includes("motion-utils")
          ) {
            return "vendor-framer";
          }
          if (id.includes("@gsap") || id.includes("/gsap/") || id.endsWith("/gsap")) {
            return "vendor-gsap";
          }
          if (id.includes("lenis")) return "vendor-lenis";
          if (id.includes("recharts") || id.includes("/d3-") || id.includes("d3-")) {
            return "vendor-recharts";
          }
          if (id.includes("react-router")) return "vendor-router";
          if (
            id.includes("/react-dom/") ||
            id.includes("/react/") ||
            id.includes("scheduler")
          ) {
            return "vendor-react";
          }
          if (id.includes("@radix-ui") || id.includes("/cmdk/")) {
            return "vendor-radix";
          }
          if (id.includes("lucide-react")) return "vendor-lucide";
          return undefined;
        },
      },
    },
  },
});

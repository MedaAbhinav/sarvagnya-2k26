import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },

  // Fixed base path for GitHub Pages:
  // https://medaabhinav.github.io/sarvagnya-2k26/
  base: "/sarvagnya-2k26/",

  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion-vendor": ["framer-motion"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "ui-vendor": ["react-hook-form", "react-hot-toast", "lucide-react"],
        },
      },
    },
  },
});

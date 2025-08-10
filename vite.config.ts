import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { Buffer } from "buffer"

// https://vite.dev/config/
export default defineConfig({
  appType: "spa",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "global.Buffer": Buffer,
    "global": "globalThis",
  },
  optimizeDeps: {
    include: ["buffer"],
  },
})

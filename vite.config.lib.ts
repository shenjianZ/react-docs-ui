import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import dts from "vite-plugin-dts"

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), dts({ include: ["src"], outDir: "dist/types" })],
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "ReactDocsUI",
        fileName: format => `react-docs-ui.${format}.js`,
        formats: ["es", "umd"],
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react-router-dom",
          "clsx",
          "tailwind-merge",
          "buffer",
        ],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react-router-dom": "ReactRouterDOM",
            clsx: "clsx",
            "tailwind-merge": "tailwindMerge",
            buffer: "Buffer",
          },
          assetFileNames: assetInfo => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "react-docs-ui.css"
            }
            return assetInfo.name ?? "[name][extname]"
          },
        },
      },
      cssCodeSplit: false,
      sourcemap: true,
      // 确保 CSS 被正确处理
      cssMinify: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})



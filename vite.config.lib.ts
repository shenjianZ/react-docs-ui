import path from "path"
import fs from "node:fs"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import dts from "vite-plugin-dts"

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      dts({
        tsconfigPath: "./tsconfig.json",
        outDir: "./dist/types",
        insertTypesEntry: true,
        copyDtsFiles: true,
      }),
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "ReactDocsUI",
        fileName: format => `react-docs-ui.${format}.js`,
        formats: ["es"],
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react-router-dom",
          "clsx",
          "tailwind-merge",
          "buffer",
          "@mdx-js/loader",
          "@mdx-js/react",
          "@radix-ui/react-collapsible",
          "@radix-ui/react-context-menu",
          "@radix-ui/react-dialog",
          "@radix-ui/react-dropdown-menu",
          "@radix-ui/react-scroll-area",
          "@radix-ui/react-slot",
          "@radix-ui/react-tooltip",
          "class-variance-authority",
          "cmdk",
          "gray-matter",
          "js-yaml",
          "katex",
          "katex-physics",
          "lucide-react",
          "next-themes",
          "react-markdown",
          "rehype-autolink-headings",
          "rehype-highlight",
          "rehype-katex",
          "rehype-raw",
          "rehype-slug",
          "remark-gfm",
          "remark-math",
          "tailwind-merge",
          "unist-util-visit",
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
          sourcemap: false,
        },
      },
      cssCodeSplit: false,
      sourcemap: false,
      esbuild: { sourcemap: false },
      emptyOutDir: true,
      copyPublicDir: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})



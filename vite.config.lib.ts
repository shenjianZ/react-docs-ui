import path from "path"
import fs from "node:fs"
import crypto from "node:crypto"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import dts from "vite-plugin-dts"

function extractFontDataUrisPlugin() {
  return {
    name: "extract-font-data-uris",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist")
      const cssPath = path.resolve(distDir, "react-docs-ui.css")

      if (!fs.existsSync(cssPath)) {
        return
      }

      const css = fs.readFileSync(cssPath, "utf8")
      const fontDir = path.resolve(distDir, "fonts")
      const fontAssetMap = new Map<string, string>()

      const nextCss = css.replace(
        /url\(data:font\/([a-z0-9+.-]+);base64,([A-Za-z0-9+/=]+)\)/gi,
        (_match, mimeSubtype: string, base64Value: string) => {
          const normalizedSubtype = mimeSubtype.toLowerCase()
          const ext =
            normalizedSubtype.includes("woff2") ? "woff2" :
            normalizedSubtype.includes("woff") ? "woff" :
            normalizedSubtype.includes("ttf") ? "ttf" :
            normalizedSubtype.includes("otf") ? "otf" :
            normalizedSubtype.includes("opentype") ? "otf" :
            "bin"

          const hash = crypto
            .createHash("sha256")
            .update(base64Value)
            .digest("hex")
            .slice(0, 16)

          const fileName = `${hash}.${ext}`

          if (!fontAssetMap.has(fileName)) {
            fs.mkdirSync(fontDir, { recursive: true })
            fs.writeFileSync(
              path.resolve(fontDir, fileName),
              Buffer.from(base64Value, "base64")
            )
            fontAssetMap.set(fileName, `./fonts/${fileName}`)
          }

          return `url('${fontAssetMap.get(fileName)}')`
        }
      )

      if (nextCss !== css) {
        fs.writeFileSync(cssPath, nextCss, "utf8")
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      extractFontDataUrisPlugin(),
      dts({
        tsconfigPath: "./tsconfig.lib.json",
        outDir: "./dist/types",
        insertTypesEntry: true,
        copyDtsFiles: true,
      }),
    ],
    build: {
      lib: {
        entry: {
          "react-docs-ui": path.resolve(__dirname, "src/index.ts"),
          "docs-app": path.resolve(__dirname, "src/docs-app.ts"),
        },
        name: "ReactDocsUI",
        fileName: (format, entryName) => `${entryName}.${format}.js`,
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
          "rehype-katex",
          "rehype-raw",
          "rehype-slug",
          "remark-gfm",
          "remark-math",
          "tailwind-merge",
          "unist-util-visit",
          "shiki",
          "@shikijs/transformers",
          "flexsearch",
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
      assetsInlineLimit: 0,
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

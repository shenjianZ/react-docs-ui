import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type UserConfig, type ViteDevServer } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { fontDownloadPlugin } from "./plugins/font-download-plugin";

function publicHmrPlugin(): Plugin {
    return {
        name: 'public-hmr',
        configureServer(server: ViteDevServer) {
            const publicDir = path.resolve(__dirname, 'public')
            const configDir = path.resolve(publicDir, 'config')
            const docsDir = path.resolve(publicDir, 'docs')

            server.watcher.add([configDir, docsDir])

            const isTargetFile = (file: string) => {
                const relativePath = path.relative(publicDir, file)
                return (
                    relativePath.startsWith('config' + path.sep) && file.endsWith('.yaml')
                ) || (
                    relativePath.startsWith('docs' + path.sep) &&
                    (file.endsWith('.md') || file.endsWith('.mdx'))
                )
            }

            const triggerReload = (file: string) => {
                if (isTargetFile(file)) {
                    server.ws.send({ type: 'full-reload', path: '*' })
                }
            }

            server.watcher.on('change', triggerReload)
            server.watcher.on('add', triggerReload)
        }
    }
}

async function searchIndexPlugin() {
    const { searchIndexPlugin: createPlugin } = await import('./src/lib/search/search-index-plugin.ts')
    return createPlugin({
        publicDir: 'public',
        enabled: true,
    })
}

const searchPlugin = await searchIndexPlugin()

const config: UserConfig = {
    appType: "spa",
    plugins: [react(), tailwindcss(), nodePolyfills(), fontDownloadPlugin(), publicHmrPlugin(), searchPlugin],
    publicDir: "public",
    server: {
        host: "0.0.0.0",
        port: 5173,
    },
    build: {
        copyPublicDir: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            buffer: "buffer/",
        },
    },
    define: {
        global: "globalThis",
    },
    optimizeDeps: {
        exclude: ['@node-rs/jieba', '@node-rs/jieba-wasm32-wasi'],
    },
    ssr: {
        external: ['@node-rs/jieba', '@node-rs/jieba-wasm32-wasi'],
    },
}

export default defineConfig(config)

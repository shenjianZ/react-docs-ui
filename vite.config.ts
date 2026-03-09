import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

function publicHmrPlugin() {
    return {
        name: 'public-hmr',
        configureServer(server) {
            const publicDir = path.resolve(__dirname, 'public')
            const configDir = path.resolve(publicDir, 'config')
            const docsDir = path.resolve(publicDir, 'docs')

            server.watcher.add([configDir, docsDir])

            const isTargetFile = (file) => {
                const relativePath = path.relative(publicDir, file)
                return (
                    relativePath.startsWith('config' + path.sep) && file.endsWith('.yaml')
                ) || (
                    relativePath.startsWith('docs' + path.sep) &&
                    (file.endsWith('.md') || file.endsWith('.mdx'))
                )
            }

            const triggerReload = (file) => {
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

export default defineConfig(async () => {
    const searchPlugin = await searchIndexPlugin()
    
    return {
        appType: "spa",
        plugins: [react(), tailwindcss(), nodePolyfills(), publicHmrPlugin(), searchPlugin],
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
})

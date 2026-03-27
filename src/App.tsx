import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { useState, useEffect, useMemo } from "react"
import type { ComponentType } from "react"
import yaml from "js-yaml"

import { ThemeProvider } from "@/components/theme-provider"
import { FontProvider } from "@/components/FontProvider"
import { SearchProvider } from "@/components/search"
import { SearchLauncherProvider } from "@/components/SearchLauncher"
import { GlobalContextMenu } from "@/components/GlobalContextMenu"
import { ComponentProvider } from "@/components/ComponentProvider"
import { ChangelogPage } from "@/pages/ChangelogPage"
import { DocsPage } from "@/pages/DocsPage"
import { HomePage } from "@/pages/HomePage"
import { AIProvider } from "@/components/ai"
import { Toaster } from "@/components/ui/toaster"
import { scanComponents, loadComponents, getBuiltinComponents } from "@/lib/component-scanner"
import type { SiteConfig } from "@/lib/config"

function App() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [components, setComponents] = useState<Record<string, ComponentType<unknown>>>(() => getBuiltinComponents())
  const location = useLocation()

  const lang = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean)
    return parts[0] === "en" || parts[0] === "zh-cn" ? parts[0] : "zh-cn"
  }, [location.pathname])

  const version = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean)
    return parts[1] === "v" ? parts[2] : undefined
  }, [location.pathname])

  useEffect(() => {
    let cancelled = false

    const loadConfig = async () => {
      try {
        const filePath = `/config/site${lang === "zh-cn" ? "" : "." + lang}.yaml`

        const tryFetch = async (path: string) => {
          const r = await fetch(path)
          return r.ok ? r : null
        }

        const res = (await tryFetch(filePath)) || (await tryFetch(`/config/site.yaml`))
        if (res && !cancelled) {
          const text = await res.text()
          const cfg = yaml.load(text) as SiteConfig
          setConfig(cfg)

          if (cfg?.mdx?.enabled !== false) {
            try {
              const componentsPath = cfg?.mdx?.componentsPath || '/src/components'
              const componentsConfig = cfg?.mdx?.components
              const componentList = await scanComponents(componentsPath)
              const loadedComponents = await loadComponents(componentList, componentsConfig)
              if (!cancelled) {
                setComponents(loadedComponents)
              }
            } catch (error) {
              console.warn('[MDX] 加载组件失败:', error)
            }
          }
        }
      } catch (e) {
        console.error('[Config] 加载配置失败:', e)
      }
    }

    loadConfig()

    return () => {
      cancelled = true
    }
  }, [lang])

  const aiEnabled = config?.ai?.enabled === true
  const searchConfig = config?.search || {}
  const searchEnabled = searchConfig?.enabled !== false

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <FontProvider config={config} lang={lang}>
        <AIProvider>
          <ComponentProvider components={components}>
            <SearchProvider
              lang={lang}
              version={version}
              enabled={searchEnabled}
              maxResults={searchConfig?.maxResults}
            >
              <SearchLauncherProvider
                lang={lang}
                version={version}
                enabled={searchEnabled}
                maxResults={searchConfig?.maxResults}
                placeholder={searchConfig?.placeholder}
              >
                <GlobalContextMenu config={config?.contextMenu}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/:lang/changelog" element={<ChangelogPage />} />
                    <Route path="/:lang" element={<DocsPage aiEnabled={aiEnabled} />} />
                    <Route path="/:lang/v/:version" element={<DocsPage aiEnabled={aiEnabled} />} />
                    <Route path="/:lang/v/:version/*" element={<DocsPage aiEnabled={aiEnabled} />} />
                    <Route path="/:lang/*" element={<DocsPage aiEnabled={aiEnabled} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </GlobalContextMenu>
              </SearchLauncherProvider>
            </SearchProvider>
            <Toaster />
          </ComponentProvider>
        </AIProvider>
      </FontProvider>
    </ThemeProvider>
  )
}

export default App

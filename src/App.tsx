import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { useState, useEffect, useMemo } from "react"
import yaml from "js-yaml"

import { ThemeProvider } from "@/components/theme-provider"
import { SearchProvider, SearchDialog } from "@/components/search"
import { GlobalContextMenu } from "@/components/GlobalContextMenu"
import { DocsPage } from "@/pages/DocsPage"
import { HomePage } from "@/pages/HomePage"
import { AIProvider } from "@/components/ai"
import { Toaster } from "@/components/ui/toaster"

interface AppConfig {
  ai?: { enabled?: boolean }
  search?: {
    enabled?: boolean
    placeholder?: string
    maxResults?: number
  }
}

function App() {
  const [aiEnabled, setAiEnabled] = useState(false)
  const [searchConfig, setSearchConfig] = useState<AppConfig['search']>({})
  const location = useLocation()

  const lang = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean)
    return parts[0] === "en" || parts[0] === "zh-cn" ? parts[0] : "zh-cn"
  }, [location.pathname])

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const filePath = `/config/site${lang === "zh-cn" ? "" : "." + lang}.yaml`

        const tryFetch = async (path: string) => {
          const r = await fetch(path)
          return r.ok ? r : null
        }

        const res = (await tryFetch(filePath)) || (await tryFetch(`/config/site.yaml`))
        if (res) {
          const text = await res.text()
          const cfg = yaml.load(text) as Record<string, unknown>
          const aiConfig = cfg?.ai as { enabled?: boolean } | undefined
          const searchCfg = cfg?.search as AppConfig['search'] | undefined
          setAiEnabled(aiConfig?.enabled === true)
          setSearchConfig(searchCfg || {})
        }
      } catch (e) {
        console.error('[Config] 加载配置失败:', e)
        setAiEnabled(false)
      }
    }

    loadConfig()
  }, [lang])

  const searchEnabled = searchConfig?.enabled !== false

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AIProvider>
        <SearchProvider lang={lang} enabled={searchEnabled} maxResults={searchConfig?.maxResults}>
          <GlobalContextMenu>
            <SearchDialog placeholder={searchConfig?.placeholder} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/:lang" element={<DocsPage aiEnabled={aiEnabled} />} />
              <Route path="/:lang/*" element={<DocsPage aiEnabled={aiEnabled} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </GlobalContextMenu>
        </SearchProvider>
        <Toaster />
      </AIProvider>
    </ThemeProvider>
  )
}

export default App

import { Navigate, Route, Routes } from "react-router-dom"
import { useState, useEffect } from "react"
import yaml from "js-yaml"

import { ThemeProvider } from "@/components/theme-provider"
import { CommandMenu } from "@/components/CommandMenu"
import { GlobalContextMenu } from "@/components/GlobalContextMenu"
import { DocsPage } from "@/pages/DocsPage"
import { HomePage } from "@/pages/HomePage"
import { AIProvider } from "@/components/ai"
import { Toaster } from "@/components/ui/toaster"

function App() {
  const [aiEnabled, setAiEnabled] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 基于当前 URL 的语言段加载对应配置
        const parts = window.location.pathname.split("/").filter(Boolean)
        const lang = parts[0] === "en" || parts[0] === "zh-cn" ? parts[0] : "zh-cn"
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
          setAiEnabled(aiConfig?.enabled === true)
        }
      } catch (e) {
        console.error('[AI] App.tsx 加载配置失败:', e)
        setAiEnabled(false)
      }
    }

    loadConfig()
  }, [])

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AIProvider>
        <GlobalContextMenu>
          <CommandMenu />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:lang" element={<DocsPage aiEnabled={aiEnabled} />} />
            <Route path="/:lang/*" element={<DocsPage aiEnabled={aiEnabled} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </GlobalContextMenu>
        <Toaster />
      </AIProvider>
    </ThemeProvider>
  )
}

export default App

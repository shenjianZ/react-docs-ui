import { createContext, useContext, useEffect, useMemo } from "react"
import type { SiteConfig } from "../lib/config"

type FontProviderProps = {
  children: React.ReactNode
  config: SiteConfig | null
  lang?: string
}

type FontContextValue = {
  fontFamilyZhCn: string
  fontFamilyEn: string
}

const defaultFonts: FontContextValue = {
  fontFamilyZhCn: "PingFang SC, Microsoft YaHei, Noto Sans SC, sans-serif",
  fontFamilyEn: "Fragment Mono, system-ui, sans-serif",
}

const FontContext = createContext<FontContextValue>(defaultFonts)

export function useFonts() {
  return useContext(FontContext)
}

export function FontProvider({ children, config, lang = "zh-cn" }: FontProviderProps) {
  const fonts = useMemo(() => {
    const fontFamilyZhCn = config?.fonts?.fontFamilyZhCn || defaultFonts.fontFamilyZhCn
    const fontFamilyEn = config?.fonts?.fontFamilyEn || defaultFonts.fontFamilyEn
    return { fontFamilyZhCn, fontFamilyEn }
  }, [config?.fonts?.fontFamilyZhCn, config?.fonts?.fontFamilyEn])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--font-family-zh-cn", fonts.fontFamilyZhCn)
    root.style.setProperty("--font-family-en", fonts.fontFamilyEn)
    
    const isZhCn = lang === "zh-cn" || lang.startsWith("zh")
    const primaryFont = isZhCn ? fonts.fontFamilyZhCn : fonts.fontFamilyEn
    root.style.setProperty("--font-family-primary", primaryFont)
  }, [fonts, lang])

  return (
    <FontContext.Provider value={fonts}>
      {children}
    </FontContext.Provider>
  )
}

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
  fontFamilyZhCn: "MiSans, PingFang SC, Noto Sans SC, Microsoft YaHei, sans-serif",
  fontFamilyEn: "Fragment Mono, system-ui, sans-serif",
}

const FONT_STYLE_ID = "react-docs-ui-font-face-styles"
const FONT_FACE_CSS = `
@font-face {
  font-family: 'Fragment Mono';
  src: url('/fonts/FragmentMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Fragment Mono';
  src: url('/fonts/FragmentMono-Italic.woff2') format('woff2');
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: 'MiSans';
  src: url('/fonts/MiSans-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'MiSans';
  src: url('/fonts/MiSans-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'MiSans';
  src: url('/fonts/MiSans-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
`

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
    let styleElement = document.getElementById(FONT_STYLE_ID) as HTMLStyleElement | null
    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = FONT_STYLE_ID
      styleElement.textContent = FONT_FACE_CSS
      document.head.appendChild(styleElement)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--font-family-zh-cn", fonts.fontFamilyZhCn)
    root.style.setProperty("--font-family-en", fonts.fontFamilyEn)
    root.setAttribute("data-docs-lang", lang)
    
    const isZhCn = lang === "zh-cn" || lang.startsWith("zh")
    const primaryFont = isZhCn ? fonts.fontFamilyZhCn : fonts.fontFamilyEn
    root.style.setProperty("--font-family-primary", primaryFont)
    let idleId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const requestIdle = "requestIdleCallback" in globalThis
      ? globalThis.requestIdleCallback.bind(globalThis)
      : null
    const cancelIdle = "cancelIdleCallback" in globalThis
      ? globalThis.cancelIdleCallback.bind(globalThis)
      : null

    if (isZhCn) {
      const preloadMiSans = () => {
        void Promise.allSettled([
          document.fonts.load('normal 400 16px "MiSans"', "中文"),
          document.fonts.load('normal 500 16px "MiSans"', "中文"),
          document.fonts.load('normal 700 16px "MiSans"', "中文"),
        ])
      }

      if (requestIdle) {
        idleId = requestIdle(() => {
          preloadMiSans()
        })
      } else {
        timeoutId = globalThis.setTimeout(() => {
          preloadMiSans()
        }, 0)
      }
    }

    return () => {
      if (idleId !== null && cancelIdle) {
        cancelIdle(idleId)
      }
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId)
      }
      root.removeAttribute("data-docs-lang")
    }
  }, [fonts, lang])

  return (
    <FontContext.Provider value={fonts}>
      {children}
    </FontContext.Provider>
  )
}

import { createContext, useContext, useEffect, useMemo, useState } from "react"
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

const fallbackFonts: FontContextValue = {
  fontFamilyZhCn: "PingFang SC, Noto Sans SC, Microsoft YaHei, sans-serif",
  fontFamilyEn: "system-ui, sans-serif",
}

const FONT_STYLE_ID = "react-docs-ui-font-face-styles"
const CONTENT_READY_EVENT = "react-docs-ui:content-ready"
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

function ensureFontFaceStyle() {
  let styleElement = document.getElementById(FONT_STYLE_ID) as HTMLStyleElement | null
  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = FONT_STYLE_ID
    styleElement.textContent = FONT_FACE_CSS
    document.head.appendChild(styleElement)
  }
}

const FontContext = createContext<FontContextValue>(defaultFonts)

function extractPrimaryFontFamily(fontFamily: string): string | null {
  const primary = fontFamily
    .split(",")[0]
    ?.trim()
    .replace(/^['"]|['"]$/g, "")

  return primary || null
}

export function useFonts() {
  return useContext(FontContext)
}

export function FontProvider({ children, config, lang = "zh-cn" }: FontProviderProps) {
  const configuredFonts = useMemo(() => {
    const fontFamilyZhCn = config?.fonts?.fontFamilyZhCn || defaultFonts.fontFamilyZhCn
    const fontFamilyEn = config?.fonts?.fontFamilyEn || defaultFonts.fontFamilyEn
    return { fontFamilyZhCn, fontFamilyEn }
  }, [config?.fonts?.fontFamilyZhCn, config?.fonts?.fontFamilyEn])
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    setFontsReady(false)

    let cancelled = false
    let idleId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let loadTimeoutId: ReturnType<typeof setTimeout> | null = null
    let removeLoadListener: (() => void) | null = null
    let contentReadyTimeoutId: ReturnType<typeof setTimeout> | null = null

    const root = document.documentElement
    root.style.setProperty("--font-family-zh-cn", fallbackFonts.fontFamilyZhCn)
    root.style.setProperty("--font-family-en", fallbackFonts.fontFamilyEn)
    root.setAttribute("data-docs-lang", lang)

    const isZhCn = lang === "zh-cn" || lang.startsWith("zh")
    const primaryFont = isZhCn
      ? fallbackFonts.fontFamilyZhCn
      : fallbackFonts.fontFamilyEn
    root.style.setProperty("--font-family-primary", primaryFont)

    const requestIdle = "requestIdleCallback" in globalThis
      ? globalThis.requestIdleCallback.bind(globalThis)
      : null
    const cancelIdle = "cancelIdleCallback" in globalThis
      ? globalThis.cancelIdleCallback.bind(globalThis)
      : null

    const applyConfiguredFonts = () => {
      if (cancelled) {
        return
      }

      root.style.setProperty("--font-family-zh-cn", configuredFonts.fontFamilyZhCn)
      root.style.setProperty("--font-family-en", configuredFonts.fontFamilyEn)
      root.style.setProperty(
        "--font-family-primary",
        isZhCn ? configuredFonts.fontFamilyZhCn : configuredFonts.fontFamilyEn
      )
      setFontsReady(true)
    }

    const zhPrimaryFont = extractPrimaryFontFamily(configuredFonts.fontFamilyZhCn)
    const enPrimaryFont = extractPrimaryFontFamily(configuredFonts.fontFamilyEn)

    const loadConfiguredFonts = async () => {
      ensureFontFaceStyle()

      const tasks: Promise<unknown>[] = []

      if (zhPrimaryFont) {
        tasks.push(
          document.fonts.load(`normal 400 16px "${zhPrimaryFont}"`, "中文"),
          document.fonts.load(`normal 500 16px "${zhPrimaryFont}"`, "中文"),
          document.fonts.load(`normal 700 16px "${zhPrimaryFont}"`, "中文")
        )
      }

      if (enPrimaryFont) {
        tasks.push(
          document.fonts.load(`normal 400 16px "${enPrimaryFont}"`, "Docs"),
          document.fonts.load(`italic 400 16px "${enPrimaryFont}"`, "Docs")
        )
      }

      if (tasks.length === 0) {
        applyConfiguredFonts()
        return
      }

      await Promise.allSettled(tasks)
      applyConfiguredFonts()
    }

    const startLoadingFonts = () => {
      void loadConfiguredFonts()
    }

    const scheduleFontLoading = () => {
      if (cancelled) {
        return
      }

      if (requestIdle) {
        idleId = requestIdle(() => {
          startLoadingFonts()
        })
        return
      }

      timeoutId = globalThis.setTimeout(() => {
        startLoadingFonts()
      }, 2000)
    }

    const beginAfterContentReady = () => {
      if (cancelled) {
        return
      }

      if (contentReadyTimeoutId !== null) {
        globalThis.clearTimeout(contentReadyTimeoutId)
        contentReadyTimeoutId = null
      }

      scheduleFontLoading()
    }

    const onContentReady = () => {
      beginAfterContentReady()
    }

    globalThis.addEventListener(CONTENT_READY_EVENT, onContentReady, { once: true })

    if (document.readyState !== "complete") {
      const onWindowLoad = () => {
        removeLoadListener?.()
        removeLoadListener = null
        if (loadTimeoutId !== null) {
          globalThis.clearTimeout(loadTimeoutId)
          loadTimeoutId = null
        }
      }

      globalThis.addEventListener("load", onWindowLoad, { once: true })
      removeLoadListener = () => {
        globalThis.removeEventListener("load", onWindowLoad)
      }

      // Fallback for environments where load is delayed or missed.
      loadTimeoutId = globalThis.setTimeout(() => {
        onWindowLoad()
      }, 1500)
    }

    // Fallback: fonts still eventually load, but only well after the page has settled.
    contentReadyTimeoutId = globalThis.setTimeout(() => {
      beginAfterContentReady()
    }, 8000)

    return () => {
      cancelled = true

      if (idleId !== null && cancelIdle) {
        cancelIdle(idleId)
      }
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId)
      }
      if (loadTimeoutId !== null) {
        globalThis.clearTimeout(loadTimeoutId)
      }
      if (contentReadyTimeoutId !== null) {
        globalThis.clearTimeout(contentReadyTimeoutId)
      }
      removeLoadListener?.()
      globalThis.removeEventListener(CONTENT_READY_EVENT, onContentReady)
      root.removeAttribute("data-docs-lang")
    }
  }, [configuredFonts, lang])

  return (
    <FontContext.Provider value={fontsReady ? configuredFonts : fallbackFonts}>
      {children}
    </FontContext.Provider>
  )
}

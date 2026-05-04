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

type FontFaceSource = {
  family: string
  fileStems: string[]
}

type FontFaceVariant = {
  weight: number
  style: "normal" | "italic"
  suffixes: string[]
}

const FONT_STYLE_ID = "react-docs-ui-font-face-styles"
const CONTENT_READY_EVENT = "react-docs-ui:content-ready"
const BUILTIN_FONT_FAMILIES = new Set(["Fragment Mono", "MiSans"])
const GENERIC_FONT_FAMILIES = new Set([
  "-apple-system",
  "arial",
  "blinkmacsystemfont",
  "cursive",
  "emoji",
  "fangsong",
  "fantasy",
  "math",
  "microsoft yahei",
  "monospace",
  "noto color emoji",
  "pingfang sc",
  "sans-serif",
  "segoe ui",
  "serif",
  "system-ui",
  "ui-monospace",
  "ui-rounded",
  "ui-sans-serif",
  "ui-serif",
])
const FONT_FACE_VARIANTS: FontFaceVariant[] = [
  { weight: 400, style: "normal", suffixes: ["400", "Regular"] },
  { weight: 400, style: "italic", suffixes: ["Italic", "400Italic", "RegularItalic"] },
  { weight: 500, style: "normal", suffixes: ["500", "Medium"] },
  { weight: 600, style: "normal", suffixes: ["600", "SemiBold", "Semibold"] },
  { weight: 700, style: "normal", suffixes: ["700", "Bold"] },
]
const FONT_FILE_EXTENSIONS = ["woff2", "woff"]
const BUILTIN_FONT_FACE_CSS = `
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

function splitFontFamilyList(fontFamily: string) {
  const families: string[] = []
  let current = ""
  let quote: "'" | "\"" | null = null

  for (const char of fontFamily) {
    if ((char === "'" || char === "\"") && !quote) {
      quote = char
      current += char
      continue
    }

    if (quote === char) {
      quote = null
      current += char
      continue
    }

    if (char === "," && !quote) {
      families.push(current)
      current = ""
      continue
    }

    current += char
  }

  if (current) {
    families.push(current)
  }

  return families
    .map(font => font.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean)
}

function getFontFileStems(fontFamily: string) {
  const exactStem = fontFamily.trim()
  const compactStem = exactStem.replace(/[\s_-]+/g, "")
  return [...new Set([exactStem, compactStem])].filter(Boolean)
}

function escapeCssString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, " ")
}

function getConfiguredFontFaceSources(configuredFonts: FontContextValue) {
  const sources = new Map<string, FontFaceSource>()

  for (const fontFamily of [
    extractPrimaryFontFamily(configuredFonts.fontFamilyZhCn),
    extractPrimaryFontFamily(configuredFonts.fontFamilyEn),
  ]) {
    if (!fontFamily || BUILTIN_FONT_FAMILIES.has(fontFamily)) {
      continue
    }

    const normalizedName = fontFamily.toLowerCase()
    if (GENERIC_FONT_FAMILIES.has(normalizedName)) {
      continue
    }

    const fileStems = getFontFileStems(fontFamily)
    if (fileStems.length === 0) {
      continue
    }

    sources.set(fontFamily, { family: fontFamily, fileStems })
  }

  return [...sources.values()]
}

function buildFontFaceSrc(source: FontFaceSource, suffixes: string[]) {
  const family = escapeCssString(source.family)
  const urls = source.fileStems.flatMap(fileStem =>
    suffixes.flatMap(suffix =>
      FONT_FILE_EXTENSIONS.map(extension => {
        const fileName = encodeURIComponent(`${fileStem}-${suffix}.${extension}`)
        const format = extension === "woff2" ? "woff2" : "woff"
        return `url("/fonts/${fileName}") format("${format}")`
      })
    )
  )

  return [`local("${family}")`, ...urls].join(",\n    ")
}

function buildConfiguredFontFaceCss(configuredFonts: FontContextValue) {
  return getConfiguredFontFaceSources(configuredFonts)
    .flatMap(source =>
      FONT_FACE_VARIANTS.map(variant => `@font-face {
  font-family: "${escapeCssString(source.family)}";
  src: ${buildFontFaceSrc(source, variant.suffixes)};
  font-weight: ${variant.weight};
  font-style: ${variant.style};
  font-display: swap;
}`)
    )
    .join("\n\n")
}

function ensureFontFaceStyle(configuredFonts: FontContextValue) {
  let styleElement = document.getElementById(FONT_STYLE_ID) as HTMLStyleElement | null
  const configuredFontFaceCss = buildConfiguredFontFaceCss(configuredFonts)
  const fontFaceCss = configuredFontFaceCss
    ? `${BUILTIN_FONT_FACE_CSS}\n${configuredFontFaceCss}`
    : BUILTIN_FONT_FACE_CSS

  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = FONT_STYLE_ID
    document.head.appendChild(styleElement)
  }

  if (styleElement.textContent !== fontFaceCss) {
    styleElement.textContent = fontFaceCss
  }
}

const FontContext = createContext<FontContextValue>(defaultFonts)

function extractPrimaryFontFamily(fontFamily: string): string | null {
  const primary = splitFontFamilyList(fontFamily)[0]

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
      ensureFontFaceStyle(configuredFonts)

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

import { createBundledHighlighter, type HighlighterGeneric, type ShikiTransformer } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { SyntaxHighlightConfig } from './config'

type Highlighter = HighlighterGeneric<string, string>

type ShikiLoader = () => Promise<any>

export interface ShikiBundle {
  langs: Record<string, ShikiLoader>
  themes: Record<string, ShikiLoader>
}

let highlighterInstance: Highlighter | null = null
let highlighterPromise: Promise<Highlighter | null> | null = null
let highlighterCacheKey: string | null = null

export const DEFAULT_SHIKI_LANGS = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'bash',
  'shell',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'sql',
  'json',
  'yaml',
  'toml',
  'markdown',
  'html',
  'css',
  'scss',
  'less',
  'vue',
  'svelte',
  'docker',
  'nginx',
  'xml',
  'diff',
  'regex',
] as const

export const DEFAULT_SHIKI_LIGHT_THEME = 'github-light'
export const DEFAULT_SHIKI_DARK_THEME = 'github-dark'

interface ResolvedSyntaxHighlightConfig {
  langs: string[]
  lightTheme: string
  darkTheme: string
  themes: string[]
}

function normalizeSyntaxHighlightConfig(
  config?: SyntaxHighlightConfig,
  bundle?: ShikiBundle
): ResolvedSyntaxHighlightConfig {
  const availableLangs = bundle ? Object.keys(bundle.langs) : []
  const availableThemes = bundle ? Object.keys(bundle.themes) : []
  const langs = Array.from(
    new Set(
      (config?.langs ?? availableLangs)
        .map(lang => resolveLang(lang))
        .filter(lang => Boolean(lang) && (!bundle || availableLangs.includes(lang)))
    )
  )

  const resolveTheme = (theme: string | undefined, fallback: string) => {
    const normalized = theme?.trim() || fallback
    if (!bundle || availableThemes.includes(normalized)) {
      return normalized
    }

    if (availableThemes.includes(fallback)) {
      return fallback
    }

    return availableThemes[0] || normalized
  }

  const lightTheme = resolveTheme(
    config?.lightTheme,
    DEFAULT_SHIKI_LIGHT_THEME
  )
  const darkTheme = resolveTheme(
    config?.darkTheme,
    DEFAULT_SHIKI_DARK_THEME
  )
  const themes = Array.from(new Set([lightTheme, darkTheme]))

  return {
    langs,
    lightTheme,
    darkTheme,
    themes,
  }
}

export function getCodeHighlightTheme(
  isDark: boolean,
  config?: SyntaxHighlightConfig,
  bundle?: ShikiBundle
): string {
  const resolved = normalizeSyntaxHighlightConfig(config, bundle)
  return isDark ? resolved.darkTheme : resolved.lightTheme
}

export async function getHighlighter(
  config?: SyntaxHighlightConfig,
  bundle?: ShikiBundle
): Promise<Highlighter | null> {
  if (!bundle || Object.keys(bundle.langs).length === 0 || Object.keys(bundle.themes).length === 0) {
    return null
  }

  const resolvedConfig = normalizeSyntaxHighlightConfig(config, bundle)
  const cacheKey = JSON.stringify({
    bundleLangs: Object.keys(bundle.langs).sort(),
    bundleThemes: Object.keys(bundle.themes).sort(),
    langs: resolvedConfig.langs,
    themes: resolvedConfig.themes,
  })

  if (highlighterInstance && highlighterCacheKey === cacheKey) {
    return highlighterInstance
  }
  
  if (highlighterPromise && highlighterCacheKey === cacheKey) {
    return highlighterPromise
  }

  highlighterCacheKey = cacheKey
  const createHighlighter = createBundledHighlighter({
    langs: bundle.langs as any,
    themes: bundle.themes as any,
    engine: createJavaScriptRegexEngine,
  })
  highlighterPromise = createHighlighter({
    themes: resolvedConfig.themes,
    langs: resolvedConfig.langs,
  })

  try {
    highlighterInstance = await highlighterPromise
    return highlighterInstance
  } catch (error) {
    if (highlighterCacheKey === cacheKey) {
      highlighterInstance = null
      highlighterPromise = null
      highlighterCacheKey = null
    }
    throw error
  }
}

export interface HighlightOptions {
  lang?: string
  theme?: string
  showLineNumbers?: boolean
}

// 行号 transformer
function createLineNumberTransformer(): ShikiTransformer {
  return {
    name: 'line-numbers',
    line(node, line) {
      node.properties['data-line'] = line
    }
  }
}

export async function highlightCode(
  code: string,
  options: HighlightOptions = {},
  config?: SyntaxHighlightConfig,
  bundle?: ShikiBundle
): Promise<string> {
  const resolvedConfig = normalizeSyntaxHighlightConfig(config, bundle)
  const {
    lang = 'text',
    theme = resolvedConfig.lightTheme,
    showLineNumbers = false,
  } = options
  
  try {
    const highlighter = await getHighlighter(config, bundle)
    if (!highlighter) {
      return `<code>${escapeHtml(code)}</code>`
    }

    const bundledLanguages = highlighter.getBundledLanguages()
    const effectiveLang =
      lang === 'text' || !lang || bundledLanguages[lang] ? lang : 'text'
    
    const transformers: ShikiTransformer[] = [
      {
        pre(node) {
          node.properties.class = 'shiki-code-block'
          if (showLineNumbers) {
            this.addClassToHast(node, 'show-line-numbers')
          }
          node.properties.style = ''
        },
        code(node) {
          node.properties.class = ''
        },
      },
    ]
    
    if (showLineNumbers) {
      transformers.push(createLineNumberTransformer())
    }
    
    const html = highlighter.codeToHtml(code, {
      lang: effectiveLang === 'text' || !effectiveLang ? 'text' : effectiveLang,
      theme,
      transformers,
    })

    // 移除外层 pre 标签，只保留内容
    return html.replace(/<pre[^>]*>/, '').replace(/<\/pre>$/, '')
  } catch (error) {
    console.warn(`Shiki highlight failed for language "${lang}":`, error)
    return `<code>${escapeHtml(code)}</code>`
  }
}

export function getBundledLanguageIds(bundle?: ShikiBundle): string[] {
  if (!bundle) {
    return []
  }

  return Object.keys(bundle.langs)
}

export function getBundledThemeIds(bundle?: ShikiBundle): string[] {
  if (!bundle) {
    return []
  }

  return Object.keys(bundle.themes)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function resolveLang(lang: string | undefined): string {
  if (!lang) return 'text'
  
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'sh': 'shell',
    'shell': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'rb': 'ruby',
    'py': 'python',
    'dockerfile': 'docker',
    'conf': 'nginx',
  }
  
  return langMap[lang.toLowerCase()] || lang.toLowerCase()
}

import { codeToHtml, createHighlighter, type Highlighter, type ShikiTransformer } from 'shiki'

let highlighterInstance: Highlighter | null = null
let highlighterPromise: Promise<Highlighter> | null = null

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) {
    return highlighterInstance
  }
  
  if (highlighterPromise) {
    return highlighterPromise
  }
  
  highlighterPromise = createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: [
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
    ],
  })
  
  highlighterInstance = await highlighterPromise
  return highlighterInstance
}

export interface HighlightOptions {
  lang?: string
  theme?: 'github-light' | 'github-dark'
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
  options: HighlightOptions = {}
): Promise<string> {
  const { lang = 'text', theme = 'github-light', showLineNumbers = false } = options
  
  try {
    const highlighter = await getHighlighter()
    
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
    
    const html = await codeToHtml(code, {
      lang: lang === 'text' || !lang ? 'text' : lang,
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

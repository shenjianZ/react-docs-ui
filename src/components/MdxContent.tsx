import * as React from "react"
import ReactMarkdown from "react-markdown"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Link, useParams } from "react-router-dom"
import { useComponents } from "./ComponentProvider"
import { visit, SKIP } from "unist-util-visit"
import type { Element, Root } from "hast"
import { rehypeComponent } from "../lib/rehype-component"
import { highlightCode, resolveLang, getHighlighter } from "../lib/shiki-highlighter"
import { Copy, Check } from "lucide-react"
import "katex/dist/katex.min.css"
import "katex/contrib/mhchem/mhchem.js"
import macros_physics from "katex-physics"

interface MdxContentProps {
  source: string
}

// 从节点子元素中提取文本
function extractTextFromChildren(node: Element): string {
  // 常见的 HTML 标签列表
  const htmlTags = new Set([
    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
    'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
    'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed',
    'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend',
    'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object',
    'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp',
    'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong',
    'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot',
    'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',
    // React 特殊元素
    'react', 'react.strictmode', 'react.fragment',
  ])
  
  const extract = (n: any): string => {
    if (n.type === 'text') return n.value || ''
    if (n.type === 'element') {
      const tagName = n.tagName || ''
      const childText = (n.children || []).map(extract).join('')
      
      if (tagName && tagName !== 'span') {
        // 判断是否是标准 HTML 标签
        const isHtmlTag = htmlTags.has(tagName.toLowerCase())
        
        if (!n.children || n.children.length === 0) {
          // 自闭合标签形式
          if (isHtmlTag) {
            return `<${tagName} />`
          }
          // React 组件：转为 PascalCase
          const pascalName = tagName.charAt(0).toUpperCase() + tagName.slice(1)
          return `<${pascalName} />`
        }
        
        // 有内容的标签
        if (isHtmlTag) {
          return `<${tagName}>${childText}</${tagName}>`
        }
        // React 组件：转为 PascalCase
        const pascalName = tagName.charAt(0).toUpperCase() + tagName.slice(1)
        return `<${pascalName}>${childText}</${pascalName}>`
      }
      return childText
    }
    return ''
  }
  
  return (node.children || []).map(extract).join('')
}

function rehypeUnwrapComponentParagraphs() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'p' && parent && typeof index === 'number') {
        if (node.children.length === 1) {
          const child = node.children[0]
          if (child.type === 'element') {
            if (isCustomComponent(child)) {
              parent.children[index] = child
              return [SKIP, index]
            }
            if (child.tagName === 'pre') {
              parent.children[index] = child
              return [SKIP, index]
            }
          }
        }
      }
    })
  }
}

function isCustomComponent(node: Element): boolean {
  return Object.keys(node.properties || {}).some(key => key.startsWith('data-'))
}

function convertJSXToHTML(source: string): string {
  return source
    .replace(/<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*)(\s+[^>]*)>([\s\S]*?)<\/\1>/g, (_match, componentName, props, content) => {
      const dataProps = convertPropsToDataAttrs(props)
      const htmlTagName = componentName.toLowerCase().replace(/\./g, '-')
      return `<${htmlTagName}${dataProps}>${content}</${htmlTagName}>`
    })
    .replace(/<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*)(\s+[^>]*?)\s*\/>/g, (_match, componentName, props) => {
      const dataProps = convertPropsToDataAttrs(props)
      const htmlTagName = componentName.toLowerCase().replace(/\./g, '-')
      return `<${htmlTagName}${dataProps}></${htmlTagName}>`
    })
}

function convertPropsToDataAttrs(props: string): string {
  if (!props) return ''
  
  const dataAttrs: string[] = []
  const propRegex = /(\w+)=(?:{([^}]+)}|"([^"]*)"|'([^']*)')/g
  let match
  
  while ((match = propRegex.exec(props)) !== null) {
    const [, propName, jsValue, doubleQuoteValue, singleQuoteValue] = match
    const value = jsValue || doubleQuoteValue || singleQuoteValue || ''
    dataAttrs.push(`data-${propName}="${value}"`)
  }
  
  return dataAttrs.length > 0 ? ' ' + dataAttrs.join(' ') : ''
}

function extractDataProps(htmlProps: Record<string, any>): Record<string, any> {
  const componentProps: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(htmlProps)) {
    if (key.startsWith('data-')) {
      const propName = key.slice(5)
      
      if (value === 'true') {
        componentProps[propName] = true
      } else if (value === 'false') {
        componentProps[propName] = false
      } else if (value === 'null') {
        componentProps[propName] = null
      } else if (value === 'undefined') {
        componentProps[propName] = undefined
      } else if (!isNaN(Number(value)) && value !== '') {
        componentProps[propName] = Number(value)
      } else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          componentProps[propName] = JSON.parse(value)
        } catch {
          componentProps[propName] = value
        }
      } else if (value.startsWith('{') && value.endsWith('}')) {
        try {
          componentProps[propName] = JSON.parse(value)
        } catch {
          componentProps[propName] = value
        }
      } else {
        componentProps[propName] = value
      }
    }
  }
  
  return componentProps
}

// 语言显示名称映射
const langDisplayNames: Record<string, string> = {
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'jsx': 'JSX',
  'tsx': 'TSX',
  'bash': 'Bash',
  'shell': 'Shell',
  'sh': 'Shell',
  'python': 'Python',
  'py': 'Python',
  'java': 'Java',
  'c': 'C',
  'cpp': 'C++',
  'csharp': 'C#',
  'go': 'Go',
  'rust': 'Rust',
  'ruby': 'Ruby',
  'php': 'PHP',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'sql': 'SQL',
  'json': 'JSON',
  'yaml': 'YAML',
  'yml': 'YAML',
  'toml': 'TOML',
  'markdown': 'Markdown',
  'md': 'Markdown',
  'html': 'HTML',
  'css': 'CSS',
  'scss': 'SCSS',
  'less': 'Less',
  'vue': 'Vue',
  'svelte': 'Svelte',
  'docker': 'Docker',
  'dockerfile': 'Dockerfile',
  'nginx': 'Nginx',
  'xml': 'XML',
  'diff': 'Diff',
  'text': 'Text',
}

// Shiki 代码块组件
function ShikiCodeBlock({ 
  className, 
  children,
  meta,
}: { 
  className?: string
  children?: React.ReactNode
  meta?: string
}) {
  const [html, setHtml] = React.useState<string>('')
  const [isDark, setIsDark] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  
  // 解析 meta 字符串获取选项
  const showLineNumbers = React.useMemo(() => {
    return meta?.toLowerCase().includes('showlinenumbers') ?? false
  }, [meta])
  
  // 获取语言
  const langMatch = /language-(\w+)/.exec(className || '')
  const lang = langMatch ? langMatch[1] : 'text'
  const resolvedLang = resolveLang(lang)
  const langDisplayName = langDisplayNames[lang.toLowerCase()] || lang.toUpperCase()
  
  // 获取代码内容
  const code = React.useMemo(() => {
    let codeText = ''
    if (typeof children === 'string') {
      codeText = children
    } else if (React.Children.count(children) === 1 && typeof children === 'string') {
      codeText = String(children)
    } else {
      codeText = React.Children.toArray(children)
        .map(child => {
          if (typeof child === 'string') return child
          // 处理被 rehypeRaw 解析后的元素节点
          if (typeof child === 'object' && child !== null && 'props' in child) {
            const childProps = (child as any).props
            // 如果是被解析的 JSX 标签，尝试还原
            if (childProps?.node?.type === 'element') {
              const tagName = childProps.node.tagName || 'span'
              const children = childProps.children
              if (Array.isArray(children) && children.length === 0) {
                return `<${tagName} />`
              }
              const innerContent = children.map((c: any) => {
                if (typeof c === 'string') return c
                if (c?.type === 'text') return c.value || ''
                return ''
              }).join('')
              return `<${tagName}>${innerContent}</${tagName}>`
            }
          }
          return ''
        })
        .join('')
    }
    
    return codeText.replace(/^\n+/, '').replace(/\n+$/, '')
  }, [children])
  
  // 检测主题
  React.useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkTheme()
    
    const observer = new MutationObserver(() => checkTheme())
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])
  
  // 高亮代码
  React.useEffect(() => {
    const theme = isDark ? 'github-dark' : 'github-light'
    highlightCode(code, { lang: resolvedLang, theme, showLineNumbers }).then(setHtml)
  }, [code, resolvedLang, isDark, showLineNumbers])
  
  // 复制功能
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [code])
  
  if (!html) {
    return (
      <div className="code-block-wrapper">
        <pre className="shiki-code-block">
          <code>{code}</code>
        </pre>
      </div>
    )
  }
  
  return (
    <div className="code-block-wrapper">
      {/* 语言标签 */}
      <span className="code-lang-label">
        {langDisplayName}
      </span>
      
      {/* 复制按钮 */}
      <button
        className="code-copy-btn"
        onClick={handleCopy}
        title={copied ? '已复制' : '复制代码'}
        aria-label="复制代码"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      
      {/* 代码块 */}
      <pre 
        className={`shiki-code-block${showLineNumbers ? ' show-line-numbers' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  )
}

export function MdxContent({ source }: MdxContentProps) {
  const params = useParams<{ lang: string }>()
  const lang = params.lang || "zh-cn"
  const registeredComponents = useComponents()
  
  // 预加载 Shiki
  React.useEffect(() => {
    getHighlighter()
  }, [])
  
  const transformedSource = React.useMemo(() => {
    return convertJSXToHTML(source)
  }, [source])

  const componentMap = React.useMemo(() => {
    const map = new Map<string, React.ComponentType<any>>()
    if (registeredComponents) {
      Object.entries(registeredComponents).forEach(([name, Component]) => {
        const lowerName = name.toLowerCase()
        
        const WrappedComponent = React.memo(({ children, ...props }: any) => {
          const componentProps = extractDataProps(props)
          return React.createElement(Component as any, componentProps, children)
        })
        
        map.set(lowerName, WrappedComponent)
        
        if (name.includes('.')) {
          const [parentName, subName] = name.split('.')
          const combinedLower = `${parentName.toLowerCase()}-${subName.toLowerCase()}`
          map.set(combinedLower, WrappedComponent)
        }
      })
    }
    return map
  }, [registeredComponents])
  
  const dynamicComponents = React.useMemo(() => {
    return Object.fromEntries(componentMap)
  }, [componentMap])

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeSlug,
          rehypeRaw as any,
          rehypeComponent(dynamicComponents) as any,
          rehypeUnwrapComponentParagraphs as any,
          [rehypeAutolinkHeadings, { behavior: "append" }],
          [rehypeKatex, {
            strict: false,
            trust: true,
            macros: {
              "\\R": "\\mathbb{R}",
              "\\N": "\\mathbb{N}",
              "\\Z": "\\mathbb{Z}",
              "\\Q": "\\mathbb{Q}",
              "\\C": "\\mathbb{C}",
              ...macros_physics,
            },
          }],
        ]}
        components={{
          ...dynamicComponents,
          table({ children, ...props }: any) {
            return (
              <div className="overflow-x-auto">
                <table {...props}>{children}</table>
              </div>
            )
          },
          // 使用 Shiki 渲染代码块 - 在 pre 组件中处理
          pre({ children, ...props }: any) {
            // 检查子元素是否是代码块
            const codeElement = React.Children.toArray(children).find(
              (child: any) => child?.type === 'code' || child?.props?.node?.tagName === 'code'
            )
            
            if (codeElement) {
              const codeProps = (codeElement as any).props
              const className = codeProps?.className || ''
              
              const node = codeProps?.node
              let codeChildren = codeProps?.children
              
              // 从 data-raw-value 属性获取原始代码（注意连字符命名）
              const rawValue = codeProps?.['data-raw-value']
              
              if (rawValue) {
                codeChildren = rawValue
              }
              
              // 获取 meta 信息
              const meta = node?.data?.meta || ''
              
              return (
                <ShikiCodeBlock className={className} meta={meta}>
                  {codeChildren}
                </ShikiCodeBlock>
              )
            }
            
            return <pre {...props}>{children}</pre>
          },
          a({ href, children, ...props }: any) {
            if (!href) return <a {...props}>{children}</a>

            if (href.startsWith("#")) {
              return (
                <a href={href} {...props}>
                  {children}
                </a>
              )
            }

            const isExternal = /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")
            if (isExternal) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                  {children}
                </a>
              )
            }

            const normalized = href.startsWith("/") ? href : `/${href}`
            const to = `/${lang}${normalized}`
            return (
              <Link to={to} {...props}>
                {children}
              </Link>
            )
          },
        } as any}
      >
        {transformedSource}
      </ReactMarkdown>
    </div>
  )
}

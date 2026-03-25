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
import { getCodeHighlightTheme, getHighlighter, highlightCode, resolveLang, type ShikiBundle } from "../lib/shiki-highlighter"
import { Copy, Check } from "lucide-react"
import { getImageViewerLabels } from "../lib/image-viewer"
import { ImageViewer } from "./ImageViewer"
import type { ImageViewerConfig, SyntaxHighlightConfig } from "../lib/config"
import macros_physics from "katex-physics"

interface MdxContentProps {
  source: string
  skipFirstH1?: boolean
  imageViewer?: ImageViewerConfig
  codeHighlight?: SyntaxHighlightConfig
  shikiBundle?: ShikiBundle
}

function rehypeUnwrapComponentParagraphs() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'p' && parent && typeof index === 'number') {
        const hasBlockComponent = node.children.some(child => 
          child.type === 'element' && (isCustomComponent(child) || child.tagName === 'pre')
        )
        
        if (hasBlockComponent) {
          const newNodes: any[] = []
          let currentTextNodes: any[] = []
          
          const flushTextNodes = () => {
            if (currentTextNodes.length > 0) {
              newNodes.push({
                type: 'element',
                tagName: 'p',
                properties: {},
                children: currentTextNodes
              })
              currentTextNodes = []
            }
          }
          
          for (const child of node.children) {
            if (child.type === 'element' && (isCustomComponent(child) || child.tagName === 'pre')) {
              flushTextNodes()
              newNodes.push(child)
            } else {
              currentTextNodes.push(child)
            }
          }
          flushTextNodes()
          
          parent.children.splice(index, 1, ...newNodes)
          return [SKIP, index]
        }
      }
    })
  }
}

function isCustomComponent(node: Element): boolean {
  const props = node.properties || {}
  if (props.isComponent) return true
  const tagName = node.tagName
  return tagName.charAt(0) === tagName.charAt(0).toUpperCase() && tagName.charAt(0) !== tagName.charAt(0).toLowerCase()
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
  codeHighlight,
  shikiBundle,
}: { 
  className?: string
  children?: React.ReactNode
  meta?: string
  codeHighlight?: SyntaxHighlightConfig
  shikiBundle?: ShikiBundle
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
    const theme = getCodeHighlightTheme(isDark, codeHighlight, shikiBundle)
    highlightCode(
      code,
      { lang: resolvedLang, theme, showLineNumbers },
      codeHighlight,
      shikiBundle
    ).then(setHtml)
  }, [code, resolvedLang, isDark, showLineNumbers, codeHighlight, shikiBundle])
  
  // 复制功能
  const handleCopy = React.useCallback(async () => {
    const copyToClipboard = async (text: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '-9999px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        try {
          document.execCommand('copy')
        } finally {
          document.body.removeChild(textarea)
        }
      }
    }

    try {
      await copyToClipboard(code)
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

function MarkdownImage({
  lang,
  viewerConfig,
  src,
  alt,
  title,
  className,
  node,
  ...props
}: {
  lang: string
  viewerConfig?: ImageViewerConfig
  src?: string
  alt?: string
  title?: string
  className?: string
  node?: unknown
  [key: string]: any
}) {
  void node
  const [open, setOpen] = React.useState(false)
  const labels = React.useMemo(
    () => getImageViewerLabels(lang, viewerConfig?.labels),
    [lang, viewerConfig?.labels]
  )

  if (!src) {
    return null
  }

  if (viewerConfig?.enabled === false) {
    return (
      <img
        src={src}
        alt={alt || labels.imageAltFallback}
        title={title}
        className={className}
        {...props}
      />
    )
  }

  return (
    <>
      <span className="not-prose group relative my-6 block">
        <button
          type="button"
          className="block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => setOpen(true)}
          aria-label={labels.preview}
          title={labels.preview}
        >
          <img
            src={src}
            alt={alt || labels.imageAltFallback}
            title={title}
            className={className ?? "h-auto w-full rounded-2xl object-contain"}
            {...props}
          />
        </button>

        <button
          type="button"
          className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          onClick={() => setOpen(true)}
          aria-label={labels.preview}
        >
          <span className="sr-only">{labels.preview}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{labels.preview}</span>
        </button>
      </span>

      <ImageViewer
        open={open}
        onOpenChange={setOpen}
        src={src}
        alt={alt}
        title={title}
        lang={lang}
        labels={viewerConfig?.labels}
      />
    </>
  )
}

export function MdxContent({
  source,
  skipFirstH1 = false,
  imageViewer,
  codeHighlight,
  shikiBundle,
}: MdxContentProps) {
  const params = useParams<{ lang: string }>()
  const lang = params.lang || "zh-cn"
  const registeredComponents = useComponents()
  
  // 预加载 Shiki
  React.useEffect(() => {
    getHighlighter(codeHighlight, shikiBundle)
  }, [codeHighlight, shikiBundle])
  
  // 如果需要跳过第一个 H1，在转换前移除它
  const processedSource = React.useMemo(() => {
    if (!skipFirstH1) return source
    // 移除第一个 # 开头的标题行
    const lines = source.split('\n')
    let foundFirstH1 = false
    const filteredLines = lines.filter((line) => {
      if (!foundFirstH1 && line.startsWith('# ')) {
        foundFirstH1 = true
        return false
      }
      return true
    })
    return filteredLines.join('\n')
  }, [source, skipFirstH1])

  const transformedSource = React.useMemo(() => {
    return convertJSXToHTML(processedSource)
  }, [processedSource])

  const componentMap = React.useMemo(() => {
    const map = new Map<string, React.ComponentType<any>>()
    if (registeredComponents) {
      Object.entries(registeredComponents).forEach(([name, Component]) => {
        const WrappedComponent = React.memo(({ children, ...props }: any) => {
          const componentProps = extractDataProps(props)
          return React.createElement(Component as any, componentProps, children)
        })
        
        map.set(name, WrappedComponent)
        
        if (name.includes('.')) {
          const [parentName, subName] = name.split('.')
          const hyphenName = `${parentName.toLowerCase()}-${subName.toLowerCase()}`
          map.set(hyphenName, WrappedComponent)
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
                <ShikiCodeBlock
                  className={className}
                  meta={meta}
                  codeHighlight={codeHighlight}
                  shikiBundle={shikiBundle}
                >
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
          img({ src, alt, title, className, node, ...props }: any) {
            return (
              <MarkdownImage
                lang={lang}
                viewerConfig={imageViewer}
                src={src}
                alt={alt}
                title={title}
                className={className}
                node={node}
                {...props}
              />
            )
          },
        } as any}
      >
        {transformedSource}
      </ReactMarkdown>
    </div>
  )
}

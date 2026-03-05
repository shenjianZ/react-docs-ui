import * as React from "react"
import ReactMarkdown from "react-markdown"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Link, useParams } from "react-router-dom"
import { useComponents } from "./ComponentProvider"
import { visit, SKIP } from "unist-util-visit"
import type { Element, Root } from "hast"
import { rehypeComponent } from "../lib/rehype-component"
import "katex/dist/katex.min.css"
import "katex/contrib/mhchem/mhchem.js"
import macros_physics from "katex-physics"

interface MdxContentProps {
  source: string
}

// 创建一个 rehype 插件来移除包裹自定义组件的 p 标签
function rehypeUnwrapComponentParagraphs() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'p' && parent && typeof index === 'number') {
        // 检查 p 标签是否只包含一个自定义组件
        if (node.children.length === 1) {
          const child = node.children[0]
          if (child.type === 'element' && isCustomComponent(child)) {
            // 用子组件替换 p 标签
            parent.children[index] = child
            // 跳过子节点的访问
            return [SKIP, index]
          }
        }
      }
    })
  }
}

// 检查是否是自定义组件（小写标签名，可能是我们的组件）
function isCustomComponent(node: Element): boolean {
  // 检查是否有 data-* 属性（这是我们转换后的组件特征）
  return Object.keys(node.properties || {}).some(key => key.startsWith('data-'))
}

// 将 JSX 组件语法转换为 HTML 标签
function convertJSXToHTML(source: string): string {
  return source
    // 转换 <Component prop="value">content</Component> 为 <component data-prop="value">content</component>
    // 支持带点号的复合组件名称，如 StepList.Step
    .replace(/<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*)(\s+[^>]*)>([\s\S]*?)<\/\1>/g, (_match, componentName, props, content) => {
      const dataProps = convertPropsToDataAttrs(props)
      // 将点号转换为连字符，因为 HTML 标签不允许包含点号
      const htmlTagName = componentName.toLowerCase().replace(/\./g, '-')
      return `<${htmlTagName}${dataProps}>${content}</${htmlTagName}>`
    })
    // 转换自闭合标签 <Component prop="value" />
    // 支持带点号的复合组件名称，如 StepList.Step
    .replace(/<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*)(\s+[^>]*?)\s*\/>/g, (_match, componentName, props) => {
      const dataProps = convertPropsToDataAttrs(props)
      // 将点号转换为连字符，因为 HTML 标签不允许包含点号
      const htmlTagName = componentName.toLowerCase().replace(/\./g, '-')
      return `<${htmlTagName}${dataProps}></${htmlTagName}>`
    })
}

// 将 JSX 属性转换为 data-* 属性
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

// 从 data-* 属性中提取组件 props
function extractDataProps(htmlProps: Record<string, any>): Record<string, any> {
  const componentProps: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(htmlProps)) {
    if (key.startsWith('data-')) {
      const propName = key.slice(5) // 移除 'data-' 前缀
      
      // 尝试解析值类型
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
        // 尝试解析数组
        try {
          componentProps[propName] = JSON.parse(value)
        } catch {
          componentProps[propName] = value
        }
      } else if (value.startsWith('{') && value.endsWith('}')) {
        // 尝试解析对象
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

export function MdxContent({ source }: MdxContentProps) {
  const params = useParams<{ lang: string }>()
  const lang = params.lang || "zh-cn"
  const registeredComponents = useComponents()
  
  // ✅ 优化：添加缓存，只在 source 变化时重新转换
  const transformedSource = React.useMemo(() => {
    return convertJSXToHTML(source)
  }, [source])

  // ✅ 优化：使用 Map 提高查找性能，并为 WrappedComponent 添加 React.memo
  const componentMap = React.useMemo(() => {
    const map = new Map<string, React.ComponentType<any>>()
    if (registeredComponents) {
      Object.entries(registeredComponents).forEach(([name, Component]) => {
        const lowerName = name.toLowerCase()
        
        // ✅ 优化：WrappedComponent 使用 React.memo 减少不必要的重渲染
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
  
  // ✅ 转换为对象以兼容 ReactMarkdown
  const dynamicComponents = React.useMemo(() => {
    return Object.fromEntries(componentMap)
  }, [componentMap])

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeSlug,
          // 允许在 Markdown 中渲染原生 HTML（需放在 autolink 之前）
          rehypeRaw as any,
          // 将自定义 HTML 标签转换为 React 组件（必须在 rehypeRaw 之后）
          rehypeComponent(dynamicComponents) as any,
          // 移除包裹自定义组件的 p 标签（必须在 rehypeRaw 之后）
          rehypeUnwrapComponentParagraphs as any,
          // 代码高亮（同步）
          [rehypeHighlight as any, { ignoreMissing: true }],
          // 避免将整个标题包裹在 <a> 中，防止与标题内部链接产生嵌套 <a>
          [rehypeAutolinkHeadings, { behavior: "append" }],
          // 数学公式渲染（启用全部功能）
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
          // 使用动态生成的组件映射
          ...dynamicComponents,
          // Markdown 元素组件
          table({ children, ...props }: any) {
            return (
              <div className="overflow-x-auto">
                <table {...props}>{children}</table>
              </div>
            )
          },
          a({ href, children, ...props }: any) {
            if (!href) return <a {...props}>{children}</a>

            // 站内锚点，保持原生 <a>，避免路由跳转
            if (href.startsWith("#")) {
              return (
                <a href={href} {...props}>
                  {children}
                </a>
              )
            }

            // 外链或协议链接，保持原生 <a>
            const isExternal = /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")
            if (isExternal) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                  {children}
                </a>
              )
            }

            // 处理站内链接：统一加上语言前缀，使用 React Router Link 避免整页刷新
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

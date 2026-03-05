import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

/**
 * 解析代码块属性字符串，支持多种格式
 * @param className 元素的 className 属性
 * @returns 解析后的属性对象
 */
function parseCodeBlockProps(className?: string): Record<string, any> {
  if (!className) return {}

  const props: Record<string, any> = {}
  const classes = className.split(' ').filter(Boolean)

  for (const cls of classes) {
    // 解析语言：language-xxx 或 lang-xxx
    const langMatch = cls.match(/^(?:language-|lang-)(.+)$/)
    if (langMatch) {
      props.language = langMatch[1]
      continue
    }

    // 解析文件名：filename-xxx 或 file-xxx
    const filenameMatch = cls.match(/^(?:filename-|file-)(.+)$/)
    if (filenameMatch) {
      props.filename = filenameMatch[1]
      continue
    }

    // 解析标题：title-xxx
    const titleMatch = cls.match(/^title-(.+)$/)
    if (titleMatch) {
      props.title = titleMatch[1]
      continue
    }

    // 解析行号显示：show-line-numbers 或 show-line-numbers-true
    if (cls === 'show-line-numbers' || cls === 'show-line-numbers-true') {
      props.showLineNumbers = true
      continue
    }

    // 解析隐藏行号：hide-line-numbers 或 show-line-numbers-false
    if (cls === 'hide-line-numbers' || cls === 'show-line-numbers-false') {
      props.showLineNumbers = false
      continue
    }

    // 解析高亮行：highlight-2,5,8 或 highlight-lines-2,5,8
    const highlightMatch = cls.match(/^(?:highlight|highlight-lines)-(.+)$/)
    if (highlightMatch) {
      const lines = highlightMatch[1].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
      props.highlightLines = lines
      continue
    }

    // 解析复制按钮：show-copy 或 show-copy-true
    if (cls === 'show-copy' || cls === 'show-copy-true') {
      props.showCopy = true
      continue
    }

    // 解析隐藏复制按钮：hide-copy 或 show-copy-false
    if (cls === 'hide-copy' || cls === 'show-copy-false') {
      props.showCopy = false
      continue
    }

    // 解析折叠：collapse 或 collapse-true
    if (cls === 'collapse' || cls === 'collapse-true') {
      props.collapse = true
      continue
    }

    // 解析最大高度：max-height-xxx（px）
    const maxHeightMatch = cls.match(/^max-height-(\d+)$/)
    if (maxHeightMatch) {
      props.maxHeight = `${maxHeightMatch[1]}px`
      continue
    }
  }

  return props
}

/**
 * 创建一个 rehype 插件，将特定的 HTML 标签转换为 React 组件
 * @param components React 组件映射
 */
export function rehypeComponent(components: Record<string, React.ComponentType<any>>): Plugin<[], Root> {
  return () => {
    return (tree: Root) => {
      visit(tree, 'element', (node: Element) => {
        const tagName = node.tagName.toLowerCase()
        
        // 检查是否有对应的 React 组件
        const componentName = Object.keys(components).find(
          name => name.toLowerCase() === tagName
        )
        
        if (componentName) {
          // 将标签名改为大写，这样 React 会将其视为组件
          node.tagName = componentName
          
          // 初始化 properties
          node.properties = node.properties || {}
          
          // 标记这是一个组件节点
          node.properties.isComponent = true

          // 对于 CodeBlock 组件，解析额外的属性
          if (componentName === 'CodeBlock') {
            const parsedProps = parseCodeBlockProps(node.properties.className as string)
            
            // 合并解析的属性到现有的 properties
            Object.assign(node.properties, parsedProps)
          }
        }
      })
    }
  }
}
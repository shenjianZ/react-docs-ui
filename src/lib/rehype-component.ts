import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

/**
 * 创建一个 rehype 插件，将特定的 HTML 标签转换为 React 组件
 * @param components React 组件映射
 */
export function rehypeComponent(components: Record<string, React.ComponentType<any>>): Plugin<[], Root> {
  const componentMap = new Map<string, string>()
  
  for (const [name] of Object.entries(components)) {
    const lowerName = name.toLowerCase()
    const hyphenName = lowerName.replace(/\./g, '-')
    componentMap.set(lowerName, name)
    componentMap.set(hyphenName, name)
  }
  
  return () => {
    return (tree: Root) => {
      visit(tree, 'element', (node: Element) => {
        const tagName = node.tagName.toLowerCase()
        
        const componentName = componentMap.get(tagName)
        
        if (componentName) {
          node.tagName = componentName
          
          node.properties = node.properties || {}
          
          node.properties.isComponent = true
        }
      })
    }
  }
}
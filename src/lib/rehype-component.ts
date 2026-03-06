import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

/**
 * 创建一个 rehype 插件，将特定的 HTML 标签转换为 React 组件
 * @param components React 组件映射
 */
export function rehypeComponent(components: Record<string, React.ComponentType<any>>): Plugin<[], Root> {
  // ✅ 优化：预处理，创建 Map 提高查找性能从 O(n) 到 O(1)
  const componentMap = new Map(
    Object.entries(components).map(([name]) => [name.toLowerCase(), name])
  )
  
  return () => {
    return (tree: Root) => {
      visit(tree, 'element', (node: Element) => {
        const tagName = node.tagName.toLowerCase()
        
        // ✅ 优化：使用 Map.find() O(1) 查找
        const componentName = componentMap.get(tagName)
        
        if (componentName) {
          // 将标签名改为大写，这样 React 会将其视为组件
          node.tagName = componentName
          
          // 初始化 properties
          node.properties = node.properties || {}
          
          // 标记这是一个组件节点
          node.properties.isComponent = true
        }
      })
    }
  }
}
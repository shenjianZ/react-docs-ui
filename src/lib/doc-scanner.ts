import { getConfig, type SiteConfig } from './config'

export interface DocItem {
  title: string
  path: string
  lang: string
  order?: number
  description?: string
  tags?: string[]
}

interface Section {
  title: string
  path?: string
  children?: Section[]
  order?: number
}

interface Collection {
  sections: Section[]
}

/**
 * 递归提取所有文档项（包括嵌套的 children）
 */
function extractDocumentsFromSections(
  sections: Section[],
  lang: string,
  basePath: string = '',
  docs: DocItem[] = []
): DocItem[] {
  sections.forEach((section, index) => {
    let fullPath = basePath
    if (section.path) {
      // 检查 path 是否是绝对路径（以 / 开头）
      if (section.path.startsWith('/')) {
        fullPath = `/${lang}${section.path}`
      } else {
        fullPath = `${basePath}${section.path}`
      }
      docs.push({
        title: section.title,
        path: fullPath,
        lang,
        order: section.order ?? index
      })
    }

    // 递归处理子页面
    if (section.children && section.children.length > 0) {
      // 子页面使用父完整路径作为基础
      extractDocumentsFromSections(section.children, lang, fullPath, docs)
    }
  })

  return docs
}

/**
 * 从配置文件中扫描所有文档
 */
export async function scanDocuments(lang: string = 'zh-cn'): Promise<DocItem[]> {
  try {
    const config = await getConfig(lang)
    if (!config || !config.sidebar) {
      return []
    }

    const docs: DocItem[] = []
    const sidebar = config.sidebar

    // 1. 从 collections 中提取文档
    if (sidebar.collections) {
      Object.entries(sidebar.collections).forEach(([collectionName, collection]: [string, Collection]) => {
        if (collection.sections && collection.sections.length > 0) {
          const collectionDocs = extractDocumentsFromSections(
            collection.sections,
            lang,
            `/${lang}`,
            docs
          )
          // 合并到主数组，避免重复
          collectionDocs.forEach(doc => {
            if (!docs.find(d => d.path === doc.path)) {
              docs.push(doc)
            }
          })
        }
      })
    }

    // 2. 从全局 sections 中提取文档
    if (sidebar.sections && sidebar.sections.length > 0) {
      const globalDocs = extractDocumentsFromSections(
        sidebar.sections,
        lang,
        `/${lang}`,
        docs
      )
      // 合并到主数组，避免重复
      globalDocs.forEach(doc => {
        if (!docs.find(d => d.path === doc.path)) {
          docs.push(doc)
        }
      })
    }

    // 按顺序排序
    docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    return docs
  } catch (error) {
    console.error('Failed to scan documents:', error)
    return []
  }
}

/**
 * 搜索文档（支持模糊搜索）
 */
export function searchDocuments(docs: DocItem[], query: string): DocItem[] {
  if (!query.trim()) {
    return docs
  }

  const lowerQuery = query.toLowerCase()

  return docs.filter(doc =>
    doc.title.toLowerCase().includes(lowerQuery) ||
    doc.path.toLowerCase().includes(lowerQuery) ||
    doc.description?.toLowerCase().includes(lowerQuery) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
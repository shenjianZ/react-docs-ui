import { scanDocuments, searchDocuments } from './doc-scanner'

// 重新定义类型以避免导出问题
interface DocItem {
  title: string
  path: string
  lang: string
  order?: number
  description?: string
  tags?: string[]
}

class DocIndexCache {
  private cache: Map<string, { docs: DocItem[]; timestamp: number }> = new Map()
  private ttl: number = 5 * 60 * 1000 // 5分钟缓存

  /**
   * 获取文档索引（带缓存）
   */
  async getDocuments(lang: string): Promise<DocItem[]> {
    const now = Date.now()
    const cached = this.cache.get(lang)

    // 检查缓存是否有效
    if (cached && (now - cached.timestamp) < this.ttl) {
      return cached.docs
    }

    // 重新扫描文档
    const docs = await scanDocuments(lang)
    this.cache.set(lang, { docs, timestamp: now })

    return docs
  }

  /**
   * 搜索文档（带缓存）
   */
  async searchDocuments(lang: string, query: string): Promise<DocItem[]> {
    const docs = await this.getDocuments(lang)
    return searchDocuments(docs, query)
  }

  /**
   * 使缓存失效
   */
  invalidate(lang?: string) {
    if (lang) {
      this.cache.delete(lang)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear()
  }
}

// 导出单例
export const docIndexCache = new DocIndexCache()
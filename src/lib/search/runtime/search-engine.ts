import FlexSearch from 'flexsearch'
import type { SearchIndex, SearchSection, SearchResult, SearchOptions } from './types'

const DEFAULT_LIMIT = 20
const DEFAULT_SNIPPET_LENGTH = 150

export class SearchEngine {
  private index: any
  private sections: Map<string, SearchSection> = new Map()
  private initialized = false

  constructor() {
    this.index = new FlexSearch.Index({
      tokenize: 'full',
      resolution: 9,
      cache: 100,
    })
  }

  init(index: SearchIndex): void {
    this.clear()
    
    for (const section of index.sections) {
      this.sections.set(section.id, section)
      this.index.add(section.id, section.tokens.join(' '))
    }

    this.initialized = true
  }

  clear(): void {
    this.sections.clear()
    this.index = new FlexSearch.Index({
      tokenize: 'full',
      resolution: 9,
      cache: 100,
    })
    this.initialized = false
  }

  search(options: SearchOptions): SearchResult[] {
    if (!this.initialized) {
      return []
    }

    const { query, version, limit = DEFAULT_LIMIT, snippetLength = DEFAULT_SNIPPET_LENGTH } = options
    const normalizedQuery = query.toLowerCase().trim()
    
    if (!normalizedQuery) {
      return []
    }

    const searchLimit = Math.max(limit * 5, limit)
    const results = this.index.search(normalizedQuery, { limit: searchLimit }) as string[]

    return results.map(id => {
      const section = this.sections.get(id)
      if (!section) return null
      if (version) {
        if (section.version && section.version !== version) return null
      } else if (section.version) {
        return null
      }
      
      return {
        id: section.id,
        pageTitle: section.pageTitle,
        sectionTitle: section.sectionTitle,
        snippet: this.generateSnippet(section.content, normalizedQuery, snippetLength),
        url: section.url,
        score: 1,
      }
    }).filter((r): r is SearchResult => r !== null).slice(0, limit)
  }

  private generateSnippet(content: string, query: string, maxLength: number): string {
    if (!content) return ''
    
    const lowerContent = content.toLowerCase()
    const queryTerms = query.split(/\s+/).filter(Boolean)
    
    let bestPos = 0
    for (const term of queryTerms) {
      const pos = lowerContent.indexOf(term)
      if (pos !== -1) {
        bestPos = pos
        break
      }
    }

    const start = Math.max(0, bestPos - 30)
    const end = Math.min(content.length, start + maxLength)
    
    let snippet = content.slice(start, end)
    
    if (start > 0) {
      snippet = '...' + snippet
    }
    if (end < content.length) {
      snippet = snippet + '...'
    }

    return snippet
  }

  isInitialized(): boolean {
    return this.initialized
  }

  getSectionCount(): number {
    return this.sections.size
  }
}

export const searchEngine = new SearchEngine()

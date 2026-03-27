import type { SearchSection, SearchIndex } from '../build/types'

export type { SearchSection, SearchIndex }

export interface SearchResult {
  id: string
  pageTitle: string
  sectionTitle: string
  snippet: string
  url: string
  score: number
}

export interface SearchOptions {
  query: string
  lang: string
  version?: string
  limit?: number
}

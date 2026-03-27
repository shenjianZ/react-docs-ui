export interface SearchSection {
  id: string
  pageTitle: string
  sectionTitle: string
  content: string
  url: string
  lang: string
  version?: string
  tokens: string[]
}

export interface SearchIndex {
  version: string
  generatedAt: number
  lang: string
  sections: SearchSection[]
}

export interface ParsedSection {
  title: string
  content: string
  level: number
}

export interface ParsedDocument {
  title: string
  description: string
  path: string
  sections: ParsedSection[]
}

export const SEARCH_INDEX_VERSION = '2.0.0'

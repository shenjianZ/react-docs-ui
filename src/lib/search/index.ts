export * from './build/types'
export type { SearchResult, SearchOptions } from './runtime/types'
export type { HighlightSegment } from './runtime/highlighter'
export { SearchEngine, searchEngine } from './runtime/search-engine'
export {
  highlightText,
  generateSnippet,
  highlightSnippet,
  highlightSnippetToSegments,
  tokenizeQuery,
} from './runtime/highlighter'

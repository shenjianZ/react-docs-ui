import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import type { SearchIndex, SearchResult, SearchOptions } from '@/lib/search'
import { SearchEngine } from '@/lib/search'

interface SearchContextValue {
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  search: (query: string) => Promise<SearchResult[]>
  results: SearchResult[]
  query: string
  setQuery: (query: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  loadIndex: () => Promise<void>
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}

interface SearchProviderProps {
  children: React.ReactNode
  lang?: string
  version?: string
  enabled?: boolean
  maxResults?: number
  enableHotkeys?: boolean
}

export function SearchProvider({
  children,
  lang = 'zh-cn',
  version,
  enabled = true,
  maxResults = 20,
  enableHotkeys = true,
}: SearchProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const engineRef = useRef<SearchEngine | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedLangRef = useRef<string | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    engineRef.current = new SearchEngine()
    
    return () => {
      if (engineRef.current) {
        engineRef.current.clear()
        engineRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (loadedLangRef.current && loadedLangRef.current !== lang) {
      setIsLoaded(false)
      loadedLangRef.current = null
      setResults([])
      setQuery('')
      if (engineRef.current) {
        engineRef.current.clear()
      }
    }
  }, [lang])

  useEffect(() => {
    setResults([])
  }, [version])

  const loadIndex = useCallback(async () => {
    if ((isLoaded && loadedLangRef.current === lang) || loadingRef.current || !enabled) return

    loadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/search-index-${lang}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`)
      }

      const index: SearchIndex = await response.json()

      if (engineRef.current) {
        engineRef.current.init(index)
      }

      loadedLangRef.current = lang
      setIsLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load search index')
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [lang, isLoaded, enabled])

  const search = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) {
      setResults([])
      return []
    }

    if (!engineRef.current?.isInitialized()) {
      await loadIndex()
    }

    const options: SearchOptions = {
      query: searchQuery,
      lang,
      version,
      limit: maxResults,
    }

    if (engineRef.current) {
      const searchResults = engineRef.current.search(options)
      setResults(searchResults)
      return searchResults
    }

    return []
  }, [lang, version, loadIndex, maxResults])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      search(query)
    }, 150)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, search])

  useEffect(() => {
    if (open && !isLoaded && !loadingRef.current) {
      loadIndex()
    }
  }, [open, isLoaded, loadIndex])

  useEffect(() => {
    if (!enableHotkeys) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enableHotkeys, open])

  const value: SearchContextValue = {
    isLoaded,
    isLoading,
    error,
    search,
    results,
    query,
    setQuery,
    open,
    setOpen,
    loadIndex,
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

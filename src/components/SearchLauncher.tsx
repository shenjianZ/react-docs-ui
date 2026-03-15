import React, {
  Suspense,
  createContext,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const LazySearchRuntime = lazy(() => import("./search/SearchRuntime"))

interface SearchLauncherContextValue {
  openSearch: () => void
}

const noopSearchLauncherContext: SearchLauncherContextValue = {
  openSearch: () => {},
}

const SearchLauncherContext = createContext<SearchLauncherContextValue>(noopSearchLauncherContext)

interface SearchLauncherProviderProps {
  children: React.ReactNode
  lang: string
  enabled?: boolean
  maxResults?: number
  placeholder?: string
}

export function SearchLauncherProvider({
  children,
  lang,
  enabled = true,
  maxResults,
  placeholder,
}: SearchLauncherProviderProps) {
  const [shouldMountRuntime, setShouldMountRuntime] = useState(false)
  const [openSignal, setOpenSignal] = useState(0)

  const openSearch = useCallback(() => {
    if (!enabled) return
    setShouldMountRuntime(true)
    setOpenSignal(prev => prev + 1)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        openSearch()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [enabled, openSearch])

  const value = useMemo<SearchLauncherContextValue>(
    () => ({ openSearch }),
    [openSearch]
  )

  return (
    <SearchLauncherContext.Provider value={value}>
      {children}
      {shouldMountRuntime && enabled && (
        <Suspense fallback={null}>
          <LazySearchRuntime
            lang={lang}
            maxResults={maxResults}
            placeholder={placeholder}
            openSignal={openSignal}
          />
        </Suspense>
      )}
    </SearchLauncherContext.Provider>
  )
}

export function useSearchLauncher(): SearchLauncherContextValue {
  return useContext(SearchLauncherContext)
}

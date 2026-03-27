import { useEffect } from "react"

import { SearchDialog } from "./SearchDialog"
import { SearchProvider, useSearch } from "./SearchProvider"

interface SearchRuntimeProps {
  lang: string
  version?: string
  maxResults?: number
  placeholder?: string
  openSignal: number
}

function SearchRuntimeBridge({
  openSignal,
  placeholder,
}: {
  openSignal: number
  placeholder?: string
}) {
  const { setOpen } = useSearch()

  useEffect(() => {
    if (openSignal > 0) {
      setOpen(true)
    }
  }, [openSignal, setOpen])

  return <SearchDialog placeholder={placeholder} />
}

export default function SearchRuntime({
  lang,
  version,
  maxResults,
  placeholder,
  openSignal,
}: SearchRuntimeProps) {
  return (
    <SearchProvider
      lang={lang}
      version={version}
      maxResults={maxResults}
      enableHotkeys={false}
    >
      <SearchRuntimeBridge openSignal={openSignal} placeholder={placeholder} />
    </SearchProvider>
  )
}

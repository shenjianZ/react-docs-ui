import { useEffect } from "react"

import { SearchDialog } from "./SearchDialog"
import { SearchProvider, useSearch } from "./SearchProvider"

interface SearchRuntimeProps {
  lang: string
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
  maxResults,
  placeholder,
  openSignal,
}: SearchRuntimeProps) {
  return (
    <SearchProvider
      lang={lang}
      maxResults={maxResults}
      enableHotkeys={false}
    >
      <SearchRuntimeBridge openSignal={openSignal} placeholder={placeholder} />
    </SearchProvider>
  )
}

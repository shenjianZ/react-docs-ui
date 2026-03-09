import React, { useState, useEffect, useRef } from 'react'
import type { SearchResult } from '@/lib/search'
import { SearchItem } from './SearchItem'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  onSelect: (url: string) => void
}

export function SearchResults({ results, query, onSelect }: SearchResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current
      const selected = selectedRef.current
      const containerRect = container.getBoundingClientRect()
      const selectedRect = selected.getBoundingClientRect()

      if (selectedRect.bottom > containerRect.bottom) {
        selected.scrollIntoView({ block: 'nearest' })
      } else if (selectedRect.top < containerRect.top) {
        selected.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = results[selectedIndex]
        if (selected) {
          onSelect(selected.url)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [results, selectedIndex, onSelect])

  const handleItemClick = (result: SearchResult) => {
    onSelect(result.url)
  }

  return (
    <div ref={containerRef} className="py-2">
      {results.map((result, index) => (
        <SearchItem
          key={result.id}
          result={result}
          query={query}
          isSelected={index === selectedIndex}
          ref={index === selectedIndex ? selectedRef : null}
          onClick={() => handleItemClick(result)}
          onMouseEnter={() => setSelectedIndex(index)}
        />
      ))}
    </div>
  )
}

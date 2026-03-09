import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from './SearchProvider'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'
import {
  Dialog,
  DialogContent,
  DialogVisuallyHiddenTitle,
  DialogVisuallyHiddenDescription,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface SearchDialogProps {
  placeholder?: string
}

export function SearchDialog({ placeholder }: SearchDialogProps) {
  const {
    open,
    setOpen,
    query,
    setQuery,
    results,
    isLoading,
    error,
    isLoaded,
  } = useSearch()
  
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open, setQuery])

  const handleSelect = (url: string) => {
    navigate(url)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-xl top-[15%] translate-y-0" showCloseButton={false}>
        <DialogVisuallyHiddenTitle>搜索文档</DialogVisuallyHiddenTitle>
        <DialogVisuallyHiddenDescription>搜索文档内容</DialogVisuallyHiddenDescription>
        <div className="flex flex-col">
          <SearchInput
            ref={inputRef}
            value={query}
            onChange={setQuery}
            placeholder={placeholder}
            onClear={() => setQuery('')}
          />
          
          <div className="max-h-[60vh] overflow-y-auto border-t">
            {isLoading && !isLoaded && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {error && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {error}
              </div>
            )}
            
            {isLoaded && !isLoading && !query && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                输入关键词搜索文档
              </div>
            )}
            
            {isLoaded && query && results.length === 0 && !isLoading && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                未找到 "{query}" 相关结果
              </div>
            )}
            
            {results.length > 0 && (
              <SearchResults results={results} query={query} onSelect={handleSelect} />
            )}
          </div>
          
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↵</kbd>
                选择
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↑↓</kbd>
                导航
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">esc</kbd>
              关闭
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

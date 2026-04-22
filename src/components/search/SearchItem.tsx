import { forwardRef, Fragment } from 'react'
import type { SearchResult, HighlightSegment } from '@/lib/search'
import { highlightSnippetToSegments, tokenizeQuery } from '@/lib/search'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

function HighlightedText({ segments }: { segments: HighlightSegment[] }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">{seg.text}</mark>
        ) : (
          <Fragment key={i}>{seg.text}</Fragment>
        )
      )}
    </>
  )
}

interface SearchItemProps {
  result: SearchResult
  query: string
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

export const SearchItem = forwardRef<HTMLDivElement, SearchItemProps>(
  ({ result, query, isSelected, onClick, onMouseEnter }, ref) => {
    const queryTerms = tokenizeQuery(query)

    const titleSegments = highlightSnippetToSegments(
      result.sectionTitle,
      queryTerms,
      { maxLength: 100, contextBefore: 0, contextAfter: 0 }
    )

    const snippetSegments = highlightSnippetToSegments(
      result.snippet,
      queryTerms,
      { maxLength: 150 }
    )

    return (
      <div
        ref={ref}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cn(
          'flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-l-2 rounded-r-md mx-2',
          'hover:shadow-sm hover:translate-x-0.5',
          isSelected
            ? 'bg-accent/80 border-l-primary shadow-md scale-[1.02] translate-x-1'
            : 'hover:bg-muted/50 border-l-transparent'
        )}
      >
        <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              <HighlightedText segments={titleSegments} />
            </span>
          </div>
          {result.pageTitle !== result.sectionTitle && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {result.pageTitle}
            </div>
          )}
          {snippetSegments.length > 0 && snippetSegments.some(s => s.text) && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              <HighlightedText segments={snippetSegments} />
            </div>
          )}
        </div>
      </div>
    )
  }
)

SearchItem.displayName = 'SearchItem'

export interface HighlightResult {
  text: string
  highlights: Array<{
    start: number
    end: number
  }>
}

export function highlightText(
  text: string,
  queryTerms: string[],
  tag: string = 'mark'
): string {
  if (!text || queryTerms.length === 0) {
    return text
  }

  const lowerText = text.toLowerCase()
  const ranges: Array<{ start: number; end: number }> = []

  for (const term of queryTerms) {
    const lowerTerm = term.toLowerCase()
    let pos = 0

    while (true) {
      const index = lowerText.indexOf(lowerTerm, pos)
      if (index === -1) break

      ranges.push({ start: index, end: index + term.length })
      pos = index + 1
    }
  }

  if (ranges.length === 0) {
    return text
  }

  const merged = mergeRanges(ranges)
  
  let result = ''
  let lastEnd = 0

  for (const range of merged) {
    result += text.slice(lastEnd, range.start)
    result += `<${tag}>`
    result += text.slice(range.start, range.end)
    result += `</${tag}>`
    lastEnd = range.end
  }

  result += text.slice(lastEnd)

  return result
}

function mergeRanges(
  ranges: Array<{ start: number; end: number }>
): Array<{ start: number; end: number }> {
  if (ranges.length === 0) return []

  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged: Array<{ start: number; end: number }> = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end)
    } else {
      merged.push(current)
    }
  }

  return merged
}

export function generateSnippet(
  content: string,
  queryTerms: string[],
  options: {
    maxLength?: number
    contextBefore?: number
    contextAfter?: number
  } = {}
): string {
  const {
    maxLength = 120,
    contextBefore = 30,
    contextAfter = 80,
  } = options

  if (!content) return ''
  if (queryTerms.length === 0) {
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '')
  }

  const lowerContent = content.toLowerCase()
  let bestPos = -1
  let bestTerm = ''

  for (const term of queryTerms) {
    const pos = lowerContent.indexOf(term.toLowerCase())
    if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
      bestPos = pos
      bestTerm = term
    }
  }

  if (bestPos === -1) {
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '')
  }

  const start = Math.max(0, bestPos - contextBefore)
  const end = Math.min(content.length, bestPos + bestTerm.length + contextAfter)
  
  let snippet = content.slice(start, end)
  
  if (start > 0) {
    snippet = '...' + snippet
  }
  if (end < content.length) {
    snippet = snippet + '...'
  }

  return snippet
}

export function highlightSnippet(
  content: string,
  queryTerms: string[],
  options: {
    maxLength?: number
    contextBefore?: number
    contextAfter?: number
    tag?: string
  } = {}
): string {
  const snippet = generateSnippet(content, queryTerms, options)
  return highlightText(snippet, queryTerms, options.tag || 'mark')
}

export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter(term => term.length > 0)
}

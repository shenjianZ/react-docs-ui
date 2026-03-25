import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import type { Root, Heading, Text, InlineCode } from 'mdast'
import type { ParsedDocument, ParsedSection } from './types'

function parseFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
  const lines = content.split('\n')
  const data: Record<string, unknown> = {}
  let contentStart = 0

  if (lines[0]?.startsWith('---')) {
    let i = 1
    while (i < lines.length && !lines[i]?.startsWith('---')) {
      const line = lines[i]
      const colonIndex = line?.indexOf(':') ?? -1
      if (colonIndex > 0 && line) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        if (value === 'true' || value === 'false') {
          data[key] = value === 'true'
        } else if (!isNaN(Number(value))) {
          data[key] = Number(value)
        } else {
          data[key] = value
        }
      }
      i++
    }
    if (i < lines.length && lines[i]?.startsWith('---')) {
      contentStart = i + 1
    }
  }

  return {
    data,
    content: lines.slice(contentStart).join('\n'),
  }
}

function extractTextContent(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  
  const n = node as Record<string, unknown>
  
  if (n.type === 'text') {
    return (n as unknown as Text).value || ''
  }
  
  if (n.type === 'inlineCode') {
    return (n as unknown as InlineCode).value || ''
  }
  
  if (n.type === 'code') {
    return (n as { value?: string }).value || ''
  }
  
  if ('children' in n && Array.isArray(n.children)) {
    return n.children.map(extractTextContent).join(' ')
  }
  
  return ''
}

function cleanContent(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*`_~>|]/g, '')
    .replace(/\$\$?[^$]+\$\$?/g, '')
    .trim()
}

export async function parseMarkdown(
  content: string,
  filePath: string,
): Promise<ParsedDocument> {
  const { data: frontmatter, content: markdownContent } = parseFrontmatter(content)
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
  
  const tree = processor.parse(markdownContent) as Root
  
  const title = (frontmatter.title as string) || extractFirstHeading(tree) || ''
  const description = (frontmatter.description as string) || ''
  
  const sections = extractSections(tree, title)
  
  const path = filePath
    .replace(/\\/g, '/')
    .replace(/\/index\.(md|mdx)$/, '/')
    .replace(/\.(md|mdx)$/, '')
  
  return {
    title,
    description,
    path,
    sections,
  }
}

function extractFirstHeading(tree: Root): string {
  for (const node of tree.children) {
    if (node.type === 'heading' && (node as Heading).depth === 1) {
      return extractTextContent(node)
    }
  }
  return ''
}

function extractSections(tree: Root, pageTitle: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  let currentSection: ParsedSection | null = null
  let contentParts: string[] = []

  const saveCurrentSection = () => {
    if (currentSection && contentParts.length > 0) {
      currentSection.content = cleanContent(contentParts.join(' '))
      sections.push(currentSection)
    }
    contentParts = []
  }

  for (const node of tree.children) {
    if (node.type === 'heading') {
      saveCurrentSection()
      
      const heading = node as Heading
      const title = extractTextContent(heading)
      
      currentSection = {
        title,
        content: '',
        level: heading.depth,
      }
    } else if (currentSection) {
      const text = extractTextContent(node)
      if (text) {
        contentParts.push(text)
      }
    }
  }

  saveCurrentSection()

  if (sections.length === 0 && pageTitle) {
    const allContent: string[] = []
    
    for (const node of tree.children) {
      const text = extractTextContent(node)
      if (text) allContent.push(text)
    }
    
    if (allContent.length > 0) {
      sections.push({
        title: pageTitle,
        content: cleanContent(allContent.join(' ')),
        level: 1,
      })
    }
  }

  return sections
}

export { extractTextContent, cleanContent }

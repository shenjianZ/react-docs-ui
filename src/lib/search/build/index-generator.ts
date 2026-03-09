import fs from 'node:fs'
import path from 'node:path'
import { parseMarkdown } from './markdown-parser'
import { tokenize } from './tokenizer'
import type { SearchIndex, SearchSection } from './types'
import { SEARCH_INDEX_VERSION } from './types'

const SUPPORTED_EXTENSIONS = ['.md', '.mdx']
const MAX_CONTENT_LENGTH = 300

interface ScanResult {
  filePath: string
  relativePath: string
  lang: string
}

function scanDocsDirectory(
  docsDir: string,
  baseDir: string,
  lang: string,
  results: ScanResult[] = []
): ScanResult[] {
  if (!fs.existsSync(docsDir)) {
    return results
  }

  const entries = fs.readdirSync(docsDir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(docsDir, entry.name)
    
    if (entry.isDirectory()) {
      scanDocsDirectory(fullPath, baseDir, lang, results)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        const relativePath = path.relative(baseDir, fullPath)
        results.push({
          filePath: fullPath,
          relativePath,
          lang,
        })
      }
    }
  }

  return results
}

function generateId(docPath: string, sectionTitle: string): string {
  const base = docPath.replace(/[\/\\]/g, '-')
  const anchor = sectionTitle
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return anchor ? `${base}--${anchor}` : base
}

function buildUrl(lang: string, docPath: string, sectionTitle: string): string {
  const anchor = sectionTitle
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  let url = `/${lang}/${docPath}`
  if (anchor) {
    url += `#${anchor}`
  }
  return url
}

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength)
}

async function processDocument(
  filePath: string,
  relativePath: string,
  lang: string
): Promise<SearchSection[]> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const docPath = relativePath
    .replace(new RegExp(`^${lang}[/\\\\]`), '')
    .replace(/\.(md|mdx)$/, '')
    .replace(/[/\\]index$/, '')
  
  const parsed = await parseMarkdown(content, docPath)
  const sections: SearchSection[] = []

  for (const section of parsed.sections) {
    const id = generateId(docPath, section.title)
    const url = buildUrl(lang, docPath, section.title)
    
    const fullText = section.title + ' ' + section.content
    const tokens = await tokenize(fullText)
    
    sections.push({
      id,
      pageTitle: parsed.title,
      sectionTitle: section.title,
      content: truncateContent(section.content, MAX_CONTENT_LENGTH),
      url,
      lang,
      tokens,
    })
  }

  return sections
}

export async function generateSearchIndex(
  publicDir: string,
  lang: string
): Promise<SearchIndex> {
  const docsDir = path.join(publicDir, 'docs', lang)
  
  const files = scanDocsDirectory(docsDir, path.join(publicDir, 'docs'), lang)
  
  const allSections: SearchSection[] = []
  
  for (const file of files) {
    try {
      const sections = await processDocument(
        file.filePath,
        file.relativePath,
        file.lang
      )
      allSections.push(...sections)
    } catch (error) {
      console.warn(`Failed to process ${file.filePath}:`, error)
    }
  }

  return {
    version: SEARCH_INDEX_VERSION,
    generatedAt: Date.now(),
    lang,
    sections: allSections,
  }
}

export async function generateAllSearchIndices(publicDir: string): Promise<Map<string, SearchIndex>> {
  const indices = new Map<string, SearchIndex>()
  const docsRoot = path.join(publicDir, 'docs')
  
  if (!fs.existsSync(docsRoot)) {
    return indices
  }

  const entries = fs.readdirSync(docsRoot, { withFileTypes: true })
  const langs = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)

  for (const lang of langs) {
    try {
      const index = await generateSearchIndex(publicDir, lang)
      indices.set(lang, index)
    } catch (error) {
      console.error(`Failed to generate index for lang "${lang}":`, error)
    }
  }

  return indices
}

export function writeSearchIndex(
  publicDir: string,
  lang: string,
  index: SearchIndex
): string {
  const outputPath = path.join(publicDir, `search-index-${lang}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(index), 'utf-8')
  return outputPath
}

import fs from 'node:fs'
import path from 'node:path'

const ROOT_DIR = process.cwd()
const PUBLIC_DIR = path.join(ROOT_DIR, 'public')
const DOCS_DIR = path.join(PUBLIC_DIR, 'docs')

const SEARCH_INDEX_VERSION = '2.0.0'
const MAX_CONTENT_LENGTH = 300

function isChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text)
}

function tokenize(text) {
  if (!text) return []
  const tokens = []
  const parts = text.split(/(\s+|[，。！？、；：""''（）【】《》\n\r]+)/)
  for (const part of parts) {
    if (!part.trim()) continue
    if (isChinese(part)) {
      const chars = part.split('')
      for (let i = 0; i < chars.length - 1; i++) {
        tokens.push(chars[i] + chars[i + 1])
      }
      tokens.push(...chars.filter(c => c.trim()))
    } else {
      const words = part.toLowerCase().split(/[^a-zA-Z0-9]+/).filter(w => w.length > 0)
      tokens.push(...words)
    }
  }
  return [...new Set(tokens)]
}

function parseFrontmatter(content) {
  const normalized = content.replace(/^\uFEFF/, '')
  const lines = normalized.split(/\r?\n/)
  const data = {}
  let contentStart = 0
  if (lines[0]?.startsWith('---')) {
    let i = 1
    while (i < lines.length && !lines[i]?.startsWith('---')) {
      const line = lines[i]
      const colonIndex = line?.indexOf(':') ?? -1
      if (colonIndex > 0 && line) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        data[key] = value
      }
      i++
    }
    if (i < lines.length && lines[i]?.startsWith('---')) {
      contentStart = i + 1
    }
  }
  return { data, content: lines.slice(contentStart).join('\n') }
}

function cleanContent(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*`_~>|]/g, '')
    .replace(/\$\$?[^$]+\$\$?/g, '')
    .trim()
}

function extractTextContent(node) {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'text') return node.value || ''
  if (node.type === 'inlineCode') return `\`${node.value || ''}\``
  if (node.type === 'code') return node.value || ''
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(extractTextContent).join(' ')
  }
  return ''
}

async function parseMarkdown(content) {
  const { unified } = await import('unified')
  const remarkParse = (await import('remark-parse')).default
  const remarkGfm = (await import('remark-gfm')).default
  const remarkMath = (await import('remark-math')).default

  const { data: frontmatter, content: markdownContent } = parseFrontmatter(content)
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath)
  const tree = processor.parse(markdownContent)

  const title = frontmatter.title || ''
  const sections = []
  let currentSection = null
  let contentParts = []

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
      currentSection = {
        title: extractTextContent(node),
        content: '',
        level: node.depth,
      }
    } else if (currentSection) {
      const text = extractTextContent(node)
      if (text) contentParts.push(text)
    }
  }

  saveCurrentSection()

  if (sections.length === 0 && title) {
    const allContent = []
    for (const node of tree.children) {
      const text = extractTextContent(node)
      if (text) allContent.push(text)
    }
    if (allContent.length > 0) {
      sections.push({
        title,
        content: cleanContent(allContent.join(' ')),
        level: 1,
      })
    }
  }

  return { title, sections }
}

function scanDocsDirectory(docsDir, baseDir, lang, results = []) {
  if (!fs.existsSync(docsDir)) return results
  const entries = fs.readdirSync(docsDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(docsDir, entry.name)
    if (entry.isDirectory()) {
      scanDocsDirectory(fullPath, baseDir, lang, results)
    } else if (entry.isFile() && ['.md', '.mdx'].includes(path.extname(entry.name))) {
      results.push({ filePath: fullPath, relativePath: path.relative(baseDir, fullPath), lang })
    }
  }
  return results
}

function generateId(docPath, sectionTitle) {
  const base = docPath.replace(/[\/\\]/g, '-')
  const anchor = sectionTitle.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '')
  return anchor ? `${base}--${anchor}` : base
}

function buildUrl(lang, docPath, sectionTitle) {
  const anchor = sectionTitle.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '')
  let url = `/${lang}/${docPath}`
  if (anchor) url += `#${anchor}`
  return url
}

function truncateContent(content, maxLength) {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength)
}

async function generateSearchIndex(lang) {
  console.log(`Generating search index for language: ${lang}`)
  const docsLangDir = path.join(DOCS_DIR, lang)
  const files = scanDocsDirectory(docsLangDir, path.join(PUBLIC_DIR, 'docs'), lang)
  const sections = []

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.filePath, 'utf-8')
      const docPath = file.relativePath
        .replace(new RegExp(`^${lang}[/\\\\]`), '')
        .replace(/\.(md|mdx)$/, '')
        .replace(/[/\\]index$/, '')
      
      const parsed = await parseMarkdown(content)

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
    } catch (error) {
      console.warn(`Failed to process ${file.filePath}:`, error.message)
    }
  }
  
  return {
    version: SEARCH_INDEX_VERSION,
    generatedAt: Date.now(),
    lang,
    sections,
  }
}

async function main() {
  console.log('Starting search index generation...')
  if (!fs.existsSync(DOCS_DIR)) {
    console.error('Docs directory not found:', DOCS_DIR)
    process.exit(1)
  }

  const entries = fs.readdirSync(DOCS_DIR, { withFileTypes: true })
  const langs = entries.filter(e => e.isDirectory()).map(e => e.name)
  console.log('Found languages:', langs.join(', '))

  for (const lang of langs) {
    const index = await generateSearchIndex(lang)
    const outputPath = path.join(PUBLIC_DIR, `search-index-${lang}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(index))
    console.log(`Generated: ${outputPath} (${index.sections.length} sections)`)
  }
  console.log('Search index generation complete!')
}

main().catch(error => {
  console.error('Error generating search index:', error)
  process.exit(1)
})

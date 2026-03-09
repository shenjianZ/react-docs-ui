import { saveAs } from "file-saver"
import JSZip from "jszip"
import TurndownService from "turndown"
import matter from "gray-matter"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import { scanDocuments, type DocItem } from "./doc-scanner"

export interface ExportOptions {
  filename?: string
  title?: string
}

export interface ExportAllOptions {
  languages: "current" | "all"
  currentLang: string
  availableLangs?: string[]
  onProgress?: (current: number, total: number, filename: string) => void
}

export interface PdfServerConfig {
  enabled?: boolean
  url?: string
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
})

export async function copyAsMarkdown(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

export function exportAsMarkdown(content: string, options: ExportOptions = {}): void {
  const filename = options.filename || "document.md"
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
  saveAs(blob, filename)
}

export function exportAsPDF(): void {
  window.print()
}

export async function exportAsPDFWithServer(
  serverUrl: string,
  filename?: string
): Promise<boolean> {
  const currentUrl = window.location.href
  const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')
  
  try {
    if (isLocalhost) {
      const html = document.documentElement.outerHTML
      const baseUrl = window.location.origin
      
      const response = await fetch(`${serverUrl}/generate-pdf-from-html`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          baseUrl,
          filename: filename || "document.pdf",
          format: "A4",
          scale: 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate PDF")
      }

      const blob = await response.blob()
      saveAs(blob, filename || "document.pdf")
      return true
    } else {
      const response = await fetch(`${serverUrl}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: currentUrl,
          filename: filename || "document.pdf",
          format: "A4",
          scale: 1,
          waitTime: 2000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate PDF")
      }

      const blob = await response.blob()
      saveAs(blob, filename || "document.pdf")
      return true
    }
  } catch (error) {
    console.error("PDF server error:", error)
    return false
  }
}

export async function exportAsPDFSmart(
  pdfServerConfig?: PdfServerConfig,
  filename?: string
): Promise<void> {
  if (pdfServerConfig?.enabled && pdfServerConfig?.url) {
    const success = await exportAsPDFWithServer(pdfServerConfig.url, filename)
    if (success) {
      return
    }
    console.log("PDF server failed, falling back to browser print")
  }
  window.print()
}

export async function exportAsWord(content: string, options: ExportOptions = {}): Promise<void> {
  const filename = options.filename || "document.docx"
  const title = options.title || "Document"

  const { data, content: bodyContent } = matter(content)
  const docTitle = data.title || title

  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      text: docTitle,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  if (data.description) {
    children.push(
      new Paragraph({
        text: String(data.description),
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )
  }

  if (data.author || data.date) {
    const meta: string[] = []
    if (data.author) meta.push(`Author: ${data.author}`)
    if (data.date) meta.push(`Date: ${data.date}`)
    children.push(
      new Paragraph({
        text: meta.join(" | "),
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    )
  }

  const lines = bodyContent.split("\n")
  let inCodeBlock = false
  let codeContent: string[] = []

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeContent.join("\n"),
                font: "Courier New",
                size: 20,
              }),
            ],
            spacing: { before: 100, after: 100 },
          })
        )
        codeContent = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    if (line.startsWith("# ")) {
      children.push(
        new Paragraph({
          text: line.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 100 },
        })
      )
    } else if (line.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: line.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      )
    } else if (line.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: line.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 150, after: 100 },
        })
      )
    } else if (line.startsWith("#### ")) {
      children.push(
        new Paragraph({
          text: line.slice(5),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 100, after: 100 },
        })
      )
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      children.push(
        new Paragraph({
          text: "• " + line.trim().slice(2),
          spacing: { before: 50, after: 50 },
          indent: { left: 360 },
        })
      )
    } else if (line.trim()) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { before: 50, after: 50 },
        })
      )
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}

export async function exportAllDocs(options: ExportAllOptions): Promise<void> {
  const { languages, currentLang, availableLangs = [currentLang], onProgress } = options

  const langsToExport = languages === "all" ? availableLangs : [currentLang]
  const zip = new JSZip()

  let totalCount = 0
  let currentCount = 0

  const allDocs: Array<{ doc: DocItem; lang: string }> = []

  for (const lang of langsToExport) {
    const docs = await scanDocuments(lang)
    docs.forEach((doc) => {
      allDocs.push({ doc, lang })
    })
  }

  totalCount = allDocs.length

  for (const { doc, lang } of allDocs) {
    currentCount++
    onProgress?.(currentCount, totalCount, doc.title)

    const docPath = doc.path.replace(`/${lang}/`, "")
    let content: string | null = null

    const mdxPath = `/docs/${lang}/${docPath}.mdx`
    const mdPath = `/docs/${lang}/${docPath}.md`

    try {
      const [mdxRes, mdRes] = await Promise.all([fetch(mdxPath), fetch(mdPath)])

      if (mdxRes.ok) {
        const text = await mdxRes.text()
        if (!text.trim().startsWith("<!DOCTYPE") && !text.includes("<html")) {
          content = text
        }
      }

      if (!content && mdRes.ok) {
        const text = await mdRes.text()
        if (!text.trim().startsWith("<!DOCTYPE") && !text.includes("<html")) {
          content = text
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${doc.path}:`, error)
    }

    if (!content) continue

    const langFolder = zip.folder(lang)
    if (!langFolder) continue

    const pathParts = docPath.split("/")
    const fileName = pathParts.pop()
    const dirPath = pathParts.join("/")

    const targetFolder = dirPath ? langFolder.folder(dirPath) : langFolder
    if (!targetFolder) continue

    targetFolder.file(`${fileName}.md`, content)
  }

  const timestamp = new Date().toISOString().slice(0, 10)
  const zipBlob = await zip.generateAsync({ type: "blob" })
  saveAs(zipBlob, `docs-export-${timestamp}.zip`)
}

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html)
}

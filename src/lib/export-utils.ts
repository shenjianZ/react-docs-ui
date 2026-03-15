import { saveAs } from "file-saver"
import JSZip from "jszip"
import TurndownService from "turndown"
import matter from "gray-matter"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
} from "docx"
import type { IRunOptions, FileChild, IBordersOptions } from "docx"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import type {
  Root,
  Content,
  PhrasingContent,
  ListItem,
  Parent,
  Image as MdastImage,
  InlineMath,
  Math as MdastMath,
} from "mdast"
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

function getHeadingLevel(depth: number) {
  switch (depth) {
    case 1:
      return HeadingLevel.HEADING_1
    case 2:
      return HeadingLevel.HEADING_2
    case 3:
      return HeadingLevel.HEADING_3
    case 4:
      return HeadingLevel.HEADING_4
    case 5:
      return HeadingLevel.HEADING_5
    default:
      return HeadingLevel.HEADING_6
  }
}

function extractText(node: Content | PhrasingContent): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value
  }

  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map(child => extractText(child as Content | PhrasingContent)).join("")
  }

  if (node.type === "image") {
    return node.alt || ""
  }

  return ""
}

function renderInlineNodes(nodes: PhrasingContent[], style: Partial<IRunOptions> = {}): TextRun[] {
  return nodes.flatMap(node => {
    switch (node.type) {
      case "text":
        return [new TextRun({ text: node.value, ...style })]
      case "strong":
        return renderInlineNodes(node.children, { ...style, bold: true })
      case "emphasis":
        return renderInlineNodes(node.children, { ...style, italics: true })
      case "delete":
        return renderInlineNodes(node.children, { ...style, strike: true })
      case "inlineCode":
        return [
          new TextRun({
            text: node.value,
            font: "Courier New",
            size: 20,
            ...style,
          }),
        ]
      case "break":
        return [new TextRun({ text: "\n", break: 1, ...style })]
      case "link": {
        const linkText = extractText(node)
        const suffix = node.url ? ` (${node.url})` : ""
        return [
          new TextRun({
            text: `${linkText}${suffix}`,
            underline: {},
            color: "0563C1",
            ...style,
          }),
        ]
      }
      case "image": {
        const imageText = node.alt ? `[Image: ${node.alt}]` : "[Image]"
        return [new TextRun({ text: imageText, italics: true, ...style })]
      }
      case "inlineMath": {
        return [
          new TextRun({
            text: node.value,
            font: "Cambria Math",
            italics: true,
            color: "1E293B",
            ...style,
          }),
        ]
      }
      default:
        if ("children" in node && Array.isArray(node.children)) {
          return renderInlineNodes(node.children as PhrasingContent[], style)
        }
        return []
    }
  })
}

function renderParagraph(node: Parent, options: { spacing?: { before?: number; after?: number }; indent?: { left?: number } } = {}): Paragraph {
  const runs = renderInlineNodes(node.children as PhrasingContent[])
  return new Paragraph({
    children: runs.length > 0 ? runs : [new TextRun("")],
    spacing: options.spacing ?? { before: 50, after: 50 },
    indent: options.indent,
  })
}

function getImageFallbackParagraph(node: MdastImage): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: node.alt ? `[Image: ${node.alt}]` : `[Image: ${node.url}]`,
        italics: true,
      }),
    ],
    spacing: { before: 80, after: 80 },
    alignment: AlignmentType.CENTER,
  })
}

interface LoadedWordImage {
  data: Uint8Array
  type: "jpg" | "png" | "gif" | "bmp"
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    image.src = src
  })
}

async function rasterizeSvgToPng(svgText: string): Promise<Uint8Array | null> {
  try {
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
    const objectUrl = URL.createObjectURL(blob)

    try {
      const image = await loadHtmlImage(objectUrl)
      const width = Math.max(image.naturalWidth || 0, 1)
      const height = Math.max(image.naturalHeight || 0, 1)
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext("2d")
      if (!context) {
        return null
      }

      context.drawImage(image, 0, 0, width, height)

      const pngBlob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(blobValue => resolve(blobValue), "image/png")
      })

      if (!pngBlob) {
        return null
      }

      const arrayBuffer = await pngBlob.arrayBuffer()
      return new Uint8Array(arrayBuffer)
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  } catch (error) {
    console.error("Failed to rasterize SVG for Word export:", error)
    return null
  }
}

async function loadImageBytes(url: string): Promise<LoadedWordImage | null> {
  try {
    const resolvedUrl = new URL(url, window.location.href).toString()
    const response = await fetch(resolvedUrl)
    if (!response.ok) {
      return null
    }

    const imageType = detectImageType(url)
    if (imageType === "svg") {
      const svgText = await response.text()
      const pngBytes = await rasterizeSvgToPng(svgText)
      return pngBytes ? { data: pngBytes, type: "png" } : null
    }

    const arrayBuffer = await response.arrayBuffer()
    return {
      data: new Uint8Array(arrayBuffer),
      type: imageType,
    }
  } catch (error) {
    console.error("Failed to load image for Word export:", error)
    return null
  }
}

function detectImageType(url: string): "jpg" | "png" | "gif" | "bmp" | "svg" {
  const normalizedUrl = url.toLowerCase().split("?")[0].split("#")[0]

  if (normalizedUrl.endsWith(".png")) return "png"
  if (normalizedUrl.endsWith(".gif")) return "gif"
  if (normalizedUrl.endsWith(".bmp")) return "bmp"
  if (normalizedUrl.endsWith(".svg")) return "svg"
  return "jpg"
}

async function renderImageNode(node: MdastImage): Promise<FileChild[]> {
  const loadedImage = await loadImageBytes(node.url)
  if (!loadedImage) {
    return [getImageFallbackParagraph(node)]
  }

  const caption = node.alt?.trim()
  const children: FileChild[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: caption ? 40 : 120 },
      children: [
        new ImageRun({
          data: loadedImage.data,
          type: loadedImage.type,
          transformation: {
            width: 520,
            height: 320,
          },
        }),
      ],
    }),
  ]

  if (caption) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: caption,
            italics: true,
            color: "64748B",
          }),
        ],
      })
    )
  }

  return children
}

async function renderParagraphNode(node: Parent): Promise<FileChild[]> {
  const children = node.children as PhrasingContent[]
  const hasImage = children.some(child => child.type === "image")

  if (!hasImage) {
    return [renderParagraph(node)]
  }

  const blocks: FileChild[] = []
  let textBuffer: PhrasingContent[] = []

  const flushTextBuffer = () => {
    if (textBuffer.length === 0) return
    blocks.push(renderParagraphFromPhrasing(textBuffer))
    textBuffer = []
  }

  for (const child of children) {
    if (child.type === "image") {
      flushTextBuffer()
      blocks.push(...await renderImageNode(child))
      continue
    }

    textBuffer.push(child)
  }

  flushTextBuffer()
  return blocks
}

function renderParagraphFromPhrasing(
  nodes: PhrasingContent[],
  options: {
    spacing?: { before?: number; after?: number }
    indent?: { left?: number }
    shading?: { fill: string }
    border?: IBordersOptions
  } = {}
): Paragraph {
  const runs = renderInlineNodes(nodes)
  return new Paragraph({
    children: runs.length > 0 ? runs : [new TextRun("")],
    spacing: options.spacing ?? { before: 50, after: 50 },
    indent: options.indent,
    shading: options.shading,
    border: options.border,
  })
}

function renderTableCellChildren(cell: Content, isHeader: boolean): FileChild[] {
  if (!("children" in cell) || !Array.isArray(cell.children)) {
    return [
      new Paragraph({
        children: [new TextRun({ text: "", bold: isHeader })],
      }),
    ]
  }

  const children = cell.children.flatMap(child => {
    if (child.type === "paragraph") {
      const text = extractText(child).trim()
      return [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: isHeader,
            }),
          ],
          spacing: { before: 40, after: 40 },
        }),
      ]
    }

    if (child.type === "list") {
      return child.children.flatMap((item, index) => renderListItem(item, !!child.ordered, 0, index))
    }

    const text = extractText(child).trim()
    return text
      ? [
          new Paragraph({
            children: [new TextRun({ text, bold: isHeader })],
            spacing: { before: 40, after: 40 },
          }),
        ]
      : []
  })

  return children.length > 0
    ? children
    : [
        new Paragraph({
          children: [new TextRun({ text: "", bold: isHeader })],
        }),
      ]
}

function renderCodeBlock(value: string, language?: string | null): FileChild[] {
  const codeLines = value.replace(/\r\n/g, "\n").split("\n")
  const codeParagraphs = codeLines.length > 0
    ? codeLines.map(line =>
        new Paragraph({
          children: [
            new TextRun({
              text: line.length > 0 ? line : " ",
              font: "Courier New",
              size: 20,
              color: "0F172A",
            }),
          ],
          spacing: { before: 0, after: 0, line: 280 },
        })
      )
    : [new Paragraph({ children: [new TextRun(" ")] })]

  const rows: TableRow[] = []

  if (language) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "E2E8F0" },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: language.toUpperCase(),
                    bold: true,
                    size: 18,
                    color: "334155",
                  }),
                ],
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
        ],
      })
    )
  }

  rows.push(
    new TableRow({
      children: [
        new TableCell({
          shading: { fill: "F8FAFC" },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: codeParagraphs,
        }),
      ],
    })
  )

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
        left: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
        insideHorizontal: language
          ? { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }
          : { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows,
    }),
    new Paragraph({ spacing: { after: 140 } }),
  ]
}

function renderMathBlock(node: MdastMath): FileChild[] {
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: "C7D2FE" },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: "C7D2FE" },
        left: { style: BorderStyle.SINGLE, size: 4, color: "C7D2FE" },
        right: { style: BorderStyle.SINGLE, size: 4, color: "C7D2FE" },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F8FAFC" },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 60 },
                  children: [
                    new TextRun({
                      text: "Formula",
                      bold: true,
                      size: 18,
                      color: "475569",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: node.value,
                      font: "Cambria Math",
                      size: 24,
                      italics: true,
                      color: "0F172A",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 140 } }),
  ]
}

function renderListItem(item: ListItem, ordered: boolean, depth: number, index: number): FileChild[] {
  const children: FileChild[] = []
  const marker = ordered ? `${index + 1}. ` : "• "
  let markerUsed = false
  const taskMarker =
    typeof item.checked === "boolean"
      ? item.checked
        ? "☑ "
        : "☐ "
      : null

  for (const child of item.children) {
    if (child.type === "paragraph") {
      const runs = renderInlineNodes(child.children)
      if (!markerUsed) {
        runs.unshift(new TextRun(taskMarker ?? marker))
        markerUsed = true
      }

      children.push(
        new Paragraph({
          children: runs,
          spacing: { before: 40, after: 40 },
          indent: { left: 360 + depth * 360 },
        })
      )
      continue
    }

    children.push(...renderBlockNodeSync(child, depth + 1))
  }

  if (!markerUsed) {
    children.unshift(
      new Paragraph({
        children: [new TextRun(taskMarker ?? marker)],
        spacing: { before: 40, after: 40 },
        indent: { left: 360 + depth * 360 },
      })
    )
  }

  return children
}

function renderTable(node: Parent): FileChild[] {
  const rows = (node.children as Content[])
    .filter(row => row.type === "tableRow")
    .map((row, rowIndex) => {
      return new TableRow({
        tableHeader: rowIndex === 0,
        children: row.children.map(cell => {
          return new TableCell({
            width: {
              size: 100 / Math.max(row.children.length, 1),
              type: WidthType.PERCENTAGE,
            },
            shading: rowIndex === 0 ? { fill: "F3F4F6" } : undefined,
            margins: {
              top: 100,
              bottom: 100,
              left: 120,
              right: 120,
            },
            children: renderTableCellChildren(cell, rowIndex === 0),
          })
        }),
      })
    })

  if (rows.length === 0) {
    return []
  }

  return [
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      },
      rows,
    }),
    new Paragraph({ spacing: { after: 120 } }),
  ]
}

function renderBlockNodeSync(node: Content, depth = 0): FileChild[] {
  switch (node.type) {
    case "heading":
      return [
        new Paragraph({
          children: renderInlineNodes(node.children),
          heading: getHeadingLevel(node.depth),
          spacing: { before: 220, after: 100 },
        }),
      ]
    case "blockquote":
      return (node.children as Content[]).flatMap(child => {
        if (child.type === "paragraph") {
          return [
            renderParagraphFromPhrasing(child.children, {
              spacing: { before: 60, after: 60 },
              indent: { left: 420 + depth * 240 },
              shading: { fill: "F8FAFC" },
              border: {
                left: { color: "94A3B8", size: 6, style: BorderStyle.SINGLE },
              },
            }),
          ]
        }
        return renderBlockNodeSync(child, depth + 1)
      })
    case "code":
      return renderCodeBlock(node.value, node.lang)
    case "list":
      return node.children.flatMap((item, index) => renderListItem(item, !!node.ordered, depth, index))
    case "thematicBreak":
      return [
        new Paragraph({
          text: "",
          spacing: { before: 120, after: 120 },
          border: {
            bottom: {
              color: "D1D5DB",
              size: 6,
              style: BorderStyle.SINGLE,
            },
          },
        }),
      ]
    case "table":
      return renderTable(node)
    case "html":
      return node.value.trim() ? [new Paragraph({ text: node.value, spacing: { before: 50, after: 50 } })] : []
    default:
      if ("children" in node && Array.isArray(node.children)) {
        return (node.children as Content[]).flatMap(child => renderBlockNodeSync(child, depth + 1))
      }
      return []
  }
}

async function renderBlockNode(node: Content, depth = 0): Promise<FileChild[]> {
  if (node.type === "paragraph") {
    return renderParagraphNode(node)
  }

  if (node.type === "image") {
    return renderImageNode(node)
  }

  if (node.type === "math") {
    return renderMathBlock(node)
  }

  return renderBlockNodeSync(node, depth)
}

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

  const children: FileChild[] = []

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

  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(bodyContent) as Root
  const renderedBody: FileChild[] = []
  for (const node of tree.children) {
    renderedBody.push(...await renderBlockNode(node))
  }
  children.push(...renderedBody)

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

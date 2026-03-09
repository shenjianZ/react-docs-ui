import { Copy, FileText, FileDown, FileType, Package } from "lucide-react"
import { useState, useRef, useCallback } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  copyAsMarkdown,
  exportAsMarkdown,
  exportAsPDFSmart,
  exportAsWord,
  type PdfServerConfig,
} from "@/lib/export-utils"
import { ExportAllDialog } from "./ExportAllDialog"

interface ExportToolbarProps {
  content: string
  title?: string
  lang: string
  availableLangs?: string[]
  pdfServerConfig?: PdfServerConfig
}

const translations = {
  "zh-cn": {
    export: "导出",
    copyAsMarkdown: "复制为 Markdown",
    exportAsMarkdown: "导出为 Markdown",
    exportAsPDF: "导出为 PDF",
    exportAsWord: "导出为 Word",
    exportAllDocs: "导出所有文档",
    copied: "已复制到剪贴板",
    exporting: "正在导出...",
  },
  en: {
    export: "Export",
    copyAsMarkdown: "Copy as Markdown",
    exportAsMarkdown: "Export as Markdown",
    exportAsPDF: "Export as PDF",
    exportAsWord: "Export as Word",
    exportAllDocs: "Export All Documents",
    copied: "Copied to clipboard",
    exporting: "Exporting...",
  },
}

export function ExportToolbar({
  content,
  title,
  lang,
  availableLangs = [lang],
  pdfServerConfig,
}: ExportToolbarProps) {
  const t = translations[lang as keyof typeof translations] || translations.en
  const [exportAllOpen, setExportAllOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleCopyAsMarkdown = useCallback(async () => {
    const success = await copyAsMarkdown(content)
    if (success) {
      // 可以添加 toast 提示
      console.log(t.copied)
    }
  }, [content, t.copied])

  const handleExportMarkdown = useCallback(() => {
    const filename = title ? `${title}.md` : "document.md"
    exportAsMarkdown(content, { filename, title })
  }, [content, title])

  const handleExportPDF = useCallback(async () => {
    const filename = title ? `${title}.pdf` : "document.pdf"
    await exportAsPDFSmart(pdfServerConfig, filename)
  }, [title, pdfServerConfig])

  const handleExportWord = useCallback(async () => {
    const filename = title ? `${title}.docx` : "document.docx"
    await exportAsWord(content, { filename, title })
  }, [content, title])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" data-export-exclude>
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">{t.export}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCopyAsMarkdown}>
            <Copy className="mr-2 h-4 w-4" />
            {t.copyAsMarkdown}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportMarkdown}>
            <FileText className="mr-2 h-4 w-4" />
            {t.exportAsMarkdown}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileType className="mr-2 h-4 w-4" />
            {t.exportAsPDF}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportWord}>
            <FileDown className="mr-2 h-4 w-4" />
            {t.exportAsWord}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setExportAllOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            {t.exportAllDocs}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div ref={contentRef} className="hidden" />

      <ExportAllDialog
        open={exportAllOpen}
        onOpenChange={setExportAllOpen}
        lang={lang}
        availableLangs={availableLangs}
      />
    </>
  )
}

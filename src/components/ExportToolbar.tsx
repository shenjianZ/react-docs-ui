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
import { useToast } from "@/components/ui/use-toast"
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
    copyFailed: "复制失败，请稍后重试",
    markdownExported: "Markdown 文件已开始下载",
    markdownExportFailed: "Markdown 导出失败，请稍后重试",
    pdfExported: "PDF 已开始导出",
    pdfPrintOpened: "已打开浏览器打印窗口",
    pdfExportFailed: "PDF 导出失败，请稍后重试",
    wordExported: "Word 文件已开始下载",
    wordExportFailed: "Word 导出失败，请稍后重试",
  },
  en: {
    export: "Export",
    copyAsMarkdown: "Copy as Markdown",
    exportAsMarkdown: "Export as Markdown",
    exportAsPDF: "Export as PDF",
    exportAsWord: "Export as Word",
    exportAllDocs: "Export All Documents",
    copied: "Copied to clipboard",
    copyFailed: "Copy failed. Please try again.",
    markdownExported: "Markdown download started.",
    markdownExportFailed: "Markdown export failed. Please try again.",
    pdfExported: "PDF export started.",
    pdfPrintOpened: "Print dialog opened.",
    pdfExportFailed: "PDF export failed. Please try again.",
    wordExported: "Word download started.",
    wordExportFailed: "Word export failed. Please try again.",
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
  const { toast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [exportAllOpen, setExportAllOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const copyTriggeredRef = useRef(false)

  const handleCopyAsMarkdown = useCallback(async () => {
    try {
      const success = await copyAsMarkdown(content)
      if (!success) {
        toast({
          variant: "destructive",
          description: t.copyFailed,
        })
        return
      }

      toast({
        description: t.copied,
      })
      setMenuOpen(false)
    } catch (error) {
      console.error("Failed to copy markdown:", error)
      toast({
        variant: "destructive",
        description: t.copyFailed,
      })
    }
  }, [content, t.copyFailed, t.copied, toast])

  const handleExportMarkdown = useCallback(() => {
    try {
      const filename = title ? `${title}.md` : "document.md"
      exportAsMarkdown(content, { filename, title })
      toast({
        description: t.markdownExported,
      })
      setMenuOpen(false)
    } catch (error) {
      console.error("Failed to export markdown:", error)
      toast({
        variant: "destructive",
        description: t.markdownExportFailed,
      })
    }
  }, [content, title, t.markdownExportFailed, t.markdownExported, toast])

  const handleExportPDF = useCallback(async () => {
    try {
      const filename = title ? `${title}.pdf` : "document.pdf"
      const result = await exportAsPDFSmart(pdfServerConfig, filename)
      toast({
        description: result.mode === "print" ? t.pdfPrintOpened : t.pdfExported,
      })
      setMenuOpen(false)
    } catch (error) {
      console.error("Failed to export PDF:", error)
      toast({
        variant: "destructive",
        description: t.pdfExportFailed,
      })
    }
  }, [title, pdfServerConfig, t.pdfExportFailed, t.pdfExported, t.pdfPrintOpened, toast])

  const handleExportWord = useCallback(async () => {
    try {
      const filename = title ? `${title}.docx` : "document.docx"
      await exportAsWord(content, { filename, title })
      toast({
        description: t.wordExported,
      })
      setMenuOpen(false)
    } catch (error) {
      console.error("Failed to export Word:", error)
      toast({
        variant: "destructive",
        description: t.wordExportFailed,
      })
    }
  }, [content, title, t.wordExportFailed, t.wordExported, toast])

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 border-0 shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-accent"
            data-export-exclude
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">{t.export}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onPointerDown={(event) => {
              event.preventDefault()
              if (copyTriggeredRef.current) return
              copyTriggeredRef.current = true
              void handleCopyAsMarkdown().finally(() => {
                window.setTimeout(() => {
                  copyTriggeredRef.current = false
                }, 0)
              })
            }}
            onClick={() => {
              if (copyTriggeredRef.current) return
              void handleCopyAsMarkdown()
            }}
            onSelect={(event) => {
              event.preventDefault()
              if (copyTriggeredRef.current) return
              void handleCopyAsMarkdown()
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t.copyAsMarkdown}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExportMarkdown}>
            <FileText className="mr-2 h-4 w-4" />
            {t.exportAsMarkdown}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExportPDF}>
            <FileType className="mr-2 h-4 w-4" />
            {t.exportAsPDF}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExportWord}>
            <FileDown className="mr-2 h-4 w-4" />
            {t.exportAsWord}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setExportAllOpen(true)}>
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

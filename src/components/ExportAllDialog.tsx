import { useState, useCallback } from "react"
import { Download, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { exportAllDocs, type ExportAllOptions } from "@/lib/export-utils"

interface ExportAllDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lang: string
  availableLangs?: string[]
}

const translations = {
  "zh-cn": {
    title: "导出所有文档",
    description: "选择导出范围，文档将打包为 ZIP 文件下载",
    languageScope: "导出范围",
    currentLang: "当前语言",
    allLangs: "所有语言",
    cancel: "取消",
    export: "开始导出",
    exporting: "正在导出...",
    progress: "正在处理: {current}/{total} - {filename}",
    exportSuccess: "文档导出完成，ZIP 文件已开始下载",
    exportFailed: "导出失败，请稍后重试",
  },
  en: {
    title: "Export All Documents",
    description: "Select export scope. Documents will be downloaded as a ZIP file.",
    languageScope: "Language Scope",
    currentLang: "Current Language",
    allLangs: "All Languages",
    cancel: "Cancel",
    export: "Start Export",
    exporting: "Exporting...",
    progress: "Processing: {current}/{total} - {filename}",
    exportSuccess: "Export complete. ZIP download started.",
    exportFailed: "Export failed. Please try again.",
  },
}

type LanguageScope = "current" | "all"

export function ExportAllDialog({
  open,
  onOpenChange,
  lang,
  availableLangs = [lang],
}: ExportAllDialogProps) {
  const t = translations[lang as keyof typeof translations] || translations.en
  const { toast } = useToast()

  const [languageScope, setLanguageScope] = useState<LanguageScope>("current")
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number; filename: string } | null>(null)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    setProgress(null)

    const options: ExportAllOptions = {
      languages: languageScope,
      currentLang: lang,
      availableLangs,
      onProgress: (current, total, filename) => {
        setProgress({ current, total, filename })
      },
    }

    try {
      await exportAllDocs(options)
      toast({
        description: t.exportSuccess,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        variant: "destructive",
        description: t.exportFailed,
      })
    } finally {
      setIsExporting(false)
      setProgress(null)
    }
  }, [languageScope, lang, availableLangs, onOpenChange, t.exportFailed, t.exportSuccess, toast])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>{t.languageScope}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={languageScope === "current" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguageScope("current")}
                className="flex-1"
              >
                {t.currentLang}
              </Button>
              <Button
                type="button"
                variant={languageScope === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguageScope("all")}
                className="flex-1"
                disabled={availableLangs.length <= 1}
              >
                {t.allLangs}
              </Button>
            </div>
          </div>

          {isExporting && progress && (
            <div className="text-sm text-muted-foreground">
              {t.progress
                .replace("{current}", String(progress.current))
                .replace("{total}", String(progress.total))
                .replace("{filename}", progress.filename)}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {t.cancel}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.exporting}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t.export}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

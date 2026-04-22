import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTheme } from "@/components/theme-provider"
import { docIndexCache } from "@/lib/doc-index"
import type { DocItem } from "@/lib/doc-scanner"
import { copyToClipboard } from "@/lib/utils"

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allDocs, setAllDocs] = useState<DocItem[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams<{ lang: string }>()
  const lang = params.lang || (location.pathname.startsWith("/en") ? "en" : "zh-cn")
  const { setTheme } = useTheme()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // 加载所有文档索引
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const docs = await docIndexCache.getDocuments(lang)
        if (!cancelled) {
          setAllDocs(docs)
        }
      } catch (error) {
        console.error('Failed to load document index:', error)
      }
    })()

    return () => { cancelled = true }
  }, [lang])

  // 过滤文档
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) {
      return allDocs
    }

    const lowerQuery = searchQuery.toLowerCase()
    return allDocs.filter(doc =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.path.toLowerCase().includes(lowerQuery) ||
      doc.description?.toLowerCase().includes(lowerQuery) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }, [allDocs, searchQuery])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput
          placeholder={lang === "en" ? "Type a command or search..." : "输入命令或搜索..."}
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>{lang === "en" ? "No results found." : "未找到结果"}</CommandEmpty>
          <CommandGroup heading={lang === "en" ? "Pages" : "文档页面"}>
            {filteredDocs.map(doc => (
              <CommandItem key={doc.path} onSelect={() => go(doc.path)}>
                {doc.title}
                <CommandShortcut>{doc.path.startsWith(`/${lang}/`) ? doc.path.substring(`/${lang}/`.length - 1) : doc.path}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={lang === "en" ? "Theme" : "主题"}>
            <CommandItem onSelect={() => setTheme("light")}>{lang === "en" ? "Light" : "浅色"}</CommandItem>
            <CommandItem onSelect={() => setTheme("dark")}>{lang === "en" ? "Dark" : "深色"}</CommandItem>
            <CommandItem onSelect={() => setTheme("system")}>{lang === "en" ? "System" : "跟随系统"}</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={lang === "en" ? "Actions" : "操作"}>
            <CommandItem onSelect={() => { setOpen(false); window.location.reload() }}>
              {lang === "en" ? "Reload Page" : "刷新页面"}
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); copyToClipboard(window.location.href) }}>
              {lang === "en" ? "Copy URL" : "复制链接"}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}



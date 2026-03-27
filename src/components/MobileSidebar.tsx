import { useEffect } from "react"
import { SidebarNav } from "./SidebarNav"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface MobileSidebarProps {
  lang: string
  version?: string
  sidebar: {
    enabled?: boolean
    sections?: any
    collections?: Record<string, { sections: any }>
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({
  lang,
  version,
  sidebar,
  open,
  onOpenChange,
}: MobileSidebarProps) {
  // 控制页面滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed left-0 right-0 top-14 bottom-0 z-50">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {/* 侧边栏 */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-[240px] max-w-[85vw]",
          "bg-background border-r border-border shadow-lg",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ScrollArea className="h-full w-full px-4 py-4">
          <SidebarNav lang={lang} version={version} sidebar={sidebar} />
        </ScrollArea>
      </div>
    </div>
  )
}

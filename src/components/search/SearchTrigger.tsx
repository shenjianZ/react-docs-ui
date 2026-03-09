import { Search } from "lucide-react"
import { useSearch } from "./SearchProvider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchTriggerProps {
  className?: string
  placeholder?: string
}

export function SearchTrigger({ className, placeholder }: SearchTriggerProps) {
  const { setOpen } = useSearch()

  return (
    <Button
      variant="ghost"
      onClick={() => setOpen(true)}
      className={cn(
        "relative h-9 justify-start rounded-lg bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:mr-2 sm:w-48 lg:w-64",
        className
      )}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex truncate">
        {placeholder || "搜索文档..."}
      </span>
      <span className="inline-flex lg:hidden">搜索</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}

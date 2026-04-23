import { useState, useEffect, useCallback } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import * as bookmarkApi from "@/lib/api/bookmarks"
import { useAuth } from "@/hooks/useAuth"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  pageSlug: string
  pageTitle?: string
  lang?: string
}

export function BookmarkButton({ pageSlug, pageTitle, lang = "zh-cn" }: BookmarkButtonProps) {
  const { isAuthenticated } = useAuth()
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    bookmarkApi.getBookmarkStatus(pageSlug, lang).then((status) => {
      setBookmarked(status.bookmarked)
      setBookmarkId(status.id ?? null)
    }).catch(() => {})
  }, [pageSlug, lang, isAuthenticated])

  const toggle = useCallback(async () => {
    if (!isAuthenticated || loading) return
    setLoading(true)
    try {
      if (bookmarked && bookmarkId) {
        const message = await bookmarkApi.deleteBookmark(bookmarkId)
        setBookmarked(false)
        setBookmarkId(null)
        toast({ description: message || "已取消收藏" })
      } else {
        const result = await bookmarkApi.createBookmark({ pageSlug, pageTitle, lang })
        setBookmarked(true)
        setBookmarkId(result.data.id)
        toast({ description: result.message || "收藏成功" })
      }
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "收藏操作失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [bookmarked, bookmarkId, pageSlug, pageTitle, lang, isAuthenticated, loading])

  if (!isAuthenticated) return null

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "h-8 gap-1.5 px-2 text-sm text-muted-foreground hover:text-foreground"
      )}
      aria-label={bookmarked ? "取消收藏" : "收藏"}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{bookmarked ? "已收藏" : "收藏"}</span>
    </button>
  )
}

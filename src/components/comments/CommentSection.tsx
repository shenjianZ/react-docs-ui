import { useState, useEffect, useCallback, useMemo } from "react"
import { MessageSquare } from "lucide-react"
import * as commentApi from "@/lib/api/comments"
import type { CommentItem as CommentItemType } from "@/lib/api/types"
import { CommentInput } from "./CommentInput"
import { CommentItem } from "./CommentItem"
import { toast } from "@/components/ui/use-toast"

interface CommentSectionProps {
  pageSlug: string
  lang?: string
}

interface ReplyTarget {
  id: string
  authorLabel: string
}

export function CommentSection({ pageSlug, lang = "zh-cn" }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItemType[]>([])
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyComposerOffset, setReplyComposerOffset] = useState(24)

  const fetchComments = useCallback(async () => {
    try {
      const list = await commentApi.listComments(pageSlug, lang)
      setComments(list)
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "评论列表获取失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [pageSlug, lang])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  useEffect(() => {
    if (replyTo && !comments.some((comment) => comment.id === replyTo.id)) {
      setReplyTo(null)
    }
  }, [comments, replyTo])

  useEffect(() => {
    if (!replyTo || typeof window === "undefined") {
      setReplyComposerOffset(24)
      return
    }

    const updateReplyComposerOffset = () => {
      const viewport = window.visualViewport
      if (!viewport) {
        setReplyComposerOffset(24)
        return
      }

      const keyboardHeight = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      )
      setReplyComposerOffset(keyboardHeight + 16)
    }

    updateReplyComposerOffset()
    window.visualViewport?.addEventListener("resize", updateReplyComposerOffset)
    window.visualViewport?.addEventListener("scroll", updateReplyComposerOffset)

    return () => {
      window.visualViewport?.removeEventListener("resize", updateReplyComposerOffset)
      window.visualViewport?.removeEventListener("scroll", updateReplyComposerOffset)
    }
  }, [replyTo])

  const submitComment = async (content: string, parentId?: string | null) => {
    try {
      const result = await commentApi.createComment({
        pageSlug,
        parentId,
        content,
        lang,
      })
      toast({ description: result.message || "评论发表成功" })
      await fetchComments()
      return true
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "评论发表失败",
        variant: "destructive",
      })
      return false
    }
  }

  const handleCreateTopLevel = async (content: string) => {
    await submitComment(content, null)
  }

  const handleCreateReply = async (content: string) => {
    const success = await submitComment(content, replyTo?.id)
    if (success) {
      setReplyTo(null)
    }
  }

  const handleUpdate = async (id: string, content: string) => {
    try {
      const result = await commentApi.updateComment(id, content)
      toast({ description: result.message || "评论更新成功" })
      await fetchComments()
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "评论更新失败",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const message = await commentApi.deleteComment(id)
      if (replyTo?.id === id) {
        setReplyTo(null)
      }
      toast({ description: message || "评论删除成功" })
      await fetchComments()
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "评论删除失败",
        variant: "destructive",
      })
    }
  }

  const handleLike = async (id: string) => {
    try {
      const result = await commentApi.likeComment(id)
      toast({ description: result.message || "点赞成功" })
      await fetchComments()
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "点赞失败",
        variant: "destructive",
      })
    }
  }

  const commentThreads = useMemo(() => {
    const repliesByRoot = new Map<string, CommentItemType[]>()

    for (const comment of comments) {
      if (comment.threadRootId === comment.id) continue
      const replies = repliesByRoot.get(comment.threadRootId) || []
      replies.push(comment)
      repliesByRoot.set(comment.threadRootId, replies)
    }

    const topLevel = comments.filter((comment) => comment.threadRootId === comment.id)

    return topLevel.map((comment) => ({
      comment,
      replies: repliesByRoot.get(comment.id) || [],
    }))
  }, [comments])

  const handleReply = (comment: CommentItemType) => {
    setReplyTo({
      id: comment.id,
      authorLabel: comment.authorLabel,
    })
  }

  return (
    <div className={`mt-8 border-t pt-6 ${replyTo ? "pb-28" : ""}`}>
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <MessageSquare className="h-5 w-5" />
        评论 ({comments.length})
      </h3>

      <div className="mt-4">
        <CommentInput
          placeholder="写下你的评论..."
          onSubmit={handleCreateTopLevel}
        />
      </div>

      <div className="mt-4 divide-y">
        {loading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">加载中...</p>
        ) : commentThreads.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">暂无评论，来抢沙发吧</p>
        ) : (
          commentThreads.map(({ comment, replies }) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={() => handleReply(comment)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onLike={handleLike}
              />
              {replies.map((reply) => (
                <div key={reply.id} className="ml-8 border-l border-border/50 pl-4">
                  <CommentItem
                    comment={reply}
                    onReply={() => handleReply(reply)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onLike={handleLike}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {replyTo && (
        <div
          className="fixed left-3 right-3 z-40 rounded-xl border border-border/60 bg-background/95 p-3 shadow-2xl backdrop-blur md:left-1/2 md:right-auto md:w-[min(720px,calc(100vw-2rem))] md:-translate-x-1/2"
          style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + ${replyComposerOffset}px)` }}
        >
          <div className="mb-2 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="truncate">回复 @{replyTo.authorLabel}</span>
            <button
              type="button"
              className="shrink-0 text-xs text-primary hover:underline"
              onClick={() => setReplyTo(null)}
            >
              取消
            </button>
          </div>
          <CommentInput
            autoFocus
            placeholder={`回复 @${replyTo.authorLabel}...`}
            onSubmit={handleCreateReply}
          />
        </div>
      )}
    </div>
  )
}

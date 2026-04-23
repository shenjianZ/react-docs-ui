import { useState, useEffect, useCallback } from "react"
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

export function CommentSection({ pageSlug, lang = "zh-cn" }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItemType[]>([])
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleCreate = async (content: string) => {
    try {
      const result = await commentApi.createComment({
        pageSlug,
        parentId: replyTo,
        content,
        lang,
      })
      setReplyTo(null)
      toast({ description: result.message || "评论发表成功" })
      await fetchComments()
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "评论发表失败",
        variant: "destructive",
      })
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

  // Build tree structure
  const topLevel = comments.filter((c) => !c.parentId)
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId)

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <MessageSquare className="h-5 w-5" />
        评论 ({comments.length})
      </h3>

      <div className="mt-4">
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>回复评论</span>
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setReplyTo(null)}
            >
              取消
            </button>
          </div>
        )}
        <CommentInput
          placeholder={replyTo ? "写下你的回复..." : "写下你的评论..."}
          onSubmit={handleCreate}
        />
      </div>

      <div className="mt-4 divide-y">
        {loading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">加载中...</p>
        ) : topLevel.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">暂无评论，来抢沙发吧</p>
        ) : (
          topLevel.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={(id) => setReplyTo(id)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onLike={handleLike}
              />
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-8">
                  <CommentItem
                    comment={reply}
                    onReply={(id) => setReplyTo(id)}
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
    </div>
  )
}

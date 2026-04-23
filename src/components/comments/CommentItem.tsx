import { useState } from "react"
import { Heart, Reply, Pencil, Trash2 } from "lucide-react"
import type { CommentItem as CommentItemType } from "@/lib/api/types"
import { useAuth } from "@/hooks/useAuth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CommentItemProps {
  comment: CommentItemType
  onReply: (parentId: string) => void
  onUpdate: (id: string, content: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onLike: (id: string) => Promise<void>
}

export function CommentItem({ comment, onReply, onUpdate, onDelete, onLike }: CommentItemProps) {
  const { isAuthenticated } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [liking, setLiking] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const authorInitials = comment.authorLabel.slice(0, 2).toUpperCase()

  const handleUpdate = async () => {
    if (!editContent.trim()) return
    await onUpdate(comment.id, editContent.trim())
    setEditing(false)
  }

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    try {
      await onLike(comment.id)
    } finally {
      setLiking(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return "刚刚"
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
    return `${Math.floor(diff / 86400)} 天前`
  }

  return (
    <div className="group py-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium"
          aria-label="查看用户公开资料"
        >
          {comment.authorAvatarUrl ? (
            <img src={comment.authorAvatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            authorInitials
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="font-medium hover:underline"
            >
              {comment.authorLabel}
            </button>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>

          {editing ? (
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex h-8 flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus
              />
              <button
                type="button"
                onClick={handleUpdate}
                className="text-xs text-primary hover:underline"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setEditContent(comment.content) }}
                className="text-xs text-muted-foreground hover:underline"
              >
                取消
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm leading-relaxed break-words">{comment.content}</p>
          )}

          <div className="mt-1.5 flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => onReply(comment.id)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Reply className="h-3.5 w-3.5" />
                回复
              </button>
            )}
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Heart className="h-3.5 w-3.5" />
              {comment.likeCount > 0 && comment.likeCount}
            </button>
            {comment.canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>{comment.authorLabel}</DialogTitle>
            <DialogDescription>
              {comment.authorUsername ? `@${comment.authorUsername}` : "公开资料"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium">
              {comment.authorAvatarUrl ? (
                <img src={comment.authorAvatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                authorInitials
              )}
            </div>
            <p className="min-h-12 flex-1 text-sm text-muted-foreground">
              {comment.authorBio || "该用户还没有填写公开简介。"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

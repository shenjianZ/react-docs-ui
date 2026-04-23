import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { LoginDialog } from "@/components/auth/LoginDialog"

interface CommentInputProps {
  placeholder?: string
  onSubmit: (content: string) => Promise<void>
}

export function CommentInput({ placeholder = "写下你的评论...", onSubmit }: CommentInputProps) {
  const { isAuthenticated } = useAuth()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-sm text-muted-foreground">
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => setLoginOpen(true)}
        >
          登录
        </button>
        {" "}后参与评论
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || loading) return
    setLoading(true)
    try {
      await onSubmit(trimmed)
      setContent("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button
        type="submit"
        disabled={!content.trim() || loading}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </button>
    </form>
  )
}

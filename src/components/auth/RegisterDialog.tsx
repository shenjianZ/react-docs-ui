import { useEffect, useState } from "react"
import { Loader2, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface RegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin?: () => void
}

export function RegisterDialog({ open, onOpenChange, onSwitchToLogin }: RegisterDialogProps) {
  const { register, sendEmailCode } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setVerificationCode("")
    setError("")
    setLoading(false)
    setSendingCode(false)
    setCountdown(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("两次密码不一致")
      return
    }
    if (password.length < 6) {
      setError("密码至少 6 位")
      return
    }
    if (!verificationCode.trim()) {
      setError("请输入邮箱验证码")
      return
    }
    setLoading(true)
    try {
      const message = await register(email, password, verificationCode)
      toast({ description: message || "注册成功" })
      onOpenChange(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError("请先输入邮箱")
      return
    }
    setError("")
    setSendingCode(true)
    try {
      const message = await sendEmailCode(email, "register")
      toast({ description: message || "验证码已发送" })
      setCountdown(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证码发送失败")
    } finally {
      setSendingCode(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      onOpenChange(nextOpen)
      if (!nextOpen) resetForm()
    }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            注册
          </DialogTitle>
          <DialogDescription>创建账户以使用收藏、评论等功能</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium">
              邮箱
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium">
              密码
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="至少 6 位"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="register-confirm" className="text-sm font-medium">
              确认密码
            </label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="再次输入密码"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="register-code" className="text-sm font-medium">
              邮箱验证码
            </label>
            <div className="flex gap-2">
              <input
                id="register-code"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="输入邮箱验证码"
              />
              <button
                type="button"
                disabled={sendingCode || countdown > 0}
                onClick={handleSendCode}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border px-3 text-sm hover:bg-muted disabled:opacity-50"
              >
                {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : "发送验证码"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "注册"}
          </button>
          {onSwitchToLogin && (
            <p className="text-center text-sm text-muted-foreground">
              已有账户？{" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  onOpenChange(false)
                  onSwitchToLogin()
                }}
              >
                登录
              </button>
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

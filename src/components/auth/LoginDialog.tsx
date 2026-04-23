import { useEffect, useState } from "react"
import { Github, Loader2, LogIn, Mail, MessageCircle, MessageSquare } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/components/ui/use-toast"
import type { OAuthProvider } from "@/lib/api/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToRegister?: () => void
}

const socialProviders: Array<{
  provider: OAuthProvider
  label: string
  icon: typeof Github
}> = [
  { provider: "google", label: "Google", icon: Mail },
  { provider: "github", label: "GitHub", icon: Github },
  { provider: "wechat", label: "微信", icon: MessageSquare },
  { provider: "qq", label: "QQ", icon: MessageCircle },
]

export function LoginDialog({ open, onOpenChange, onSwitchToRegister }: LoginDialogProps) {
  const { login, loginWithEmailCode, sendEmailCode, loginWithProvider } = useAuth()
  const [mode, setMode] = useState<"password" | "emailCode">("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [providerLoading, setProviderLoading] = useState<OAuthProvider | null>(null)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setVerificationCode("")
    setError("")
    setLoading(false)
    setSendingCode(false)
    setCountdown(0)
    setProviderLoading(null)
    setMode("password")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const message = mode === "password"
        ? await login(email, password)
        : await loginWithEmailCode(email, verificationCode)
      toast({ description: message || "登录成功" })
      onOpenChange(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败")
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
      const message = await sendEmailCode(email, "login")
      toast({ description: message || "验证码已发送" })
      setCountdown(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证码发送失败")
    } finally {
      setSendingCode(false)
    }
  }

  const handleProviderLogin = async (provider: OAuthProvider) => {
    setError("")
    setProviderLoading(provider)
    try {
      const message = await loginWithProvider(provider)
      toast({ description: message || "登录成功" })
      onOpenChange(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "第三方登录失败")
    } finally {
      setProviderLoading(null)
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
            <LogIn className="h-5 w-5" />
            登录
          </DialogTitle>
          <DialogDescription>登录你的账户以使用收藏、评论等功能</DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1 text-sm">
            <button
              type="button"
              className={`rounded-md px-3 py-2 ${mode === "password" ? "bg-background shadow" : "text-muted-foreground"}`}
              onClick={() => setMode("password")}
            >
              密码登录
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-2 ${mode === "emailCode" ? "bg-background shadow" : "text-muted-foreground"}`}
              onClick={() => setMode("emailCode")}
            >
              验证码登录
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium">
                邮箱
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="your@email.com"
              />
            </div>

            {mode === "password" ? (
              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium">
                  密码
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="输入密码"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="login-code" className="text-sm font-medium">
                  验证码
                </label>
                <div className="flex gap-2">
                  <input
                    id="login-code"
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "登录"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>其他方式登录</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {socialProviders.map(({ provider, label, icon: Icon }) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleProviderLogin(provider)}
                disabled={providerLoading !== null}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm hover:bg-muted disabled:opacity-50"
              >
                {providerLoading === provider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                {label}
              </button>
            ))}
          </div>

          {onSwitchToRegister && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              没有账户？{" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  onOpenChange(false)
                  onSwitchToRegister()
                }}
              >
                注册
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

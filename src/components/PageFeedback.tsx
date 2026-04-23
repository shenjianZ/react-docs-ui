import { useEffect, useMemo, useState } from "react"
import type { FeedbackConfig } from "@/lib/config"
import { toast } from "@/components/ui/use-toast"

interface PageFeedbackProps {
  config?: FeedbackConfig
  lang: string
  slug?: string
  title?: string
  filePath?: string
}

interface FeedbackStatusPayload {
  data?: {
    submitted?: boolean
  } | null
  message?: string
}

function buildFeedbackHeaders(includeJsonContentType: boolean) {
  const headers = new Headers()
  const accessToken = typeof window === "undefined" ? null : window.localStorage.getItem("auth.access_token")

  if (includeJsonContentType) {
    headers.set("Content-Type", "application/json")
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  return headers
}

export function PageFeedback({ config, lang, slug, title, filePath }: PageFeedbackProps) {
  const [value, setValue] = useState<"helpful" | "unhelpful">()
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const endpoint = config?.endpoint?.trim()
  const enabled = Boolean(config && config.enabled !== false && endpoint)
  const statusEndpoint = useMemo(() => (
    endpoint ? `${endpoint.replace(/\/+$/, "")}/status` : ""
  ), [endpoint])
  const labels = useMemo(() => ({
    helpful: config?.labels?.helpful || "有帮助",
    unhelpful: config?.labels?.unhelpful || "没帮助",
    inputPlaceholder: config?.labels?.inputPlaceholder || "可以补充哪里不清楚或不准确",
    submit: config?.labels?.submit || "提交反馈",
    thanks: config?.labels?.thanks || "感谢反馈",
  }), [config?.labels])
  const question = lang === "en" ? "Was this page helpful?" : "这篇文档对你有帮助吗？"
  const errorMessage = lang === "en" ? "Failed to submit feedback. Please try again later." : "反馈提交失败，请稍后重试。"

  useEffect(() => {
    if (!enabled || !endpoint || !statusEndpoint) {
      setAvailable(false)
      setChecking(false)
      setSubmitted(false)
      return
    }

    let cancelled = false
    const params = new URLSearchParams({
      lang,
      slug: slug || "index",
    })

    setChecking(true)
    setAvailable(true)
    setSubmitted(false)
    setValue(undefined)
    setComment("")
    setError("")

    fetch(`${statusEndpoint}?${params.toString()}`, {
      headers: buildFeedbackHeaders(false),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null) as FeedbackStatusPayload | null
        if (!response.ok) {
          throw new Error(payload?.message || `Failed to fetch feedback status: ${response.status}`)
        }

        if (cancelled) return
        setSubmitted(payload?.data?.submitted === true)
        setAvailable(true)
      })
      .catch((err) => {
        console.warn("[PageFeedback] status check failed:", err)
        if (cancelled) return
        setAvailable(false)
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, endpoint, lang, slug, statusEndpoint])

  if (!enabled || !available || checking) {
    return null
  }

  if (submitted) {
    return <p className="text-sm text-muted-foreground">{labels.thanks}</p>
  }

  async function handleSubmit(nextValue: "helpful" | "unhelpful") {
    if (!endpoint || submitting) return

    setValue(nextValue)
    setError("")
    setSubmitting(true)

    try {
      const response = await fetch(endpoint, {
        method: config?.method || "POST",
        headers: buildFeedbackHeaders(true),
        body: JSON.stringify({
          value: nextValue,
          comment: comment || undefined,
          lang: config.includePageMeta === false ? undefined : lang,
          slug: config.includePageMeta === false ? undefined : slug || "index",
          title: config.includePageMeta === false ? undefined : title,
          filePath: config.includePageMeta === false ? undefined : filePath,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message || `Failed to submit feedback: ${response.status}`)
      }
      setSubmitted(true)
      toast({ description: payload?.message || labels.thanks })
    } catch (err) {
      console.error("[PageFeedback] submit failed:", err)
      const message = err instanceof Error ? err.message : errorMessage
      setError(message)
      toast({ description: message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="mb-3 text-sm font-medium">{question}</p>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} onClick={() => handleSubmit("helpful")} type="button">{labels.helpful}</button>
        <button className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} onClick={() => setValue("unhelpful")} type="button">{labels.unhelpful}</button>
      </div>
      {value === "unhelpful" && (
        <div className="mt-3 space-y-3">
          <textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" disabled={submitting} placeholder={labels.inputPlaceholder} value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} onClick={() => handleSubmit("unhelpful")} type="button">{labels.submit}</button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}

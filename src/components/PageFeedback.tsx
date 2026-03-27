import { useMemo, useState } from "react"
import type { FeedbackConfig } from "@/lib/config"

interface PageFeedbackProps {
  config?: FeedbackConfig
  lang: string
  slug?: string
  title?: string
  filePath?: string
}

export function PageFeedback({ config, lang, slug, title, filePath }: PageFeedbackProps) {
  const [value, setValue] = useState<"helpful" | "unhelpful">()
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(() => localStorage.getItem(`docs-feedback:${lang}:${slug || "index"}`) === "1")
  const [error, setError] = useState("")
  const enabled = Boolean(config && config.enabled !== false)
  const labels = useMemo(() => ({
    helpful: config?.labels?.helpful || "有帮助",
    unhelpful: config?.labels?.unhelpful || "没帮助",
    inputPlaceholder: config?.labels?.inputPlaceholder || "可以补充哪里不清楚或不准确",
    submit: config?.labels?.submit || "提交反馈",
    thanks: config?.labels?.thanks || "感谢反馈",
  }), [config?.labels])
  const question = lang === "en" ? "Was this page helpful?" : "这篇文档对你有帮助吗？"
  const errorMessage = lang === "en" ? "Failed to submit feedback. Please try again later." : "反馈提交失败，请稍后重试。"

  if (!enabled) {
    return null
  }

  if (submitted) {
    return <p className="text-sm text-muted-foreground">{labels.thanks}</p>
  }

  async function handleSubmit(nextValue: "helpful" | "unhelpful") {
    const storageKey = `docs-feedback:${lang}:${slug || "index"}`
    setValue(nextValue)
    setError("")
    if (!config?.endpoint) {
      localStorage.setItem(storageKey, "1")
      setSubmitted(true)
      return
    }

    try {
      const response = await fetch(config.endpoint, {
        method: config.method || "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok) throw new Error(`Failed to submit feedback: ${response.status}`)
      localStorage.setItem(storageKey, "1")
      setSubmitted(true)
    } catch (err) {
      console.error("[PageFeedback] submit failed:", err)
      setError(errorMessage)
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="mb-3 text-sm font-medium">{question}</p>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => handleSubmit("helpful")} type="button">{labels.helpful}</button>
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setValue("unhelpful")} type="button">{labels.unhelpful}</button>
      </div>
      {value === "unhelpful" && (
        <div className="mt-3 space-y-3">
          <textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder={labels.inputPlaceholder} value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => handleSubmit("unhelpful")} type="button">{labels.submit}</button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}

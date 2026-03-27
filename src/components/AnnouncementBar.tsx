import { X } from "lucide-react"
import { useMemo, useState } from "react"

interface AnnouncementBarProps {
  lang: string
  announcement?: {
    enabled?: boolean
    text?: string
    link?: string
    dismissible?: boolean
  }
}

export function AnnouncementBar({ lang, announcement }: AnnouncementBarProps) {
  const storageKey = useMemo(() => `react-docs-ui:announcement:${lang}:${announcement?.text || ""}`, [announcement?.text, lang])
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === "1")

  if (!announcement?.enabled || !announcement.text || dismissed) return null

  const content = announcement.link ? (
    <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="underline decoration-white/40 underline-offset-4 hover:decoration-white">
      {announcement.text}
    </a>
  ) : (
    <span>{announcement.text}</span>
  )

  return (
    <div className="border-b border-black/10 bg-amber-500 px-4 py-2 text-center text-sm text-black">
      <div className="container flex max-w-screen-2xl items-center justify-center gap-3 md:px-8">
        <div className="min-w-0 flex-1 text-center font-medium">{content}</div>
        {announcement.dismissible !== false && (
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10"
            onClick={() => {
              localStorage.setItem(storageKey, "1")
              setDismissed(true)
            }}
            aria-label={lang === "en" ? "Dismiss announcement" : "关闭公告"}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

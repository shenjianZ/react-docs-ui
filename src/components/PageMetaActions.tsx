import { Calendar, FilePenLine } from "lucide-react"
import type { FeedbackConfig, SiteConfig } from "@/lib/config"
import { PageFeedback } from "@/components/PageFeedback"

interface PageMetaActionsProps {
  lang: string
  slug?: string
  title?: string
  filePath?: string
  lastUpdated?: string
  editUrl?: string
  feedback?: FeedbackConfig
  backend?: SiteConfig["backend"]
  pageMeta?: SiteConfig["pageMeta"]
  editLinkLabel?: string
}

export function PageMetaActions(props: PageMetaActionsProps) {
  const editLabel = props.editLinkLabel || (props.lang === "en" ? "Edit this page" : "编辑此页")
  const updatedLabel = props.lang === "en" ? "Updated" : "最后更新"
  const formattedLastUpdated = props.lastUpdated
    ? new Date(props.lastUpdated).toString() !== "Invalid Date"
      ? new Date(props.lastUpdated).toLocaleDateString(props.lang === "en" ? "en-US" : "zh-CN")
      : props.lastUpdated
    : undefined
  const showLastUpdated = props.pageMeta?.showLastUpdated !== false && Boolean(formattedLastUpdated)
  const showEditLink = props.pageMeta?.showEditLink !== false && Boolean(props.editUrl)
  const hasSummary = showLastUpdated || showEditLink
  const showFeedback = Boolean(
    props.feedback &&
      props.feedback.enabled !== false &&
      props.feedback.endpoint &&
      props.backend?.enabled !== false &&
      props.backend?.features?.feedback !== false
  )

  if (!hasSummary && !showFeedback) return null

  return (
    <div className="space-y-4">
      {hasSummary && (
        <div className="flex flex-wrap items-center justify-end gap-4 text-sm text-muted-foreground">
          {showLastUpdated && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {updatedLabel} {formattedLastUpdated}
            </span>
          )}
          {showLastUpdated && showEditLink && (
            <span className="h-4 w-px bg-border/80" aria-hidden="true" />
          )}
          {showEditLink && (
            <a className="inline-flex items-center gap-1.5 hover:text-foreground" href={props.editUrl} target="_blank" rel="noopener noreferrer">
              <FilePenLine className="h-4 w-4" />
              {editLabel}
            </a>
          )}
        </div>
      )}
      {showFeedback && (
        <PageFeedback config={props.feedback} lang={props.lang} slug={props.slug} title={props.title} filePath={props.filePath} />
      )}
    </div>
  )
}

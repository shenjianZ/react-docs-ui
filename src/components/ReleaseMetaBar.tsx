import { Link } from "react-router-dom"
import { ArrowLeft, CalendarDays, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatChangelogDate, getChangelogBadgeVariant, getChangelogTypeLabel } from "@/lib/changelog"

interface ReleaseMetaBarProps {
  lang: string
  version?: string
  date?: string
  type?: string
  breaking?: boolean
}

export function ReleaseMetaBar({ lang, version, date, type = "release", breaking }: ReleaseMetaBarProps) {
  const backLabel = lang === "en" ? "Back to changelog" : "返回更新日志"
  const formattedDate = date ? formatChangelogDate(date, lang) : undefined

  return (
    <div className="mb-6 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`/${lang}/changelog`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getChangelogBadgeVariant(type)}>{getChangelogTypeLabel(type, lang)}</Badge>
          {breaking && <Badge variant="destructive">{lang === "en" ? "Breaking" : "破坏性变更"}</Badge>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {version && (
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-4 w-4" />
            {version}
          </span>
        )}
        {formattedDate && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formattedDate}
          </span>
        )}
      </div>
    </div>
  )
}

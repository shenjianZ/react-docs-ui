import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { DocsLayout } from "@/components/DocsLayout"
import { getConfig, type SiteConfig } from "@/lib/config"
import { formatChangelogDate, getChangelogBadgeVariant, getChangelogIndex, getChangelogTypeLabel, type ChangelogItem } from "@/lib/changelog"

export function ChangelogPage() {
  const params = useParams<{ lang: string }>()
  const lang = params.lang === "en" ? "en" : "zh-cn"
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [items, setItems] = useState<ChangelogItem[]>([])

  useEffect(() => {
    getConfig(lang).then(setConfig).catch(() => setConfig(null))
    getChangelogIndex(lang).then((data) => setItems(data.items)).catch(() => setItems([]))
  }, [lang])

  if (!config) {
    return <div>Loading...</div>
  }

  return (
    <DocsLayout
      lang={lang}
      config={config}
      frontmatter={{ title: config.changelog?.title || (lang === "en" ? "Changelog" : "更新日志") }}
      slug="changelog"
      content=""
      availableLangs={["zh-cn", "en"]}
    >
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
            {lang === "en" ? "No releases yet." : "暂时还没有发布记录。"}
          </div>
        )}
        {items.map((item) => (
          <article key={item.slug} className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getChangelogBadgeVariant(item.type)}>{getChangelogTypeLabel(item.type, lang)}</Badge>
              {item.breaking && <Badge variant="destructive">{lang === "en" ? "Breaking" : "需注意"}</Badge>}
            </div>
            <h2 className="mt-3 text-xl font-semibold"><Link to={item.path} className="hover:text-primary">{item.title}</Link></h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.version} · {formatChangelogDate(item.date, lang)}
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground/80">{item.summary}</p>
            <div className="mt-4">
              <Link to={item.path} className="text-sm font-medium text-primary hover:underline">
                {lang === "en" ? "Read release notes" : "查看发布详情"}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </DocsLayout>
  )
}

import { useEffect, useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { DocsLayout } from "@/components/DocsLayout"
import { getConfig, type SiteConfig } from "@/lib/config"
import { formatChangelogDate, getChangelogBadgeVariant, getChangelogIndex, getChangelogTypeLabel, type ChangelogItem } from "@/lib/changelog"

export function ChangelogPage() {
  const params = useParams<{ lang: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const lang = params.lang === "en" ? "en" : "zh-cn"
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [items, setItems] = useState<ChangelogItem[]>([])
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    setLoadError(false)
    getConfig(lang).then(setConfig).catch(() => {
      setConfig(null)
      setLoadError(true)
    })
    getChangelogIndex(lang).then((data) => setItems(data.items)).catch(() => {
      setItems([])
      setLoadError(true)
    })
  }, [lang])

  const pageSize = config?.changelog?.pageSize && config.changelog.pageSize > 0
    ? config.changelog.pageSize
    : undefined
  const requestedPage = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1)
  const totalPages = pageSize ? Math.max(1, Math.ceil(items.length / pageSize)) : 1
  const currentPage = pageSize ? Math.min(requestedPage, totalPages) : 1
  const visibleItems = useMemo(() => {
    if (!pageSize) return items
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [currentPage, items, pageSize])

  useEffect(() => {
    if (!pageSize) return
    const currentParam = searchParams.get("page")
    const normalizedParam = currentPage > 1 ? String(currentPage) : null
    if (currentParam === normalizedParam || (!currentParam && !normalizedParam)) return
    const nextParams = new URLSearchParams(searchParams)
    if (normalizedParam) nextParams.set("page", normalizedParam)
    else nextParams.delete("page")
    setSearchParams(nextParams, { replace: true })
  }, [currentPage, pageSize, searchParams, setSearchParams])

  if (!config) {
    if (loadError) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-lg font-medium text-muted-foreground">
              {lang === "en" ? "Failed to load page data" : "页面数据加载失败"}
            </p>
            <p className="text-sm text-muted-foreground">
              {lang === "en" ? "Please check your network and refresh." : "请检查网络连接后刷新页面。"}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              {lang === "en" ? "Refresh" : "刷新页面"}
            </button>
          </div>
        </div>
      )
    }
    return <div>Loading...</div>
  }

  const labels = lang === "en"
    ? { prev: "Previous", next: "Next", page: `Page ${currentPage} of ${totalPages}` }
    : { prev: "上一页", next: "下一页", page: `第 ${currentPage} 页，共 ${totalPages} 页` }

  const goToPage = (page: number) => {
    const nextParams = new URLSearchParams(searchParams)
    if (page <= 1) nextParams.delete("page")
    else nextParams.set("page", String(page))
    setSearchParams(nextParams)
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
        {visibleItems.length > 0 && (
          <div className="relative md:translate-x-[-15px] md:pl-8">
            <span className="absolute bottom-5 left-4 top-5 hidden w-0.5 -translate-x-1/2 bg-primary md:block" />
            <div className="space-y-4">
              {visibleItems.map((item) => (
                <article key={item.slug} className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm transition hover:border-border hover:shadow-md">
                  <div className="flex gap-3 md:gap-4">
                    <div className="relative hidden w-8 shrink-0 md:block">
                      <span className="absolute left-4 top-[14px] h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(34,197,94,0.14)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={getChangelogBadgeVariant(item.type)}>{getChangelogTypeLabel(item.type, lang)}</Badge>
                            {item.breaking && <Badge variant="destructive">{lang === "en" ? "Breaking" : "需注意"}</Badge>}
                          </div>
                          <h2 className="mt-2 text-lg font-semibold leading-snug">
                            <Link to={item.path} className="hover:text-primary">{item.title}</Link>
                          </h2>
                          <p
                            className="mt-1 text-sm leading-6 text-foreground/75"
                            style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}
                          >
                            {item.summary}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-row items-center justify-between gap-3 md:w-56 md:flex-col md:items-end md:text-right">
                          <p className="text-sm text-muted-foreground">
                            {item.version} · {formatChangelogDate(item.date, lang)}
                          </p>
                          <Link
                            to={item.path}
                            className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-muted"
                          >
                            {lang === "en" ? "Read release notes" : "查看发布详情"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        {pageSize && totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              {labels.prev}
            </button>
            <p className="text-sm text-muted-foreground">{labels.page}</p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              {labels.next}
            </button>
          </div>
        )}
      </div>
    </DocsLayout>
  )
}

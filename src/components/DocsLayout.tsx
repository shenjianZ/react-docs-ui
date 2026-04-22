import * as React from "react"
import { useState, useEffect } from "react"
import { Calendar, User, Clock } from "lucide-react"

import { HeaderNav } from "@/components/HeaderNav"
import { MobileSidebar } from "@/components/MobileSidebar"
import { FloatingActionBall } from "@/components/FloatingActionBall"
import { ReadingProgressBar } from "@/components/ReadingProgressBar"
import { PageMetaActions } from "@/components/PageMetaActions"
import { ReleaseMetaBar } from "@/components/ReleaseMetaBar"
import { SidebarNav } from "@/components/SidebarNav"
import { TableOfContents } from "@/components/TableOfContents"
import { PageNavigation } from "@/components/PageNavigation"
import { Breadcrumb } from "@/components/Breadcrumb"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Footer } from "./Footer"
import { ExportToolbar } from "@/components/ExportToolbar"
import { useScrollPosition } from "@/hooks/useScrollPosition"
import { useSearchLauncher } from "@/components/SearchLauncher"
import type { TocItem } from "@/lib/rehype-toc"
import type { SiteConfig } from "@/lib/config"
import { estimateReadingTime } from "@/lib/reading-time"

interface Frontmatter {
  title?: string
  description?: string
  author?: string
  authors?: string[]
  createdAt?: string | Date
  date?: string | Date
  version?: string
  type?: string
  breaking?: boolean
  canonical?: string
  noindex?: boolean
  toc?: TocItem[]
  firstH1?: string
  [key: string]: unknown
}

function joinSiteUrl(baseUrl: string, pathname: string) {
  return `${baseUrl.replace(/\/+$/, "")}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}

function upsertHeadTag(selector: string, create: () => HTMLElement, apply: (node: HTMLElement) => void) {
  let node = document.head.querySelector(selector) as HTMLElement | null
  if (!node) {
    node = create()
    document.head.appendChild(node)
  }
  apply(node)
}

interface DocsLayoutProps {
  lang: string
  config: SiteConfig
  frontmatter: Frontmatter | null
  slug?: string
  version?: string
  lastUpdated?: string
  editUrl?: string
  docFilePath?: string
  children: React.ReactNode
  prev?: { title: string; path: string } | null
  next?: { title: string; path: string } | null
  content?: string
  availableLangs?: string[]
}

export function DocsLayout({
  lang,
  config,
  frontmatter,
  slug,
  version,
  lastUpdated,
  editUrl,
  docFilePath,
  children,
  prev,
  next,
  content = "",
  availableLangs,
}: DocsLayoutProps) {
  const { site, navbar, sidebar, theme } = config
  const sidebarEnabled = React.useMemo(() => {
    if (!sidebar || sidebar.enabled === false) return false
    const hasSections = Boolean(sidebar.sections?.length)
    const hasCollections = Boolean(
      sidebar.collections &&
        Object.values(sidebar.collections).some(collection => collection.sections?.length)
    )
    return hasSections || hasCollections
  }, [sidebar])
  const topAuthors = frontmatter?.authors?.length ? frontmatter.authors : frontmatter?.author ? [frontmatter.author] : []
  const showTopAuthors = config.pageMeta?.showAuthors !== false && topAuthors.length > 0
  const isChangelogDetail = Boolean(slug?.startsWith("changelog/"))
  const createdAtValue = frontmatter?.createdAt
  const formattedCreatedAt = createdAtValue
    ? new Date(createdAtValue).toString() !== "Invalid Date"
      ? new Date(createdAtValue).toLocaleDateString(lang === "en" ? "en-US" : "zh-CN")
      : String(createdAtValue)
    : undefined
  
  const rawTitle = frontmatter?.title || frontmatter?.firstH1 || config.seo?.defaultTitle || site?.title || "Docs"
  const pageTitle = config.seo?.titleTemplate && rawTitle
    ? config.seo.titleTemplate.replace(/\{title\}/g, rawTitle).replace(/\{siteTitle\}/g, site?.title || "Docs")
    : rawTitle
  const pageDescription = frontmatter?.description || config.seo?.defaultDescription || site?.description
  const readingTime = React.useMemo(
    () => config.reading?.showTime !== false ? estimateReadingTime(content, lang) : null,
    [content, lang, config.reading?.showTime]
  )
  const siteUrl = site?.url?.replace(/\/+$/, "")
  const pagePath = version ? `/${lang}/v/${version}${slug ? `/${slug}` : ""}` : `/${lang}${slug ? `/${slug}` : ""}`
  
  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  useEffect(() => {
    if (config.seo?.enabled === false) return

    const robotsContent = frontmatter?.noindex ? "noindex, nofollow" : config.seo?.robots || "index, follow"
    const canonicalUrl = frontmatter?.noindex
      ? undefined
      : typeof frontmatter?.canonical === "string"
        ? frontmatter.canonical
        : siteUrl
          ? joinSiteUrl(siteUrl, pagePath)
          : undefined
    const alternateLangs = frontmatter?.noindex || !siteUrl ? [] : [
      { hreflang: "zh-CN", href: joinSiteUrl(siteUrl, version ? `/zh-cn/v/${version}${slug ? `/${slug}` : ""}` : `/zh-cn${slug ? `/${slug}` : ""}`) },
      { hreflang: "en", href: joinSiteUrl(siteUrl, version ? `/en/v/${version}${slug ? `/${slug}` : ""}` : `/en${slug ? `/${slug}` : ""}`) },
      { hreflang: "x-default", href: joinSiteUrl(siteUrl, version ? `/zh-cn/v/${version}${slug ? `/${slug}` : ""}` : `/zh-cn${slug ? `/${slug}` : ""}`) },
    ]

    upsertHeadTag('meta[name="description"]', () => document.createElement("meta"), node => {
      node.setAttribute("name", "description")
      node.setAttribute("content", pageDescription || "")
    })
    upsertHeadTag('meta[name="robots"]', () => document.createElement("meta"), node => {
      node.setAttribute("name", "robots")
      node.setAttribute("content", robotsContent)
    })

    const ogEntries = [
      { key: "og:title", value: pageTitle },
      { key: "og:description", value: pageDescription || "" },
      { key: "og:type", value: "article" },
      { key: "og:url", value: canonicalUrl },
      { key: "og:image", value: config.seo?.defaultOgImage },
    ]
    ogEntries.filter((entry) => entry.value).forEach(({ key, value }) => upsertHeadTag(`meta[property="${key}"]`, () => document.createElement("meta"), node => {
      node.setAttribute("property", key)
      node.setAttribute("content", value || "")
    }))

    const twitterEntries = [
      { key: "twitter:card", value: config.seo?.twitterCard || "summary_large_image" },
      { key: "twitter:title", value: pageTitle },
      { key: "twitter:description", value: pageDescription || "" },
      { key: "twitter:image", value: config.seo?.defaultOgImage },
    ]
    twitterEntries.filter((entry) => entry.value).forEach(({ key, value }) => upsertHeadTag(`meta[name="${key}"]`, () => document.createElement("meta"), node => {
      node.setAttribute("name", key)
      node.setAttribute("content", value || "")
    }))

    const canonicalNode = document.head.querySelector('link[rel="canonical"][data-rdu-seo="canonical"]')
    if (canonicalUrl) {
      upsertHeadTag('link[rel="canonical"][data-rdu-seo="canonical"]', () => document.createElement("link"), node => {
        node.setAttribute("rel", "canonical")
        node.setAttribute("href", canonicalUrl)
        node.setAttribute("data-rdu-seo", "canonical")
      })
    } else if (canonicalNode) {
      canonicalNode.remove()
    }

    document.head.querySelectorAll('link[rel="alternate"][data-rdu-seo="alternate"]').forEach(node => node.remove())
    alternateLangs.forEach(({ hreflang, href }) => upsertHeadTag(`link[rel="alternate"][hreflang="${hreflang}"][data-rdu-seo="alternate"]`, () => document.createElement("link"), node => {
      node.setAttribute("rel", "alternate")
      node.setAttribute("hreflang", hreflang)
      node.setAttribute("href", href)
      node.setAttribute("data-rdu-seo", "alternate")
    }))

    // RSS Feed 自动发现
    const feedNode = document.head.querySelector('link[rel="alternate"][type="application/rss+xml"][data-rdu-seo="feed"]')
    if (siteUrl && config.feed?.enabled !== false) {
      upsertHeadTag('link[rel="alternate"][type="application/rss+xml"][data-rdu-seo="feed"]', () => document.createElement("link"), node => {
        node.setAttribute("rel", "alternate")
        node.setAttribute("type", "application/rss+xml")
        node.setAttribute("title", config.feed?.title || site?.title || "RSS Feed")
        node.setAttribute("href", joinSiteUrl(siteUrl, "/feed.xml"))
        node.setAttribute("data-rdu-seo", "feed")
      })
    } else if (feedNode) {
      feedNode.remove()
    }
  }, [config.feed?.enabled, config.feed?.title, config.seo, frontmatter?.canonical, frontmatter?.noindex, lang, pageDescription, pagePath, pageTitle, site?.title, siteUrl, slug, version])
  
  const toc = config.toc?.enabled !== false
    ? (frontmatter?.toc || [])
    : []
  
  const { openSearch } = useSearchLauncher()

  // 移动端侧边栏状态
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // 滚动位置记忆
  useScrollPosition()

  return (
    <div className="relative flex min-h-screen flex-col">
      <HeaderNav lang={lang} version={version} site={site} navbar={navbar} announcement={config.announcement} themeConfig={theme} searchConfig={config.search} versions={config.versions} />
      {config.reading?.showProgress === true && <ReadingProgressBar />}
      {/* 移动端侧边栏 */}
      {sidebarEnabled && sidebar && (
        <MobileSidebar
          lang={lang}
          version={version}
          sidebar={sidebar}
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
        />
      )}
      {/* 统一悬浮球 */}
      <FloatingActionBall
        lang={lang}
        navItems={navbar.items || []}
        toc={toc}
        showSidebar={sidebarEnabled}
        showSearch={config.search?.enabled !== false}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        onOpenSearch={openSearch}
      />
      <div 
  className={`flex-1 items-start px-4 md:px-8 ${sidebarEnabled ? 'md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10' : ''} ${toc && toc.length > 0 ? 'container lg:max-w-[calc(100vw-280px)]' : 'container'}`}
>
        {sidebarEnabled && sidebar && (
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <SidebarNav lang={lang} version={version} sidebar={sidebar} />
            </ScrollArea>
          </aside>
        )}
        {/* 内容区域 */}
        <div className={`relative flex min-w-0 overflow-hidden ${sidebarEnabled ? 'md:col-start-2' : ''}`}>
          <main className="relative py-6 lg:py-8 flex-auto w-full">
            {config.breadcrumb?.enabled !== false && (
              <Breadcrumb
                lang={lang}
                version={version}
                sidebar={sidebar}
                frontmatterTitle={frontmatter?.title}
                labels={{ showHome: config.breadcrumb?.showHome }}
              />
            )}
            {/* Frontmatter 元信息展示 */}
            {frontmatter && (frontmatter.title || frontmatter.description || showTopAuthors || formattedCreatedAt || lastUpdated || editUrl) && (
              <header className="mb-8 pb-6 border-b border-border">
                {frontmatter.title ? (
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-3xl font-bold tracking-tight">{frontmatter.title}</h1>
                    <ExportToolbar
                      content={content}
                      title={frontmatter.title}
                      lang={lang}
                      availableLangs={availableLangs}
                      exportConfig={config.export}
                      pdfServerConfig={config.export?.pdfServer}
                    />
                  </div>
                ) : (
                  <div className="flex justify-end mb-3">
                    <ExportToolbar
                      content={content}
                      title={frontmatter.firstH1}
                      lang={lang}
                      availableLangs={availableLangs}
                      exportConfig={config.export}
                      pdfServerConfig={config.export?.pdfServer}
                    />
                  </div>
                )}
                {frontmatter.description && (
                  <p className="text-lg text-muted-foreground mb-4">{frontmatter.description}</p>
                )}
                {(showTopAuthors || formattedCreatedAt || readingTime) && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {showTopAuthors && (
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        {topAuthors.join("、")}
                      </span>
                    )}
                    {formattedCreatedAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {lang === "en" ? "Created" : "创建时间"} {formattedCreatedAt}
                      </span>
                    )}
                    {readingTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {readingTime.text}
                      </span>
                    )}
                  </div>
                )}
              </header>
            )}
            {(!frontmatter || (!frontmatter.title && !frontmatter.description && !showTopAuthors && !formattedCreatedAt && !lastUpdated && !editUrl)) && (
              <div className="mb-4">
                <div className="flex justify-end">
                  <ExportToolbar
                    content={content}
                    title={frontmatter?.firstH1}
                    lang={lang}
                    availableLangs={availableLangs}
                    exportConfig={config.export}
                    pdfServerConfig={config.export?.pdfServer}
                  />
                </div>
              </div>
            )}
            {isChangelogDetail && (
              <ReleaseMetaBar
                lang={lang}
                version={typeof frontmatter?.version === "string" ? frontmatter.version : undefined}
                date={typeof frontmatter?.date === "string" ? frontmatter.date : undefined}
                type={typeof frontmatter?.type === "string" ? frontmatter.type : undefined}
                breaking={frontmatter?.breaking === true}
              />
            )}
            {children}
            <div className="mt-8 border-t border-border pt-6">
              <PageMetaActions
                lang={lang}
                slug={slug}
                title={frontmatter?.title || frontmatter?.firstH1}
                filePath={docFilePath}
                lastUpdated={lastUpdated}
                editUrl={editUrl}
                feedback={frontmatter?.title === "Not Found" ? { ...config.feedback, enabled: false } : config.feedback}
                pageMeta={config.pageMeta}
                editLinkLabel={config.editLink?.label}
              />
            </div>
            <PageNavigation prev={prev} next={next} lang={lang} version={version} />
          </main>
        </div>
        <div className={sidebarEnabled ? "md:col-start-2" : undefined}>
          {config.footer?.enabled !== false && (
            <Footer footer={config.footer} lang={lang} />
          )}
        </div>
      </div>
      {/* 目录导航 - 紧贴页面右侧边缘 */}
      {toc && toc.length > 0 && (
        <aside className="fixed top-14 right-0 z-30 hidden lg:block h-[calc(100vh-3.5rem)] w-[280px] shrink-0 border-l border-border bg-background/50 backdrop-blur-sm">
          <ScrollArea className="h-full py-6 pr-4 lg:py-8 pl-6">
            <TableOfContents toc={toc} />
          </ScrollArea>
        </aside>
      )}
    </div>
  )
}

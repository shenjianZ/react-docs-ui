import * as React from "react"
import { useState, useEffect } from "react"
import {
  Calendar,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Footer } from "./Footer"
import { ExportToolbar } from "@/components/ExportToolbar"
import { useAnalytics } from "@/hooks/useAnalytics"
import { CommentSection } from "@/components/comments/CommentSection"
import { BookmarkButton } from "@/components/BookmarkButton"
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
  const isChangelogPage = slug === "changelog" || Boolean(slug?.startsWith("changelog/"))
  const isChangelogDetail = Boolean(slug?.startsWith("changelog/"))
  const createdAtValue = frontmatter?.createdAt
  const formattedCreatedAt = createdAtValue
    ? new Date(createdAtValue).toString() !== "Invalid Date"
      ? new Date(createdAtValue).toLocaleDateString(lang === "en" ? "en-US" : "zh-CN")
      : String(createdAtValue)
    : undefined
  
  const documentTitle = frontmatter?.title || frontmatter?.firstH1
  const rawTitle = documentTitle || config.seo?.defaultTitle || site?.title || "Docs"
  const pageTitle = config.seo?.titleTemplate && rawTitle
    ? config.seo.titleTemplate.replace(/\{title\}/g, rawTitle).replace(/\{siteTitle\}/g, site?.title || "Docs")
    : rawTitle
  const pageDescription = frontmatter?.description || config.seo?.defaultDescription || site?.description
  const readingTime = React.useMemo(
    () => config.reading?.showTime !== false && !isChangelogPage ? estimateReadingTime(content, lang) : null,
    [content, lang, config.reading?.showTime, isChangelogPage]
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
  const hasToc = toc.length > 0
  const sidebarControlEnabled = config.sidebar?.collapseControl?.enabled === true
  const tocControlEnabled = config.toc?.collapseControl?.enabled === true
  const fullscreenControlEnabled = config.reading?.fullscreen?.enabled === true
  
  const { openSearch } = useSearchLauncher()

  useAnalytics({
    enabled: config.backend?.enabled !== false && config.backend?.features?.analytics !== false,
    pageSlug: slug || "index",
    pageTitle: frontmatter?.title || frontmatter?.firstH1,
    lang,
  })

  // 移动端侧边栏状态
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    sidebarControlEnabled && config.sidebar?.collapseControl?.defaultCollapsed === true
  )
  const [tocCollapsed, setTocCollapsed] = useState(
    tocControlEnabled && config.toc?.collapseControl?.defaultCollapsed === true
  )
  const [articleFullscreen, setArticleFullscreen] = useState(false)

  useEffect(() => {
    setSidebarCollapsed(
      sidebarControlEnabled && config.sidebar?.collapseControl?.defaultCollapsed === true
    )
  }, [config.sidebar?.collapseControl?.defaultCollapsed, sidebarControlEnabled])

  useEffect(() => {
    setTocCollapsed(
      tocControlEnabled && config.toc?.collapseControl?.defaultCollapsed === true
    )
  }, [config.toc?.collapseControl?.defaultCollapsed, tocControlEnabled])

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setArticleFullscreen(false)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // 滚动位置记忆
  useScrollPosition()

  const [headerOffset, setHeaderOffset] = useState(56)

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('header[data-print-hidden]')
    if (!header) return

    const updateHeaderOffset = () => {
      setHeaderOffset(Math.ceil(header.getBoundingClientRect().height))
    }

    updateHeaderOffset()
    const observer = new ResizeObserver(updateHeaderOffset)
    observer.observe(header)
    window.addEventListener("resize", updateHeaderOffset)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateHeaderOffset)
    }
  }, [config.announcement?.enabled, config.announcement?.text])

  const sidePanelStyle: React.CSSProperties = {
    top: headerOffset,
    height: `calc(100vh - ${headerOffset}px)`,
  }
  const showSidebarPanel = sidebarEnabled && !sidebarCollapsed && !articleFullscreen
  const showTocPanel = hasToc && !tocCollapsed && !articleFullscreen
  const showSidebarControl = sidebarEnabled && sidebarControlEnabled && !articleFullscreen
  const showTocControl = hasToc && tocControlEnabled && !articleFullscreen
  const showFullscreenControl = fullscreenControlEnabled
  const toggleArticleFullscreen = async () => {
    if (articleFullscreen) {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => undefined)
      }
      setArticleFullscreen(false)
      return
    }

    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen().catch(() => undefined)
    }
    setArticleFullscreen(true)
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {!articleFullscreen && (
        <HeaderNav lang={lang} version={version} site={site} navbar={navbar} announcement={config.announcement} themeConfig={theme} searchConfig={config.search} versions={config.versions} backendEnabled={config.backend?.enabled !== false} />
      )}
      {!articleFullscreen && config.reading?.showProgress === true && <ReadingProgressBar />}
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
      {!articleFullscreen && (
        <FloatingActionBall
          lang={lang}
          navItems={navbar.items || []}
          toc={toc}
          showSidebar={sidebarEnabled}
          showSearch={config.search?.enabled !== false}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          onOpenSearch={openSearch}
        />
      )}
      <div 
  className={`flex-1 items-start px-4 md:px-8 ${showSidebarPanel ? 'md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10' : ''} ${showTocPanel ? 'container lg:max-w-[calc(100vw-280px)]' : 'container'} ${articleFullscreen ? 'w-full max-w-none' : ''}`}
>
        {showSidebarPanel && sidebar && (
          <aside className="z-30 -ml-2 hidden w-full shrink-0 md:sticky md:block" style={sidePanelStyle}>
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <SidebarNav lang={lang} version={version} sidebar={sidebar} />
            </ScrollArea>
            {showSidebarControl && (
              <button
                type="button"
                aria-label="收起左侧导航"
                className="absolute right-0 top-0 z-40 hidden h-full w-6 translate-x-full items-center justify-center bg-background/0 text-muted-foreground opacity-0 transition hover:bg-muted/80 hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
                onClick={() => setSidebarCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </aside>
        )}
        {showSidebarControl && sidebarCollapsed && (
          <button
            type="button"
            aria-label="展开左侧导航"
            className="fixed left-0 z-40 hidden w-6 items-center justify-center bg-background/0 text-muted-foreground opacity-0 transition hover:bg-muted/80 hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
            style={sidePanelStyle}
            onClick={() => setSidebarCollapsed(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {/* 内容区域 */}
        <div className={`relative flex min-w-0 overflow-hidden ${showSidebarPanel ? 'md:col-start-2' : ''}`}>
          <main className="relative py-6 lg:py-8 flex-auto w-full">
            {showFullscreenControl && (
              <TooltipProvider>
                <div className="mb-4 flex justify-end gap-2" data-print-hidden>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={articleFullscreen ? "退出文章全屏" : "文章全屏展示"}
                        onClick={toggleArticleFullscreen}
                      >
                        {articleFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{articleFullscreen ? "退出文章全屏" : "文章全屏展示"}</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}
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
            {frontmatter && (documentTitle || frontmatter.description || showTopAuthors || formattedCreatedAt || lastUpdated || editUrl) && (
              <header className="mb-8 pb-6 border-b border-border">
                {documentTitle ? (
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-3xl font-bold tracking-tight">{documentTitle}</h1>
                    <ExportToolbar
                      content={content}
                      title={documentTitle}
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
            {(!frontmatter || (!documentTitle && !frontmatter.description && !showTopAuthors && !formattedCreatedAt && !lastUpdated && !editUrl)) && (
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
                date={frontmatter?.date}
                type={typeof frontmatter?.type === "string" ? frontmatter.type : undefined}
                breaking={frontmatter?.breaking === true}
              />
            )}
            {children}
            <div className="mt-8 border-t border-border pt-6">
              {config.backend?.enabled !== false && config.backend?.features?.bookmarks !== false && slug && (
                <div className="mb-3">
                  <BookmarkButton
                    pageSlug={slug}
                    pageTitle={frontmatter?.title || frontmatter?.firstH1}
                    lang={lang}
                  />
                </div>
              )}
              <PageMetaActions
                lang={lang}
                slug={slug}
                title={frontmatter?.title || frontmatter?.firstH1}
                filePath={docFilePath}
                lastUpdated={lastUpdated}
                editUrl={editUrl}
                feedback={frontmatter?.title === "Not Found" ? { ...config.feedback, enabled: false } : config.feedback}
                backend={config.backend}
                pageMeta={config.pageMeta}
                editLinkLabel={config.editLink?.label}
              />
            </div>
            <PageNavigation prev={prev} next={next} lang={lang} version={version} />
            {config.backend?.enabled !== false && config.backend?.features?.comments !== false && slug && (
              <CommentSection pageSlug={slug} lang={lang} />
            )}
          </main>
        </div>
        <div className={showSidebarPanel ? "md:col-start-2" : undefined}>
          {config.footer?.enabled !== false && (
            <Footer footer={config.footer} lang={lang} />
          )}
        </div>
      </div>
      {/* 目录导航 - 紧贴页面右侧边缘 */}
      {showTocPanel && (
        <aside className="fixed right-0 z-30 hidden lg:block w-[280px] shrink-0 border-l border-border bg-background/50 backdrop-blur-sm" style={sidePanelStyle}>
          <ScrollArea className="h-full py-6 pr-4 lg:py-8 pl-6">
            <TableOfContents toc={toc} />
          </ScrollArea>
          {showTocControl && (
            <button
              type="button"
              aria-label="收起本页目录"
              className="absolute left-0 top-0 z-40 hidden h-full w-6 -translate-x-full items-center justify-center bg-background/0 text-muted-foreground opacity-0 transition hover:bg-muted/80 hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
              onClick={() => setTocCollapsed(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </aside>
      )}
      {showTocControl && tocCollapsed && (
        <button
          type="button"
          aria-label="展开本页目录"
          className="fixed right-0 z-40 hidden w-6 items-center justify-center bg-background/0 text-muted-foreground opacity-0 transition hover:bg-muted/80 hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
          style={sidePanelStyle}
          onClick={() => setTocCollapsed(false)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

import * as React from "react"
import { useState, useEffect } from "react"
import { Calendar, User } from "lucide-react"

import { HeaderNav } from "@/components/HeaderNav"
import { MobileSidebar } from "@/components/MobileSidebar"
import { FloatingActionBall } from "@/components/FloatingActionBall"
import { PageMetaActions } from "@/components/PageMetaActions"
import { SidebarNav } from "@/components/SidebarNav"
import { TableOfContents } from "@/components/TableOfContents"
import { PageNavigation } from "@/components/PageNavigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Footer } from "./Footer"
import { ExportToolbar } from "@/components/ExportToolbar"
import { useScrollPosition } from "@/hooks/useScrollPosition"
import { useSearchLauncher } from "@/components/SearchLauncher"
import type { TocItem } from "@/lib/rehype-toc"
import type { SiteConfig } from "@/lib/config"

interface Frontmatter {
  title?: string
  description?: string
  author?: string
  authors?: string[]
  createdAt?: string
  toc?: TocItem[]
  firstH1?: string
  [key: string]: unknown
}

interface DocsLayoutProps {
  lang: string
  config: SiteConfig
  frontmatter: Frontmatter | null
  slug?: string
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
  const topAuthors = frontmatter?.authors?.length ? frontmatter.authors : frontmatter?.author ? [frontmatter.author] : []
  const formattedCreatedAt = frontmatter?.createdAt
    ? new Date(frontmatter.createdAt).toString() !== "Invalid Date"
      ? new Date(frontmatter.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "zh-CN")
      : frontmatter.createdAt
    : undefined
  
  const pageTitle = frontmatter?.title || frontmatter?.firstH1 || site?.title || "Docs"
  
  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])
  
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
      <HeaderNav lang={lang} site={site} navbar={navbar} themeConfig={theme} searchConfig={config.search} />
      {/* 移动端侧边栏 */}
      {sidebar && (
        <MobileSidebar
          lang={lang}
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
        showSidebar={!!sidebar}
        showSearch={config.search?.enabled !== false}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        onOpenSearch={openSearch}
      />
      <div 
  className={`flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 px-4 md:px-8 ${toc && toc.length > 0 ? 'container lg:max-w-[calc(100vw-280px)]' : 'container'}`}
>
        {sidebar && (
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <SidebarNav lang={lang} sidebar={sidebar} />
            </ScrollArea>
          </aside>
        )}
        {/* 内容区域 */}
        <div className="relative flex md:col-start-2 min-w-0 overflow-hidden">
          <main className="relative py-6 lg:py-8 flex-auto w-full">
            {/* Frontmatter 元信息展示 */}
            {frontmatter && (frontmatter.title || frontmatter.description || topAuthors.length || formattedCreatedAt || lastUpdated || editUrl) && (
              <header className="mb-8 pb-6 border-b border-border">
                {frontmatter.title ? (
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-3xl font-bold tracking-tight">{frontmatter.title}</h1>
                    <ExportToolbar
                      content={content}
                      title={frontmatter.title}
                      lang={lang}
                      availableLangs={availableLangs}
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
                      pdfServerConfig={config.export?.pdfServer}
                    />
                  </div>
                )}
                {frontmatter.description && (
                  <p className="text-lg text-muted-foreground mb-4">{frontmatter.description}</p>
                )}
                {(topAuthors.length > 0 || formattedCreatedAt) && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {topAuthors.length > 0 && (
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
                  </div>
                )}
              </header>
            )}
            {(!frontmatter || (!frontmatter.title && !frontmatter.description && !topAuthors.length && !formattedCreatedAt && !lastUpdated && !editUrl)) && (
              <div className="mb-4">
                <div className="flex justify-end">
                  <ExportToolbar
                    content={content}
                    title={frontmatter?.firstH1}
                    lang={lang}
                    availableLangs={availableLangs}
                    pdfServerConfig={config.export?.pdfServer}
                  />
                </div>
              </div>
            )}
            {children}
            <div className="mt-10 border-t border-border pt-6">
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
          </main>
        </div>
        <div className="md:col-start-2">
          <PageNavigation prev={prev} next={next} lang={lang} />
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

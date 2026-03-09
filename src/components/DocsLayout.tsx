import * as React from "react"
import { useState, useEffect } from "react"
import { Calendar, User } from "lucide-react"

import { HeaderNav } from "@/components/HeaderNav"
import { MobileSidebar } from "@/components/MobileSidebar"
import { FloatingActionBall } from "@/components/FloatingActionBall"
import { SidebarNav } from "@/components/SidebarNav"
import { TableOfContents } from "@/components/TableOfContents"
import { PageNavigation } from "@/components/PageNavigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Footer } from "./Footer"
import { useScrollPosition } from "@/hooks/useScrollPosition"
import { useSearch } from "@/components/search"

interface Frontmatter {
  title?: string
  description?: string
  author?: string
  date?: string | Date
  toc?: Array<{ id: string; text: string; level: number }>
  firstH1?: string
  [key: string]: unknown
}

// Define SiteConfig types locally
interface SiteConfig {
  site: any
  navbar: any
  theme?: { allowToggle?: boolean }
  sidebar: {
    enabled?: boolean
    sections?: any
    collections?: Record<string, { sections: any }>
  }
  footer?: any
  toc?: {
    enabled?: boolean
    maxLevel?: number
    title?: string
  }
  search?: {
    enabled?: boolean
    placeholder?: string
  }
}

interface DocsLayoutProps {
  lang: string
  config: SiteConfig
  frontmatter: Frontmatter | null
  children: React.ReactNode
  prev?: { title: string; path: string } | null
  next?: { title: string; path: string } | null
}

export function DocsLayout({
  lang,
  config,
  frontmatter,
  children,
  prev,
  next,
}: DocsLayoutProps) {
  const { site, navbar, sidebar, theme } = config
  
  const pageTitle = frontmatter?.title || frontmatter?.firstH1 || site?.title || "Docs"
  
  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])
  
  const toc = config.toc?.enabled !== false
    ? (frontmatter?.toc || [])
    : []
  
  const { setOpen: setSearchOpen } = useSearch()

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
        onOpenSearch={() => setSearchOpen(true)}
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
            {frontmatter && (frontmatter.title || frontmatter.description || frontmatter.author || frontmatter.date) && (
              <header className="mb-8 pb-6 border-b border-border">
                {frontmatter.title && (
                  <h1 className="text-3xl font-bold tracking-tight mb-3">{frontmatter.title}</h1>
                )}
                {frontmatter.description && (
                  <p className="text-lg text-muted-foreground mb-4">{frontmatter.description}</p>
                )}
                {(frontmatter.author || frontmatter.date) && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {frontmatter.author && (
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        {frontmatter.author}
                      </span>
                    )}
                    {frontmatter.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {frontmatter.date instanceof Date 
                          ? frontmatter.date.toLocaleDateString('zh-CN') 
                          : String(frontmatter.date)}
                      </span>
                    )}
                  </div>
                )}
              </header>
            )}
            {children}
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

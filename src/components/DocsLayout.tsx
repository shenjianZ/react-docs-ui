import * as React from "react"
import { useState } from "react"

import { HeaderNav } from "@/components/HeaderNav"
import { MobileSidebar } from "@/components/MobileSidebar"
import { FloatingNavBall } from "@/components/FloatingNavBall"
import { SidebarNav } from "@/components/SidebarNav"
import { TableOfContents } from "@/components/TableOfContents"
import { PageNavigation } from "@/components/PageNavigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Footer } from "./Footer"
import { useScrollPosition } from "@/hooks/useScrollPosition"

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
}

interface DocsLayoutProps {
  lang: string
  config: SiteConfig
  frontmatter: any
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
  const toc = frontmatter?.toc

  // 移动端侧边栏状态
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // 滚动位置记忆
  useScrollPosition()

  return (
    <div className="relative flex min-h-screen flex-col">
      <HeaderNav lang={lang} site={site} navbar={navbar} themeConfig={theme} onMenuClick={() => setMobileSidebarOpen(true)} />
      {/* 移动端侧边栏 */}
      {sidebar && (
        <MobileSidebar
          lang={lang}
          sidebar={sidebar}
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
        />
      )}
      {/* 移动端悬浮导航球 */}
      <FloatingNavBall lang={lang} items={navbar.items || []} />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 px-4 md:px-8">
        {sidebar && (
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <SidebarNav lang={lang} sidebar={sidebar} />
            </ScrollArea>
          </aside>
        )}
        <div className="relative flex md:col-start-2 min-w-0 overflow-hidden">
          <main className="relative py-6 lg:py-8 flex-auto w-full">{children}</main>
          {toc && (
            <aside
              className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block"
              style={{ right: "2rem", width: "200px" }}
            >
              <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                <TableOfContents toc={toc} />
              </ScrollArea>
            </aside>
          )}
        </div>
        <div className="md:col-start-2">
          <PageNavigation prev={prev} next={next} lang={lang} />
          {config.footer?.enabled !== false && (
            <Footer footer={config.footer} lang={lang} />
          )}
        </div>
      </div>
    </div>
  )
}

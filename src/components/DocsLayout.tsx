import * as React from "react"

import { HeaderNav } from "@/components/HeaderNav"
import { SidebarNav } from "@/components/SidebarNav"
import { TableOfContents } from "@/components/TableOfContents"

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
}

interface DocsLayoutProps {
  lang: string
  config: SiteConfig
  frontmatter: any
  children: React.ReactNode
}

export function DocsLayout({
  lang,
  config,
  frontmatter,
  children,
}: DocsLayoutProps) {
  const { site, navbar, sidebar, theme } = config
  const toc = frontmatter?.toc

  return (
    <div className="relative flex min-h-screen flex-col">
      <HeaderNav lang={lang} site={site} navbar={navbar} themeConfig={theme} />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-8">
        {sidebar && (
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <div className="h-full py-6 pr-6 lg:py-8">
              <SidebarNav lang={lang} sidebar={sidebar} />
            </div>
          </aside>
        )}
        <div className="relative flex">
          <main className="relative py-6 lg:py-8 flex-auto">{children}</main>
          {toc && (
            <aside
              className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block"
              style={{ right: "2rem", width: "200px" }}
            >
              <div className="h-full py-6 pr-6 lg:py-8">
                <TableOfContents toc={toc} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

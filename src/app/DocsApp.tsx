import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  createBrowserRouter,
  RouterProvider,
  useParams,
  Outlet,
  useLocation,
} from "react-router-dom"
import matter from "gray-matter"

import { DocsLayout } from "../components/DocsLayout"
import { ThemeProvider } from "../components/theme-provider"
import { FontProvider } from "../components/FontProvider"
import { GlobalContextMenu } from "../components/GlobalContextMenu"
import { SearchProvider, SearchDialog } from "../components/search"
import { MdxContent } from "../components/MdxContent"
import { ComponentProvider } from "../components/ComponentProvider"
import {
  AIProvider,
  AISelectionTrigger,
  AIChatDialog,
  AISettingsPanel,
} from "../components/ai"
import { Toaster } from "../components/ui/toaster"
import { getConfig, type SiteConfig } from "../lib/config"
import { getPrevNextPage } from "../lib/navigation"
import { scanComponents, loadComponents, getBuiltinComponents } from "../lib/component-scanner"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { rehypeToc, type TocItem } from "../lib/rehype-toc"

interface Frontmatter {
  title?: string
  description?: string
  author?: string
  date?: string | Date
  toc?: TocItem[]
  firstH1?: string
  [key: string]: unknown
}

function extractFirstH1(content: string): string | undefined {
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.slice(2).trim()
    }
  }
  return undefined
}

const SiteConfigContext = createContext<{
  config: SiteConfig | null
  lang: string
}>({ config: null, lang: "zh-cn" })

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}

function SearchProviderWrapper({ children }: { children: React.ReactNode }) {
  const params = useParams<{ lang: string }>()
  const lang = useMemo(() => params.lang || "zh-cn", [params.lang])
  const [config, setConfig] = useState<SiteConfig | null>(null)
  
  useEffect(() => {
    getConfig(lang).then(setConfig).catch(console.error)
  }, [lang])
  
  return (
    <SearchProvider lang={lang} enabled={config?.search?.enabled !== false} maxResults={config?.search?.maxResults}>
      {children}
    </SearchProvider>
  )
}

function RootShell(): React.JSX.Element {
  const location = useLocation()
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [components, setComponents] = useState<Record<string, React.ComponentType<unknown>>>(() => getBuiltinComponents())
  const [aiEnabled, setAiEnabled] = useState(false)

  const lang = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean)
    return parts[0] === "en" || parts[0] === "zh-cn" ? parts[0] : "zh-cn"
  }, [location.pathname])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const loadedConfig = await getConfig(lang)
        if (!cancelled) {
          setConfig(loadedConfig)
          setAiEnabled(loadedConfig?.ai?.enabled === true)

          const componentsPath = loadedConfig?.mdx?.componentsPath || '/src/components'
          const componentsConfig = loadedConfig?.mdx?.components

          if (loadedConfig?.mdx?.enabled !== false) {
            try {
              const componentList = await scanComponents(componentsPath)
              const loadedComponents = await loadComponents(componentList, componentsConfig)
              setComponents(loadedComponents)
            } catch (error) {
              console.warn('[MDX] 加载组件失败:', error)
            }
          }
        }
      } catch (error) {
        console.error("Error loading config:", error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [lang])

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SiteConfigContext.Provider value={{ config, lang }}>
        <FontProvider config={config} lang={lang}>
          <AIProvider>
            <ComponentProvider components={components}>
              <SearchProviderWrapper>
                <GlobalContextMenu config={config?.contextMenu}>
                  <SearchDialog placeholder={config?.search?.placeholder} />
                  {aiEnabled && (
                    <>
                      <AISelectionTrigger />
                      <AIChatDialog />
                      <AISettingsPanel />
                    </>
                  )}
                  <Outlet />
                </GlobalContextMenu>
              </SearchProviderWrapper>
            </ComponentProvider>
            <Toaster />
          </AIProvider>
        </FontProvider>
      </SiteConfigContext.Provider>
    </ThemeProvider>
  )
}

function DocsPage() {
  const params = useParams<{ lang: string; "*": string }>()
  const langParam = params.lang
  const slug = params["*"]

  const currentLang = useMemo(() => langParam || "zh-cn", [langParam])

  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [frontmatter, setFrontmatter] = useState<Frontmatter | null>(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 计算当前路径的第一段（用于匹配 collections）
  const firstSegment = useMemo(() => {
    const parts = (slug || "").split("/").filter(Boolean)
    return parts.length > 0 ? parts[0] : ""
  }, [slug])

  // 计算上一节和下一节
  const { prev, next } = useMemo(() => {
    const currentPath = `/${currentLang}/${slug || ""}`
    return getPrevNextPage(config?.sidebar, currentPath, firstSegment)
  }, [config?.sidebar, currentLang, slug, firstSegment])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const loadedConfig = await getConfig(currentLang)
        if (!cancelled) {
          setConfig(loadedConfig)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setConfig(null)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [currentLang])

  useEffect(() => {
    let cancelled = false
    setContentLoading(true)

    const pageSlug = slug || "index"
    
    const mdPath = `/docs/${currentLang}/${pageSlug}.md`
    const mdxPath = `/docs/${currentLang}/${pageSlug}.mdx`
    
    const loadContent = async () => {
      try {
        const [mdResponse, mdxResponse] = await Promise.all([
          fetch(mdPath),
          fetch(mdxPath)
        ])
        
        let contentToUse: string | null = null
        
        if (mdxResponse.ok) {
          const mdxText = await mdxResponse.text()
          if (!mdxText.trim().startsWith('<!DOCTYPE') && !mdxText.includes('<html')) {
            contentToUse = mdxText
          }
        }
        
        if (!contentToUse && mdResponse.ok) {
          const mdText = await mdResponse.text()
          if (!mdText.trim().startsWith('<!DOCTYPE') && !mdText.includes('<html')) {
            contentToUse = mdText
          }
        }
        
        if (!contentToUse) {
          throw new Error(`Neither ${mdPath} nor ${mdxPath} found`)
        }

        if (cancelled) return

        const { data, content: markdownContent } = matter(contentToUse)

        const maxLevel = config?.toc?.maxLevel || 3

        const remarkProcessor = unified()
          .use(remarkParse)
          .use(rehypeToc, { maxLevel });

        const remarkTree = await remarkProcessor.run(remarkProcessor.parse(markdownContent));
        const treeWithToc = remarkTree as { data?: { toc?: TocItem[] } };
        const toc = treeWithToc.data?.toc || [];

        const firstH1 = extractFirstH1(markdownContent)

        const enrichedFrontmatter: Frontmatter = {
          ...data,
          toc,
          firstH1
        };

        setFrontmatter(enrichedFrontmatter)
        setContent(markdownContent)
        
      } catch (error) {
        if (cancelled) return
        const errorMessage =
          "# 404 - Not Found\n\nThe page you're looking for could not be found."
        setContent(errorMessage)
        setFrontmatter({ title: "Not Found", toc: [] })
        setError(error as Error)
      } finally {
        setContentLoading(false)
      }
    }

    loadContent()

    // 监听文档文件变化，实现热更新
    if (import.meta.hot) {
      const handleUpdate = () => {
        loadContent()
      }

      // 监听 MDX 和 MD 文件的变化
      const mdxFile = `/public/docs/${currentLang}/${pageSlug}.mdx`
      const mdFile = `/public/docs/${currentLang}/${pageSlug}.md`

      import.meta.hot.accept(mdxFile, handleUpdate)
      import.meta.hot.accept(mdFile, handleUpdate)
    }

    return () => {
      cancelled = true
    }
  }, [currentLang, slug])

  if (!config) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <DocsLayout lang={currentLang} config={config} frontmatter={{ title: '错误', toc: [] }} prev={null} next={null}>
        <div className="text-red-600">
          <h1>页面加载失败</h1>
          <p>{error.message}</p>
        </div>
      </DocsLayout>
    )
  }

  return (
    <DocsLayout lang={currentLang} config={config} frontmatter={frontmatter} prev={prev} next={next}>
      {contentLoading && !content ? (
        <div>Loading...</div>
      ) : (
        <MdxContent
          source={content || ''}
          skipFirstH1={!!frontmatter?.title}
          imageViewer={config?.imageViewer}
        />
      )}
    </DocsLayout>
  )
}

export function DocsApp(): React.JSX.Element {
  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <RootShell />,
          children: [
            { index: true, element: <DocsPage /> },
            { path: ":lang", element: <DocsPage /> },
            { path: ":lang/*", element: <DocsPage /> },
          ],
        },
      ]),
    []
  )

  return <RouterProvider router={router} />
}

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  createBrowserRouter,
  RouterProvider,
  useParams,
  Outlet,
} from "react-router-dom"

import { DocsLayout } from "../components/DocsLayout"
import { ThemeProvider } from "../components/theme-provider"
import { FontProvider } from "../components/FontProvider"
import { GlobalContextMenu } from "../components/GlobalContextMenu"
import { CommandMenu } from "../components/CommandMenu"
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
import { scanComponents, loadComponents } from "../lib/component-scanner"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { rehypeToc } from "../lib/rehype-toc"

const SiteConfigContext = createContext<{
  config: SiteConfig | null
  lang: string
}>({ config: null, lang: "zh-cn" })

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}

// 简单的 markdown frontmatter 解析函数，不依赖 Buffer
function parseMarkdownFrontmatter(markdown: string): { data: Record<string, any>; content: string } {
  const lines = markdown.split('\n')
  let frontmatterData: Record<string, any> = {}
  let contentStart = 0
  
  // 检查是否有 frontmatter
  if (lines[0]?.startsWith('---')) {
    let i = 1
    while (i < lines.length && !lines[i]?.startsWith('---')) {
      const line = lines[i]
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        // 尝试解析值类型
        if (value === 'true' || value === 'false') {
          frontmatterData[key] = value === 'true'
        } else if (!isNaN(Number(value))) {
          frontmatterData[key] = Number(value)
        } else {
          frontmatterData[key] = value
        }
      }
      i++
    }
    if (i < lines.length && lines[i]?.startsWith('---')) {
      contentStart = i + 1
    }
  }
  
  return {
    data: frontmatterData,
    content: lines.slice(contentStart).join('\n')
  }
}

function RootShell(): React.JSX.Element {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [components, setComponents] = useState<Record<string, React.ComponentType<any>>>({})
  const [aiEnabled, setAiEnabled] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const loadedConfig = await getConfig("zh-cn")
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
  }, [])

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SiteConfigContext.Provider value={{ config, lang: "zh-cn" }}>
        <FontProvider config={config} lang="zh-cn">
          <AIProvider>
            <ComponentProvider components={components}>
              <GlobalContextMenu config={config?.contextMenu}>
                <CommandMenu />
                {aiEnabled && (
                  <>
                    <AISelectionTrigger />
                    <AIChatDialog />
                    <AISettingsPanel />
                  </>
                )}
                <Outlet />
              </GlobalContextMenu>
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
  const [frontmatter, setFrontmatter] = useState<Record<string, any>>({})
  const [isMdx, setIsMdx] = useState(false)
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
        // 同时请求两个文件
        const [mdResponse, mdxResponse] = await Promise.all([
          fetch(mdPath),
          fetch(mdxPath)
        ])
        
        let contentToUse: string | null = null
        let isMdxFile = false
        
        // 检查 MDX 文件
        if (mdxResponse.ok) {
          const mdxText = await mdxResponse.text()
          // 检查是否是 HTML（表示文件不存在）
          if (!mdxText.trim().startsWith('<!DOCTYPE') && !mdxText.includes('<html')) {
            contentToUse = mdxText
            isMdxFile = true
          }
        }
        
        // 如果 MDX 不可用，检查 MD 文件
        if (!contentToUse && mdResponse.ok) {
          const mdText = await mdResponse.text()
          // 检查是否是 HTML（表示文件不存在）
          if (!mdText.trim().startsWith('<!DOCTYPE') && !mdText.includes('<html')) {
            contentToUse = mdText
            isMdxFile = false
          }
        }
        
        if (!contentToUse) {
          throw new Error(`Neither ${mdPath} nor ${mdxPath} found`)
        }

        if (cancelled) return

        const { data, content: markdownContent } = parseMarkdownFrontmatter(contentToUse)

        // 获取配置中的 maxLevel
        const maxLevel = config?.toc?.maxLevel || 3

        // 运行 remark 处理链生成 toc
        const remarkProcessor = unified()
          .use(remarkParse)
          .use(rehypeToc, { maxLevel });

        const remarkTree = await remarkProcessor.run(remarkProcessor.parse(markdownContent));
        const toc = (remarkTree as any).data?.toc || [];

        // 将 toc 合并到 frontmatter 中
        const enrichedFrontmatter = {
          ...data,
          toc
        };

        setFrontmatter(enrichedFrontmatter)
        setContent(markdownContent)
        setIsMdx(isMdxFile)
        
      } catch (error) {
        if (cancelled) return
        const errorMessage =
          "# 404 - Not Found\n\nThe page you're looking for could not be found."
        setContent(errorMessage)
        setFrontmatter({ title: "Not Found" })
        setIsMdx(false)
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
      <DocsLayout lang={currentLang} config={config} frontmatter={{ title: '错误' }} prev={null} next={null}>
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
      ) : isMdx ? (
        <MdxContent source={content || ''} />
      ) : (
        <MdxContent source={content || ''} />
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
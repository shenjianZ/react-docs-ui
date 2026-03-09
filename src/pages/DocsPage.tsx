import matter from "gray-matter"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { unified } from "unified"
import remarkParse from "remark-parse"

import { DocsLayout } from "../components/DocsLayout"
import { MdxContent } from "../components/MdxContent"
import { getConfig, type SiteConfig } from "../lib/config"
import { getPrevNextPage } from "../lib/navigation"
import { rehypeToc, type TocItem } from "../lib/rehype-toc"
import { AISelectionTrigger, AIChatDialog, AISettingsPanel } from "../components/ai"

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

interface DocsPageProps {
  aiEnabled?: boolean
}

export function DocsPage({ aiEnabled = false }: DocsPageProps) {
  const params = useParams<{ lang: string; "*": string }>()
  const langParam = params.lang
  const slug = params["*"]

  const currentLang = useMemo(() => langParam || "zh-cn", [langParam])

  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [content, setContent] = useState("")
  const [frontmatter, setFrontmatter] = useState<Frontmatter | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(true)

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

  // 加载站点配置：仅在语言变化时触发
  useEffect(() => {
    let cancelled = false
    setConfigLoading(true)

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
      } finally {
        if (!cancelled) setConfigLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [currentLang])

  // 加载文档内容：在语言或 slug 变化时触发。仅刷新内容区域
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
        const { data, content } = matter(contentToUse)

        const maxLevel = config?.toc?.maxLevel || 3

        const remarkProcessor = unified()
          .use(remarkParse)
          .use(rehypeToc, { maxLevel });

        const remarkTree = await remarkProcessor.run(remarkProcessor.parse(content));
        const treeWithToc = remarkTree as { data?: { toc?: TocItem[] } };
        const toc = treeWithToc.data?.toc || [];

        const firstH1 = extractFirstH1(content)

        const enrichedFrontmatter: Frontmatter = {
          ...data,
          toc,
          firstH1
        };

        setFrontmatter(enrichedFrontmatter)
        setContent(content)
      } catch (error) {
        console.error('[DocsPage] Error:', error);
        if (cancelled) return
        const errorMessage =
          "# 404 - Not Found\n\nThe page you're looking for could not be found."
        setContent(errorMessage)
        setFrontmatter({ title: "Not Found" })
      } finally {
        if (!cancelled) setContentLoading(false)
      }
    }

    loadContent()

    if (import.meta.hot) {
      const handleUpdate = () => {
        loadContent()
      }

      const mdxFile = `/public/docs/${currentLang}/${pageSlug}.mdx`
      const mdFile = `/public/docs/${currentLang}/${pageSlug}.md`

      import.meta.hot.accept(mdxFile, handleUpdate)
      import.meta.hot.accept(mdFile, handleUpdate)
    }

    return () => {
      cancelled = true
    }
  }, [currentLang, slug, config?.toc?.maxLevel])

  if (configLoading && !config) {
    return <div>Loading...</div>
  }

  return (
    <DocsLayout
      lang={currentLang}
      config={config!}
      frontmatter={frontmatter}
      prev={prev}
      next={next}
      content={content}
      availableLangs={["zh-cn", "en"]}
    >
      {contentLoading && !content ? <div>Loading...</div> : <MdxContent source={content} skipFirstH1={!!frontmatter?.title} />}
      {aiEnabled && (
        <>
          <AISelectionTrigger />
          <AIChatDialog />
          <AISettingsPanel />
        </>
      )}
    </DocsLayout>
  )
}
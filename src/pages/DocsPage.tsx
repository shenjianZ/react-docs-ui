import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { unified } from "unified"
import remarkParse from "remark-parse"

import { DocsLayout } from "../components/DocsLayout"
import { MdxContent } from "../components/MdxContent"
import { getConfig, type SiteConfig } from "../lib/config"
import { parseFrontmatter } from "../lib/frontmatter"
import { getPrevNextPage } from "../lib/navigation"
import { buildEditUrl, resolvePageMeta, type DocGitMeta } from "../lib/page-meta"
import { rehypeToc, type TocItem } from "../lib/rehype-toc"
import { buildVersionedDocAssetPath, isKnownVersion, resolveVersionedDocFilePath } from "../lib/versioning"
import { AISelectionTrigger, AIChatDialog, AISettingsPanel } from "../components/ai"
import { siteShikiBundle } from "../generated/shiki-bundle"

interface Frontmatter {
  title?: string
  description?: string
  author?: string
  authors?: string[]
  createdAt?: string
  lastUpdated?: string
  editUrl?: string
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
  const params = useParams<{ lang: string; version?: string; "*": string }>()
  const langParam = params.lang
  const versionParam = params.version
  const slug = params["*"]

  const currentLang = useMemo(() => langParam || "zh-cn", [langParam])

  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [content, setContent] = useState("")
  const [frontmatter, setFrontmatter] = useState<Frontmatter | null>(null)
  const [docGitMeta, setDocGitMeta] = useState<DocGitMeta | null>(null)
  const [docFilePath, setDocFilePath] = useState<string>()
  const [docExt, setDocExt] = useState<"md" | "mdx">()
  const [configLoading, setConfigLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(true)

  // 计算当前路径的第一段（用于匹配 collections）
  const firstSegment = useMemo(() => {
    const parts = (slug || "").split("/").filter(Boolean)
    return parts.length > 0 ? parts[0] : ""
  }, [slug])

  const currentVersion = useMemo(() => {
    return isKnownVersion(config, versionParam) ? versionParam : undefined
  }, [config, versionParam])

  // 计算上一节和下一节
  const { prev, next } = useMemo(() => {
    const currentPath = currentVersion
      ? `/${currentLang}/v/${currentVersion}/${slug || ""}`
      : `/${currentLang}/${slug || ""}`
    return getPrevNextPage(config?.sidebar, currentPath, firstSegment, currentVersion)
  }, [config?.sidebar, currentLang, currentVersion, slug, firstSegment])

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
    setDocGitMeta(null)
    setDocFilePath(undefined)
    setDocExt(undefined)

    const pageSlug = slug || "index"
    const mdPath = buildVersionedDocAssetPath(currentLang, pageSlug, "md", currentVersion)
    const mdxPath = buildVersionedDocAssetPath(currentLang, pageSlug, "mdx", currentVersion)
    const fallbackMdPath = buildVersionedDocAssetPath(currentLang, pageSlug, "md")
    const fallbackMdxPath = buildVersionedDocAssetPath(currentLang, pageSlug, "mdx")

    const loadContent = async () => {
      try {
        const [mdResponse, mdxResponse] = await Promise.all([fetch(mdPath), fetch(mdxPath)])
        const [fallbackMdResponse, fallbackMdxResponse] = currentVersion
          ? await Promise.all([fetch(fallbackMdPath), fetch(fallbackMdxPath)])
          : [null, null]

        let contentToUse: string | null = null
        let resolvedExt: "md" | "mdx" | undefined
        let usedVersionedSource = false

        if (mdxResponse.ok) {
          const mdxText = await mdxResponse.text()
          if (!mdxText.trim().startsWith('<!DOCTYPE') && !mdxText.includes('<html')) {
            contentToUse = mdxText
            resolvedExt = "mdx"
            usedVersionedSource = true
          }
        }

        if (!contentToUse && mdResponse.ok) {
          const mdText = await mdResponse.text()
          if (!mdText.trim().startsWith('<!DOCTYPE') && !mdText.includes('<html')) {
            contentToUse = mdText
            resolvedExt = "md"
            usedVersionedSource = true
          }
        }

        if (!contentToUse && fallbackMdxResponse?.ok) {
          const mdxText = await fallbackMdxResponse.text()
          if (!mdxText.trim().startsWith('<!DOCTYPE') && !mdxText.includes('<html')) {
            contentToUse = mdxText
            resolvedExt = "mdx"
          }
        }

        if (!contentToUse && fallbackMdResponse?.ok) {
          const mdText = await fallbackMdResponse.text()
          if (!mdText.trim().startsWith('<!DOCTYPE') && !mdText.includes('<html')) {
            contentToUse = mdText
            resolvedExt = "md"
          }
        }

        if (!contentToUse) {
          throw new Error(`Neither ${mdPath} nor ${mdxPath} found`)
        }

        if (cancelled) return
        const { data, content } = parseFrontmatter(contentToUse)

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
        if (resolvedExt) {
          setDocExt(resolvedExt)
          const resolvedVersion = currentVersion && usedVersionedSource ? currentVersion : undefined
          setDocFilePath(resolveVersionedDocFilePath(currentLang, pageSlug, resolvedExt, resolvedVersion))
        }
      } catch (error) {
        console.error('[DocsPage] Error:', error);
        if (cancelled) return
        const errorMessage =
          "# 404 - Not Found\n\nThe page you're looking for could not be found."
        setContent(errorMessage)
        setFrontmatter({ title: "Not Found" })
        setDocGitMeta(null)
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
  }, [currentLang, currentVersion, slug, config?.toc?.maxLevel])

  useEffect(() => {
    let cancelled = false

    if (!docFilePath || frontmatter?.title === "Not Found") {
      setDocGitMeta(null)
      return () => {
        cancelled = true
      }
    }

    ;(async () => {
      try {
        const response = await fetch("/doc-git-meta.json")
        if (!response.ok) throw new Error(`Failed to fetch doc git meta: ${response.status}`)
        const payload = await response.json() as { files?: Record<string, DocGitMeta> }
        if (!cancelled) {
          setDocGitMeta(payload.files?.[docFilePath] ?? null)
        }
      } catch (error) {
        console.error("[DocsPage] Failed to load doc git meta:", error)
        if (!cancelled) {
          setDocGitMeta(null)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [docFilePath, frontmatter?.title])

  const pageMeta = useMemo(() => {
    return resolvePageMeta({
      gitMeta: docGitMeta ?? undefined,
      frontmatter,
      preferGitMeta: config?.pageMeta?.preferGitMeta !== false,
    })
  }, [config?.pageMeta?.preferGitMeta, docGitMeta, frontmatter])

  const editUrl = useMemo(() => {
    if (typeof frontmatter?.editUrl === "string") return frontmatter.editUrl
    if (config?.editLink?.enabled === false) return undefined
    return buildEditUrl(config?.editLink?.urlTemplate, {
      lang: currentLang,
      version: currentVersion,
      slug: slug || "index",
      docPath: docFilePath,
      ext: docExt,
      filePath: docFilePath,
    })
  }, [config?.editLink?.enabled, config?.editLink?.urlTemplate, currentLang, currentVersion, docExt, docFilePath, frontmatter?.editUrl, slug])

  if (configLoading && !config) {
    return <div>Loading...</div>
  }

  return (
    <DocsLayout
      lang={currentLang}
      config={config!}
      frontmatter={frontmatter}
      slug={slug}
      version={currentVersion}
      lastUpdated={pageMeta.lastUpdated}
      editUrl={frontmatter?.title === "Not Found" ? undefined : editUrl}
      docFilePath={docFilePath}
      prev={prev}
      next={next}
      content={content}
      availableLangs={["zh-cn", "en"]}
    >
      {contentLoading && !content ? (
        <div>Loading...</div>
      ) : (
        <MdxContent
          source={content}
          skipFirstH1={!!(frontmatter?.title || frontmatter?.firstH1)}
          imageViewer={config?.imageViewer}
          codeHighlight={config?.codeHighlight}
          shikiBundle={siteShikiBundle}
        />
      )}
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

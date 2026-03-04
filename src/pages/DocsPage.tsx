import matter from "gray-matter"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { DocsLayout } from "../components/DocsLayout"
import { MdxContent } from "../components/MdxContent"
import { getConfig, type SiteConfig } from "../lib/config"
import * as navigation from "../lib/navigation"

console.log("navigation module:", navigation)
console.log("getPrevNextPage function:", navigation.getPrevNextPage)

export function DocsPage() {
  const params = useParams<{ lang: string; "*": string }>()
  const langParam = params.lang
  const slug = params["*"]

  const currentLang = useMemo(() => langParam || "zh-cn", [langParam])

  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [content, setContent] = useState("")
  const [frontmatter, setFrontmatter] = useState<any>(null)
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
    console.log("DocsPage useMemo:", { config, sidebar: config?.sidebar, currentPath, firstSegment })
    const result = getPrevNextPage(config?.sidebar, currentPath, firstSegment)
    console.log("DocsPage result:", result)
    return result
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
    const docPath = `/docs/${currentLang}/${pageSlug}.md`

    ;(async () => {
      try {
        const response = await fetch(docPath)
        const contentType = response.headers.get("content-type")

        if (
          !response.ok ||
          !contentType ||
          (!contentType.includes("text/markdown") &&
            !contentType.includes("text/plain"))
        ) {
          throw new Error(`File not found or invalid content type for: ${docPath}`)
        }

        const markdown = await response.text()
        if (cancelled) return
        const { data, content } = matter(markdown)
        setFrontmatter(data)
        setContent(content)
      } catch (error) {
        console.error(error)
        if (cancelled) return
        const errorMessage =
          "# 404 - Not Found\n\nThe page you're looking for at `" +
          docPath +
          "` could not be found."
        setContent(errorMessage)
        setFrontmatter({ title: "Not Found" })
      } finally {
        if (!cancelled) setContentLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [currentLang, slug])

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
    >
      {contentLoading && !content ? <div>Loading...</div> : <MdxContent source={content} />}
    </DocsLayout>
  )
}
import fs from "node:fs/promises"
import path from "node:path"
import { glob } from "glob"
import yaml from "js-yaml"

const rootDir = process.cwd()
const publicDir = path.join(rootDir, "public")

function parseFrontmatter(source) {
  if (!source.startsWith("---\n")) return { data: {} }
  const endIndex = source.indexOf("\n---\n", 4)
  if (endIndex === -1) return { data: {} }
  const raw = source.slice(4, endIndex)
  const data = {}
  for (const line of raw.split("\n")) {
    const index = line.indexOf(":")
    if (index <= 0) continue
    data[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^["']|["']$/g, "")
  }
  return { data }
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

async function loadSiteUrl() {
  const configPath = path.join(publicDir, "config", "site.yaml")
  try {
    const content = await fs.readFile(configPath, "utf8")
    const config = yaml.load(content)
    return config?.site?.url || ""
  } catch {
    return ""
  }
}

async function loadSitemapConfig() {
  const configPath = path.join(publicDir, "config", "site.yaml")
  try {
    const content = await fs.readFile(configPath, "utf8")
    const config = yaml.load(content)
    return config?.sitemap || {}
  } catch {
    return {}
  }
}

async function collectDocPages(lang) {
  const mdFiles = await glob(`public/docs/${lang}/**/*.md`, { cwd: rootDir, absolute: true, nodir: true })
  const mdxFiles = await glob(`public/docs/${lang}/**/*.mdx`, { cwd: rootDir, absolute: true, nodir: true })
  const files = [...mdFiles, ...mdxFiles]
  const pages = []

  for (const file of files) {
    const relativePath = path.relative(path.join(publicDir, "docs", lang), file)
    const slug = relativePath.replace(/\.(md|mdx)$/i, "")
    const source = await fs.readFile(file, "utf8")
    const { data } = parseFrontmatter(source)

    if (data.draft === "true" || data.noindex === "true") continue

    pages.push({
      path: `/${lang}/${slug}`,
      lastmod: data.date || "",
      changefreq: data.changefreq || "",
      priority: data.priority ? Number(data.priority) : undefined,
    })
  }

  return pages
}

async function collectChangelogPages(lang) {
  const mdFiles = await glob(`public/docs/${lang}/changelog/*.md`, { cwd: rootDir, absolute: true, nodir: true })
  const mdxFiles = await glob(`public/docs/${lang}/changelog/*.mdx`, { cwd: rootDir, absolute: true, nodir: true })
  const files = [...mdFiles, ...mdxFiles]
  const pages = []

  for (const file of files) {
    const slug = path.basename(file).replace(/\.(md|mdx)$/i, "")
    const source = await fs.readFile(file, "utf8")
    const { data } = parseFrontmatter(source)

    if (data.draft === "true") continue

    pages.push({
      path: `/${lang}/changelog/${slug}`,
      lastmod: data.date || "",
    })
  }

  return pages
}

async function main() {
  const siteUrl = await loadSiteUrl()
  if (!siteUrl) {
    console.warn("[sitemap] Skipping: site.url is not configured in site.yaml")
    return
  }

  const sitemapConfig = await loadSitemapConfig()
  if (sitemapConfig.enabled === false) {
    console.log("[sitemap] Disabled in config")
    return
  }

  const excludePatterns = sitemapConfig.exclude || []
  const defaultChangefreq = sitemapConfig.changefreq || "weekly"
  const defaultPriority = sitemapConfig.priority || 0.7

  const docsRoot = path.join(publicDir, "docs")
  const entries = await fs.readdir(docsRoot, { withFileTypes: true })
  const langs = entries.filter(entry => entry.isDirectory()).map(entry => entry.name)

  const allPages = []

  for (const lang of langs) {
    // 首页
    allPages.push({ path: `/${lang}`, priority: 1.0, changefreq: "daily" })

    // 文档页
    const docPages = await collectDocPages(lang)
    allPages.push(...docPages)

    // Changelog 页
    const changelogPages = await collectChangelogPages(lang)
    if (changelogPages.length > 0) {
      allPages.push({ path: `/${lang}/changelog`, priority: 0.6, changefreq: "daily" })
      allPages.push(...changelogPages)
    }
  }

  // 排除指定路径
  const filteredPages = allPages.filter(page => {
    return !excludePatterns.some(pattern => {
      if (pattern.endsWith("/*")) {
        return page.path.startsWith(pattern.slice(0, -1))
      }
      if (pattern.startsWith("*")) {
        return page.path.endsWith(pattern.slice(1))
      }
      return page.path === pattern
    })
  })

  // 去重
  const seen = new Set()
  const uniquePages = filteredPages.filter(page => {
    if (seen.has(page.path)) return false
    seen.add(page.path)
    return true
  })

  // 生成 XML
  const today = new Date().toISOString().split("T")[0]
  const urls = uniquePages.map(page => {
    const loc = `${siteUrl.replace(/\/+$/, "")}${page.path}`
    const changefreq = page.changefreq || defaultChangefreq
    const priority = page.priority ?? defaultPriority
    const lastmod = page.lastmod || today

    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

  const outputPath = path.join(publicDir, "sitemap.xml")
  await fs.writeFile(outputPath, xml, "utf8")
  console.log(`[sitemap] Generated ${uniquePages.length} URLs to sitemap.xml`)
}

main().catch((error) => {
  console.error("[sitemap] Failed:", error)
  process.exitCode = 1
})

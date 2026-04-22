import fs from "node:fs/promises"
import path from "node:path"
import yaml from "js-yaml"

const rootDir = process.cwd()
const publicDir = path.join(rootDir, "public")

function escapeXml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

async function loadSiteConfig() {
  const configPath = path.join(publicDir, "config", "site.yaml")
  try {
    const content = await fs.readFile(configPath, "utf8")
    return yaml.load(content)
  } catch {
    return {}
  }
}

async function loadChangelogIndex(lang) {
  const indexPath = path.join(publicDir, `changelog-index-${lang}.json`)
  try {
    const content = await fs.readFile(indexPath, "utf8")
    return JSON.parse(content)
  } catch {
    return { lang, items: [] }
  }
}

async function main() {
  const config = await loadSiteConfig()
  const siteUrl = config?.site?.url
  if (!siteUrl) {
    console.warn("[feed] Skipping: site.url is not configured in site.yaml")
    return
  }

  const feedConfig = config?.feed || {}
  if (feedConfig.enabled === false) {
    console.log("[feed] Disabled in config")
    return
  }

  const siteTitle = feedConfig.title || config?.site?.title || "Documentation"
  const siteDescription = feedConfig.description || config?.site?.description || ""
  const limit = feedConfig.limit || 20
  const baseUrl = siteUrl.replace(/\/+$/, "")

  // 收集所有语言的 changelog
  const docsRoot = path.join(publicDir, "docs")
  const entries = await fs.readdir(docsRoot, { withFileTypes: true })
  const langs = entries.filter(entry => entry.isDirectory()).map(entry => entry.name)

  const allItems = []
  for (const lang of langs) {
    const index = await loadChangelogIndex(lang)
    for (const item of index.items || []) {
      allItems.push({ ...item, lang })
    }
  }

  // 按日期降序排序
  allItems.sort((a, b) => {
    const dateA = Date.parse(a.date || "")
    const dateB = Date.parse(b.date || "")
    if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0
    if (Number.isNaN(dateA)) return 1
    if (Number.isNaN(dateB)) return -1
    return dateB - dateA
  })

  const items = allItems.slice(0, limit)

  if (items.length === 0) {
    console.log("[feed] No changelog items found")
    return
  }

  const lastBuildDate = new Date().toUTCString()

  const itemsXml = items.map(item => {
    const link = `${baseUrl}${item.path}`
    const pubDate = item.date ? new Date(item.date).toUTCString() : lastBuildDate
    const tags = []
    if (item.type) tags.push(`<category>${escapeXml(item.type)}</category>`)
    if (item.breaking) tags.push(`<category>breaking</category>`)

    return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(item.summary || "")}</description>
      <pubDate>${pubDate}</pubDate>${tags.length > 0 ? "\n      " + tags.join("\n      ") : ""}
    </item>`
  }).join("\n")

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>${escapeXml(siteDescription)}</description>
    <link>${escapeXml(baseUrl)}</link>
    <atom:link href="${escapeXml(baseUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <language>zh-cn</language>
    <generator>react-docs-ui</generator>
${itemsXml}
  </channel>
</rss>
`

  const outputPath = path.join(publicDir, "feed.xml")
  await fs.writeFile(outputPath, rss, "utf8")
  console.log(`[feed] Generated ${items.length} items to feed.xml`)
}

main().catch((error) => {
  console.error("[feed] Failed:", error)
  process.exitCode = 1
})

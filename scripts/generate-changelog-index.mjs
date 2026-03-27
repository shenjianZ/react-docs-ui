import fs from "node:fs/promises"
import path from "node:path"
import { glob } from "glob"

const rootDir = process.cwd()
const publicDir = path.join(rootDir, "public")
const docsRoot = path.join(publicDir, "docs")

function parseFrontmatter(source) {
  if (!source.startsWith("---\n")) return { data: {}, content: source }
  const endIndex = source.indexOf("\n---\n", 4)
  if (endIndex === -1) return { data: {}, content: source }
  const raw = source.slice(4, endIndex)
  const content = source.slice(endIndex + 5).trim()
  const data = {}
  for (const line of raw.split("\n")) {
    const index = line.indexOf(":")
    if (index <= 0) continue
    data[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^["']|["']$/g, "")
  }
  return { data, content }
}

function sortByDateDesc(items) {
  return items.sort((a, b) => {
    const left = Date.parse(b.date || "")
    const right = Date.parse(a.date || "")
    if (Number.isNaN(left) && Number.isNaN(right)) return a.slug.localeCompare(b.slug)
    if (Number.isNaN(left)) return -1
    if (Number.isNaN(right)) return 1
    return left - right
  })
}

async function buildLangIndex(lang) {
  const mdFiles = await glob(`public/docs/${lang}/changelog/*.md`, { cwd: rootDir, absolute: true, nodir: true })
  const mdxFiles = await glob(`public/docs/${lang}/changelog/*.mdx`, { cwd: rootDir, absolute: true, nodir: true })
  const files = [...mdFiles, ...mdxFiles]
  const items = await Promise.all(files.map(async (file) => {
    const source = await fs.readFile(file, "utf8")
    const { data, content } = parseFrontmatter(source)
    const slug = path.basename(file).replace(/\.(md|mdx)$/i, "")
    return {
      slug,
      title: data.title || data.version || slug,
      version: data.version || slug,
      date: data.date || "",
      summary: data.summary || content.slice(0, 140),
      type: data.type || "release",
      breaking: data.breaking === "true",
      draft: data.draft === "true",
      path: `/${lang}/changelog/${slug}`,
    }
  }))
  return sortByDateDesc(items.filter(item => !item.draft))
}

async function main() {
  const entries = await fs.readdir(docsRoot, { withFileTypes: true })
  const langs = entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
  for (const lang of langs) {
    const items = await buildLangIndex(lang)
    const output = path.join(publicDir, `changelog-index-${lang}.json`)
    await fs.writeFile(output, `${JSON.stringify({ lang, items }, null, 2)}\n`, "utf8")
    console.log(`[changelog] Wrote ${items.length} items to ${path.basename(output)}`)
  }
}

main().catch((error) => {
  console.error("[changelog] Failed:", error)
  process.exitCode = 1
})

import fs from "node:fs/promises"
import path from "node:path"
import { glob } from "glob"

const rootDir = process.cwd()
const publicDir = path.join(rootDir, "public")

function stripFrontmatter(source) {
  if (!source.startsWith("---\n")) return source
  const endIndex = source.indexOf("\n---\n", 4)
  return endIndex === -1 ? source : source.slice(endIndex + 5)
}

async function main() {
  const files = await glob("public/docs/**/*.{md,mdx}", { cwd: rootDir, absolute: true, nodir: true })
  const docs = await Promise.all(files.map(async (file) => {
    const relative = path.relative(rootDir, file).replace(/\\/g, "/")
    const urlPath = relative.replace(/^public\/docs\//, "").replace(/\.(md|mdx)$/i, "")
    const content = stripFrontmatter(await fs.readFile(file, "utf8")).trim()
    return { relative, urlPath, content }
  }))

  const llms = docs.map((doc) => `- /${doc.urlPath} | ${doc.relative}`).join("\n")
  const llmsFull = docs.map((doc) => `# /${doc.urlPath}\n\n${doc.content}`).join("\n\n")

  await fs.writeFile(path.join(publicDir, "llms.txt"), `${llms}\n`, "utf8")
  await fs.writeFile(path.join(publicDir, "llms-full.txt"), `${llmsFull}\n`, "utf8")
  console.log(`[llms] Wrote ${docs.length} docs to llms.txt and llms-full.txt`)
}

main().catch((error) => {
  console.error("[llms] Failed:", error)
  process.exitCode = 1
})

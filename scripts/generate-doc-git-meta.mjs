import { promisify } from "node:util"
import { execFile } from "node:child_process"
import { glob } from "glob"
import path from "node:path"
import fs from "node:fs/promises"

const execFileAsync = promisify(execFile)
const rootDir = process.cwd()
const publicDir = path.join(rootDir, "public")
const outputPath = path.join(publicDir, "doc-git-meta.json")

async function getGitValue(args) {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd: rootDir })
    return stdout.trim()
  } catch {
    return ""
  }
}

async function main() {
  const repoRoot = (await getGitValue(["rev-parse", "--show-toplevel"])) || rootDir
  const files = await glob("public/docs/**/*.{md,mdx}", {
    cwd: rootDir,
    absolute: true,
    nodir: true,
  })

  const entries = []
  for (const file of files) {
    const relativePath = path.relative(repoRoot, file).replace(/\\/g, "/")
    const [lastUpdated, author] = await Promise.all([
      getGitValue(["log", "-1", "--format=%cI", "--", relativePath]),
      getGitValue(["log", "-1", "--format=%an", "--", relativePath]),
    ])
    entries.push({
      relativePath: path.relative(rootDir, file).replace(/\\/g, "/"),
      meta: {
        lastUpdated: lastUpdated || undefined,
        author: author || undefined,
      },
    })
  }
  const docMeta = Object.fromEntries(
    entries
      .filter(({ meta }) => meta.lastUpdated || meta.author)
      .map(({ relativePath, meta }) => [relativePath, meta])
  )

  const payload = {
    generatedAt: new Date().toISOString(),
    files: docMeta,
  }

  await fs.mkdir(publicDir, { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")
  console.log(`[doc-git-meta] Wrote ${Object.keys(docMeta).length} entries to public/doc-git-meta.json`)
}

main().catch((error) => {
  console.error("[doc-git-meta] Failed:", error)
  process.exitCode = 1
})

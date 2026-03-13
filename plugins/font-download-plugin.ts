import fs from "node:fs/promises"
import path from "node:path"
import yaml from "js-yaml"
import type { Plugin, ResolvedConfig } from "vite"

const FONT_BASE_URL = "https://file.shenjianl.cn/fonts/"
const CONFIG_FILE_NAMES = ["site.yaml", "site.en.yaml"]

interface FontDownloadConfig {
  fonts?: {
    downloadFonts?: string[]
  }
}

interface DownloadTask {
  filename: string
  source: string
}

function log(message: string) {
  console.log(`[font-download] ${message}`)
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"

  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

async function downloadFont(task: DownloadTask) {
  const response = await fetch(task.source)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  if (!response.body) {
    throw new Error("response body is empty")
  }

  const totalBytes = Number(response.headers.get("content-length") ?? 0)
  const reader = response.body.getReader()
  const chunks: Buffer[] = []
  const startedAt = Date.now()
  let downloadedBytes = 0
  let lastLogAt = 0

  log(`start: ${task.filename} <- ${task.source}`)

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = Buffer.from(value)
    chunks.push(chunk)
    downloadedBytes += chunk.byteLength

    const now = Date.now()
    if (lastLogAt === 0 || now - lastLogAt >= 500 || (totalBytes > 0 && downloadedBytes >= totalBytes)) {
      const elapsedSeconds = Math.max((now - startedAt) / 1000, 0.001)
      const speed = downloadedBytes / elapsedSeconds
      const progress = totalBytes > 0
        ? `${((downloadedBytes / totalBytes) * 100).toFixed(1)}%`
        : "unknown"
      const totalText = totalBytes > 0 ? formatBytes(totalBytes) : "unknown"

      log(
        `progress: ${task.filename} ${formatBytes(downloadedBytes)}/${totalText} (${progress}) @ ${formatBytes(speed)}/s`
      )
      lastLogAt = now
    }
  }

  return Buffer.concat(chunks)
}

function toDownloadTask(entry: string): DownloadTask | null {
  const normalized = entry.trim()
  if (!normalized) return null

  try {
    const url = /^https?:\/\//i.test(normalized)
      ? new URL(normalized)
      : new URL(normalized.replace(/^\/+/, ""), FONT_BASE_URL)

    const filename = path.posix.basename(url.pathname)
    if (!filename) return null

    return {
      filename,
      source: url.toString(),
    }
  } catch {
    return null
  }
}

async function readDownloadTasks(configDir: string) {
  const tasks = new Map<string, DownloadTask>()

  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.resolve(configDir, fileName)

    try {
      const content = await fs.readFile(filePath, "utf8")
      const parsed = yaml.load(content) as FontDownloadConfig | null
      const entries = parsed?.fonts?.downloadFonts ?? []

      for (const entry of entries) {
        const task = toDownloadTask(entry)
        if (!task) {
          log(`skip invalid font entry "${entry}" from ${fileName}`)
          continue
        }

        tasks.set(task.filename, task)
      }
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException
      if (nodeError.code !== "ENOENT") {
        log(`failed to read ${fileName}: ${nodeError.message}`)
      }
    }
  }

  return [...tasks.values()]
}

async function ensureFontFile(fontsDir: string, task: DownloadTask) {
  const targetPath = path.resolve(fontsDir, task.filename)

  try {
    await fs.access(targetPath)
    log(`exists: public/fonts/${task.filename}`)
    return
  } catch {
    // Continue to download.
  }

  try {
    const fileBuffer = await downloadFont(task)
    await fs.writeFile(targetPath, fileBuffer)
    log(`downloaded: ${task.source} -> public/fonts/${task.filename}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log(`failed: ${task.source} -> public/fonts/${task.filename} (${message})`)
  }
}

async function ensureFonts(root: string) {
  const configDir = path.resolve(root, "public", "config")
  const fontsDir = path.resolve(root, "public", "fonts")

  await fs.mkdir(fontsDir, { recursive: true })

  const tasks = await readDownloadTasks(configDir)
  if (tasks.length === 0) {
    log("no fonts.downloadFonts entries found in public/config/site*.yaml")
    return
  }

  for (const task of tasks) {
    await ensureFontFile(fontsDir, task)
  }
}

export function fontDownloadPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig | null = null
  let serveChecked = false

  return {
    name: "font-download-plugin",
    configResolved(config) {
      resolvedConfig = config
    },
    async configureServer() {
      if (!resolvedConfig || serveChecked) return
      serveChecked = true
      await ensureFonts(resolvedConfig.root)
    },
    async buildStart() {
      if (!resolvedConfig || resolvedConfig.command !== "build") return
      await ensureFonts(resolvedConfig.root)
    },
  }
}

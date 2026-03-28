import yaml from "js-yaml"

export interface ParsedFrontmatter {
  data: Record<string, unknown>
  content: string
}

export function parseFrontmatter(source: string): ParsedFrontmatter {
  const normalized = source.replace(/^\uFEFF/, "")
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)

  if (!match) {
    return { data: {}, content: source }
  }

  const rawFrontmatter = match[1]
  const content = normalized.slice(match[0].length)

  try {
    const parsed = yaml.load(rawFrontmatter)
    return {
      data: parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {},
      content,
    }
  } catch (error) {
    console.warn("[frontmatter] Failed to parse YAML frontmatter:", error)
    return { data: {}, content: source }
  }
}

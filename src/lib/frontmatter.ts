import yaml from "js-yaml"

export interface ParsedFrontmatter {
  data: Record<string, unknown>
  content: string
}

export function parseFrontmatter(source: string): ParsedFrontmatter {
  if (!source.startsWith("---\n")) {
    return { data: {}, content: source }
  }

  const endIndex = source.indexOf("\n---\n", 4)
  if (endIndex === -1) {
    return { data: {}, content: source }
  }

  const rawFrontmatter = source.slice(4, endIndex)
  const content = source.slice(endIndex + 5)

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

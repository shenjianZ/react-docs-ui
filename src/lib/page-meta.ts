export interface DocGitMeta {
  lastUpdated?: string
  author?: string
}

export interface ResolvedPageMeta {
  lastUpdated?: string
  authors: string[]
}

function normalizeMetaDate(value: unknown) {
  if (typeof value === "string") return value
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }
  return undefined
}

export function resolveDocFilePath(lang: string, pageSlug: string, ext: "md" | "mdx") {
  return `public/docs/${lang}/${pageSlug}.${ext}`
}

export function buildEditUrl(
  template: string | undefined,
  params: Record<string, string | undefined>
) {
  if (!template) return undefined
  return template.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? "")
}

export function resolvePageMeta(options: {
  gitMeta?: DocGitMeta
  frontmatter?: Record<string, unknown> | null
  preferGitMeta?: boolean
}): ResolvedPageMeta {
  const { gitMeta, frontmatter, preferGitMeta = true } = options
  const frontmatterAuthor = Array.isArray(frontmatter?.authors)
    ? frontmatter.authors.filter((value): value is string => typeof value === "string")
    : typeof frontmatter?.author === "string"
      ? [frontmatter.author]
      : []

  const gitAuthors = gitMeta?.author ? [gitMeta.author] : []
  const authors = preferGitMeta && gitAuthors.length > 0 ? gitAuthors : frontmatterAuthor

  const frontmatterLastUpdated = normalizeMetaDate(frontmatter?.lastUpdated)

  const lastUpdated =
    preferGitMeta && gitMeta?.lastUpdated ? gitMeta.lastUpdated : frontmatterLastUpdated

  return { lastUpdated, authors }
}

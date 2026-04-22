export interface ChangelogItem {
  slug: string
  title: string
  version: string
  date: string
  summary: string
  type: string
  breaking: boolean
  draft?: boolean
  path: string
}

export interface ChangelogIndex {
  lang: string
  items: ChangelogItem[]
}

export async function getChangelogIndex(lang: string) {
  const response = await fetch(`/changelog-index-${lang}.json`)
  if (!response.ok) {
    throw new Error(`Failed to fetch changelog index: ${response.status}`)
  }
  return await response.json() as ChangelogIndex
}

export function formatChangelogDate(value: string | Date, lang: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(lang === "en" ? "en-US" : "zh-CN")
}

export function getChangelogTypeLabel(type: string, lang: string) {
  const labels: Record<string, { zh: string; en: string }> = {
    release: { zh: "发布", en: "Release" },
    feature: { zh: "新功能", en: "Feature" },
    fix: { zh: "修复", en: "Fix" },
    breaking: { zh: "破坏性变更", en: "Breaking" },
    deprecation: { zh: "弃用", en: "Deprecation" },
  }
  const normalized = labels[type] || labels.release
  return lang === "en" ? normalized.en : normalized.zh
}

export function getChangelogBadgeVariant(type: string) {
  const variants: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    release: "secondary",
    feature: "success",
    fix: "default",
    breaking: "destructive",
    deprecation: "warning",
  }
  return variants[type] || "secondary"
}

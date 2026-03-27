import type { SiteConfig } from "./config"

export function isKnownVersion(config: SiteConfig | null | undefined, version?: string) {
  if (!version) return false
  if (config?.versions?.enabled === false) return false
  return Boolean(config?.versions?.items?.some((item) => item.value === version))
}

export function buildVersionedPath(lang: string, path: string, version?: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return version ? `/${lang}/v/${version}${normalized}` : `/${lang}${normalized}`
}

export function buildVersionedDocAssetPath(lang: string, pageSlug: string, ext: "md" | "mdx", version?: string) {
  return version
    ? `/docs/${lang}/${version}/${pageSlug}.${ext}`
    : `/docs/${lang}/${pageSlug}.${ext}`
}

export function resolveVersionedDocFilePath(lang: string, pageSlug: string, ext: "md" | "mdx", version?: string) {
  return version
    ? `public/docs/${lang}/${version}/${pageSlug}.${ext}`
    : `public/docs/${lang}/${pageSlug}.${ext}`
}

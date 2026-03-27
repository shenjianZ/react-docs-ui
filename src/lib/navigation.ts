import type { SiteConfig } from "./config"
import type { NavigationItem } from "../components/PageNavigation"
import { buildVersionedPath } from "./versioning"

export interface NavigationResult {
  prev: NavigationItem | null
  next: NavigationItem | null
}

export function getPrevNextPage(
  sidebar: SiteConfig["sidebar"] | undefined,
  currentPath: string,
  firstSegment: string,
  version?: string
): NavigationResult {
  if (!sidebar) {
    return { prev: null, next: null }
  }

  // 扁平化所有页面项
  const allPages: NavigationItem[] = []

  // 优先使用 collections 模式
  const collectionSections = sidebar.collections?.[firstSegment]?.sections
  const globalSections = sidebar.sections
  const sections = collectionSections || globalSections

  if (sections) {
    sections.forEach((section) => {
      // 添加 section 本身（如果有 path）
      if (section.path) {
        allPages.push({
          title: section.title,
          path: buildVersionedPath(currentPath.replace(/^\/([^/]+).*/, "$1"), section.path, version),
        })
      }

      // 添加 children
      if (section.children && section.children.length > 0) {
        section.children.forEach((child) => {
          allPages.push({
            title: child.title,
            path: buildVersionedPath(currentPath.replace(/^\/([^/]+).*/, "$1"), child.path, version),
          })
        })
      }
    })
  }

  // 找到当前页面的索引
  // 移除语言前缀（如 /zh-cn 或 /en）来匹配配置中的路径
  const currentIndex = allPages.findIndex((page) => currentPath === page.path)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex > 0 ? allPages[currentIndex - 1] : null,
    next: currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null,
  }
}

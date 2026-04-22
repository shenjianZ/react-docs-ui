import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { buildVersionedPath } from "@/lib/versioning"
import type { SiteConfig } from "@/lib/config"

interface BreadcrumbItem {
  title: string
  path: string
}

interface BreadcrumbProps {
  lang: string
  version?: string
  sidebar: SiteConfig["sidebar"]
  frontmatterTitle?: string
  labels?: {
    home?: string
    showHome?: boolean
  }
}

function findBreadcrumbPath(
  sidebar: SiteConfig["sidebar"],
  currentPath: string,
  lang: string
): BreadcrumbItem[] {
  if (!sidebar) return []

  const parts = currentPath.split("/").filter(Boolean)
  // parts: ["zh-cn", "guide", "introduction"] or ["zh-cn", "changelog", "v0.7.0"]
  if (parts.length < 2) return []

  const firstSegment = parts[1] === "v" ? parts[3] || "" : parts[1] || ""
  const collectionSections = sidebar.collections?.[firstSegment]?.sections
  const globalSections = sidebar.sections
  const sections = collectionSections || globalSections

  if (!sections) return []

  const breadcrumbs: BreadcrumbItem[] = []

  for (const section of sections) {
    if (section.path) {
      const sectionFullPath = `/${lang}${section.path}`
      if (currentPath === sectionFullPath || currentPath.startsWith(sectionFullPath + "/")) {
        breadcrumbs.push({ title: section.title, path: sectionFullPath })

        if (section.children) {
          for (const child of section.children) {
            const childFullPath = `/${lang}${child.path}`
            if (currentPath === childFullPath || currentPath.startsWith(childFullPath + "/")) {
              breadcrumbs.push({ title: child.title, path: childFullPath })
              break
            }
          }
        }
        break
      }
    } else {
      // Section without path — check children
      if (section.children) {
        for (const child of section.children) {
          const childFullPath = `/${lang}${child.path}`
          if (currentPath === childFullPath || currentPath.startsWith(childFullPath + "/")) {
            breadcrumbs.push({ title: section.title, path: "" })
            breadcrumbs.push({ title: child.title, path: childFullPath })
            break
          }
        }
        if (breadcrumbs.length > 0) break
      }
    }
  }

  // Changelog special case
  if (firstSegment === "changelog" && breadcrumbs.length === 0) {
    const changelogPath = `/${lang}/changelog`
    breadcrumbs.push({ title: lang === "en" ? "Changelog" : "更新日志", path: changelogPath })
  }

  return breadcrumbs
}

function normalizeBreadcrumbTitle(title?: string) {
  return title?.replace(/\s+/g, " ").trim().toLowerCase() || ""
}

export function Breadcrumb({ lang, version, sidebar, frontmatterTitle, labels }: BreadcrumbProps) {
  const location = useLocation()
  const pathname = location.pathname

  const items = React.useMemo(() => {
    return findBreadcrumbPath(sidebar, pathname, lang)
  }, [sidebar, pathname, lang])

  const lastItemTitle = items.at(-1)?.title
  const displayFrontmatterTitle =
    frontmatterTitle &&
    normalizeBreadcrumbTitle(frontmatterTitle) !== normalizeBreadcrumbTitle(lastItemTitle)

  if (items.length === 0) return null

  const homePath = buildVersionedPath(lang, "/", version)
  const homeLabel = labels?.home || (lang === "en" ? "Home" : "首页")
  const showHome = labels?.showHome !== false

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {showHome && (
          <li className="flex items-center">
            <Link
              to={homePath}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>{homeLabel}</span>
            </Link>
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1 && !displayFrontmatterTitle
          return (
            <li key={`${item.path}-${index}`} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              {isLast || !item.path ? (
                <span className={isLast ? "text-foreground font-medium" : ""}>
                  {item.title}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-foreground transition-colors"
                >
                  {item.title}
                </Link>
              )}
            </li>
          )
        })}
        {displayFrontmatterTitle && items.length > 0 && (
          <li className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {frontmatterTitle}
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}

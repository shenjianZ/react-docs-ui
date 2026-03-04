import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight } from "lucide-react"

export interface NavigationItem {
  title: string
  path: string
}

export interface PageNavigationProps {
  prev?: NavigationItem | null
  next?: NavigationItem | null
  lang: string
}

const i18n = {
  "zh-cn": {
    prev: "上一节",
    next: "下一节",
  },
  en: {
    prev: "Previous",
    next: "Next",
  },
}

function handleNavigationClick(e: React.MouseEvent<HTMLAnchorElement>, targetPath: string) {
  e.preventDefault()

  try {
    const stored = sessionStorage.getItem("scroll-positions")
    if (stored) {
      const positions = JSON.parse(stored)

      // 清除当前页面的滚动位置
      const currentKey = window.location.pathname + window.location.search
      delete positions[currentKey]

      // 清除目标页面的滚动位置
      const targetKey = targetPath + window.location.search
      delete positions[targetKey]

      sessionStorage.setItem("scroll-positions", JSON.stringify(positions))
    }
  } catch {
    // ignore
  }

  // 导航到目标页面
  const href = e.currentTarget.getAttribute('href')
  if (href) {
    window.location.href = href
  }
}

export function PageNavigation({ prev, next, lang }: PageNavigationProps) {
  console.log("PageNavigation render:", {
    prev,
    next,
    lang,
    prevType: typeof prev,
    nextType: typeof next,
    prevNull: prev === null,
    nextNull: next === null,
    prevUndefined: prev === undefined,
    nextUndefined: next === undefined
  })

  if (!prev && !next) {
    console.log("PageNavigation returning null because prev and next are both falsy")
    return null
  }

  const texts = i18n[lang as keyof typeof i18n] || i18n["zh-cn"]

  return (
    <div className="flex flex-row gap-4 mt-8 pt-8 border-t">
      {prev && (
        <Link
          to={`/${lang}${prev.path}`}
          onClick={(e) => handleNavigationClick(e, `/${lang}${prev.path}`)}
          className="flex items-center flex-1 min-w-0 group hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
          <div className="flex flex-col min-w-0">
            <div className="text-xs text-muted-foreground mb-1">{texts.prev}</div>
            <div className="font-medium text-sm truncate">{prev.title}</div>
          </div>
        </Link>
      )}
      {next && (
        <Link
          to={`/${lang}${next.path}`}
          onClick={(e) => handleNavigationClick(e, `/${lang}${next.path}`)}
          className="flex items-center justify-end flex-1 min-w-0 text-right group hover:text-foreground transition-colors"
        >
          <div className="flex flex-col min-w-0">
            <div className="text-xs text-muted-foreground mb-1">{texts.next}</div>
            <div className="font-medium text-sm truncate">{next.title}</div>
          </div>
          <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
        </Link>
      )}
    </div>
  )
}
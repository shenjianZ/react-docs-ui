import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingNavBallProps {
  lang: string
  items: {
    title: string
    link: string
    external?: boolean
    visible?: boolean
  }[]
}

const translations = {
  "zh-cn": {
    openNav: "打开导航",
    closeNav: "关闭导航"
  },
  en: {
    openNav: "Open navigation",
    closeNav: "Close navigation"
  }
}

export function FloatingNavBall({ lang, items }: FloatingNavBallProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const currentLang = location.pathname.startsWith("/en") ? "en" : "zh-cn"
  const t = translations[currentLang]

  const filteredItems = items.filter(i => i.visible !== false && !i.external)

  if (filteredItems.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      {/* 悬浮球按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 w-10 rounded-full shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-300 ease-in-out",
          isOpen ? "rotate-180 scale-110" : "hover:scale-110",
          "bg-primary text-primary-foreground"
        )}
        aria-label={isOpen ? t.closeNav : t.openNav}
      >
        {isOpen ? <X className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
      </button>

      {/* 导航菜单 */}
      <div
        className={cn(
          "absolute bottom-12 right-0 w-40",
          "transition-all duration-300 ease-in-out",
          "origin-bottom-right",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="rounded-lg bg-background border border-border shadow-xl overflow-hidden">
          {filteredItems.map(item => {
            const isActive = pathname === `/${lang}${item.link}`
            return (
              <Link
                key={item.link}
                to={`/${lang}${item.link}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-5 py-3 text-sm transition-colors",
                  "first:rounded-t-lg last:rounded-b-lg",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
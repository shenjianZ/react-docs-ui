import { Github, MoreVertical, Search } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { SearchTrigger } from "@/components/search"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ModeToggle } from "@/components/mode-toggle"
import { buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Define SiteConfig types locally as they are not available in the Vite project
interface SiteConfig {
  site: {
    title: string
    logo: string | { light: string; dark: string }
  }
  navbar: {
    showLogo?: boolean
    showTitle?: boolean
    showLanguageSwitcher?: boolean
    items: {
      title: string
      link: string
      external?: boolean
      visible?: boolean
    }[]
    actions?: {
      type?: "github" | "custom"
      title?: string
      link: string
      icon?: string
      enabled?: boolean
    }[]
  }
  theme?: {
    allowToggle?: boolean
  }
}

interface HeaderNavProps {
  lang: string
  site: SiteConfig["site"]
  navbar: SiteConfig["navbar"]
  themeConfig?: { allowToggle?: boolean }
  searchConfig?: {
    enabled?: boolean
    placeholder?: string
  }
}

export function HeaderNav({ lang, site, navbar, themeConfig, searchConfig }: HeaderNavProps) {
  const location = useLocation()
  const pathname = location.pathname
  const { theme } = useTheme()
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const searchEnabled = searchConfig?.enabled !== false

  const translations = {
    "zh-cn": {
      switchLanguage: "切换语言",
      switchTheme: "切换主题",
      moreOptions: "更多选项",
      searchPlaceholder: "搜索文档...",
      search: "搜索",
    },
    en: {
      switchLanguage: "Switch language",
      switchTheme: "Toggle theme",
      moreOptions: "More options",
      searchPlaceholder: "Search docs...",
      search: "Search",
    },
  }
  
  const currentLang = location.pathname.startsWith("/en") ? "en" : "zh-cn"
  const t = translations[currentLang]

  useEffect(() => {
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setResolvedTheme(isDark ? "dark" : "light")
    } else {
      setResolvedTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setResolvedTheme(isDark ? "dark" : "light")
    } else {
      setResolvedTheme(theme)
    }
  }, [theme])
  const normalizeLogoPath = (p: string) => (p.startsWith("http") ? p : `/${p.replace(/^\//, "")}`)
  const { light: logoLight, dark: logoDark } =
    typeof site.logo === "string"
      ? {
          light: normalizeLogoPath(site.logo),
          dark: normalizeLogoPath(site.logo),
        }
      : {
          light: normalizeLogoPath(site.logo.light),
          dark: normalizeLogoPath(site.logo.dark),
        }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
        {(((navbar.showLogo ?? true) as boolean) || ((navbar.showTitle ?? true) as boolean)) && (
          <div className="mr-6 flex items-center space-x-2 flex-shrink-0">
            {(navbar.showLogo ?? true) && (
              <img
                src={resolvedTheme === "dark" ? logoDark : logoLight}
                alt={site.title}
                width={24}
                height={24}
              />
            )}
            {(navbar.showTitle ?? true) && (
              <span className="font-bold sm:inline-block whitespace-nowrap">{site.title}</span>
            )}
          </div>
        )}
        <nav className="ml-6 flex items-center space-x-6 text-sm font-medium hidden md:flex">
          {navbar.items.filter(i => i.visible !== false).map(
            item =>
              !item.external && (
                <Link
                  key={item.link}
                  to={`/${lang}${item.link}`}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    (item.link === "/" 
                      ? pathname === `/${lang}` || pathname === `/${lang}/`
                      : pathname.startsWith(`/${lang}${item.link}`))
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end">
          {/* 搜索按钮 - 仅桌面端显示 */}
          {searchEnabled && (
            <div className="hidden md:block">
              <SearchTrigger placeholder={searchConfig?.placeholder || t.searchPlaceholder} />
            </div>
          )}
          {/* 桌面端：显示独立图标 */}
          <nav className="flex items-center space-x-2 hidden md:flex">
            {(navbar.actions || [])
              .filter(action => action.enabled !== false)
              .map((action, idx) => {
                const title = action.title || (action.type === "github" ? "GitHub" : "Action")
                return (
                  <TooltipProvider key={action.link || `${action.type || 'action'}-${idx}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={action.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={title}
                        >
                          <div
                            className={cn(
                              buttonVariants({ variant: "ghost" }),
                              "w-9 px-0"
                            )}
                          >
                            {action.type === "github" ? (
                              <Github className="h-4 w-4" />
                            ) : (
                              <span className="text-sm">{title}</span>
                            )}
                          </div>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent align="center">{title}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            {navbar.showLanguageSwitcher !== false && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <LanguageSwitcher />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent align="center">{t.switchLanguage}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {(themeConfig?.allowToggle ?? true) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ModeToggle />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent align="center">{t.switchTheme}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </nav>
          {/* 移动端：显示下拉菜单 */}
          <div className="relative md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-9 px-0 flex-shrink-0"
                  )}
                  aria-label={t.moreOptions}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[40px]">
                {(navbar.actions || [])
                  .filter(action => action.enabled !== false)
                  .map((action, idx) => {
                    return (
                      <DropdownMenuItem key={action.link || `${action.type || 'action'}-${idx}`} asChild>
                        <a
                          href={action.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full h-9"
                        >
                          {action.type === "github" && <Github className="h-4 w-4" />}
                        </a>
                      </DropdownMenuItem>
                    )
                  })}
                {navbar.showLanguageSwitcher !== false && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center justify-center w-full h-9">
                      <LanguageSwitcher />
                    </DropdownMenuItem>
                  </>
                )}
                {(themeConfig?.allowToggle ?? true) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center justify-center w-full h-9">
                      <ModeToggle />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

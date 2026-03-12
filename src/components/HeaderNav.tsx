import type { LucideIcon } from "lucide-react"
import { ExternalLink, Gitlab, Github, Globe, Monitor, Moon, MoreVertical, Sun } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { type ReactNode, useEffect, useState } from "react"
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
      type?: string
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

function GiteeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.59.59 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z" />
    </svg>
  )
}

function GiteaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.209 4.603c-.247 0-.525.02-.84.088c-.333.07-1.28.283-2.054 1.027C-.403 7.25.035 9.685.089 10.052c.065.446.263 1.687 1.21 2.768c1.749 2.141 5.513 2.092 5.513 2.092s.462 1.103 1.168 2.119c.955 1.263 1.936 2.248 2.89 2.367c2.406 0 7.212-.004 7.212-.004s.458.004 1.08-.394c.535-.324 1.013-.893 1.013-.893s.492-.527 1.18-1.73c.21-.37.385-.729.538-1.068c0 0 2.107-4.471 2.107-8.823c-.042-1.318-.367-1.55-.443-1.627c-.156-.156-.366-.153-.366-.153s-4.475.252-6.792.306c-.508.011-1.012.023-1.512.027v4.474l-.634-.301c0-1.39-.004-4.17-.004-4.17c-1.107.016-3.405-.084-3.405-.084s-5.399-.27-5.987-.324c-.187-.011-.401-.032-.648-.032zm.354 1.832h.111s.271 2.269.6 3.597C5.549 11.147 6.22 13 6.22 13s-.996-.119-1.641-.348c-.99-.324-1.409-.714-1.409-.714s-.73-.511-1.096-1.52C1.444 8.73 2.021 7.7 2.021 7.7s.32-.859 1.47-1.145c.395-.106.863-.12 1.072-.12m8.33 2.554c.26.003.509.127.509.127l.868.422l-.529 1.075a.69.69 0 0 0-.614.359a.69.69 0 0 0 .072.756l-.939 1.924a.69.69 0 0 0-.66.527a.69.69 0 0 0 .347.763a.686.686 0 0 0 .867-.206a.69.69 0 0 0-.069-.882l.916-1.874a.7.7 0 0 0 .237-.02a.66.66 0 0 0 .271-.137a9 9 0 0 1 1.016.512a.76.76 0 0 1 .286.282c.073.21-.073.569-.073.569c-.087.29-.702 1.55-.702 1.55a.69.69 0 0 0-.676.477a.681.681 0 1 0 1.157-.252c.073-.141.141-.282.214-.431c.19-.397.515-1.16.515-1.16c.035-.066.218-.394.103-.814c-.095-.435-.48-.638-.48-.638c-.467-.301-1.116-.58-1.116-.58s0-.156-.042-.27a.7.7 0 0 0-.148-.241l.516-1.062l2.89 1.401s.48.218.583.619c.073.282-.019.534-.069.657c-.24.587-2.1 4.317-2.1 4.317s-.232.554-.748.588a1.1 1.1 0 0 1-.393-.045l-.202-.08l-4.31-2.1s-.417-.218-.49-.596c-.083-.31.104-.691.104-.691l2.073-4.272s.183-.37.466-.497a.9.9 0 0 1 .35-.077" />
    </svg>
  )
}

function resolveActionKind(action: { type?: string; icon?: string; title?: string; link: string }) {
  const explicit = (action.icon || action.type || "").trim().toLowerCase()
  if (explicit) return explicit

  try {
    const hostname = new URL(action.link).hostname.toLowerCase()
    if (hostname.includes("github")) return "github"
    if (hostname.includes("gitee")) return "gitee"
    if (hostname.includes("gitea")) return "gitea"
    if (hostname.includes("gitlab")) return "gitlab"
  } catch {
    // Ignore relative or invalid URLs and fall back to title/default handling.
  }

  return "external"
}

function getActionTitle(action: { type?: string; icon?: string; title?: string; link: string }) {
  const kind = resolveActionKind(action)
  if (action.title) return action.title
  if (kind === "github") return "GitHub"
  if (kind === "gitee") return "Gitee"
  if (kind === "gitea") return "Gitea"
  if (kind === "gitlab") return "GitLab"
  return "Link"
}

function getActionIcon(action: { type?: string; icon?: string; title?: string; link: string }): ReactNode {
  const kind = resolveActionKind(action)
  const iconClassName =
    kind === "github" ? "h-4 w-4" : kind === "gitee" ? "h-[18px] w-[18px]" : "h-5 w-5"
  const iconMap: Record<string, LucideIcon> = {
    github: Github,
    gitlab: Gitlab,
    globe: Globe,
    link: ExternalLink,
    external: ExternalLink,
  }

  if (kind === "gitee") return <GiteeIcon className={iconClassName} />
  if (kind === "gitea") return <GiteaIcon className={iconClassName} />

  const Icon = iconMap[kind]
  if (Icon) return <Icon className={iconClassName} />

  if (action.title) {
    return (
      <span className="text-[11px] font-medium uppercase leading-none">
        {action.title.slice(0, 2)}
      </span>
    )
  }

  return <ExternalLink className={iconClassName} />
}

export function HeaderNav({ lang, site, navbar, themeConfig, searchConfig }: HeaderNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const { theme, setTheme } = useTheme()
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const searchEnabled = searchConfig?.enabled !== false

  const translations = {
    "zh-cn": {
      switchLanguage: "切换语言",
      switchTheme: "切换主题",
      moreOptions: "更多选项",
      language: "语言",
      theme: "主题",
      light: "浅色",
      dark: "深色",
      system: "跟随系统",
      searchPlaceholder: "搜索文档...",
      search: "搜索",
    },
    en: {
      switchLanguage: "Switch language",
      switchTheme: "Toggle theme",
      moreOptions: "More options",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      searchPlaceholder: "Search docs...",
      search: "Search",
    },
  }

  const currentLang = location.pathname.startsWith("/en") ? "en" : "zh-cn"
  const t = translations[currentLang]
  const locales = [
    { code: "en", name: "English" },
    { code: "zh-cn", name: "简体中文" },
  ]

  const handleLanguageChange = (newLocale: string) => {
    const pathParts = location.pathname.split("/").filter(Boolean)
    if (pathParts.length > 0 && (pathParts[0] === "en" || pathParts[0] === "zh-cn")) {
      pathParts[0] = newLocale
    } else {
      pathParts.unshift(newLocale)
    }
    navigate(`/${pathParts.join("/")}`)
  }

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-print-hidden>
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
                const title = getActionTitle(action)
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
                            {getActionIcon(action)}
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
                    const title = getActionTitle(action)
                    return (
                      <DropdownMenuItem key={action.link || `${action.type || 'action'}-${idx}`} asChild>
                        <a
                          href={action.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full h-9"
                        >
                          {getActionIcon(action)}
                          <span>{title}</span>
                        </a>
                      </DropdownMenuItem>
                    )
                  })}
                {navbar.showLanguageSwitcher !== false && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{t.language}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent alignOffset={-4}>
                        <DropdownMenuRadioGroup value={currentLang}>
                          {locales.map((locale) => (
                            <DropdownMenuRadioItem
                              key={locale.code}
                              value={locale.code}
                              onClick={() => handleLanguageChange(locale.code)}
                            >
                              {locale.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </>
                )}
                {(themeConfig?.allowToggle ?? true) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2">
                        {resolvedTheme === "dark" ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                        <span>{t.theme}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent alignOffset={-4}>
                        <DropdownMenuRadioGroup value={theme}>
                          <DropdownMenuRadioItem value="light" onClick={() => setTheme("light")}>
                            <span className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              <span>{t.light}</span>
                            </span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="dark" onClick={() => setTheme("dark")}>
                            <span className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              <span>{t.dark}</span>
                            </span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="system" onClick={() => setTheme("system")}>
                            <span className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              <span>{t.system}</span>
                            </span>
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
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

import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useTheme } from "@/components/theme-provider"
import type { SiteConfig } from "@/lib/config"

// 语言翻译
const i18n = {
  "zh-cn": {
    page: "页面",
    copyUrl: "复制当前链接",
    copyTitle: "复制页面标题",
    copyMarkdownLink: "复制 Markdown 链接",
    copySelectedText: "复制",
    openInNewTab: "在新标签页打开",
    reload: "刷新",
    printPage: "打印页面",
    scrollToTop: "回到顶部",
    scrollToBottom: "滚动到底部",
    site: "站点",
    goHome: "返回首页",
    quickNav: "快速跳转",
    docsIndex: "文档首页",
    guide: "指南",
    introduction: "简介",
    installation: "安装",
    quickStart: "快速开始",
    configuration: "配置",
    language: "语言",
    appearance: "外观",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
    resetThemePref: "重置主题偏好",
  },
  en: {
    page: "Page",
    copyUrl: "Copy Current URL",
    copyTitle: "Copy Page Title",
    copyMarkdownLink: "Copy Markdown Link",
    copySelectedText: "Copy",
    openInNewTab: "Open in New Tab",
    reload: "Reload",
    printPage: "Print Page",
    scrollToTop: "Scroll to Top",
    scrollToBottom: "Scroll to Bottom",
    site: "Site",
    goHome: "Go Home",
    quickNav: "Quick Navigation",
    docsIndex: "Docs Index",
    guide: "Guide",
    introduction: "Introduction",
    installation: "Installation",
    quickStart: "Quick Start",
    configuration: "Configuration",
    language: "Language",
    appearance: "Appearance",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    resetThemePref: "Reset Theme Preference",
  },
}

// 默认配置
const defaultContextMenuConfig: Required<SiteConfig>["contextMenu"] = {
  enabled: true,
  page: {
    copyUrl: true,
    copyTitle: true,
    copyMarkdownLink: true,
    copySelectedText: true,
    openInNewTab: true,
    reload: true,
    printPage: true,
    scrollToTop: true,
    scrollToBottom: true,
  },
  site: {
    goHome: true,
    quickNav: true,
    language: true,
  },
  appearance: {
    theme: true,
    resetThemePref: true,
  },
}

export function GlobalContextMenu({
  children,
  config,
}: {
  children: React.ReactNode
  config?: SiteConfig["contextMenu"]
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const copyToClipboard = useCallback(async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(textarea)
      }
    }
  }, [])

  const copyUrl = useCallback(async () => {
    try {
      await copyToClipboard(window.location.href)
    } catch {
      // ignore
    }
  }, [copyToClipboard])

  const copyTitle = useCallback(async () => {
    try {
      await copyToClipboard(document.title || "")
    } catch {
      // ignore
    }
  }, [copyToClipboard])

  const copyMarkdownLink = useCallback(async () => {
    try {
      const title = document.title || "Docs"
      const url = window.location.href
      await copyToClipboard(`[${title}](${url})`)
    } catch {
      // ignore
    }
  }, [copyToClipboard])

  const copySelectedText = useCallback(async () => {
    try {
      const selectedText = window.getSelection()?.toString() || ""
      if (selectedText) {
        await copyToClipboard(selectedText)
      }
    } catch {
      // ignore
    }
  }, [copyToClipboard])

  const openInNewTab = useCallback(() => {
    window.open(window.location.href, "_blank")
  }, [])

  const reload = useCallback(() => {
    window.location.reload()
  }, [])

  const goHome = useCallback(() => navigate("/"), [navigate])

  const currentLang = (location.pathname.startsWith("/en") ? "en" : "zh-cn")
  const t = i18n[currentLang]

  const goLang = useCallback(
    (code: string) => {
      const parts = location.pathname.split("/").filter(Boolean)
      if (parts.length > 0 && (parts[0] === "en" || parts[0] === "zh-cn")) {
        parts[0] = code
      } else {
        parts.unshift(code)
      }
      navigate("/" + parts.join("/"))
    },
    [location.pathname, navigate]
  )

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), [])
  const scrollToBottom = useCallback(
    () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }),
    []
  )

  const printPage = useCallback(() => window.print(), [])

  const quickNav = useCallback((slug: string) => navigate(`/${currentLang}/${slug}`), [navigate, currentLang])

  const resetThemePref = useCallback(() => {
    try {
      localStorage.removeItem("vite-ui-theme")
    } catch {
      // ignore
    }
  }, [])

  // 合并配置
  const menuConfig = config?.enabled === false ? null : { ...defaultContextMenuConfig, ...config }

  // 如果菜单被禁用，直接返回 children
  if (!menuConfig) {
    return <div className="min-h-screen">{children}</div>
  }

  const pageConfig = { ...defaultContextMenuConfig.page, ...menuConfig.page }
  const siteConfig = { ...defaultContextMenuConfig.site, ...menuConfig.site }
  const appearanceConfig = { ...defaultContextMenuConfig.appearance, ...menuConfig.appearance }

  // 检查页面组是否有任何启用的项
  const hasPageItems = Object.values(pageConfig).some(Boolean)
  // 检查站点组是否有任何启用的项
  const hasSiteItems = Object.values(siteConfig).some(Boolean)
  // 检查外观组是否有任何启用的项
  const hasAppearanceItems = Object.values(appearanceConfig).some(Boolean)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="min-h-screen">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {/* 页面组 */}
        {hasPageItems && (
          <>
            <ContextMenuLabel>{t.page}</ContextMenuLabel>
            <ContextMenuGroup>
              {pageConfig.copyUrl && <ContextMenuItem onClick={copyUrl}>{t.copyUrl}</ContextMenuItem>}
              {pageConfig.copyTitle && <ContextMenuItem onClick={copyTitle}>{t.copyTitle}</ContextMenuItem>}
              {pageConfig.copyMarkdownLink && <ContextMenuItem onClick={copyMarkdownLink}>{t.copyMarkdownLink}</ContextMenuItem>}
              {pageConfig.copySelectedText && <ContextMenuItem onClick={copySelectedText}>{t.copySelectedText}</ContextMenuItem>}
              {pageConfig.openInNewTab && <ContextMenuItem onClick={openInNewTab}>{t.openInNewTab}</ContextMenuItem>}
              {pageConfig.reload && <ContextMenuItem onClick={reload}>{t.reload}</ContextMenuItem>}
              {pageConfig.printPage && <ContextMenuItem onClick={printPage}>{t.printPage}</ContextMenuItem>}
              {(pageConfig.scrollToTop || pageConfig.scrollToBottom) && (
                <>
                  <ContextMenuSeparator />
                  {pageConfig.scrollToTop && <ContextMenuItem onClick={scrollToTop}>{t.scrollToTop}</ContextMenuItem>}
                  {pageConfig.scrollToBottom && <ContextMenuItem onClick={scrollToBottom}>{t.scrollToBottom}</ContextMenuItem>}
                </>
              )}
            </ContextMenuGroup>
          </>
        )}

        {/* 站点组 */}
        {hasSiteItems && (
          <>
            {hasPageItems && <ContextMenuSeparator />}
            <ContextMenuLabel>{t.site}</ContextMenuLabel>
            <ContextMenuGroup>
              {siteConfig.goHome && <ContextMenuItem onClick={goHome}>{t.goHome}</ContextMenuItem>}
              {siteConfig.quickNav && (
                <ContextMenuSub>
                  <ContextMenuSubTrigger>{t.quickNav}</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem onClick={() => quickNav("index")}>{t.docsIndex}</ContextMenuItem>
                    <ContextMenuItem onClick={() => quickNav("guide")}>{t.guide}</ContextMenuItem>
                    <ContextMenuItem onClick={() => quickNav("guide/introduction")}>{t.introduction}</ContextMenuItem>
                    <ContextMenuItem onClick={() => quickNav("guide/installation")}>{t.installation}</ContextMenuItem>
                    <ContextMenuItem onClick={() => quickNav("guide/quick-start")}>{t.quickStart}</ContextMenuItem>
                    <ContextMenuItem onClick={() => quickNav("guide/configuration")}>{t.configuration}</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              )}
              {siteConfig.language && (
                <ContextMenuSub>
                  <ContextMenuSubTrigger>{t.language}</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuRadioGroup value={currentLang}>
                      <ContextMenuRadioItem value="en" onClick={() => goLang("en")}>English</ContextMenuRadioItem>
                      <ContextMenuRadioItem value="zh-cn" onClick={() => goLang("zh-cn")}>简体中文</ContextMenuRadioItem>
                    </ContextMenuRadioGroup>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              )}
            </ContextMenuGroup>
          </>
        )}

        {/* 外观组 */}
        {hasAppearanceItems && (
          <>
            {(hasPageItems || hasSiteItems) && <ContextMenuSeparator />}
            <ContextMenuLabel>{t.appearance}</ContextMenuLabel>
            <ContextMenuGroup>
              {appearanceConfig.theme && (
                <ContextMenuSub>
                  <ContextMenuSubTrigger>{t.theme}</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuRadioGroup value={theme}>
                      <ContextMenuRadioItem value="light" onClick={() => setTheme("light")}>{t.light}</ContextMenuRadioItem>
                      <ContextMenuRadioItem value="dark" onClick={() => setTheme("dark")}>{t.dark}</ContextMenuRadioItem>
                      <ContextMenuRadioItem value="system" onClick={() => setTheme("system")}>{t.system}</ContextMenuRadioItem>
                    </ContextMenuRadioGroup>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              )}
              {appearanceConfig.resetThemePref && <ContextMenuItem onClick={resetThemePref}>{t.resetThemePref}</ContextMenuItem>}
            </ContextMenuGroup>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}



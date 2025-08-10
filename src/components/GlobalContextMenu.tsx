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

export function GlobalContextMenu({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // ignore
    }
  }, [])

  const copyTitle = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(document.title || "")
    } catch {
      // ignore
    }
  }, [])

  const copyMarkdownLink = useCallback(async () => {
    try {
      const title = document.title || "Docs"
      const url = window.location.href
      await navigator.clipboard.writeText(`[${title}](${url})`)
    } catch {
      // ignore
    }
  }, [])

  const openInNewTab = useCallback(() => {
    window.open(window.location.href, "_blank")
  }, [])

  const reload = useCallback(() => {
    window.location.reload()
  }, [])

  const goHome = useCallback(() => navigate("/"), [navigate])

  const currentLang = (location.pathname.startsWith("/en") ? "en" : "zh-cn")

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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="min-h-screen">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>页面</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem onClick={copyUrl}>复制当前链接</ContextMenuItem>
          <ContextMenuItem onClick={copyTitle}>复制页面标题</ContextMenuItem>
          <ContextMenuItem onClick={copyMarkdownLink}>复制 Markdown 链接</ContextMenuItem>
          <ContextMenuItem onClick={openInNewTab}>在新标签页打开</ContextMenuItem>
          <ContextMenuItem onClick={reload}>刷新</ContextMenuItem>
          <ContextMenuItem onClick={printPage}>打印页面</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={scrollToTop}>回到顶部</ContextMenuItem>
          <ContextMenuItem onClick={scrollToBottom}>滚动到底部</ContextMenuItem>
        </ContextMenuGroup>

        <ContextMenuSeparator />
        <ContextMenuLabel>站点</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem onClick={goHome}>返回首页</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>快速跳转</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => quickNav("index")}>文档首页</ContextMenuItem>
              <ContextMenuItem onClick={() => quickNav("guide")}>指南</ContextMenuItem>
              <ContextMenuItem onClick={() => quickNav("guide/introduction")}>简介</ContextMenuItem>
              <ContextMenuItem onClick={() => quickNav("guide/installation")}>安装</ContextMenuItem>
              <ContextMenuItem onClick={() => quickNav("guide/quick-start")}>快速开始</ContextMenuItem>
              <ContextMenuItem onClick={() => quickNav("guide/configuration")}>配置</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger>语言</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup value={currentLang}>
                <ContextMenuRadioItem value="en" onClick={() => goLang("en")}>English</ContextMenuRadioItem>
                <ContextMenuRadioItem value="zh-cn" onClick={() => goLang("zh-cn")}>简体中文</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>

        <ContextMenuSeparator />
        <ContextMenuLabel>外观</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuSub>
            <ContextMenuSubTrigger>主题</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup value={theme}>
                <ContextMenuRadioItem value="light" onClick={() => setTheme("light")}>浅色</ContextMenuRadioItem>
                <ContextMenuRadioItem value="dark" onClick={() => setTheme("dark")}>深色</ContextMenuRadioItem>
                <ContextMenuRadioItem value="system" onClick={() => setTheme("system")}>跟随系统</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem onClick={resetThemePref}>重置主题偏好</ContextMenuItem>
        </ContextMenuGroup>

        {/* 开发分组已移除 */}
      </ContextMenuContent>
    </ContextMenu>
  )
}



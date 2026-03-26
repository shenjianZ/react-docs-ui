import { Link } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { SiteConfig } from "@/lib/config"
import {
  Globe,
  Mail,
  Tv,
  MessageCircle,
  MessageSquare,
  Send,
  Video,
  BookOpen,
  Flame,
} from "lucide-react"

function GitHubIcon(props: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.4-4-1.4c-.5-1.3-1.3-1.7-1.3-1.7c-1.1-.8.1-.8.1-.8c1.2.1 1.9 1.3 1.9 1.3c1.1 1.9 2.9 1.3 3.6 1c.1-.8.4-1.3.8-1.6c-2.7-.3-5.5-1.4-5.5-6A4.7 4.7 0 0 1 5.8 8.6c-.1-.3-.5-1.5.1-3.1c0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2c.6 1.6.2 2.8.1 3.1a4.7 4.7 0 0 1 1.3 3.3c0 4.6-2.8 5.7-5.5 6c.4.4.8 1 .8 2.1v3.1c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z" /></svg>
}

function YouTubeIcon(props: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2A31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6l-6.2 3.6Z" /></svg>
}

function XIcon(props: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.3L5.6 22H2.5l7.2-8.2L1 2h6.5l4.4 6.7L18.9 2Zm-1.1 18h1.7L6.6 3.9H4.8L17.8 20Z" /></svg>
}

type FooterLink = { title: string; link: string; external?: boolean; action?: "scrollTop" }
type FooterGroup = { title: string; items: FooterLink[] }
type FooterSocial = NonNullable<NonNullable<SiteConfig["footer"]>["social"]>[number]
type FooterConfig = NonNullable<SiteConfig["footer"]>

interface FooterProps {
  footer?: FooterConfig
  lang: string
}

export function Footer({ footer, lang }: FooterProps) {
  if (!footer || footer.enabled === false) return null

  const links = footer.links || []
  const social = footer.social || []
  const groups: FooterGroup[] = footer.groups || []
  const getSocialHref = (item: FooterSocial) => item.url || item.link || "#"
  const isScrollTop = (item: FooterLink) =>
    item.action === "scrollTop" || item.link === "#" || item.link?.startsWith("#")
  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="mt-8" data-print-hidden>
      <div className="container max-w-screen-2xl px-4 md:px-8 py-8 rounded-md border">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          {footer.copyright && (
            <div className="text-foreground/80">{footer.copyright}</div>
          )}
          <div className="flex flex-wrap gap-3 items-center">
            {footer.repository?.url && (
              <a
                className="hover:underline"
                href={footer.repository.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Repo{footer.repository.branch ? ` (${footer.repository.branch})` : ""}
              </a>
            )}
            {footer.lastUpdated && (
              <span className="text-xs">Last updated: {footer.lastUpdated}</span>
            )}
            {footer.version && <Badge variant="warning">{footer.version}</Badge>}
          </div>
        </div>

        {groups.length > 0 && (
          <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group: FooterGroup) => (
              <div key={group.title}>
                <div className="font-medium mb-2">{group.title}</div>
                <ul className="space-y-1 text-sm">
                  {group.items.map((item: FooterLink) => (
                    <li key={`${item.title}-${item.link}`}>
                      {item.external ? (
                        <a
                          className="hover:underline"
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.title}
                        </a>
                      ) : isScrollTop(item) ? (
                        <a href="#" className="hover:underline" onClick={handleScrollTop}>
                          {item.title}
                        </a>
                      ) : (
                        <Link className="hover:underline" to={`/${lang}${item.link}`}>
                          {item.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {groups.length === 0 && links.length > 0 && (
          <div>
            <div className="font-medium mb-2">Links</div>
            <ul className="space-y-1 text-sm">
              {links.map((item: FooterLink) => (
                <li key={`${item.title}-${item.link}`}>
                  {item.external ? (
                    <a
                      className="hover:underline"
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.title}
                    </a>
                  ) : isScrollTop(item) ? (
                    <a href="#" className="hover:underline" onClick={handleScrollTop}>
                      {item.title}
                    </a>
                  ) : (
                    <Link className="hover:underline" to={`/${lang}${item.link}`}>
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {social.length > 0 && (
          <div>
            <div className="font-medium mb-2">Social</div>
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {social.map(s => {
                  const kind = (s.icon || s.name || "").toLowerCase()
                  const Icon = (() => {
                    if (kind.includes("github")) return GitHubIcon
                    if (kind.includes("mail") || kind.includes("email")) return Mail
                    if (kind.includes("bilibili")) return Tv
                    if (kind === "qq") return MessageCircle
                    if (kind.includes("wechat") || kind.includes("weixin")) return MessageSquare
                    if (kind.includes("youtube")) return YouTubeIcon
                    if (kind.includes("twitter") || kind === "x") return XIcon
                    if (kind.includes("discord")) return MessageSquare
                    if (kind.includes("telegram")) return Send
                    if (kind.includes("tiktok") || kind.includes("douyin")) return Video
                    if (kind.includes("weibo")) return Flame
                    if (kind.includes("zhihu")) return BookOpen
                    return Globe
                  })()
                  return (
                    <Tooltip key={`${s.name}-${s.url}`}>
                      <TooltipTrigger asChild>
                        <a
                          href={getSocialHref(s)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.name}
                          className={cn(buttonVariants({ variant: "ghost" }), "w-9 h-9 p-0")}
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent align="center">{s.name}</TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>
          </div>
        )}
        </div>
        <Separator className="my-6" />
        <div className="text-xs text-muted-foreground">
          Built with{" "}
          <a
            className="inline-flex items-center rounded-md border border-transparent bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-200"
            href="https://react-docs-ui.shenjianl.cn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Docs UI
          </a>
        </div>
      </div>
    </footer>
  )
}



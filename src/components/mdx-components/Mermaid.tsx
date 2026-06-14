import * as React from "react"
import { Maximize } from "lucide-react"
import type { MermaidConfig } from "mermaid"

import type { MermaidViewerConfig } from "@/lib/config"
import { getMermaidViewerLabels } from "@/lib/mermaid-viewer"
import { Button } from "@/components/ui/button"
import { MermaidViewer } from "./MermaidViewer"

interface MermaidProps {
  chart: string
  lang?: string
  viewerConfig?: MermaidViewerConfig
}

let mermaidModulePromise: Promise<typeof import("mermaid")> | null = null
let initialized = false

function loadMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("mermaid")
  }
  return mermaidModulePromise
}

// mermaid 会在 <svg> 根标签上写入内联 max-width，导致图被压缩到容器宽度（字体变小）。
// 这里移除该限制，保留 viewBox 与其余样式，让 SVG 以自然像素尺寸渲染。
function cleanSvg(svg: string): string {
  return svg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const cleaned = attrs.replace(
      /\sstyle="([^"]*)"/g,
      (_styleMatch: string, style: string) => {
        const kept = style.replace(/max-width\s*:\s*[^;"}]+;?/gi, "").trim()
        return kept ? ` style="${kept}"` : ""
      }
    )
    return `<svg${cleaned}>`
  })
}

export function Mermaid({ chart, lang = "zh-cn", viewerConfig }: MermaidProps) {
  const id = React.useId().replace(/:/g, "")
  const [svg, setSvg] = React.useState("")
  const [viewerOpen, setViewerOpen] = React.useState(false)

  const labels = React.useMemo(
    () => getMermaidViewerLabels(lang, viewerConfig?.labels),
    [lang, viewerConfig?.labels]
  )

  React.useEffect(() => {
    let cancelled = false

    loadMermaid()
      .then((module) => {
        const mermaid = module.default
        if (!initialized) {
          // 关闭各图类型 useMaxWidth，让 SVG 以自然像素尺寸渲染，避免字体被压缩到看不清。
          const config = {
            startOnLoad: false,
            theme: "default",
            securityLevel: "strict",
            flowchart: { useMaxWidth: false },
            sequence: { useMaxWidth: false },
            class: { useMaxWidth: false },
            state: { useMaxWidth: false },
            er: { useMaxWidth: false },
            gantt: { useMaxWidth: false },
            journey: { useMaxWidth: false },
            pie: { useMaxWidth: false },
            requirement: { useMaxWidth: false },
            gitGraph: { useMaxWidth: false },
            mindmap: { useMaxWidth: false },
            timeline: { useMaxWidth: false },
            quadrantChart: { useMaxWidth: false },
          } satisfies MermaidConfig
          mermaid.initialize(config)
          initialized = true
        }
        return mermaid.render(`mermaid-${id}`, chart)
      })
      .then((result) => {
        if (!cancelled) setSvg(cleanSvg(result.svg))
      })
      .catch((error) => {
        console.error("[Mermaid] render failed:", error)
        if (!cancelled) setSvg("")
      })

    return () => {
      cancelled = true
    }
  }, [chart, id])

  if (!svg) {
    return (
      <pre className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <div className="not-prose relative my-6 rounded-2xl border border-border/60 bg-background">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 z-10 h-8 w-8 bg-background/80 backdrop-blur hover:bg-accent"
        onClick={() => setViewerOpen(true)}
        aria-label={labels.openViewer}
        title={labels.openViewer}
      >
        <Maximize className="h-4 w-4" />
      </Button>

      <div className="custom-scrollbar flex max-h-[70vh] items-center justify-center overflow-auto p-4">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>

      <MermaidViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        svg={svg}
        id={id}
        lang={lang}
        labels={viewerConfig?.labels}
      />
    </div>
  )
}

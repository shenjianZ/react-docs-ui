import * as React from "react"
import {
  Download,
  Maximize,
  Minimize,
  RefreshCw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import type { MermaidViewerConfig } from "@/lib/config"
import { getMermaidViewerLabels } from "@/lib/mermaid-viewer"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogVisuallyHiddenDescription,
  DialogVisuallyHiddenTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const MIN_SCALE = 0.2
const MAX_SCALE = 5
const SCALE_STEP = 0.2
const FIT_PADDING = 48

type FitMode = "fit" | "actual"

export interface MermaidViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  svg: string
  id?: string
  lang?: string
  labels?: MermaidViewerConfig["labels"]
}

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))))
}

// 读取 SVG 自然尺寸：优先 viewBox（用户单位），回退 width/height 属性，再回退 BoundingRect
function getSvgNaturalSize(svg: SVGSVGElement): { w: number; h: number } | null {
  const vb = svg.viewBox?.baseVal
  if (vb && vb.width && vb.height) {
    return { w: vb.width, h: vb.height }
  }
  const w = svg.width?.baseVal?.value
  const h = svg.height?.baseVal?.value
  if (w && h) {
    return { w, h }
  }
  const rect = svg.getBoundingClientRect()
  if (rect.width && rect.height) {
    return { w: rect.width, h: rect.height }
  }
  return null
}

export function MermaidViewer({
  open,
  onOpenChange,
  svg,
  id,
  lang = "zh-cn",
  labels,
}: MermaidViewerProps) {
  const mergedLabels = React.useMemo(
    () => getMermaidViewerLabels(lang, labels),
    [lang, labels]
  )
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const [scale, setScale] = React.useState(1)
  const [translate, setTranslate] = React.useState({ x: 0, y: 0 })
  const [fitMode, setFitMode] = React.useState<FitMode>("fit")
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const pointersRef = React.useRef(new Map<number, { x: number; y: number }>())
  const dragStateRef = React.useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const pinchStateRef = React.useRef<{
    startDistance: number
    startScale: number
  } | null>(null)

  const computeFitScale = React.useCallback(() => {
    const viewport = viewportRef.current
    const svgEl = stageRef.current?.querySelector("svg")
    if (!viewport || !svgEl) return 1
    const vw = viewport.clientWidth
    const vh = viewport.clientHeight
    if (!vw || !vh) return 1
    const natural = getSvgNaturalSize(svgEl as SVGSVGElement)
    if (!natural) return 1
    const sx = (vw - FIT_PADDING) / natural.w
    const sy = (vh - FIT_PADDING) / natural.h
    return clampScale(Math.min(sx, sy))
  }, [])

  const resetState = React.useCallback(() => {
    setTranslate({ x: 0, y: 0 })
    setFitMode("fit")
    setIsDragging(false)
    pointersRef.current.clear()
    dragStateRef.current = null
    pinchStateRef.current = null
    setScale(computeFitScale())
  }, [computeFitScale])

  // 打开时计算初始 fit；关闭时退出原生全屏
  React.useEffect(() => {
    if (!open) {
      setIsFullscreen(false)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      return
    }

    setTranslate({ x: 0, y: 0 })
    setFitMode("fit")
    setIsDragging(false)
    pointersRef.current.clear()
    dragStateRef.current = null
    pinchStateRef.current = null

    // 双 rAF 等 Dialog 内容挂载完成后再测量
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setScale(computeFitScale())
      })
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [open, svg, computeFitScale])

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const transformStyle = React.useMemo<React.CSSProperties>(
    () => ({
      transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
      transformOrigin: "center center",
      transition: isDragging ? "none" : "transform 160ms ease",
      cursor: isDragging ? "grabbing" : "grab",
    }),
    [isDragging, scale, translate.x, translate.y]
  )

  const zoomIn = React.useCallback(() => {
    setFitMode("actual")
    setScale((value) => clampScale(value + SCALE_STEP))
  }, [])

  const zoomOut = React.useCallback(() => {
    setFitMode("actual")
    setScale((value) => clampScale(value - SCALE_STEP))
  }, [])

  const setFit = React.useCallback(() => {
    setFitMode("fit")
    setTranslate({ x: 0, y: 0 })
    setScale(computeFitScale())
  }, [computeFitScale])

  const setActualSize = React.useCallback(() => {
    setFitMode("actual")
    setTranslate({ x: 0, y: 0 })
    setScale(1)
  }, [])

  const handleDownload = React.useCallback(() => {
    try {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `mermaid-${id || "diagram"}.svg`
      anchor.rel = "noopener noreferrer"
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
      toast({ description: mergedLabels.downloadSuccess })
    } catch {
      toast({ variant: "destructive", description: mergedLabels.downloadError })
    }
  }, [svg, id, mergedLabels.downloadSuccess, mergedLabels.downloadError])

  const handleFullscreen = React.useCallback(async () => {
    const node = viewportRef.current
    if (!node?.requestFullscreen) {
      toast({ description: mergedLabels.fullscreenError })
      return
    }
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await node.requestFullscreen()
      }
    } catch {
      toast({ description: mergedLabels.fullscreenError })
    }
  }, [mergedLabels.fullscreenError])

  // 键盘快捷键：+/-/0/f
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        zoomIn()
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault()
        zoomOut()
      } else if (event.key === "0") {
        event.preventDefault()
        resetState()
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault()
        void handleFullscreen()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleFullscreen, open, resetState, zoomIn, zoomOut])

  // 滚轮缩放（阻止页面滚动）
  const handleWheel = React.useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.deltaY < 0) {
        zoomIn()
      } else {
        zoomOut()
      }
    },
    [zoomIn, zoomOut]
  )

  React.useEffect(() => {
    if (!open) return

    const node = viewportRef.current
    if (!node) return

    node.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      node.removeEventListener("wheel", handleWheel)
    }
  }, [handleWheel, open])

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return

      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.setPointerCapture(event.pointerId)
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      })

      const pointers = Array.from(pointersRef.current.values())
      if (pointers.length === 2) {
        const [first, second] = pointers
        pinchStateRef.current = {
          startDistance: Math.max(
            1,
            Math.hypot(second.x - first.x, second.y - first.y)
          ),
          startScale: scale,
        }
        dragStateRef.current = null
        setIsDragging(false)
        return
      }

      dragStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: translate.x,
        originY: translate.y,
      }
      setIsDragging(true)
    },
    [scale, translate.x, translate.y]
  )

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      })

      const pointers = Array.from(pointersRef.current.values())
      if (pointers.length === 2 && pinchStateRef.current) {
        const [first, second] = pointers
        const distance = Math.hypot(second.x - first.x, second.y - first.y)
        const nextScale = clampScale(
          pinchStateRef.current.startScale *
            (distance / pinchStateRef.current.startDistance)
        )
        setFitMode("actual")
        setScale(nextScale)
        return
      }

      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) return

      setTranslate({
        x: dragState.originX + (event.clientX - dragState.startX),
        y: dragState.originY + (event.clientY - dragState.startY),
      })
    },
    []
  )

  const stopDragging = React.useCallback(
    (event?: React.PointerEvent<HTMLDivElement>) => {
      if (event && viewportRef.current?.hasPointerCapture(event.pointerId)) {
        viewportRef.current.releasePointerCapture(event.pointerId)
      }
      if (event) {
        pointersRef.current.delete(event.pointerId)
      }
      dragStateRef.current = null
      if (pointersRef.current.size < 2) {
        pinchStateRef.current = null
      }
      setIsDragging(false)
    },
    []
  )

  const actions = React.useMemo(
    () => [
      { key: "zoom-in", label: mergedLabels.zoomIn, icon: ZoomIn, onClick: zoomIn, disabled: scale >= MAX_SCALE },
      { key: "zoom-out", label: mergedLabels.zoomOut, icon: ZoomOut, onClick: zoomOut, disabled: scale <= MIN_SCALE },
      { key: "fit", label: mergedLabels.fit, icon: Minimize, onClick: setFit, disabled: false },
      { key: "actual-size", label: mergedLabels.actualSize, icon: Search, onClick: setActualSize, disabled: false },
      { key: "reset", label: mergedLabels.reset, icon: RefreshCw, onClick: resetState, disabled: false },
      { key: "fullscreen", label: mergedLabels.fullscreen, icon: Maximize, onClick: () => void handleFullscreen(), disabled: false },
      { key: "download", label: mergedLabels.download, icon: Download, onClick: handleDownload, disabled: false },
    ],
    [
      handleDownload,
      handleFullscreen,
      mergedLabels.actualSize,
      mergedLabels.download,
      mergedLabels.fit,
      mergedLabels.fullscreen,
      mergedLabels.reset,
      mergedLabels.zoomIn,
      mergedLabels.zoomOut,
      resetState,
      scale,
      setActualSize,
      setFit,
      zoomIn,
      zoomOut,
    ]
  )

  if (!svg) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(94vh,980px)] w-[calc(100vw-0.75rem)] sm:w-[40rem] md:w-[52rem] lg:w-[64rem] xl:w-[74rem] 2xl:w-[86rem] max-w-[calc(100vw-0.75rem)] flex-col gap-3 border-zinc-800 bg-zinc-950 p-3 text-zinc-50 sm:max-w-[calc(100vw-2rem)] sm:p-4"
      >
        <DialogVisuallyHiddenTitle>{mergedLabels.openViewer}</DialogVisuallyHiddenTitle>
        <DialogVisuallyHiddenDescription>{mergedLabels.close}</DialogVisuallyHiddenDescription>

        <TooltipProvider delayDuration={100}>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
            <p className="text-xs text-zinc-400">
              {fitMode === "fit" ? mergedLabels.fit : `${Math.round(scale * 100)}%`}
              {isFullscreen ? ` · ${mergedLabels.fullscreen}` : ""}
            </p>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0 text-zinc-100 hover:bg-zinc-800 hover:text-white"
              onClick={() => onOpenChange(false)}
              aria-label={mergedLabels.close}
              title={mergedLabels.close}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/80 px-2 py-2">
            <div className="flex min-w-max items-center gap-2">
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <Tooltip key={action.key}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        aria-label={action.label}
                        title={action.label}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </TooltipProvider>

        <div
          ref={viewportRef}
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%),linear-gradient(180deg,_rgba(24,24,27,0.9),_rgba(9,9,11,1))] p-4 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <div ref={stageRef} className="select-none" style={transformStyle}>
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

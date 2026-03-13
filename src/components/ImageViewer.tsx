import * as React from "react"
import {
  Download,
  ExternalLink,
  Maximize,
  Minimize,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import type { ImageViewerConfig } from "@/lib/config"
import { getImageViewerLabels } from "@/lib/image-viewer"
import { cn } from "@/lib/utils"
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

type FitMode = "fit" | "actual"

export interface ImageViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt?: string
  title?: string
  lang?: string
  labels?: ImageViewerConfig["labels"]
}

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))))
}

function getDownloadFilename(src: string, title?: string, alt?: string) {
  const fallbackName = (title || alt || "image")
    .trim()
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code < 32 || '<>:"/\\|?*'.includes(char)) {
        return "-"
      }
      return char
    })
    .join("")
  const pathname = src.split("?")[0]?.split("#")[0] ?? src
  const segment = pathname.split("/").pop()?.trim()
  return segment || fallbackName || "image"
}

function triggerAnchorDownload(href: string, filename: string) {
  const anchor = document.createElement("a")
  anchor.href = href
  anchor.download = filename
  anchor.rel = "noopener noreferrer"
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

function canUseNativeDownload(src: string) {
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return true
  }

  try {
    const url = new URL(src, window.location.href)
    return url.origin === window.location.origin
  } catch {
    return false
  }
}

export function ImageViewer({
  open,
  onOpenChange,
  src,
  alt,
  title,
  lang = "zh-cn",
  labels,
}: ImageViewerProps) {
  const mergedLabels = React.useMemo(
    () => getImageViewerLabels(lang, labels),
    [lang, labels]
  )
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const imageRef = React.useRef<HTMLImageElement | null>(null)
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [fitMode, setFitMode] = React.useState<FitMode>("fit")
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [loadError, setLoadError] = React.useState(false)

  const effectiveAlt = alt?.trim() || title?.trim() || mergedLabels.imageAltFallback

  const resetState = React.useCallback(() => {
    setScale(1)
    setRotation(0)
    setFitMode("fit")
    setLoadError(false)
  }, [])

  React.useEffect(() => {
    if (open) {
      resetState()
      return
    }

    setIsFullscreen(false)
  }, [open, resetState])

  React.useEffect(() => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false)
    }
  }, [open])

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const transformStyle = React.useMemo<React.CSSProperties>(() => {
    return {
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      transition: "transform 160ms ease",
    }
  }, [rotation, scale])

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
    setScale(1)
  }, [])

  const setActualSize = React.useCallback(() => {
    setFitMode("actual")
    setScale(1)
  }, [])

  const rotateLeft = React.useCallback(() => {
    setRotation((value) => value - 90)
  }, [])

  const rotateRight = React.useCallback(() => {
    setRotation((value) => value + 90)
  }, [])

  const handleDownload = React.useCallback(async () => {
    const filename = getDownloadFilename(src, title, alt)
    let objectUrl: string | null = null

    try {
      if (canUseNativeDownload(src)) {
        triggerAnchorDownload(src, filename)
        toast({ description: mergedLabels.downloadSuccess })
        return
      }
    } catch {
      // Fall through to blob download.
    }

    try {
      const response = await fetch(src, { mode: "cors" })
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }

      const blob = await response.blob()
      objectUrl = URL.createObjectURL(blob)
      triggerAnchorDownload(objectUrl, filename)
      toast({ description: mergedLabels.downloadSuccess })
    } catch {
      toast({
        variant: "destructive",
        description: mergedLabels.downloadError,
      })
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [alt, mergedLabels.downloadError, mergedLabels.downloadSuccess, src, title])

  const handleOpenInNewTab = React.useCallback(() => {
    try {
      window.open(src, "_blank", "noopener,noreferrer")
    } catch {
      toast({
        variant: "destructive",
        description: mergedLabels.openInNewTabError,
      })
    }
  }, [mergedLabels.openInNewTabError, src])

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

  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "+") {
        event.preventDefault()
        zoomIn()
      } else if (event.key === "-") {
        event.preventDefault()
        zoomOut()
      } else if (event.key === "0") {
        event.preventDefault()
        resetState()
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault()
        void handleFullscreen()
      } else if (event.key === "[") {
        event.preventDefault()
        rotateLeft()
      } else if (event.key === "]") {
        event.preventDefault()
        rotateRight()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleFullscreen, open, resetState, rotateLeft, rotateRight, zoomIn, zoomOut])

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

  React.useEffect(() => {
    if (!open) return

    const handleCtrlWheel = (event: WheelEvent) => {
      const node = viewportRef.current
      const target = event.target

      if (!node || !(target instanceof Node) || !node.contains(target) || !event.ctrlKey) {
        return
      }

      handleWheel(event)
    }

    window.addEventListener("wheel", handleCtrlWheel, {
      passive: false,
      capture: true,
    })

    return () => {
      window.removeEventListener("wheel", handleCtrlWheel, {
        capture: true,
      })
    }
  }, [handleWheel, open])

  const actions = React.useMemo(
    () => [
      { key: "zoom-in", label: mergedLabels.zoomIn, icon: ZoomIn, onClick: zoomIn, disabled: loadError || scale >= MAX_SCALE },
      { key: "zoom-out", label: mergedLabels.zoomOut, icon: ZoomOut, onClick: zoomOut, disabled: loadError || scale <= MIN_SCALE },
      { key: "fit", label: mergedLabels.fit, icon: Minimize, onClick: setFit, disabled: loadError },
      { key: "actual-size", label: mergedLabels.actualSize, icon: Search, onClick: setActualSize, disabled: loadError },
      { key: "reset", label: mergedLabels.reset, icon: RefreshCw, onClick: resetState, disabled: loadError },
      { key: "rotate-left", label: mergedLabels.rotateLeft, icon: RotateCcw, onClick: rotateLeft, disabled: loadError },
      { key: "rotate-right", label: mergedLabels.rotateRight, icon: RotateCw, onClick: rotateRight, disabled: loadError },
      { key: "fullscreen", label: mergedLabels.fullscreen, icon: Maximize, onClick: () => void handleFullscreen(), disabled: false },
      { key: "download", label: mergedLabels.download, icon: Download, onClick: handleDownload, disabled: loadError },
      { key: "new-tab", label: mergedLabels.openInNewTab, icon: ExternalLink, onClick: handleOpenInNewTab, disabled: false },
    ],
    [
      handleDownload,
      handleFullscreen,
      handleOpenInNewTab,
      loadError,
      mergedLabels.actualSize,
      mergedLabels.download,
      mergedLabels.fit,
      mergedLabels.fullscreen,
      mergedLabels.openInNewTab,
      mergedLabels.reset,
      mergedLabels.rotateLeft,
      mergedLabels.rotateRight,
      mergedLabels.zoomIn,
      mergedLabels.zoomOut,
      resetState,
      rotateLeft,
      rotateRight,
      scale,
      setActualSize,
      setFit,
      zoomIn,
      zoomOut,
    ]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(94vh,980px)] w-[calc(100vw-0.75rem)] sm:w-[40rem] md:w-[52rem] lg:w-[64rem] xl:w-[74rem] 2xl:w-[86rem] max-w-[calc(100vw-0.75rem)] flex-col gap-3 border-zinc-800 bg-zinc-950 p-3 text-zinc-50 sm:max-w-[calc(100vw-2rem)] sm:p-4"
      >
        <DialogVisuallyHiddenTitle>{effectiveAlt}</DialogVisuallyHiddenTitle>
        <DialogVisuallyHiddenDescription>{mergedLabels.close}</DialogVisuallyHiddenDescription>

        <TooltipProvider delayDuration={100}>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{effectiveAlt}</p>
              <p className="text-xs text-zinc-400">
                {fitMode === "fit" ? mergedLabels.fit : `${Math.round(scale * 100)}%`}
                {rotation !== 0 ? ` · ${rotation}deg` : ""}
                {isFullscreen ? ` · ${mergedLabels.fullscreen}` : ""}
              </p>
            </div>

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
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl border border-zinc-800 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%),linear-gradient(180deg,_rgba(24,24,27,0.9),_rgba(9,9,11,1))] p-4"
        >
          {loadError ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full border border-red-500/40 bg-red-500/10 p-3 text-red-300">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">{mergedLabels.imageLoadError}</p>
              <p className="max-w-md text-xs text-zinc-400">{src}</p>
            </div>
          ) : (
            <img
              ref={imageRef}
              src={src}
              alt={effectiveAlt}
              className={cn(
                "max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl",
                fitMode === "fit" ? "h-auto w-auto" : ""
              )}
              style={transformStyle}
              onError={() => setLoadError(true)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

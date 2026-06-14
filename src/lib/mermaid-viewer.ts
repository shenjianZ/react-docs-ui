import type { MermaidViewerConfig, MermaidViewerLabels } from "@/lib/config"

const DEFAULT_LABELS: Record<"zh-cn" | "en", Required<MermaidViewerLabels>> = {
  "zh-cn": {
    zoomIn: "放大",
    zoomOut: "缩小",
    fit: "适配窗口",
    actualSize: "原始比例",
    reset: "重置",
    fullscreen: "全屏",
    download: "下载 SVG",
    close: "关闭图表查看器",
    openViewer: "全屏查看图表",
    downloadSuccess: "SVG 已开始下载",
    downloadError: "SVG 下载失败，请重试。",
    fullscreenError: "当前浏览器不支持全屏，已保留对话框预览。",
  },
  en: {
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit to viewport",
    actualSize: "Actual size",
    reset: "Reset",
    fullscreen: "Fullscreen",
    download: "Download SVG",
    close: "Close diagram viewer",
    openViewer: "View diagram in fullscreen",
    downloadSuccess: "SVG download started",
    downloadError: "Failed to download the SVG. Please try again.",
    fullscreenError: "Fullscreen is not available in this browser. Dialog preview is still available.",
  },
}

export function getMermaidViewerLabels(
  lang: string = "zh-cn",
  labels?: MermaidViewerConfig["labels"]
): Required<MermaidViewerLabels> {
  const locale = lang === "en" ? "en" : "zh-cn"
  return {
    ...DEFAULT_LABELS[locale],
    ...labels,
  }
}

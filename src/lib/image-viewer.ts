import type { ImageViewerConfig, ImageViewerLabels } from "@/lib/config"

const DEFAULT_LABELS: Record<"zh-cn" | "en", Required<ImageViewerLabels>> = {
  "zh-cn": {
    preview: "预览图片",
    zoomIn: "放大",
    zoomOut: "缩小",
    fit: "适配窗口",
    actualSize: "原始比例",
    reset: "重置",
    rotateLeft: "左旋",
    rotateRight: "右旋",
    fullscreen: "全屏",
    download: "下载",
    openInNewTab: "新标签打开",
    close: "关闭图片查看器",
    imageAltFallback: "文档图片",
    downloadSuccess: "图片下载已开始",
    downloadError: "当前图片无法直接下载，请尝试新标签打开。",
    fullscreenError: "当前浏览器不支持全屏，已保留对话框预览。",
    openInNewTabError: "无法在新标签页打开图片。",
    imageLoadError: "图片加载失败",
  },
  en: {
    preview: "Preview image",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit to viewport",
    actualSize: "Actual size",
    reset: "Reset",
    rotateLeft: "Rotate left",
    rotateRight: "Rotate right",
    fullscreen: "Fullscreen",
    download: "Download",
    openInNewTab: "Open in new tab",
    close: "Close image viewer",
    imageAltFallback: "Documentation image",
    downloadSuccess: "Image download started",
    downloadError: "This image cannot be downloaded directly. Try opening it in a new tab.",
    fullscreenError: "Fullscreen is not available in this browser. Dialog preview is still available.",
    openInNewTabError: "Unable to open the image in a new tab.",
    imageLoadError: "Failed to load image",
  },
}

export function getImageViewerLabels(
  lang: string = "zh-cn",
  labels?: ImageViewerConfig["labels"]
): Required<ImageViewerLabels> {
  const locale = lang === "en" ? "en" : "zh-cn"
  return {
    ...DEFAULT_LABELS[locale],
    ...labels,
  }
}

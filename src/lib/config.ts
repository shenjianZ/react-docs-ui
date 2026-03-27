// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore types provided via ambient declaration
import yaml from "js-yaml"

export interface ImageViewerLabels {
  preview?: string
  zoomIn?: string
  zoomOut?: string
  fit?: string
  actualSize?: string
  reset?: string
  rotateLeft?: string
  rotateRight?: string
  fullscreen?: string
  download?: string
  openInNewTab?: string
  close?: string
  imageAltFallback?: string
  downloadSuccess?: string
  downloadError?: string
  fullscreenError?: string
  openInNewTabError?: string
  imageLoadError?: string
}

export interface ImageViewerConfig {
  enabled?: boolean
  labels?: ImageViewerLabels
}

export interface SyntaxHighlightConfig {
  langs?: string[]
  lightTheme?: string
  darkTheme?: string
}

export interface FeedbackConfig {
  enabled?: boolean
  endpoint?: string
  method?: "POST"
  includePageMeta?: boolean
  labels?: {
    helpful?: string
    unhelpful?: string
    inputPlaceholder?: string
    submit?: string
    thanks?: string
  }
}

export interface EditLinkConfig {
  enabled?: boolean
  urlTemplate?: string
  label?: string
}

export interface AnnouncementConfig {
  enabled?: boolean
  text?: string
  link?: string
  dismissible?: boolean
}

export interface SiteConfig {
  site: {
    logo: string | { light: string; dark: string }
    title: string
    description: string
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
  announcement?: AnnouncementConfig
  sidebar: {
    // 全局开关，未设置时按数据存在与否自动判断
    enabled?: boolean
    // 旧版：单一侧边栏结构（向后兼容）
    sections?: {
      title: string
      path?: string
      children?: {
        title: string
        path: string
      }[]
    }[]
    // 新版：按一级路由段（如 guide、components）选择不同侧边栏
    collections?: Record<
      string,
      {
        sections: {
          title: string
          path: string
          children?: {
            title: string
            path: string
          }[]
        }[]
      }
    >
  }
  theme?: {
    allowToggle?: boolean
  }
  footer?: {
    enabled?: boolean
    copyright?: string
    repository?: {
      url?: string
      branch?: string
    }
    lastUpdated?: string
    version?: string
    groups?: {
      title: string
      items: {
        title: string
        link: string
        external?: boolean
      }[]
    }[]
    links?: {
      title: string
      link: string
      external?: boolean
    }[]
    social?: {
      name: string
      url?: string
      link?: string
      icon?: string
    }[]
  }
  pwa?: {
    enabled?: boolean
    name?: string
    shortName?: string
    description?: string
    themeColor?: string
    backgroundColor?: string
  }
  contextMenu?: {
    enabled?: boolean
    page?: {
      copyUrl?: boolean
      copyTitle?: boolean
      copyMarkdownLink?: boolean
      copySelectedText?: boolean
      openInNewTab?: boolean
      reload?: boolean
      printPage?: boolean
      scrollToTop?: boolean
      scrollToBottom?: boolean
    }
    site?: {
      goHome?: boolean
      quickNav?: boolean
      language?: boolean
    }
    appearance?: {
      theme?: boolean
      resetThemePref?: boolean
    }
  }
  // MDX 组件配置
  mdx?: {
    componentsPath?: string  // 组件扫描路径，默认 '/src/components'
    enabled?: boolean         // 是否启用 MDX 支持，默认 true
    // 手动配置的组件列表（可选）
    components?: {
      [componentName: string]: string  // 组件名称到组件导入路径的映射
    }
  }
  // 目录导航配置
  toc?: {
    enabled?: boolean        // 是否启用目录导航，默认 true
    maxLevel?: number        // 最大标题层级，默认 3（h1-h3）
    title?: string           // 目录标题，默认 "本页目录"
  }
  // AI功能配置
  ai?: {
    enabled?: boolean        // 是否启用AI功能，默认 true
    // AI功能可通过UI配置，此处仅作为站点级开关
  }
  // 字体配置
  fonts?: {
    fontFamilyZhCn?: string  // 中文字体族，多个字体用逗号分隔
    fontFamilyEn?: string    // 英文字体族，多个字体用逗号分隔
    downloadFonts?: string[] // 启动 dev/build 时自动检查并下载到 public/fonts
  }
  // 代码高亮配置
  codeHighlight?: SyntaxHighlightConfig
  // 全文搜索配置
  search?: {
    enabled?: boolean        // 是否启用全文搜索，默认 true
    placeholder?: string     // 搜索框占位符
    maxResults?: number      // 最大返回结果数，默认 20
  }
  // 导出功能配置
  export?: {
    enabled?: boolean        // 是否启用导出功能，默认 true
    markdown?: boolean       // 是否启用 Markdown 导出，默认 true
    pdf?: boolean            // 是否启用 PDF 导出，默认 true
    word?: boolean           // 是否启用 Word 导出，默认 true
    allDocs?: boolean        // 是否启用批量导出，默认 true
    pdfServer?: {
      enabled?: boolean      // 是否启用服务器端 PDF 生成
      url?: string           // PDF 服务器地址
    }
  }
  feedback?: FeedbackConfig
  editLink?: EditLinkConfig
  pageMeta?: {
    showLastUpdated?: boolean
    showEditLink?: boolean
    showAuthors?: boolean
    preferGitMeta?: boolean
  }
  imageViewer?: ImageViewerConfig
}

export async function getConfig(
  lang: string = "zh-cn"
): Promise<SiteConfig | null> {
  if (!lang || lang.startsWith("_next") || lang.includes(".")) {
    return null
  }

  const defaultLang = "zh-cn"
  const configLang = lang === defaultLang ? "" : `.${lang}`
  const filePath = `/config/site${configLang}.yaml`

  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}`)
    }
    const fileContents = await response.text()
    const config = yaml.load(fileContents) as SiteConfig
    return config
  } catch (error) {
    console.error(`Error loading config for lang "${lang}":`, error)
    if (lang !== defaultLang) {
      return await getConfig(defaultLang)
    }
    return null
  }
}

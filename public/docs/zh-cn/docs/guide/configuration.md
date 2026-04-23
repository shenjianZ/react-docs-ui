---
title: 配置文件（`site.yaml`）字段说明
description: 说明模板项目中 site.yaml 与 site.en.yaml 的主要配置字段和示例
author: React Docs UI Team
createdAt: 2026-03-25
lastUpdated: 2026-03-27
---

# 配置文件（`site.yaml`）字段说明

项目遵循“配置驱动”。站点的大部分行为都由 `public/config/site.yaml`（中文）和 `public/config/site.en.yaml`（英文）控制。本文档按当前运行时实际支持的字段说明，并补充少量保留/兼容字段的用途。

## 顶级键

| 键 | 作用 |
| :-- | :-- |
| `site` | 网站基础信息，如标题、描述、Logo |
| `navbar` | 顶部导航栏 |
| `announcement` | 顶部公告栏 |
| `versions` | 文档版本配置 |
| `changelog` | 更新日志列表页与标题配置 |
| `sidebar` | 侧边栏导航树 |
| `theme` | 主题模式与切换行为 |
| `toc` | 文章右侧目录 |
| `imageViewer` | 图片预览器 |
| `footer` | 页脚信息 |
| `contextMenu` | 右键菜单 |
| `mdx` | MDX 组件扫描与映射 |
| `fonts` | 页面字体与构建期下载字体 |
| `codeHighlight` | 代码高亮语言与主题 |
| `search` | 全文搜索 |
| `seo` | 页面 SEO 标签配置 |
| `sitemap` | Sitemap 自动生成 |
| `feed` | RSS Feed 配置 |
| `breadcrumb` | 面包屑导航 |
| `reading` | 阅读体验（阅读时间、进度条） |
| `export` | Markdown / PDF / Word / 批量导出 |
| `pageMeta` | 页面元信息展示配置 |
| `editLink` | “编辑此页”链接配置 |
| `feedback` | 页面反馈配置 |
| `ai` | AI 功能总开关 |
| `pwa` | PWA 相关配置 |

## 站点信息 `site`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 网站标题 | `"React Docs UI 示例项目"` |
| `description` | string | 网站描述，通常用于首页说明和 SEO | `"基于 React Docs UI 构建的文档网站示例"` |
| `url` | string | 站点基准地址，用于生成 canonical、`hreflang`、`og:url` | `"https://your-docs-site.example.com"` |
| `logo` | string 或 object | 网站 Logo，可用 emoji、图片路径、绝对 URL，或按明暗主题分别配置 | `"📚"` / `"/images/logo.png"` / `{ light: "...", dark: "..." }` |
| `author` | string | 示例元信息字段，当前运行时未直接消费，可保留给站点维护者使用 | `"React Docs UI Team"` |

`logo` 支持的常见写法：

- emoji：`"🤖"`
- 公共资源路径：`"/images/logo.png"`
- 完整 URL：`"https://example.com/logo.png"`
- 明暗主题对象：`{ light: "/images/logo.svg", dark: "/images/logo-dark.svg" }`

## 顶部导航 `navbar`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `showLogo` | boolean | 是否显示左上角 Logo |
| `showTitle` | boolean | 是否显示站点标题 |
| `showLanguageSwitcher` | boolean | 是否显示语言切换器 |
| `items` | `NavbarItem[]` | 主导航项 |
| `actions` | `NavbarAction[]` | 右侧操作按钮 |

`NavbarItem`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 导航文案 | `"文档"` |
| `link` | string | 目标路径或外链 | `"/docs"` |
| `external` | boolean | 外链时是否新开标签页 | `true` |
| `visible` | boolean | 是否显示，设为 `false` 时隐藏 | `true` |
| `active` | boolean | 示例字段，当前运行时未使用，不建议依赖 | `true` |

`NavbarAction`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `type` | string | 预设动作类型，影响图标选择 | `"github"` |
| `title` | string | 自定义动作名称 | `"API"` |
| `link` | string | 目标地址 | `"https://example.com/api"` |
| `icon` | string | 自定义图标名，通常与 `type` 二选一 | `"link"` |
| `enabled` | boolean | 是否启用该按钮 | `true` |

常见 `type` / `icon` 值：

- `github`
- `gitee`
- `gitea`
- `gitlab`
- `link`
- `external`
- `globe`

## 公告栏 `announcement`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否显示公告栏 | `true` |
| `text` | string | 公告文案 | `"React Docs UI 已支持 Tabs"` |
| `link` | string | 点击后的目标地址 | `"https://github.com/..."` |
| `dismissible` | boolean | 是否允许用户关闭公告 | `true` |

## 版本配置 `versions`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否启用版本切换 |
| `current` | string | 当前默认版本值 |
| `items` | `VersionItem[]` | 可选版本列表 |

`VersionItem`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `value` | string | 版本值，用于路由段 | `"v1"` |
| `label` | string | 版本显示文案 | `"v1"` |

启用后，版本化路由格式为 `/:lang/v/:version/*`，例如：`/zh-cn/v/v1/docs/guide/introduction`。

版本化文档目录建议使用：

- `public/docs/zh-cn/v1/docs/...`
- `public/docs/en/v1/docs/...`

如果某个版本目录下缺少对应页面，当前运行时会回退到未版本化文档。

## 侧边栏 `sidebar`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 全局开关；未设置时按是否存在数据自动判断 |
| `collections` | `Record<string, SidebarCollection>` | 推荐写法。按一级路由段拆分侧边栏 |
| `sections` | `SidebarSection[]` | 兼容旧结构的单棵树写法 |

`SidebarCollection`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `sections` | `SidebarSection[]` | 当前集合下的分组列表 |

`SidebarSection`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 分组标题 | `"快速开始"` |
| `path` | string | 分组基础路径，用于展开和高亮判断 | `"/docs/guide"` |
| `children` | `SidebarItem[]` | 子页面列表 | |

`SidebarItem`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 子项标题 | `"安装"` |
| `path` | string | 完整文档路径 | `"/docs/guide/installation"` |

## 主题 `theme`

| 字段 | 类型 | 说明 | 可选值 | 默认值 |
| :-- | :-- | :-- | :-- | :-- |
| `defaultMode` | string | 默认主题模式 | `light` / `dark` / `auto` | `auto` |
| `allowToggle` | boolean | 是否允许用户切换主题 | `true` / `false` | `true` |

说明：

- `defaultMode: "auto"` 表示跟随系统主题。
- 若 `allowToggle: false`，页面不会显示主题切换入口。

## 目录导航 `toc`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否启用右侧目录 | `true` |
| `maxLevel` | number | 最多显示到几级标题，范围通常为 `1-6` | `3` |
| `title` | string | 目录标题 | `"本页目录"` |

## 更新日志 `changelog`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否启用 changelog 模块 | `true` |
| `title` | string | 列表页标题 | `"更新日志"` |
| `showInNavbar` | boolean | 是否在导航中显示入口 | `true` |
| `showInSidebar` | boolean | 是否在侧边栏显示入口 | `false` |
| `pageSize` | number | 每页显示条数；未配置时列表页默认全量显示 | `10` |

## 图片查看器 `imageViewer`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否启用图片预览器 |
| `labels` | object | 图片预览器界面文案 |

`imageViewer.labels`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `preview` | string | 鼠标悬停/按钮上的“预览图片”文案 |
| `zoomIn` | string | 放大 |
| `zoomOut` | string | 缩小 |
| `fit` | string | 适配窗口 |
| `actualSize` | string | 原始比例 |
| `reset` | string | 重置缩放和旋转 |
| `rotateLeft` | string | 左旋 |
| `rotateRight` | string | 右旋 |
| `fullscreen` | string | 全屏 |
| `download` | string | 下载 |
| `openInNewTab` | string | 新标签打开 |
| `close` | string | 关闭预览器 |
| `imageAltFallback` | string | 图片缺少 alt 时的兜底文案 |
| `downloadSuccess` | string | 下载成功提示 |
| `downloadError` | string | 下载失败提示 |
| `fullscreenError` | string | 全屏失败提示 |
| `openInNewTabError` | string | 新标签打开失败提示 |
| `imageLoadError` | string | 图片加载失败提示 |

如果你只想改部分文案，只配置需要覆盖的键即可。

### 文档中的图片扩展语法

除了通过 `imageViewer.enabled` 全局控制图片预览外，页面作者还可以在 Markdown / HTML 里单独控制某一张图片的尺寸、是否开启预览、是否按行内元素渲染，以及水平/垂直偏移。

Markdown 图片可在标题字符串里追加参数：

```md
![封面图](/images/og-default.png "width=320 preview=true")
![状态图标](/images/success.svg "width=18 inline=true preview=false x=4 y=-2")
```

支持的参数：

- `width=24` / `height=24`：设置宽高
- `size=24`：同时设置宽高
- `preview=true|false`：单独开启或关闭该图片的预览
- `inline=true`：按行内元素渲染，不独占一行
- `x=4` / `y=-2`：设置水平或垂直偏移，适合微调小图标和文字基线

如果你希望直接用 HTML，也可以使用原生 `<img>`：

```html
<img src="/images/success.svg" alt="状态图标" width="18" data-inline="true" data-preview="false" data-offset-x="4" data-offset-y="-2" />
```

HTML `img` 常用属性：

- `width` / `height`
- `data-preview="true|false"`
- `data-inline="true"`
- `data-offset-x="4"`
- `data-offset-y="-2"`

## 页脚 `footer`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否显示页脚 |
| `copyright` | string | 版权文案 |
| `repository` | object | 仓库信息，用于“编辑此页”等能力 |
| `lastUpdated` | string | 页脚显示的最近更新时间 |
| `version` | string | 页脚显示的版本号 |
| `groups` | `FooterGroup[]` | 页脚分组链接区 |
| `links` | `FooterLink[]` | 简单链接列表 |
| `social` | `FooterSocial[]` | 社交链接图标 |

`footer.repository`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `url` | string | 仓库地址 | `"https://github.com/your/repo"` |
| `branch` | string | 分支名 | `"main"` |

`FooterGroup`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `title` | string | 分组标题 |
| `items` | `FooterLink[]` | 分组内链接 |

`FooterLink`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `title` | string | 链接名称 |
| `link` | string | 链接地址 |
| `external` | boolean | 是否新开标签页 |
| `action` | string | 兼容动作字段；当前内置支持 `scrollTop` |

`FooterSocial`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `name` | string | 平台名称，仅用于语义和调试 |
| `url` | string | 社交链接地址 |
| `link` | string | 兼容旧写法，和 `url` 二选一 |
| `icon` | string | 图标名 |

## 右键菜单 `contextMenu`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否启用右键菜单 |
| `page` | object | 页面级菜单项开关 |
| `site` | object | 站点级菜单项开关 |
| `appearance` | object | 外观级菜单项开关 |

`contextMenu.page`

| 字段 | 类型 | 说明 | 默认值 |
| :-- | :-- | :-- | :-- |
| `copySelectedText` | boolean | 复制选中文本 | `true` |
| `copyUrl` | boolean | 复制当前链接 | `true` |
| `copyTitle` | boolean | 复制页面标题 | `false` |
| `copyMarkdownLink` | boolean | 复制 Markdown 链接 | `false` |
| `openInNewTab` | boolean | 新标签打开 | `false` |
| `reload` | boolean | 刷新页面 | `true` |
| `printPage` | boolean | 打印页面 | `true` |
| `scrollToTop` | boolean | 回到顶部 | `true` |
| `scrollToBottom` | boolean | 滚动到底部 | `true` |

`contextMenu.site`

| 字段 | 类型 | 说明 | 默认值 |
| :-- | :-- | :-- | :-- |
| `goHome` | boolean | 返回首页 | `true` |
| `quickNav` | boolean | 快速导航 | `false` |
| `language` | boolean | 语言切换 | `false` |

`contextMenu.appearance`

| 字段 | 类型 | 说明 | 默认值 |
| :-- | :-- | :-- | :-- |
| `theme` | boolean | 主题切换 | `false` |
| `resetThemePref` | boolean | 重置主题偏好 | `false` |

## MDX 配置 `mdx`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `componentsPath` | string | 自动扫描自定义 MDX 组件的路径 | `"/src/components"` |
| `enabled` | boolean | 是否启用 MDX 支持 | `true` |
| `components` | `Record<string, string>` | 手动声明组件名到文件路径的映射 | `{ Demo: "/src/components/Demo.tsx" }` |

说明：

- `componentsPath` 用于自动扫描。
- `components` 用于手动补充映射。
- 两者可以同时使用。

## 字体 `fonts`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `fontFamilyZhCn` | string | 中文字体栈 | `"MiSans, PingFang SC, sans-serif"` |
| `fontFamilyEn` | string | 英文或等宽字体栈 | `"Fragment Mono, system-ui, sans-serif"` |
| `downloadFonts` | string[] | 构建或开发时自动准备到 `public/fonts` 的字体文件名 | `["FragmentMono-Regular.woff2"]` |

说明：

- 页面会先用系统字体渲染，再异步切换到你配置的站点字体。
- `downloadFonts` 属于构建辅助配置，不是运行时网络请求白名单。

## 代码高亮 `codeHighlight`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `langs` | string[] | 站点预加载的高亮语言列表 | `["bash", "yaml", "typescript", "tsx"]` |
| `lightTheme` | string | 亮色主题名 | `"github-light"` |
| `darkTheme` | string | 暗色主题名 | `"github-dark"` |

说明：

- 这里只建议写站点实际会出现的语言。
- 未列出的代码块会回退为普通 `code` 显示。
- 语言名需要与 Shiki 支持的语言名或常见别名一致。

## 搜索 `search`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否启用全文搜索 | `true` |
| `placeholder` | string | 搜索框占位符 | `"搜索文档..."` |
| `maxResults` | number | 最多返回多少条结果 | `20` |
| `snippetLength` | number | 示例/保留字段，当前运行时未直接使用 | `120` |

## SEO `seo`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否启用页面 SEO 标签注入 |
| `defaultTitle` | string | 默认页面标题 |
| `titleTemplate` | string | 标题模板，支持 `{title}` 与 `{siteTitle}` |
| `defaultDescription` | string | 默认描述 |
| `defaultOgImage` | string | 默认社交分享图片 |
| `robots` | string | 默认 robots 内容 |
| `twitterCard` | string | Twitter 卡片类型 |

说明：

- `site.url` 是生成 `canonical`、`hreflang`、`og:url` 的前置项。
- 页面 frontmatter 可覆盖 `title`、`description`、`canonical`，并支持 `noindex: true`。
- 版本化文档会自动保留 `/v/:version` 前缀。

## 导出 `export`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否启用导出能力 |
| `markdown` | boolean | 是否允许导出 Markdown |
| `pdf` | boolean | 是否允许导出 PDF |
| `word` | boolean | 是否允许导出 Word |
| `allDocs` | boolean | 是否允许批量导出全部文档 |
| `pdfServer` | object | 服务端 PDF 配置 |

`export.pdfServer`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否启用服务端 PDF 生成 | `true` |
| `url` | string | PDF 服务地址 | `"http://localhost:3001"` |

说明：

- 若 `pdfServer.enabled` 为 `false`，PDF 导出会退回到浏览器打印方案。

## 页面元信息 `pageMeta`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `showLastUpdated` | boolean | 是否显示页面最后更新时间 |
| `showEditLink` | boolean | 是否显示“编辑此页”入口 |
| `showAuthors` | boolean | 是否显示作者 |
| `preferGitMeta` | boolean | 是否优先使用构建时生成的 git 元数据 |

页面级展示会优先读取 `public/doc-git-meta.json` 中的最后更新时间和作者；若缺失，则回退到 frontmatter 中的 `lastUpdated` / `authors` / `author`。创建时间请使用 `createdAt`。

## 编辑入口 `editLink`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `enabled` | boolean | 是否启用编辑入口 |
| `label` | string | 链接文案 |
| `urlTemplate` | string | 编辑地址模板 |

支持的模板变量：`{lang}`、`{slug}`、`{docPath}`、`{ext}`、`{filePath}`。

## 页面反馈 `feedback`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `enabled` | boolean | 是否显示反馈区 |
| `endpoint` | string | 反馈上报地址，留空则仅本地记录提交状态 |
| `method` | string | 请求方法，当前固定为 `POST` |
| `includePageMeta` | boolean | 是否在请求中附带页面信息 |
| `labels` | object | 按钮与文案配置 |

## AI 功能 `ai`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | AI 功能总开关 |

## PWA `pwa`

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否启用 PWA |
| `name` | string | 应用名称 |
| `shortName` | string | 应用简称 |
| `description` | string | 应用描述 |
| `themeColor` | string | 主题色 |
| `backgroundColor` | string | 背景色 |

## Sitemap 配置 `sitemap`

| 字段 | 类型 | 说明 | 默认值 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否在构建时生成 `sitemap.xml` | `true` |
| `changefreq` | string | 页面更新频率 | `"weekly"` |
| `priority` | number | 页面优先级，范围 `0.0 - 1.0` | `0.7` |
| `exclude` | string[] | 排除路径，支持精确路径、后缀通配（`*.pdf`）和目录通配（`/zh-cn/private/*`） | `[]` |

说明：

- 需要在 `site.url` 中配置站点域名，否则无法生成完整 URL。
- 构建时自动扫描所有文档页面，过滤 `draft: true` 和 `noindex: true` 的页面。
- `changefreq` 可选值：`always`、`hourly`、`daily`、`weekly`、`monthly`、`yearly`、`never`。
- 构建产物输出到 `public/sitemap.xml`。

## RSS Feed 配置 `feed`

| 字段 | 类型 | 说明 | 默认值 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否在构建时生成 `feed.xml` | `true` |
| `title` | string | Feed 标题 | 站点标题 |
| `description` | string | Feed 描述 | 站点描述 |
| `limit` | number | RSS 条目数量上限 | `20` |

说明：

- RSS 条目来源于 changelog 目录下的发布日志文件。
- 需要在 `site.url` 中配置站点域名。
- 浏览器会通过 `<link rel="alternate" type="application/rss+xml">` 自动发现 RSS 源。
- 构建产物输出到 `public/feed.xml`。

## 面包屑导航 `breadcrumb`

| 字段 | 类型 | 说明 | 默认值 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否显示面包屑导航 | `true` |
| `showHome` | boolean | 是否显示首页入口（图标和文字） | `true` |

说明：

- 面包屑路径基于 `sidebar.collections` 或 `sidebar.sections` 配置自动生成。
- Changelog 详情页会显示为 `首页 > 更新日志 > 版本号`。
- 设为 `false` 可完全隐藏面包屑导航。

## 阅读体验 `reading`

| 字段 | 类型 | 说明 | 默认值 |
| :-- | :-- | :-- | :-- |
| `showTime` | boolean | 是否显示阅读时间估算 | `true` |
| `showProgress` | boolean | 是否显示阅读进度条 | `false` |

说明：

- 阅读时间根据页面内容自动估算，中文按 300 字/分钟、英文按 200 词/分钟计算。
- 进度条显示在页面顶部，随滚动实时更新。
- 两个功能独立控制，可以单独开关。

## 建议

- 优先以模板里的最新 `site.yaml` 作为参考，不要只看旧博客或旧 README 示例。
- 对于标注为“保留字段”“兼容字段”“示例字段”的项，不要把它们当成核心运行时能力。
- 若你准备新增配置字段，先同步更新 `src/lib/config.ts`、模板示例和本页文档，避免再次出现“配置可写但文档缺失”的问题。

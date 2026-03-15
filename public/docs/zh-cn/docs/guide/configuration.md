# 配置文件（`site.yaml`）字段说明

项目遵循“配置驱动”。站点的大部分行为都由 `public/config/site.yaml`（中文）和 `public/config/site.en.yaml`（英文）控制。本文档按当前运行时实际支持的字段说明，并补充少量保留/兼容字段的用途。

## 顶级键

| 键 | 作用 |
| :-- | :-- |
| `site` | 网站基础信息，如标题、描述、Logo |
| `navbar` | 顶部导航栏 |
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
| `export` | Markdown / PDF / Word / 批量导出 |
| `ai` | AI 功能总开关 |
| `pwa` | PWA 相关配置 |

## 站点信息 `site`

| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 网站标题 | `"React Docs UI 示例项目"` |
| `description` | string | 网站描述，通常用于首页说明和 SEO | `"基于 React Docs UI 构建的文档网站示例"` |
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
| `builtWith` | array | 保留字段，当前页脚未直接使用 |

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

## 建议

- 优先以模板里的最新 `site.yaml` 作为参考，不要只看旧博客或旧 README 示例。
- 对于标注为“保留字段”“兼容字段”“示例字段”的项，不要把它们当成核心运行时能力。
- 若你准备新增配置字段，先同步更新 `src/lib/config.ts`、模板示例和本页文档，避免再次出现“配置可写但文档缺失”的问题。

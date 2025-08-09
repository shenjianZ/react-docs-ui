# 配置文件 (`site.yaml`) 详解

`vue-docs-ui` 的核心是其**配置驱动**的理念。你几乎可以通过 `public/config/site.yaml` 这一个文件来定义整个网站的外观和行为。本文档将详细解释每个配置项。

## 顶级配置项概览

| 顶级字段 | 说明 |
| :--- | :--- |
| `site` | 网站的全局信息，如标题、描述、Logo。 |
| `navbar` | 配置网站顶部的导航栏。 |
| `sidebar` | 配置网站侧边栏的导航菜单。 |
| `theme` | 配置网站的主题，如颜色、浅色/深色模式。 |
| `footer` | 配置网站底部的页脚信息。 |
| `toc` | 配置文章页面右侧的目录（Table of Contents）。 |
| `search` | 配置内置的全文搜索功能。 |
| `pwa` | 配置渐进式Web应用（PWA）相关设置。 |
| `ai` | 配置 AI 助手功能。 |

---

## `site`

网站的基础元数据配置。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `title` | 网站标题，显示在浏览器标签页上。 | `"Vue Docs UI"` |
| `description` | 网站描述，用于搜索引擎优化 (SEO)。 | `"一个 Vue 3 文档网站构建工具"` |
| `logo` | 网站 Logo，显示在导航栏左上角。 | `"📚"` 或 `"/images/logo.png"` |
| `author` | 网站作者。 | `"Vue Docs UI Team"` |

**Logo 格式说明:**
1.  **Emoji**: 直接使用一个表情符号，如 `"🚀"`。
2.  **本地图片**: 指向 `public` 目录下的图片路径，如 `"/images/logo.png"`。
3.  **外部图片 URL**: 一个完整的图片链接。

---

## `navbar`

顶部导航栏配置。

| 字段 | 说明 |
| :--- | :--- |
| `items` | 导航项数组，定义了导航栏中显示的所有链接。 |

### `navbar.items`

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `title` | 导航项的显示文本。 | `"指南"` |
| `link` | 链接地址。内部链接以 `/` 开头。 | `"/guide/introduction"` |
| `external` | (可选) `true` 表示为外部链接，将在新标签页打开。 | `true` |

---

## `sidebar`

侧边栏导航配置，是文档结构的核心。

| 字段 | 说明 |
| :--- | :--- |
| `sections` | 侧边栏区域数组，每个区域代表一个可折叠的菜单组。 |

### `sidebar.sections`

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `title` | 区域的标题。 | `"入门指南"` |
| `path` | 区域的基础路径。当用户访问的 URL 以此路径开头时，该区域会自动展开并高亮。 | `"/guide"` |
| `children` | 该区域下的子链接数组。 | |

### `sidebar.sections.children`

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `title` | 子链接的显示文本。 | `"介绍"` |
| `path` | 子链接的完整路径，指向一个具体的 Markdown 页面。 | `"/guide/introduction"` |

---

## `theme`

主题和外观配置。

| 字段 | 说明 | 可选值 | 默认值 |
| :--- | :--- | :--- | :--- |
| `defaultMode` | 网站的默认主题模式。 | `'light'`, `'dark'`, `'auto'` | `'auto'` |
| `allowToggle` | 是否允许用户切换主题。 | `true`, `false` | `true` |
| `primaryColor`| 网站的主题色。 | CSS 颜色值 | `"#3b82f6"` |

---

## `footer`

页脚配置。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `copyright` | 版权信息。`{year}` 会被替换为当前年份。 | `"Copyright © {year} My Company"` |
| `repository` | (可选) 仓库信息，用于显示“在 GitHub 上编辑此页”等链接。 | |
| `links` | (可选) 在页脚显示的额外链接列。 | |
| `social` | (可选) 在页脚显示的社交媒体图标链接。 | |

### `footer.repository`

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `url` | 仓库的 URL。 | `"https://github.com/user/repo"` |
| `branch` | 文档所在的 Git 分支。 | `"main"` |
| `dir` | 文档文件在仓库中的根目录。 | `"docs/src"` |

### `footer.social`

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `name` | 社交媒体名称，用于 `aria-label`。 | `"GitHub"` |
| `url` | 链接地址。 | `"https://github.com/user"` |
| `icon` | 图标标识符，支持 `github`, `twitter`, `discord` 等。 | `"github"` |

---

## `toc` (Table of Contents)

文章页面右侧的目录配置。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `enabled` | 是否启用页面目录功能。 | `true` |
| `maxLevel` | 在目录中显示的最大标题级别（h1-h6）。 | `3` |
| `title` | 目录组件的标题。 | `"本页内容"` |

---

## `search`

内置搜索功能配置。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `enabled` | 是否启用搜索功能。 | `true` |
| `placeholder` | 搜索框的占位文本。 | `"搜索文档..."` |

---

## `pwa`

渐进式Web应用配置。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `enabled` | 是否启用 PWA 功能。 | `true` |
| `name` | PWA 的完整名称。 | `"Vue Docs UI"` |
| `shortName` | PWA 的短名称。 | `"VueDocs"` |

---

## `ai`

AI 助手配置。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `enabled` | 是否启用 AI 助手功能。 | `true` |
| `buttonTitle` | 浮动按钮的标题。 | `"AI 助手"` |
| `modalTitle` | 对话框的标题。 | `"与 AI 对话"` |
| `placeholder` | 输入框的占位文本。 | `"向我提问..."` |

**注意**: AI 功能的 `provider` 和 `apiKey` 等敏感信息在 `public/config/ai.json` 中单独配置，以避免意外泄露。
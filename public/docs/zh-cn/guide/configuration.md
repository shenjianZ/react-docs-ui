# 配置文件 (`site.yaml`) 详解

`react-docs-ui` 的核心是其**配置驱动**的理念。你几乎可以通过 `public/config/site.yaml` 这一个文件来定义整个网站的外观和行为。本文档将详细解释每个配置项。

## 顶级配置项概览

| 顶级字段 | 说明 |
| :--- | :--- |
| `site` | 网站的全局信息，如标题、描述、Logo。 |
| `navbar` | 配置网站顶部的导航栏。 |
| `sidebar` | 配置网站侧边栏的导航菜单。 |
| `theme` | 配置网站的主题，如颜色、浅色/深色模式。 |
| `footer` | 配置网站底部的页脚信息。 |
| `toc` | 配置文章页面右侧的目录（Table of Contents）。 |

---

## `site`

网站的基础元数据配置。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `title` | 网站标题，显示在浏览器标签页上。 | `"React Docs UI"` |
| `description` | 网站描述，用于搜索引擎优化 (SEO)。 | `"一个 React 文档网站构建工具"` |
| `logo` | 网站 Logo，显示在导航栏左上角。 | `"📚"` 或 `"/images/logo.png"` 或一个包含 `light` 和 `dark` 模式图片路径的对象 |
| `author` | 网站作者。 | `"React Docs UI Team"` |

**Logo 格式说明:**
1.  **Emoji**: 直接使用一个表情符号，如 `"🚀"`。
2.  **本地图片**: 指向 `public` 目录下的图片路径，如 `"/images/logo.png"`。
3.  **亮/暗模式图片**: 一个对象，包含 `light` 和 `dark` 两个键，分别指向不同主题下的图片路径。

---

## `navbar`

顶部导航栏配置。

| 字段 | 说明 |
| :--- | :--- |
| `items` | 导航项数组，定义了导航栏中显示的所有链接。 |
| `actions` | (可选) 导航栏右侧的操作按钮，如 GitHub 链接。 |

### `navbar.items`

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `title` | 导航项的显示文本。 | `"指南"` |
| `link` | 链接地址。内部链接以 `/` 开头。 | `"/guide/introduction"` |
| `external` | (可选) `true` 表示为外部链接，将在新标签页打开。 | `true` |

---

## `sidebar`

侧边栏导航配置，是文档结构的核心。它使用 `collections` 来组织不同部分的内容。

| 字段 | 说明 |
| :--- | :--- |
| `collections` | 一个对象，键是集合的名称（通常对应一级路由，如 `guide`），值是该集合的侧边栏配置。 |

### `sidebar.collections.<name>.sections`

每个集合包含一个 `sections` 数组，每个 `section` 代表一个可折叠的菜单组。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `title` | 区域的标题。 | `"入门指南"` |
| `path` | 区域的基础路径。当用户访问的 URL 以此路径开头时，该区域会自动展开并高亮。 | `"/guide"` |
| `children` | 该区域下的子链接数组。 | |

### `sidebar.collections.<name>.sections.children`

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `title` | 子链接的显示文本。 | `"介绍"` |
| `path` | 子链接的完整路径，指向一个具体的 Markdown 页面。 | `"/guide/introduction"` |

---

## `theme`

主题和外观配置。

| 字段 | 说明 | 可选值 | 默认值 |
| :--- | :--- | :--- | :--- |
| `defaultMode` | 网站的默认主题模式。 | `'light'`, `'dark'`, `'system'` | `'system'` |
| `allowToggle` | 是否允许用户切换主题。 | `true`, `false` | `true` |

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

---

## `toc` (Table of Contents)

文章页面右侧的目录配置。

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| `enabled` | 是否启用页面目录功能。 | `true` |
| `maxLevel` | 在目录中显示的最大标题级别（h1-h6）。 | `3` |
| `title` | 目录组件的标题。 | `"本页内容"` |

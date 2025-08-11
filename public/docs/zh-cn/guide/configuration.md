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
# 配置文件（`site.yaml`）字段说明

项目遵循“配置驱动”。绝大多数行为由 `public/config/site.yaml` 决定。下面用表格逐项说明所有字段。

## 顶级键
| 键 | 作用 |
| :-- | :-- |
| `site` | 全局元信息（标题、描述、Logo、作者） |
| `navbar` | 顶部导航（开关、导航项、操作按钮） |
| `sidebar` | 左侧导航树（集合/分组/子项） |
| `theme` | 主题配置（默认模式、是否允许切换） |
| `toc` | 文章右侧目录（开关、层级、标题） |
| `footer` | 页脚（链接、社交、仓库信息） |
| `pwa` | PWA 设置（预留/可选） |

---

## `site`
| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 网站标题 | `"React Docs UI 示例"` |
| `description` | string | 简短网站描述（SEO） | `"简单漂亮的文档站"` |
| `logo` | string 或 object | 网站 Logo。字符串可为 emoji 或图片路径；对象可分别设置亮/暗图标 | `"📚"`、`"/images/logo.png"`、或 `{ light: "/images/favicon.svg", dark: "/images/favicon-dark.svg" }` |
| `author` | string | 作者或组织 | `"React Docs UI Team"` |

Logo 支持：
- Emoji：`"🚀"`
- 公共路径或 URL：`"/images/logo.png"`
- 明/暗主题对象：`{ light, dark }`

---

## `navbar`
| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `showLogo` | boolean | 是否显示左上角 Logo |
| `showTitle` | boolean | 是否显示站点标题 |
| `showLanguageSwitcher` | boolean | 是否显示语言切换 |
| `items` | array<Item> | 主导航链接 |
| `actions` | array<Action> | 右侧操作按钮（如 GitHub） |

Item
| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 链接文字 | `"指南"` |
| `link` | string | 路径或 URL。内部路径以 `/` 开头 | `"/guide"` |
| `external` | boolean(可选) | 外部链接新开标签 |
| `visible` | boolean(可选) | 条件展示 |

Action
| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `type` | `"github"`/`"custom"`(可选) | 预设或自定义动作 | `"github"` |
| `title` | string(可选) | 自定义动作按钮文案 |
| `link` | string | 目标链接 |
| `icon` | string(可选) | 自定义动作图标名 |
| `enabled` | boolean(可选) | 是否启用 |

---

## `sidebar`
| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean(可选) | 全局开启/关闭侧边栏 |
| `collections` | record<string, Collection> | 顶级集合映射（如 `guide`） |
| `sections` | Section[] (兼容，可选) | 旧版单树结构 |

Collection
| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `sections` | Section[] | 一组可折叠分组 |

Section
| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 分组标题 | `"快速开始"` |
| `path` | string | 访问该前缀将自动展开/高亮 | `"/guide"` |
| `children` | Child[](可选) | 该分组下的子链接 |

Child
| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `title` | string | 子链接文字 | `"介绍"` |
| `path` | string | 完整页面路径 | `"/guide/introduction"` |

---

## `theme`
| 字段 | 类型 | 说明 | 可选值 | 默认值 |
| :-- | :-- | :-- | :-- | :-- |
| `defaultMode` | string | 默认主题模式 | `light`/`dark`/`auto` | `auto` |
| `allowToggle` | boolean | 是否允许用户切换主题 | `true`/`false` | `true` |

---

## `toc`
| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | 是否启用页面目录 | `true` |
| `maxLevel` | number (1-6) | 展示的最大标题层级 | `3` |
| `title` | string | 目录标题 | `"本页内容"` |

说明：具体锚点与是否显示也可能受页面 Frontmatter 影响。

---

## `footer`
| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否显示页脚 |
| `copyright` | string | 版权文案 |
| `repository` | Repository(可选) | 仓库信息（如“在 GitHub 上编辑此页”） |
| `lastUpdated` | string(可选) | 站点/内容最近更新时间 |
| `links` | Link[](可选) | 页脚链接列 |
| `social` | Social[](可选) | 社交图标链接 |

Repository
| 字段 | 类型 | 说明 | 示例 |
| :-- | :-- | :-- | :-- |
| `url` | string | 仓库地址 | `"https://github.com/user/repo"` |
| `branch` | string | 文档所在分支 | `"main"` |

Link
| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `title` | string | 链接标题 |
| `link` | string | 路径或 URL |
| `external` | boolean(可选) | 新开标签 |

Social
| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `name` | string | 平台名称（如 `github`/`twitter`/`bilibili`） |
| `url` | string | 个人页或链接 |
| `icon` | string | 图标名 |

---

## `pwa`（可选）
| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `enabled` | boolean | 是否启用 PWA（预留） |
| `name` | string | 应用名 |
| `shortName` | string | 应用短名 |
| `description` | string | 应用描述 |
| `themeColor` | string | 主题色 |
| `backgroundColor` | string | 背景色 |

---


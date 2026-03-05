# 配置说明

配置文件：`public/config/site.yaml`

## site

网站基本信息。

| 字段 | 说明 |
|------|------|
| title | 网站标题 |
| description | 网站描述 |
| logo | Logo（emoji 或图片路径） |
| author | 作者 |

## navbar

顶部导航栏。

| 字段 | 说明 |
|------|------|
| showLogo | 显示 Logo |
| showTitle | 显示标题 |
| showLanguageSwitcher | 显示语言切换 |
| items | 导航项 |
| actions | 操作按钮 |

## sidebar

侧边栏导航。

| 字段 | 说明 |
|------|------|
| enabled | 启用侧边栏 |
| collections | 导航集合 |

## theme

主题配置。

| 字段 | 说明 |
|------|------|
| defaultMode | 默认模式（light/dark/auto） |
| allowToggle | 允许切换主题 |

## toc

目录配置。

| 字段 | 说明 |
|------|------|
| enabled | 启用目录 |
| maxLevel | 最大标题层级 |
| title | 目录标题 |

## footer

页脚配置。

| 字段 | 说明 |
|------|------|
| enabled | 启用页脚 |
| copyright | 版权信息 |
| links | 链接列表 |
| social | 社交链接 |

## pwa

PWA 配置。

| 字段 | 说明 |
|------|------|
| enabled | 启用 PWA |
| name | 应用名称 |
| shortName | 短名称 |

## contextMenu

右键菜单配置。

| 字段 | 说明 |
|------|------|
| enabled | 启用右键菜单 |
| page | 页面菜单项 |
| site | 站点菜单项 |
| appearance | 外观菜单项 |
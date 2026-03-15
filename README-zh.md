简体中文 | [English](README.md)

## react-docs-ui

React 文档站 UI 组件库。用即用型应用外壳快速构建现代文档站。

### 安装

```bash
npm install react-docs-ui
```

### 快速开始

完整应用（读取 `public/config/site(.lang).yaml` 和 `public/docs/<lang>/**/*.md`）：

```tsx
import 'react-docs-ui/dist/style.css'
import { DocsApp } from 'react-docs-ui'

export default function App() {
  return <DocsApp />
}
```

### 特性

- 配置驱动，通过 `site.yaml` 控制
- MD/MDX 支持，代码语法高亮
- 明暗主题切换
- 命令菜单（Cmd+K）
- 右键菜单
- 国际化支持
- 目录导航
- PWA 支持
- AI 集成（需配置 API 密钥）

### 导出

- 布局：`DocsLayout`
- 应用外壳：`DocsApp`
- 导航：`HeaderNav`、`SidebarNav`、`TableOfContents`
- 主题：`ThemeProvider`、`ModeToggle`、`LanguageSwitcher`
- Markdown：`MdxContent`
- 基础组件：`ScrollArea`、`Tooltip`、`Dialog`、`DropdownMenu`、`Command`、`ContextMenu`

### 许可证

MIT

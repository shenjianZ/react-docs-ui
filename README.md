English | [简体中文](README-zh.md)

## react-docs-ui

React documentation site UI components. Build modern docs sites with a ready-to-use app shell.

### Install

```bash
npm install react-docs-ui
```

### Quick Start

Full app (reads `public/config/site(.lang).yaml` and `public/docs/<lang>/**/*.md`):

```tsx
import 'react-docs-ui/dist/style.css'
import { DocsApp } from 'react-docs-ui'

export default function App() {
  return <DocsApp />
}
```

### Features

- Configuration-driven via `site.yaml`
- MD/MDX with syntax highlighting
- Light/dark themes
- Command menu (Cmd+K)
- Context menu
- Internationalization
- Table of contents
- PWA support
- AI integration (requires API key)

### Exports

- Layout: `DocsLayout`
- App shell: `DocsApp`
- Navigation: `HeaderNav`, `SidebarNav`, `TableOfContents`
- Theming: `ThemeProvider`, `ModeToggle`, `LanguageSwitcher`
- Markdown: `MdxContent`
- Primitives: `ScrollArea`, `Tooltip`, `Dialog`, `DropdownMenu`, `Command`, `ContextMenu`

### License

MIT
English | [简体中文](README-zh.md)

## react-docs-ui

React documentation site UI components. Build modern docs sites with a ready-to-use app shell.

### Install

```bash
npx create-react-docs-ui@latest my-docs
```

### Quick Start

Use the official scaffolding tool. Manual integration is no longer recommended because configuration parsing and runtime behavior depend on the generated project structure.

```bash
cd my-docs
npm install
npm run dev
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

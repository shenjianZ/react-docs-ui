English | [简体中文](README-zh.md)

## react-docs-ui

React documentation site UI components. Build modern docs sites with a ready-to-use app shell.

### Install

```bash
pnpm create react-docs-ui my-docs
```

### Quick Start

Use the official scaffolding tool. Manual integration is no longer recommended because configuration parsing and runtime behavior depend on the generated project structure.

```bash
cd my-docs
pnpm install
pnpm dev
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

### AI Agent Skills

We provide AI Agent Skills to help you work more efficiently with react-docs-ui:

- [React Docs UI Skills](https://github.com/shenjianZ/react-docs-skills)

These skills can help you:
- 📝 Write configuration files
- 📚 Write documentation
- 🚀 Create new projects

Visit the [Skills repository](https://github.com/shenjianZ/react-docs-skills) to learn more.

### Exports

- Layout: `DocsLayout`
- App shell: `DocsApp`
- Navigation: `HeaderNav`, `SidebarNav`, `TableOfContents`
- Theming: `ThemeProvider`, `ModeToggle`, `LanguageSwitcher`
- Markdown: `MdxContent`
- Primitives: `ScrollArea`, `Tooltip`, `Dialog`, `DropdownMenu`, `Command`, `ContextMenu`

### License

MIT

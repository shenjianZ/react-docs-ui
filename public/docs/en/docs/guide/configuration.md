# Configuration File (`site.yaml`) Explained

The project is configuration-driven. Most site behavior is controlled by `public/config/site.yaml` for Chinese and `public/config/site.en.yaml` for English. This page documents the fields supported by the current runtime and also calls out a few legacy or sample-only fields where relevant.

## Top-level keys

| Key | Purpose |
| :-- | :-- |
| `site` | Basic site metadata such as title, description, and logo |
| `navbar` | Top navigation bar |
| `sidebar` | Sidebar navigation tree |
| `theme` | Theme mode and theme-switch behavior |
| `toc` | Right-side table of contents |
| `imageViewer` | Image preview viewer |
| `footer` | Footer content |
| `contextMenu` | Context menu options |
| `mdx` | MDX component scanning and mappings |
| `fonts` | Site fonts and build-time font downloads |
| `codeHighlight` | Syntax highlighting languages and themes |
| `search` | Full-text search |
| `export` | Markdown / PDF / Word / bulk export |
| `ai` | Global AI feature switch |
| `pwa` | PWA-related settings |

## Site `site`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `title` | string | Site title | `"React Docs UI Example"` |
| `description` | string | Site description, usually used on the homepage and for SEO | `"Documentation site built with React Docs UI"` |
| `logo` | string or object | Site logo. Can be an emoji, image path, absolute URL, or a light/dark object | `"📚"` / `"/images/logo.png"` / `{ light: "...", dark: "..." }` |
| `author` | string | Sample metadata field. Not directly consumed by the current runtime | `"React Docs UI Team"` |

Common `logo` formats:

- emoji: `"🤖"`
- public asset path: `"/images/logo.png"`
- absolute URL: `"https://example.com/logo.png"`
- light/dark object: `{ light: "/images/logo.svg", dark: "/images/logo-dark.svg" }`

## Navbar `navbar`

| Field | Type | Description |
| :-- | :-- | :-- |
| `showLogo` | boolean | Whether to show the top-left logo |
| `showTitle` | boolean | Whether to show the site title |
| `showLanguageSwitcher` | boolean | Whether to show the language switcher |
| `items` | `NavbarItem[]` | Main navigation items |
| `actions` | `NavbarAction[]` | Right-side action buttons |

`NavbarItem`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `title` | string | Navigation label | `"Docs"` |
| `link` | string | Internal path or external URL | `"/docs"` |
| `external` | boolean | Open in a new tab for external links | `true` |
| `visible` | boolean | Hide the item when set to `false` | `true` |
| `active` | boolean | Sample-only field. Not used by the current runtime | `true` |

`NavbarAction`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `type` | string | Preset action type. Affects icon resolution | `"github"` |
| `title` | string | Label for a custom action | `"API"` |
| `link` | string | Target URL | `"https://example.com/api"` |
| `icon` | string | Custom icon name, usually used instead of `type` | `"link"` |
| `enabled` | boolean | Whether the action is enabled | `true` |

Common `type` / `icon` values:

- `github`
- `gitee`
- `gitea`
- `gitlab`
- `link`
- `external`
- `globe`

## Sidebar `sidebar`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Global switch. If omitted, the runtime infers visibility from the data |
| `collections` | `Record<string, SidebarCollection>` | Recommended structure. Splits sidebars by first route segment |
| `sections` | `SidebarSection[]` | Legacy single-tree structure |

`SidebarCollection`

| Field | Type | Description |
| :-- | :-- | :-- |
| `sections` | `SidebarSection[]` | Sections inside the collection |

`SidebarSection`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `title` | string | Section title | `"Getting Started"` |
| `path` | string | Base path used for expand/highlight matching | `"/docs/guide"` |
| `children` | `SidebarItem[]` | Child pages | |

`SidebarItem`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `title` | string | Child item title | `"Installation"` |
| `path` | string | Full document path | `"/docs/guide/installation"` |

## Theme `theme`

| Field | Type | Description | Options | Default |
| :-- | :-- | :-- | :-- | :-- |
| `defaultMode` | string | Default theme mode | `light` / `dark` / `auto` | `auto` |
| `allowToggle` | boolean | Whether users can switch theme manually | `true` / `false` | `true` |

Notes:

- `defaultMode: "auto"` follows the system preference.
- If `allowToggle: false`, the theme switch UI is hidden.

## Table Of Contents `toc`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | Enable the right-side TOC | `true` |
| `maxLevel` | number | Maximum heading depth to show, usually `1-6` | `3` |
| `title` | string | TOC title | `"On This Page"` |

## Image Viewer `imageViewer`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Enable the image viewer |
| `labels` | object | UI text used by the image viewer |

`imageViewer.labels`

| Field | Type | Description |
| :-- | :-- | :-- |
| `preview` | string | Preview image label |
| `zoomIn` | string | Zoom in |
| `zoomOut` | string | Zoom out |
| `fit` | string | Fit to viewport |
| `actualSize` | string | Actual size |
| `reset` | string | Reset zoom and rotation |
| `rotateLeft` | string | Rotate left |
| `rotateRight` | string | Rotate right |
| `fullscreen` | string | Fullscreen |
| `download` | string | Download |
| `openInNewTab` | string | Open in new tab |
| `close` | string | Close viewer |
| `imageAltFallback` | string | Fallback text when an image has no alt |
| `downloadSuccess` | string | Download success message |
| `downloadError` | string | Download failure message |
| `fullscreenError` | string | Fullscreen failure message |
| `openInNewTabError` | string | New-tab failure message |
| `imageLoadError` | string | Image load failure message |

You only need to define the labels you want to override.

## Footer `footer`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Show footer |
| `copyright` | string | Copyright text |
| `repository` | object | Repository metadata used by footer features |
| `lastUpdated` | string | Last updated text shown in the footer |
| `version` | string | Version text shown in the footer |
| `groups` | `FooterGroup[]` | Grouped footer link blocks |
| `links` | `FooterLink[]` | Simple footer links |
| `social` | `FooterSocial[]` | Social icon links |
| `builtWith` | array | Reserved field. Not directly rendered by the current footer |

`footer.repository`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `url` | string | Repository URL | `"https://github.com/your/repo"` |
| `branch` | string | Branch name | `"main"` |

`FooterGroup`

| Field | Type | Description |
| :-- | :-- | :-- |
| `title` | string | Group title |
| `items` | `FooterLink[]` | Links inside the group |

`FooterLink`

| Field | Type | Description |
| :-- | :-- | :-- |
| `title` | string | Link label |
| `link` | string | Link URL or path |
| `external` | boolean | Open in a new tab |
| `action` | string | Legacy action field. The built-in supported value is `scrollTop` |

`FooterSocial`

| Field | Type | Description |
| :-- | :-- | :-- |
| `name` | string | Provider name for semantics and debugging |
| `url` | string | Social URL |
| `link` | string | Legacy alternative to `url` |
| `icon` | string | Icon name |

## Context Menu `contextMenu`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Enable the context menu |
| `page` | object | Page-level menu item switches |
| `site` | object | Site-level menu item switches |
| `appearance` | object | Appearance-related menu item switches |

`contextMenu.page`

| Field | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `copySelectedText` | boolean | Copy selected text | `true` |
| `copyUrl` | boolean | Copy current URL | `true` |
| `copyTitle` | boolean | Copy page title | `false` |
| `copyMarkdownLink` | boolean | Copy Markdown link | `false` |
| `openInNewTab` | boolean | Open in new tab | `false` |
| `reload` | boolean | Reload page | `true` |
| `printPage` | boolean | Print page | `true` |
| `scrollToTop` | boolean | Scroll to top | `true` |
| `scrollToBottom` | boolean | Scroll to bottom | `true` |

`contextMenu.site`

| Field | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `goHome` | boolean | Go to home | `true` |
| `quickNav` | boolean | Quick navigation | `false` |
| `language` | boolean | Language switch | `false` |

`contextMenu.appearance`

| Field | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `theme` | boolean | Theme switch | `false` |
| `resetThemePref` | boolean | Reset saved theme preference | `false` |

## MDX `mdx`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `componentsPath` | string | Path used to auto-scan custom MDX components | `"/src/components"` |
| `enabled` | boolean | Enable MDX support | `true` |
| `components` | `Record<string, string>` | Manual mapping from component name to file path | `{ Demo: "/src/components/Demo.tsx" }` |

Notes:

- `componentsPath` is used for auto scanning.
- `components` is used for manual overrides or additions.
- Both can be used together.

## Fonts `fonts`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `fontFamilyZhCn` | string | Chinese font stack | `"MiSans, PingFang SC, sans-serif"` |
| `fontFamilyEn` | string | English or monospace font stack | `"Fragment Mono, system-ui, sans-serif"` |
| `downloadFonts` | string[] | Font file names that should be prepared into `public/fonts` during dev/build | `["FragmentMono-Regular.woff2"]` |

Notes:

- The page renders with system fonts first, then switches to configured site fonts asynchronously.
- `downloadFonts` is a build helper, not a runtime network allow-list.

## Code Highlight `codeHighlight`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `langs` | string[] | Languages to preload for highlighting | `["bash", "yaml", "typescript", "tsx"]` |
| `lightTheme` | string | Light theme name | `"github-light"` |
| `darkTheme` | string | Dark theme name | `"github-dark"` |

Notes:

- Only list languages your site actually uses.
- Unlisted code blocks fall back to plain `code`.
- Language names should match Shiki language names or supported aliases.

## Search `search`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | Enable full-text search | `true` |
| `placeholder` | string | Search box placeholder | `"Search docs..."` |
| `maxResults` | number | Maximum number of returned results | `20` |
| `snippetLength` | number | Sample/reserved field. Not directly used by the current runtime | `120` |

## Export `export`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Enable export features |
| `markdown` | boolean | Allow Markdown export |
| `pdf` | boolean | Allow PDF export |
| `word` | boolean | Allow Word export |
| `allDocs` | boolean | Allow bulk export for all docs |
| `pdfServer` | object | Server-side PDF settings |

`export.pdfServer`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | Enable server-side PDF generation | `true` |
| `url` | string | PDF server URL | `"http://localhost:3001"` |

Notes:

- If `pdfServer.enabled` is `false`, PDF export falls back to browser print/export.

## AI `ai`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Global switch for AI features |

## PWA `pwa`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Enable PWA support |
| `name` | string | App name |
| `shortName` | string | Short app name |
| `description` | string | App description |
| `themeColor` | string | Theme color |
| `backgroundColor` | string | Background color |

## Recommendations

- Treat the latest template `site.yaml` as the primary reference instead of relying on older blog posts or README snippets.
- Do not depend on fields marked as reserved, legacy, or sample-only as core runtime features.
- If you add a new config field, update `src/lib/config.ts`, the template example, and this page together so docs and runtime stay aligned.

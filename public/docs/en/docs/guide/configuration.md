---
title: Configuration File (`site.yaml`) Explained
description: Explains the main site.yaml and site.en.yaml fields used by the template project
author: React Docs UI Team
createdAt: 2026-03-25
lastUpdated: 2026-03-27
---

# Configuration File (`site.yaml`) Explained

The project is configuration-driven. Most site behavior is controlled by `public/config/site.yaml` for Chinese and `public/config/site.en.yaml` for English. This page documents the fields supported by the current runtime and also calls out a few legacy or sample-only fields where relevant.

## Top-level keys

| Key | Purpose |
| :-- | :-- |
| `site` | Basic site metadata such as title, description, and logo |
| `navbar` | Top navigation bar |
| `announcement` | Top announcement bar |
| `versions` | Documentation version configuration |
| `changelog` | Changelog list-page and title configuration |
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
| `seo` | Page SEO tag configuration |
| `sitemap` | Sitemap auto-generation |
| `feed` | RSS Feed configuration |
| `breadcrumb` | Breadcrumb navigation |
| `reading` | Reading experience (reading time, progress bar) |
| `export` | Markdown / PDF / Word / bulk export |
| `pageMeta` | Page-level metadata display configuration |
| `editLink` | Edit-this-page link configuration |
| `feedback` | Page feedback configuration |
| `ai` | Global AI feature switch |
| `pwa` | PWA-related settings |

## Site `site`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `title` | string | Site title | `"React Docs UI Example"` |
| `description` | string | Site description, usually used on the homepage and for SEO | `"Documentation site built with React Docs UI"` |
| `url` | string | Base site URL used to build canonical, `hreflang`, and `og:url` | `"https://your-docs-site.example.com"` |
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

## Announcement `announcement`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | Whether to show the announcement bar | `true` |
| `text` | string | Announcement text | `"React Docs UI now supports Tabs"` |
| `link` | string | Target URL when clicked | `"https://github.com/..."` |
| `dismissible` | boolean | Whether users can dismiss the bar | `true` |

## Versions `versions`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Whether version switching is enabled |
| `current` | string | Default current version value |
| `items` | `VersionItem[]` | Available versions |

`VersionItem`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `value` | string | Version value used in the route | `"v1"` |
| `label` | string | Label shown in the UI | `"v1"` |

When enabled, the versioned route format is `/:lang/v/:version/*`, for example: `/en/v/v1/docs/guide/introduction`.

Recommended versioned document directories:

- `public/docs/zh-cn/v1/docs/...`
- `public/docs/en/v1/docs/...`

If a page is missing under a version directory, the current runtime falls back to the unversioned document.

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

## Changelog `changelog`

| Field | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | Enable the changelog module | `true` |
| `title` | string | List page title | `"Changelog"` |
| `showInNavbar` | boolean | Whether to show the entry in the navbar | `true` |
| `showInSidebar` | boolean | Whether to show the entry in the sidebar | `false` |
| `pageSize` | number | Number of items per page; if omitted, the list page shows all items | `10` |

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

### Extended image syntax in documents

Besides the global `imageViewer.enabled` switch, page authors can override behavior per image in Markdown or HTML, including size, preview on/off, inline rendering, and horizontal/vertical offsets.

You can append options in the Markdown image title string:

```md
![Cover image](/images/og-default.png "width=320 preview=true")
![Status icon](/images/success.svg "width=18 inline=true preview=false x=4 y=-2")
```

Supported options:

- `width=24` / `height=24`: set width or height
- `size=24`: set both width and height
- `preview=true|false`: enable or disable preview for this image only
- `inline=true`: render as an inline element instead of a full block
- `x=4` / `y=-2`: apply horizontal or vertical offset, useful for small icons and text baseline alignment

If you prefer raw HTML, you can also use a native `<img>` tag:

```html
<img src="/images/success.svg" alt="Status icon" width="18" data-inline="true" data-preview="false" data-offset-x="4" data-offset-y="-2" />
```

Common HTML `img` attributes:

- `width` / `height`
- `data-preview="true|false"`
- `data-inline="true"`
- `data-offset-x="4"`
- `data-offset-y="-2"`

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

## SEO `seo`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Enable page-level SEO tag injection |
| `defaultTitle` | string | Default page title |
| `titleTemplate` | string | Title template with `{title}` and `{siteTitle}` |
| `defaultDescription` | string | Default description |
| `defaultOgImage` | string | Default social share image |
| `robots` | string | Default robots content |
| `twitterCard` | string | Twitter card type |

Notes:

- `site.url` is required for `canonical`, `hreflang`, and `og:url`.
- Page frontmatter can override `title`, `description`, `canonical`, and supports `noindex: true`.
- Versioned pages automatically keep the `/v/:version` prefix.

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

## Page Meta `pageMeta`

| Field | Type | Description |
| :-- | :-- | :-- |
| `showLastUpdated` | boolean | Show the page last-updated value |
| `showEditLink` | boolean | Show the "Edit this page" link |
| `showAuthors` | boolean | Show the author |
| `preferGitMeta` | boolean | Prefer build-time git metadata over frontmatter |

Page-level meta first reads `public/doc-git-meta.json`; if no git data is available, it falls back to frontmatter `lastUpdated` / `authors` / `author`. Use `createdAt` for created time.

## Edit Link `editLink`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Enable the edit link |
| `label` | string | Link label |
| `urlTemplate` | string | Edit URL template |

Supported variables: `{lang}`, `{slug}`, `{docPath}`, `{ext}`, `{filePath}`.

## Feedback `feedback`

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Show the page feedback section |
| `endpoint` | string | Feedback endpoint; when empty, submission is stored locally only |
| `method` | string | Request method, currently `POST` |
| `includePageMeta` | boolean | Include page metadata in the payload |
| `labels` | object | UI labels for the feedback block |

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

## Sitemap `sitemap`

| Field | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | Whether to generate `sitemap.xml` at build time | `true` |
| `changefreq` | string | Page update frequency | `"weekly"` |
| `priority` | number | Page priority, range `0.0 - 1.0` | `0.7` |
| `exclude` | string[] | Paths to exclude. Supports exact paths, suffix wildcards (`*.pdf`), and directory wildcards (`/en/private/*`) | `[]` |

Notes:

- Requires `site.url` to be configured; otherwise full URLs cannot be generated.
- Automatically scans all doc pages at build time, filtering out `draft: true` and `noindex: true` pages.
- Valid `changefreq` values: `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`.
- Output goes to `public/sitemap.xml`.

## RSS Feed `feed`

| Field | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | Whether to generate `feed.xml` at build time | `true` |
| `title` | string | Feed title | Site title |
| `description` | string | Feed description | Site description |
| `limit` | number | Maximum number of RSS items | `20` |

Notes:

- RSS items are sourced from changelog release notes in the docs directory.
- Requires `site.url` to be configured.
- Browsers auto-discover the RSS feed via `<link rel="alternate" type="application/rss+xml">`.
- Output goes to `public/feed.xml`.

## Breadcrumb `breadcrumb`

| Field | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `enabled` | boolean | Whether to show breadcrumb navigation | `true` |
| `showHome` | boolean | Whether to show the home entry (icon and label) | `true` |

Notes:

- Breadcrumb paths are generated automatically based on `sidebar.collections` or `sidebar.sections`.
- Changelog detail pages display as `Home > Changelog > Version`.
- Set to `false` to hide breadcrumb navigation entirely.

## Reading Experience `reading`

| Field | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `showTime` | boolean | Whether to show estimated reading time | `true` |
| `showProgress` | boolean | Whether to show the reading progress bar | `false` |

Notes:

- Reading time is estimated automatically based on content: Chinese at 300 chars/min, English at 200 words/min.
- The progress bar appears at the top of the page and updates in real time as you scroll.
- Both features can be toggled independently.

## Recommendations

- Treat the latest template `site.yaml` as the primary reference instead of relying on older blog posts or README snippets.
- Do not depend on fields marked as reserved, legacy, or sample-only as core runtime features.
- If you add a new config field, update `src/lib/config.ts`, the template example, and this page together so docs and runtime stay aligned.

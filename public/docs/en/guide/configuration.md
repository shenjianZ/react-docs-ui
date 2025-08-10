# Configuration File (`site.yaml`) Explained

The core of `react-docs-ui` is its **configuration-driven** philosophy. You can define the entire look and behavior of your website almost exclusively through the `public/config/site.yaml` file. This document explains each configuration option in detail.

## Top-Level Configuration Overview

| Top-Level Field | Description |
| :--- | :--- |
| `site` | Global site information, such as title, description, and logo. |
| `navbar` | Configures the top navigation bar of the website. |
| `sidebar` | Configures the navigation menu in the website's sidebar. |
| `theme` | Configures the website's theme, such as colors and light/dark mode. |
| `footer` | Configures the footer information at the bottom of the website. |
| `toc` | Configures the Table of Contents on the right side of article pages. |

---

## `site`

Basic metadata configuration for the website.

| Field | Description | Example |
| :--- | :--- | :--- |
| `title` | The website title, displayed in the browser tab. | `"React Docs UI"` |
| `description` | The website description, used for Search Engine Optimization (SEO). | `"A React documentation website builder"` |
| `logo` | The website logo, displayed in the top-left corner of the navbar. | `"📚"` or `"/images/logo.png"` or an object with `light` and `dark` image paths |
| `author` | The author of the website. | `"React Docs UI Team"` |

**Logo Format Guide:**
1.  **Emoji**: Use an emoji directly, like `"🚀"`.
2.  **Local Image**: A path to an image in the `public` directory, like `"/images/logo.png"`.
3.  **Light/Dark Mode Images**: An object with `light` and `dark` keys, pointing to different image paths for each theme.

---

## `navbar`

Top navigation bar configuration.

| Field | Description |
| :--- | :--- |
| `items` | An array of navigation items that defines all the links displayed in the navbar. |
| `actions` | (Optional) Action buttons on the right side of the navbar, such as a GitHub link. |

### `navbar.items`

| Field | Description | Example |
| :--- | :--- | :--- |
| `title` | The display text for the navigation item. | `"Guide"` |
| `link` | The link address. Internal links start with `/`. | `"/guide/introduction"` |
| `external` | (Optional) If `true`, it's an external link that will open in a new tab. | `true` |

---

## `sidebar`

Sidebar navigation configuration, which is the core of the documentation structure. It uses `collections` to organize different sections of content.

| Field | Description |
| :--- | :--- |
| `collections` | An object where keys are collection names (usually corresponding to top-level routes like `guide`), and values are the sidebar configurations for that collection. |

### `sidebar.collections.<name>.sections`

Each collection contains a `sections` array, where each `section` represents a collapsible menu group.

| Field | Description | Example |
| :--- | :--- | :--- |
| `title` | The title of the section. | `"Getting Started"` |
| `path` | The base path for the section. When a user visits a URL starting with this path, this section will automatically expand and be highlighted. | `"/guide"` |
| `children` | An array of child links under this section. | |

### `sidebar.collections.<name>.sections.children`

| Field | Description | Example |
| :--- | :--- | :--- |
| `title` | The display text for the child link. | `"Introduction"` |
| `path` | The full path to the child link, pointing to a specific Markdown page. | `"/guide/introduction"` |

---

## `theme`

Theme and appearance configuration.

| Field | Description | Options | Default |
| :--- | :--- | :--- | :--- |
| `defaultMode` | The default theme mode for the website. | `'light'`, `'dark'`, `'system'` | `'system'` |
| `allowToggle` | Whether to allow users to switch the theme. | `true`, `false` | `true` |

---

## `footer`

Footer configuration.

| Field | Description | Example |
| :--- | :--- | :--- |
| `copyright` | Copyright information. `{year}` will be replaced with the current year. | `"Copyright © {year} My Company"` |
| `repository` | (Optional) Repository information, used for displaying links like "Edit this page on GitHub". | |
| `links` | (Optional) Additional link columns displayed in the footer. | |
| `social` | (Optional) Social media icon links displayed in the footer. | |

### `footer.repository`

| Field | Description | Example |
| :--- | :--- | :--- |
| `url` | The URL of the repository. | `"https://github.com/user/repo"` |
| `branch` | The Git branch where the documentation is located. | `"main"` |
| `dir` | The root directory of the documentation files in the repository. | `"docs/src"` |

---

## `toc` (Table of Contents)

Configuration for the table of contents on the right side of article pages.

| Field | Description | Example |
| :--- | :--- | :--- |
| `enabled` | Whether to enable the page table of contents feature. | `true` |
| `maxLevel` | The maximum heading level (h1-h6) to display in the TOC. | `3` |
| `title` | The title of the TOC component. | `"On this page"` |
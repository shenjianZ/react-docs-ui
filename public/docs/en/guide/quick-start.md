# Quick Start

This guide will help you understand the basics of Vue Docs UI and get your documentation website up and running quickly.

## Project Overview

Vue Docs UI follows a simple file-based routing system. Your documentation is organized as:

- **Configuration**: `public/config/site.yaml` - Site settings and navigation
- **Content**: `public/docs/` - Markdown files for your documentation pages
- **Assets**: `public/images/` - Images and other static assets

## Writing Your First Page

Let's create a simple documentation page:

### 1. Create a Markdown File

Create a new file at `public/docs/my-first-page.md`:

```markdown
# My First Page

Welcome to my documentation! This is written in **Markdown**.

## Features

- Easy to write
- Supports code syntax highlighting
- Responsive design
- Built-in search

## Code Example

Here's a simple Vue component:

```vue
<template>
  <div class="hello">
    <h1>{{ message }}</h1>
  </div>
</template>

<script setup lang="ts">
const message = "Hello Vue Docs UI!"
</script>
```

## Lists and More

1. Ordered lists work great
2. With automatic numbering
3. And proper styling

- Unordered lists too
- With bullet points
- And consistent spacing

> **Tip**: Use blockquotes for important notes and tips!
```

### 2. Add to Navigation

Update your `public/config/site.yaml` to include the new page:

```yaml
sidebar:
  sections:
    - title: "Getting Started"
      path: "/guide"
      children:
        - title: "My First Page"
          path: "/my-first-page"
```

### 3. View Your Page

Start the development server and navigate to your new page:

```bash
npm run dev
```

Visit `http://localhost:5173/my-first-page` to see your page!

## Understanding Configuration

The `site.yaml` file controls your entire site structure:

### Site Settings
```yaml
site:
  title: "Your Site Title"
  description: "Site description for SEO"
  logo: "📚"  # Emoji, image URL, or path
  author: "Your Name"
```

### Navigation Bar
```yaml
navbar:
  items:
    - title: "Home"
      link: "/"
    - title: "GitHub"
      link: "https://github.com/username/repo"
      external: true
```

### Sidebar Navigation
```yaml
sidebar:
  sections:
    - title: "Section Name"
      path: "/section"
      children:
        - title: "Page Title"
          path: "/page-path"
```

## Markdown Features

Vue Docs UI supports enhanced Markdown with:

### Code Highlighting
```javascript
// JavaScript code is highlighted
function greet(name) {
  return `Hello, ${name}!`
}
```

### Tables
| Feature | Status | Description |
|---------|--------|-------------|
| Responsive | ✅ | Works on all devices |
| Themes | ✅ | Light and dark mode |
| Search | ✅ | Built-in search |

### Math (Optional)
If you need math equations, you can add support for LaTeX:

Inline math: $E = mc^2$

Block math:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Customizing Appearance

### Theme Colors
Customize your site's colors in `site.yaml`:

```yaml
theme:
  colors:
    primary: "#3b82f6"    # Main brand color
    secondary: "#64748b"  # Secondary text
    accent: "#06b6d4"     # Accent color
```

### Fonts
```yaml
theme:
  fonts:
    primary: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    mono: "JetBrains Mono, Consolas, monospace"
```

## Adding Images

Place images in `public/images/` and reference them in your Markdown:

```markdown
![Logo](/images/logo.png)
```

Or with custom sizing:
```markdown
<img src="/images/screenshot.png" alt="Screenshot" width="600">
```

## Best Practices

### 1. Organize Your Content
```
public/docs/
├── guide/
│   ├── introduction.md
│   ├── installation.md
│   └── quick-start.md
├── api/
│   ├── components.md
│   └── utilities.md
└── examples/
    ├── basic.md
    └── advanced.md
```

### 2. Use Descriptive Titles
- Good: "Setting up Authentication"
- Bad: "Auth Setup"

### 3. Add Table of Contents
Enable TOC in your `site.yaml`:

```yaml
toc:
  enabled: true
  maxLevel: 3
  title: "On This Page"
```

### 4. Link Between Pages
Use relative links to connect your content:

```markdown
Check out our [Installation Guide](/guide/installation) for setup instructions.
```

## What's Next?

Now that you understand the basics:

1. **[Configuration](/guide/configuration)** - Learn about all available options
2. **[Advanced Features](/advanced/customization)** - Customize your site further
3. **[Deployment](/advanced/deployment)** - Deploy your site to production

Happy documenting! 🚀 
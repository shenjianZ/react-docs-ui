# Quick Start

## 1. Create Project

```bash
npx create-react-docs-ui@latest my-docs
cd my-docs
npm install
```

## 2. Add Documentation

Create Markdown files in `public/docs/en/`:

```markdown
---
title: My Page
---

# My Page

Content...
```

## 3. Configure Navigation

Edit `public/config/site.yaml`:

```yaml
navbar:
  items:
    - title: "Home"
      link: "/en/"
    - title: "My Page"
      link: "/en/my-page"

sidebar:
  collections:
    guide:
      sections:
        - title: "Docs"
          path: "/en"
          children:
            - title: "My Page"
              path: "/en/my-page"
```

## 4. Start

```bash
npm run dev
```

Visit http://localhost:5173
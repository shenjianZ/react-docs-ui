# Configuration

## Configuration Overview

Vue Docs UI provides flexible configuration options that allow you to customize the appearance and behavior of your documentation website.

## Basic Configuration

### site.yaml File

The configuration file is located at `public/config/site.yaml` and contains the following main sections:

```yaml
# Website Configuration
site:
  title: "Vue Docs UI"
  description: "Beautiful documentation websites made simple"
  logo: "📚"
  author: "Vue Docs UI Team"
```

### Navigation Bar Configuration

```yaml
navbar:
  items:
    - title: "Home"
      link: "/"
      active: true
    - title: "Documentation"
      link: "/guide"
```

### Sidebar Configuration

```yaml
sidebar:
  sections:
    - title: "Getting Started"
      path: "/guide"
      children:
        - title: "Introduction"
          path: "/guide/introduction"
```

## Theme Configuration

### Color Customization

```yaml
theme:
  colors:
    primary: "#3b82f6"
    secondary: "#64748b"
    accent: "#06b6d4"
```

### Font Configuration

```yaml
theme:
  fonts:
    primary: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    mono: "JetBrains Mono, Consolas, monospace"
```

## Advanced Configuration

For more advanced configuration options, please refer to the related documentation. 
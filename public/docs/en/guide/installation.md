# Installation

Get Vue Docs UI up and running in your project with these simple steps.

## Prerequisites
Before you begin, make sure you have the following installed:

- **Node.js** 14.18+ or 16+
- **npm** 6+ or **yarn** 1.22+

## Quick Start

The fastest way to get started is using our CLI tool:

```bash
# Create a new project
npm create vue-docs-ui@latest my-docs

# Navigate to your project
cd my-docs

# Install dependencies
npm install

# Start the development server
npm run dev
```

Your documentation website will be running at `http://localhost:5173`!

## Manual Installation

If you prefer to set up Vue Docs UI manually in an existing project:

### 1. Install Vue Docs UI

```bash
npm install vue-docs-ui
```

### 2. Create Your App

Create a `main.ts` file:

```typescript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 3. Create App Component

Create an `App.vue` file:

```vue
<template>
  <DocsLayout />
</template>

<script setup lang="ts">
import { DocsLayout } from 'vue-docs-ui'
import 'vue-docs-ui/style.css'
</script>
```

### 4. Configure Your Site

Create a `public/config/site.yaml` file with your site configuration:

```yaml
site:
  title: "My Documentation"
  description: "My awesome documentation website"
  logo: "📚"
  author: "Your Name"
```

### 5. Add Your Content

Create your documentation files in the `public/docs/` directory as Markdown files.

## Project Structure

After installation, your project structure should look like this:

```
my-docs/
├── public/
│   ├── config/
│   │   └── site.yaml
│   └── docs/
│       └── guide/
│           └── introduction.md
├── src/
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
└── vite.config.js
```

## Development

Start the development server:

```bash
npm run dev
```

Your site will be available at `http://localhost:5173` with hot reload enabled.

## Building for Production

Build your documentation for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service.

## Next Steps

- [Quick Start Guide](/guide/quick-start) - Learn the basics
- [Configuration](/guide/configuration) - Customize your site
- [Examples](/examples) - See Vue Docs UI in action 



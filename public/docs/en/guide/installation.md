# Installation

## Prerequisites

- Node.js >= 18
- npm, yarn, or pnpm

## Using Scaffolding

```bash
npx create-react-docs-ui@latest my-docs
cd my-docs
npm install && npm run dev
```

## Manual Installation

```bash
npm install react-docs-ui
```

Configure `public/config/site.yaml` and `public/docs/en/**/*.md`.

In `src/main.tsx`:

```tsx
import { DocsApp } from 'react-docs-ui'
import 'react-docs-ui/dist/style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DocsApp />
)
```
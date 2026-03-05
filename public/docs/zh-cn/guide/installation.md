# 安装

## 环境要求

- Node.js >= 18
- npm、yarn 或 pnpm

## 使用脚手架

```bash
npx create-react-docs-ui@latest my-docs
cd my-docs
npm install && npm run dev
```

## 手动安装

```bash
npm install react-docs-ui
```

配置 `public/config/site.yaml` 和 `public/docs/zh-cn/**/*.md`。

在 `src/main.tsx` 中：

```tsx
import { DocsApp } from 'react-docs-ui'
import 'react-docs-ui/dist/style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DocsApp />
)
```
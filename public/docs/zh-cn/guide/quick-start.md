# 快速开始

## 1. 创建项目

```bash
npx create-react-docs-ui@latest my-docs
cd my-docs
npm install
```

## 2. 添加文档

在 `public/docs/zh-cn/` 创建 Markdown 文件：

```markdown
---
title: 我的页面
---

# 我的页面

内容...
```

## 3. 配置导航

编辑 `public/config/site.yaml`：

```yaml
navbar:
  items:
    - title: "首页"
      link: "/zh-cn/"
    - title: "我的页面"
      link: "/zh-cn/my-page"

sidebar:
  collections:
    guide:
      sections:
        - title: "文档"
          path: "/zh-cn"
          children:
            - title: "我的页面"
              path: "/zh-cn/my-page"
```

## 4. 启动

```bash
npm run dev
```

访问 http://localhost:5173
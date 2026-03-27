# 新功能联动开发指南

这份文档用于约束 `react-docs-ui` 与 `create-react-docs-ui/template` 的联动开发流程，避免出现“主项目可用，但模板项目不生效”的问题。

## 先分清两条运行链

1. 主项目站点
   - 入口通常是 `react-docs-ui/src/App.tsx`
   - 页面实现通常是 `react-docs-ui/src/pages/DocsPage.tsx`

2. 模板项目
   - 入口是 `create-react-docs-ui/template/src/main.tsx`
   - 实际引用的是 `react-docs-ui/dist/docs-app.es.js`
   - 对应源码入口是 `react-docs-ui/src/app/DocsApp.tsx`

结论：
- 只改 `src/pages/DocsPage.tsx`，主项目可能生效，但模板不会自动生效
- 只改模板自己的配置或文档，也不能替代库运行时逻辑

## 开发新功能时必须先判断改动类型

1. 纯站点调试功能
   - 只服务 `react-docs-ui` 自己的网站
   - 可以只改 `src/App.tsx` / `src/pages/DocsPage.tsx`

2. 库能力
   - 模板项目也要使用
   - 必须同步检查 `src/app/DocsApp.tsx`

3. 脚手架示例能力
   - 需要用户创建新项目后也能看到
   - 除了库代码，还要同步 `create-react-docs-ui/template`

## 功能开发的标准顺序

1. 先改库源码
   - 公共组件：`react-docs-ui/src/components/*`
   - 公共工具：`react-docs-ui/src/lib/*`
   - 主项目页面链：`react-docs-ui/src/pages/DocsPage.tsx`
   - 模板运行链：`react-docs-ui/src/app/DocsApp.tsx`

2. 再补配置类型和默认值
   - `react-docs-ui/src/lib/config.ts`
   - 如涉及路由或版本能力，还要看 `navigation.ts`、`versioning.ts`

3. 再补文档和示例
   - 主项目文档：`react-docs-ui/public/docs/*`
   - 模板文档：`create-react-docs-ui/template/public/docs/*`
   - 主项目配置示例：`react-docs-ui/public/config/site*.yaml`
   - 模板配置示例：`create-react-docs-ui/template/public/config/site*.yaml`

4. 最后构建库产物
   - 在 `react-docs-ui` 执行 `pnpm build:lib`
   - 因为模板默认消费的是 `dist`，不是 `src`

## 每次都要检查的同步点

- 页面渲染逻辑是否同时覆盖：
  - `src/pages/DocsPage.tsx`
  - `src/app/DocsApp.tsx`
- 新增 props 是否真的传到：
  - `DocsLayout`
  - `HeaderNav`
  - `SidebarNav`
  - `PageMetaActions`
- 新功能是否需要配置项：
  - `config.ts`
  - `site.yaml`
  - `site.en.yaml`
- 新功能是否需要示例页：
  - 主项目示例
  - 模板示例
- 新功能是否依赖构建产物：
  - `dist/docs-app.es.js`
  - `dist/react-docs-ui.css`

## 验证顺序

1. 在 `react-docs-ui` 验证源码站点
   - `pnpm build`

2. 在 `react-docs-ui` 重新构建库
   - `pnpm build:lib`

3. 在 `create-react-docs-ui/template` 验证模板
   - 重启 `pnpm dev`
   - 必要时删除 `node_modules/.vite`

4. 同时检查两类页面
   - 主项目页面
   - 模板项目页面

## 这类问题最常见的根因

- 只改了 `src/pages/DocsPage.tsx`，没改 `src/app/DocsApp.tsx`
- 改了源码，但没重新执行 `pnpm build:lib`
- 模板引用的是旧 `dist`
- `site.yaml` 在主项目加了，模板没同步
- 主项目示例文档补了 frontmatter，模板示例没补
- `gray-matter` 把日期解析成 `Date`，代码却只按 `string` 处理
- 模板目录不一定有 git 历史，不能假设 `doc-git-meta.json` 一定有值

## 关于页面元信息功能的额外要求

像 `createdAt`、`lastUpdated`、`author`、`editUrl` 这类能力，开发时必须同时考虑：
- frontmatter 回退
- git meta 回退
- 404 页面禁用
- 版本化路由
- 模板项目没有 git 数据时的行为

## 推荐原则

- 先把功能做成库能力，再让主项目和模板同时消费
- 不要把“主项目演示逻辑”误当成“库能力已经完成”
- 每次改动后都问自己一句：
  - 这个功能是只在 `react-docs-ui` 生效，还是在 template 里也应该生效？


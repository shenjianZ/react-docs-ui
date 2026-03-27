---
title: 更新日志模块
description: 介绍 react-docs-ui 的 Changelog / Release Notes 能力、目录约定和配置方式。
author: React Docs UI Team
createdAt: 2026-03-27
---

# 更新日志模块

`react-docs-ui` 支持用 Markdown 驱动的 Changelog / Release Notes。

## 目录约定

- 列表页：`/:lang/changelog`
- 详情页：`/:lang/changelog/:slug`
- 内容目录：`public/docs/<lang>/changelog/`

## 配置项

在 `public/config/site.yaml` 与 `public/config/site.en.yaml` 中可配置：

```yaml
changelog:
  enabled: true
  title: "更新日志"
  pageSize: 10
```

- `pageSize` 可选；配置后列表页会启用分页。
- 访问第 2 页可使用：`/zh-cn/changelog?page=2`

## frontmatter 字段

- `title`
- `version`
- `date`
- `summary`
- `type`
- `breaking`

## 如何新增一条发布记录

1. 在 `public/docs/<lang>/changelog/` 下新增一个 `.md` 或 `.mdx` 文件。
2. 文件名会直接作为路由 slug。
3. 先写 frontmatter，再写正文。
4. 重新生成列表页依赖的 changelog 索引 JSON。

例如：

```text
public/docs/zh-cn/changelog/v0.6.20.md
```

它会对应到：

```text
/zh-cn/changelog/v0.6.20
```

支持的 `type` 值：

- `release`
- `feature`
- `fix`
- `breaking`
- `deprecation`

可选行为字段：

- `breaking: true` 会显示破坏性变更标记
- `draft: true` 不会进入列表页索引

## frontmatter 示例

```yaml
---
title: v0.6.20 发布说明
version: v0.6.20
date: 2026-04-02
summary: 修复 changelog 路由并完善相关文档说明。
type: fix
breaking: false
draft: false
---
```

列表页数据来自 `public/changelog-index-<lang>.json`。因此，在新增、重命名或删除发布文件后，需要在你的项目流程里重新生成这个索引。

分页由前端列表页根据 `changelog.pageSize` 控制，不影响 changelog 文件结构或索引生成逻辑。

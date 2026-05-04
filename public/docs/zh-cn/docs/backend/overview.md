---
title: 接入概览
description: 概览 React Docs UI 当前依赖的后端能力、功能开关和联调方式
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# 接入概览

React Docs UI 当前把后端能力拆成两类：

1. `backend`：业务 API，包括认证、评论、书签、统计、反馈。
2. `export.pdfServer`：服务端 PDF 生成服务，独立于 `backend.baseUrl`。

## 当前运行时会用到什么

- 认证：邮箱密码、邮箱验证码、Google / GitHub OAuth
- 用户资料：`/auth/me`、资料修改、头像上传
- 评论：列表、发布、回复、编辑、删除、点赞
- 书签：收藏状态查询、新增、删除
- 统计：访问量和阅读时长上报
- 反馈：状态查询与提交

## 功能开关

```yaml
backend:
  enabled: true
  baseUrl: "/api"
  features:
    auth: true
    comments: true
    bookmarks: true
    analytics: true
    feedback: true
```

- `backend.enabled = false`：整体关闭后端能力 UI
- `backend.features.auth = false`：隐藏登录和用户菜单
- `backend.features.comments = false`：隐藏评论区
- `backend.features.bookmarks = false`：隐藏书签按钮
- `backend.features.analytics = false`：停止统计上报
- `backend.features.feedback = false`：隐藏反馈组件

## 运行时映射

- `DocsLayout` 会根据 `backend.features.comments` 控制评论区
- `DocsLayout` 会根据 `backend.features.bookmarks` 控制书签按钮
- `useAnalytics` 会根据 `backend.features.analytics` 决定是否上报
- `PageMetaActions` 同时检查 `feedback` 和 `backend.features.feedback`

推荐从 [部署 Rust 后端](/docs/backend/deploy-rust-backend) 开始，再继续阅读 SMTP 和 OAuth 配置。

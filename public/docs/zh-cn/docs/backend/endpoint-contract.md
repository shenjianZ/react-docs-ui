---
title: 接口约定
description: 汇总 React Docs UI 当前实际依赖的业务接口、鉴权规则和特殊请求约定
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# 接口约定

React Docs UI 默认假设业务接口挂在 `/api` 下，并返回统一结构：

```json
{ "code": 200, "message": "success", "data": {} }
```

## 当前前端依赖的接口

- 认证：`/auth/login`、`/auth/login/email-code`、`/auth/email/send-code`、`/auth/register`
- OAuth：`/auth/oauth/:provider/start`、`/auth/oauth/:provider/callback`
- Token：`/auth/refresh`、`/auth/delete-refresh-token`
- 用户：`/auth/me`、`/auth/profile`、`/auth/avatar`
- 评论：`GET/POST /comments`、`PUT/DELETE /comments/:id`、`POST /comments/:id/like`
- 书签：`GET/POST /bookmarks`、`GET /bookmarks/check`、`DELETE /bookmarks/:id`
- 统计：`POST /analytics/view`、`POST /analytics/duration`
- 反馈：`GET /feedback/status`、`POST /feedback`

## 鉴权和刷新

- Access Token 键：`auth.access_token`
- Refresh Token 键：`auth.refresh_token`
- 受保护接口走 `Authorization: Bearer <token>`
- 401 时前端会尝试调用 `/auth/refresh`

## 特殊请求

- 头像上传必须使用 `multipart/form-data`
- 上传字段名必须是 `avatar`
- OAuth popup 会用 `auth:oauth:result` 回传结果

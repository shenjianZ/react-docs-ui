---
title: 常见问题
description: 排查 React Docs UI 接入后端时常见的 401、OAuth、SMTP、代理与功能开关问题
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# 常见问题

## 一直 401

- 检查 `/api/auth/refresh`
- 检查 Redis 是否可用
- 检查 access token / refresh token 是否真的写入本地存储

## 评论或书签不显示

- 检查 `backend.enabled`
- 检查 `backend.features.comments` / `bookmarks`
- 检查相关接口是否返回 200

## 反馈区不显示

- 检查 `feedback.enabled`
- 检查 `backend.features.feedback`
- 检查 `/api/feedback/status`

## OAuth 回调不匹配

- 平台 callback URL 与后端 `redirect_uri` 不一致
- 把前端地址误填成了后端 callback

## SMTP 发信失败

- 账号可能需要应用专用密码
- `587` 通常要配 `starttls = true`
- 服务器出站端口可能被拦截

## `/api` 代理失效

- 检查 Vite 代理配置
- 检查后端是否真的运行在 `3000`
- 如果你修改了端口，也要同步更新代理目标

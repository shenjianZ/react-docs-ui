---
title: Google / GitHub OAuth
description: 为 React Docs UI 准备 Google 和 GitHub 第三方登录的材料、回调地址和后端配置
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Google / GitHub OAuth

React Docs UI 当前推荐接入 Google 和 GitHub，callback 由后端处理，前端只负责打开 popup。

## 材料准备

- 前端 origin，例如 `http://localhost:5173`
- 后端 origin，例如 `http://localhost:3000`
- Google / GitHub 的 `client_id`、`client_secret`
- 与后端配置完全一致的 callback URL

## 本地开发填写方式

Google：

- Authorized JavaScript origins：`http://localhost:5173`
- Authorized redirect URI：`http://localhost:3000/api/auth/oauth/google/callback`

GitHub：

- Homepage URL：`http://localhost:5173`
- Authorization callback URL：`http://localhost:3000/api/auth/oauth/github/callback`

## 后端配置示例

```toml
[auth]
frontend_base_url = "http://localhost:5173"

[auth.providers.google]
enabled = true
redirect_uri = "http://localhost:3000/api/auth/oauth/google/callback"

[auth.providers.github]
enabled = true
redirect_uri = "http://localhost:3000/api/auth/oauth/github/callback"
```

## 注意

- `frontend_base_url` 是前端站点地址
- `redirect_uri` 是后端 callback 地址
- 两者不能混写

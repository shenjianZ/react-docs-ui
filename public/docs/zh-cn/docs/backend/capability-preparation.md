---
title: 能力准备清单
description: 在 React Docs UI 中启用后端能力前，需要先准备好的依赖、账号和配置材料
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# 能力准备清单

建议在打开 `backend` 相关开关之前，先准备好下面这些输入。

## 基础环境

- 前端站点地址
- 后端 API 地址
- 数据库连接信息
- Redis 连接信息
- JWT 密钥

## 登录体系

- SMTP 主机、端口、账号、密码
- 发件邮箱和发件人名称
- Google `client_id` / `client_secret`
- GitHub `client_id` / `client_secret`
- callback URL 和前端 origin

## 互动能力

- comments 表和鉴权
- bookmarks 表和鉴权
- `/feedback/status` 和 `/feedback`
- `/analytics/view` 和 `/analytics/duration`
- `/api/avatar/*` 静态资源暴露

## 推荐顺序

后端部署 -> 数据迁移 -> Redis -> SMTP -> OAuth -> 本地联调 -> 启用 `backend.features.*`

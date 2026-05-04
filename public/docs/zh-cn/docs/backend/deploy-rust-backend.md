---
title: 部署 Rust 后端
description: 使用官方 web-rust-template-project 为 React Docs UI 提供认证、评论、书签和统计能力
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# 部署 Rust 后端

推荐直接使用仓库中的 `web-rust-template-project` 作为 React Docs UI 的参考后端。

## 本地启动

```bash
cd web-rust-template-project
cargo run
```

默认监听 `http://localhost:3000`，API 前缀为 `/api`。

## 启动前确认

- 数据库：SQLite 可快速试跑，MySQL / PostgreSQL 更适合正式环境
- Redis：必须可用，否则 refresh token、验证码和 OAuth state 都会受影响
- 认证升级：启用邮箱验证码和 OAuth 前要先执行 `docs/sql/migrations/auth-upgrade.*.sql`

## 推荐部署结构

- 前端：`https://docs.example.com`
- 后端：`https://api.example.com`
- 反向代理：暴露 `/api` 和 `/api/avatar`

## 参考文档

- `web-rust-template-project/README.md`
- `docs/development/getting-started.md`
- `docs/development/auth-upgrade.md`
- `docs/deployment/environment-variables.md`
- `docs/deployment/production-guide.md`

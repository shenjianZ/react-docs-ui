---
title: 后端集成
description: 了解 React Docs UI 启用认证、评论、书签、统计、反馈和服务端 PDF 所需的后端准备工作
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# 后端集成

如果你准备在 React Docs UI 中启用登录、评论、书签、统计、反馈或服务端 PDF，这组文档就是对应的后端接入入口。

## 先读什么

- [接入概览](/docs/backend/overview) - 当前运行时依赖哪些后端能力
- [部署 Rust 后端](/docs/backend/deploy-rust-backend) - 使用官方 `web-rust-template-project` 跑通后端
- [能力准备清单](/docs/backend/capability-preparation) - 准备域名、数据库、Redis、JWT、SMTP、OAuth 材料
- [邮箱 SMTP 配置](/docs/backend/email-smtp) - 配置验证码发送
- [Google / GitHub OAuth](/docs/backend/oauth-google-github) - 配置第三方登录
- [接口约定](/docs/backend/endpoint-contract) - 前端实际依赖的接口和请求规则
- [常见问题](/docs/backend/troubleshooting) - 处理 401、代理、SMTP、OAuth 和功能不显示问题

## 默认结构

本文档默认使用：

- 文档前端：`http://localhost:5173`
- 业务后端：`http://localhost:3000`
- 开发代理：`/api -> http://localhost:3000`

如无特别说明，均以 `web-rust-template-project` 作为官方参考后端实现。

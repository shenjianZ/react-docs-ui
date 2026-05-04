---
title: 邮箱 SMTP 配置
description: 为 React Docs UI 的邮箱验证码登录和注册能力配置 SMTP
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# 邮箱 SMTP 配置

邮箱验证码登录和注册都依赖后端 SMTP 配置。

## 最少需要这些字段

- `auth.email_verification.smtp.enabled = true`
- `host`
- `port`
- `username`
- `password`
- `from_email`
- `from_name`
- `starttls`

## 示例

```toml
[auth.email_verification.smtp]
enabled = true
host = "smtp.gmail.com"
port = 587
username = "your.name@example.com"
password = "your-app-password"
from_email = "your.name@example.com"
from_name = "React Docs"
starttls = true
```

## 校验方式

```bash
curl -X POST http://localhost:3000/api/auth/email/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","purpose":"register"}'
```

失败时优先检查：

- 是否需要应用专用密码
- 端口和 `starttls` 是否匹配
- 服务器是否允许连出 SMTP 端口

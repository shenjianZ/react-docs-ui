---
title: Email SMTP
description: Configure SMTP for email-code login and registration in React Docs UI
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Email SMTP

Email-code login and registration both depend on SMTP in the backend.

## Minimum required fields

- `auth.email_verification.smtp.enabled = true`
- `host`
- `port`
- `username`
- `password`
- `from_email`
- `from_name`
- `starttls`

## Example

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

## Validation

```bash
curl -X POST http://localhost:3000/api/auth/email/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","purpose":"register"}'
```

If sending fails, check app passwords, port / TLS mode, and outbound firewall rules first.

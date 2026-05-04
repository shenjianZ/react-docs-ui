---
title: Endpoint Contract
description: Business APIs, auth rules, and special request conventions currently required by React Docs UI
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Endpoint Contract

React Docs UI assumes business APIs live under `/api` and return a shared envelope:

```json
{ "code": 200, "message": "success", "data": {} }
```

## APIs currently used by the frontend

- Auth: `/auth/login`, `/auth/login/email-code`, `/auth/email/send-code`, `/auth/register`
- OAuth: `/auth/oauth/:provider/start`, `/auth/oauth/:provider/callback`
- Token: `/auth/refresh`, `/auth/delete-refresh-token`
- User: `/auth/me`, `/auth/profile`, `/auth/avatar`
- Comments: `GET/POST /comments`, `PUT/DELETE /comments/:id`, `POST /comments/:id/like`
- Bookmarks: `GET/POST /bookmarks`, `GET /bookmarks/check`, `DELETE /bookmarks/:id`
- Analytics: `POST /analytics/view`, `POST /analytics/duration`
- Feedback: `GET /feedback/status`, `POST /feedback`

## Auth and refresh rules

- Access token key: `auth.access_token`
- Refresh token key: `auth.refresh_token`
- Protected APIs use `Authorization: Bearer <token>`
- On 401 the frontend retries through `/auth/refresh`

## Special request rules

- Avatar upload must use `multipart/form-data`
- The upload field name must be `avatar`
- OAuth popup completion uses `auth:oauth:result`

---
title: Google / GitHub OAuth
description: Prepare Google and GitHub third-party login for React Docs UI with correct origins and callback URLs
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Google / GitHub OAuth

React Docs UI recommends Google and GitHub. The backend handles the callback; the frontend only opens the popup.

## Inputs to prepare

- Frontend origin, such as `http://localhost:5173`
- Backend origin, such as `http://localhost:3000`
- Google / GitHub `client_id` and `client_secret`
- Callback URLs that exactly match backend config

## Local development values

Google:

- Authorized JavaScript origins: `http://localhost:5173`
- Authorized redirect URI: `http://localhost:3000/api/auth/oauth/google/callback`

GitHub:

- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:3000/api/auth/oauth/github/callback`

## Backend config example

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

Keep `frontend_base_url` and backend `redirect_uri` separate. They are not interchangeable.

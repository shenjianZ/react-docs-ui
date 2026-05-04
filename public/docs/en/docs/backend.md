---
title: Backend Integration
description: Learn what backend support React Docs UI needs for auth, comments, bookmarks, analytics, feedback, and server-side PDF
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Backend Integration

If you want login, comments, bookmarks, analytics, feedback, or server-side PDF in React Docs UI, this section is the backend entry point.

## Start here

- [Overview](/docs/backend/overview) - What the runtime expects from the backend
- [Deploy Rust Backend](/docs/backend/deploy-rust-backend) - Run the official `web-rust-template-project`
- [Capability Preparation](/docs/backend/capability-preparation) - Collect domains, Redis, database, JWT, SMTP, and OAuth inputs
- [Email SMTP](/docs/backend/email-smtp) - Configure verification email sending
- [Google / GitHub OAuth](/docs/backend/oauth-google-github) - Configure third-party login
- [Endpoint Contract](/docs/backend/endpoint-contract) - APIs the frontend actually calls
- [Troubleshooting](/docs/backend/troubleshooting) - Fix 401s, SMTP, OAuth, proxy, and visibility issues

## Default setup

- Docs frontend: `http://localhost:5173`
- Business backend: `http://localhost:3000`
- Dev proxy: `/api -> http://localhost:3000`

Unless stated otherwise, this section uses `web-rust-template-project` as the official reference backend.

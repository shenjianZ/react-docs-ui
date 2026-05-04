---
title: Deploy Rust Backend
description: Use the official web-rust-template-project backend to power auth, comments, bookmarks, analytics, and feedback in React Docs UI
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Deploy Rust Backend

The recommended backend for React Docs UI is the `web-rust-template-project` in this workspace.

## Local startup

```bash
cd web-rust-template-project
cargo run
```

It starts on `http://localhost:3000` by default and exposes `/api`.

## Confirm these dependencies first

- Database: SQLite for a quick local start, MySQL / PostgreSQL for production
- Redis: required for refresh tokens, verification codes, and OAuth state
- Auth upgrade: run `docs/sql/migrations/auth-upgrade.*.sql` before enabling email-code auth or OAuth

## Suggested production structure

- Frontend: `https://docs.example.com`
- Backend: `https://api.example.com`
- Reverse proxy: expose `/api` and `/api/avatar`

Reference docs:

- `web-rust-template-project/README.md`
- `docs/development/getting-started.md`
- `docs/development/auth-upgrade.md`
- `docs/deployment/environment-variables.md`

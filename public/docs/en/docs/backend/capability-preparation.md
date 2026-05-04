---
title: Capability Preparation
description: Checklist of infrastructure, accounts, and config inputs required before enabling backend features in React Docs UI
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Capability Preparation

Before turning on `backend` feature flags, prepare the following inputs.

## Core environment

- Frontend site URL
- Backend API URL
- Database connection values
- Redis connection values
- JWT secret

## Login system

- SMTP host, port, username, password
- Sender email and sender name
- Google `client_id` / `client_secret`
- GitHub `client_id` / `client_secret`
- Callback URLs and frontend origin

## Interactive features

- Comments tables and auth
- Bookmark tables and auth
- `/feedback/status` and `/feedback`
- `/analytics/view` and `/analytics/duration`
- `/api/avatar/*` static exposure

Recommended order: backend deployment -> migrations -> Redis -> SMTP -> OAuth -> local integration -> enable `backend.features.*`.

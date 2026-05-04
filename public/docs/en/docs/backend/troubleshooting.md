---
title: Troubleshooting
description: Fix common 401, OAuth, SMTP, proxy, and feature-visibility issues when integrating React Docs UI with a backend
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Troubleshooting

## Constant 401 responses

- Check `/api/auth/refresh`
- Check Redis availability
- Check whether access and refresh tokens are really stored locally

## Comments or bookmarks are missing

- Check `backend.enabled`
- Check `backend.features.comments` / `bookmarks`
- Check whether the related endpoints return 200

## Feedback block is missing

- Check `feedback.enabled`
- Check `backend.features.feedback`
- Check `/api/feedback/status`

## OAuth callback mismatch

- Platform callback URL and backend `redirect_uri` do not match
- The frontend URL was mistakenly used as the backend callback URL

## SMTP delivery fails

- The provider may require an app password
- `587` usually expects `starttls = true`
- The server may block outbound mail ports

## `/api` proxy is not working

- Check the Vite proxy config
- Check whether the backend is actually running on port `3000`

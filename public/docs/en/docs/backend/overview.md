---
title: Overview
description: Overview of backend capabilities, feature flags, and local integration flow used by React Docs UI
author: React Docs UI Team
createdAt: 2026-04-25
lastUpdated: 2026-04-25
---

# Overview

React Docs UI separates backend support into two layers:

1. `backend`: business APIs for auth, comments, bookmarks, analytics, and feedback.
2. `export.pdfServer`: a dedicated service for server-side PDF generation.

## Runtime capabilities currently used

- Auth: email/password, email-code login, Google / GitHub OAuth
- User profile: `/auth/me`, profile updates, avatar upload
- Comments: list, create, reply, edit, delete, like
- Bookmarks: check, create, delete
- Analytics: page view and duration reporting
- Feedback: status check and submission

## Feature flags

```yaml
backend:
  enabled: true
  baseUrl: "/api"
  features:
    auth: true
    comments: true
    bookmarks: true
    analytics: true
    feedback: true
```

- `backend.enabled = false`: hide all backend-driven UI
- `backend.features.auth = false`: hide login and user menu
- `backend.features.comments = false`: hide comments
- `backend.features.bookmarks = false`: hide bookmarks
- `backend.features.analytics = false`: stop analytics reporting
- `backend.features.feedback = false`: hide feedback

## Runtime mapping

- `DocsLayout` checks `comments` and `bookmarks`
- `useAnalytics` checks `analytics`
- `PageMetaActions` checks both `feedback` config and `backend.features.feedback`

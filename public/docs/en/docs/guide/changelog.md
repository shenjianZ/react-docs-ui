---
title: Changelog Module
description: Introduces the Changelog / Release Notes support in react-docs-ui, including content structure and config.
author: React Docs UI Team
createdAt: 2026-03-27
---

# Changelog Module

`react-docs-ui` supports a Markdown-driven Changelog / Release Notes workflow.

## Structure

- List page: `/:lang/changelog`
- Detail page: `/:lang/changelog/:slug`
- Content directory: `public/docs/<lang>/changelog/`

## Config

In `public/config/site.yaml` and `public/config/site.en.yaml`:

```yaml
changelog:
  enabled: true
  title: "Changelog"
  pageSize: 10
```

- `pageSize` is optional; when set, the list page enables pagination.
- You can open page 2 with: `/en/changelog?page=2`

## Recommended frontmatter

- `title`
- `version`
- `date`
- `summary`
- `type`
- `breaking`

## Add a new release note

1. Create a `.md` or `.mdx` file under `public/docs/<lang>/changelog/`.
2. Use the file name as the route slug.
3. Add frontmatter, then write the page body.
4. Rebuild the changelog index JSON used by the list page.

Example:

```text
public/docs/en/changelog/v0.6.20.md
```

This file resolves to:

```text
/en/changelog/v0.6.20
```

Supported type labels:

- `release`
- `feature`
- `fix`
- `breaking`
- `deprecation`

Optional behavior fields:

- `breaking: true` shows a breaking-change badge
- `draft: true` hides the item from the list page index

## Example frontmatter

```yaml
---
title: v0.6.20 Release Notes
version: v0.6.20
date: 2026-04-02
summary: Added changelog routing fixes and improved docs.
type: fix
breaking: false
draft: false
---
```

The list page is driven by `public/changelog-index-<lang>.json`, so whenever you add, rename, or delete release files, regenerate that index in your project workflow.

Pagination is handled by the frontend list page through `changelog.pageSize` and does not change the changelog file structure or index generation flow.

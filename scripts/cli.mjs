#!/usr/bin/env node

const command = process.argv[2]

const commands = {
  "generate-doc-git-meta": "./generate-doc-git-meta.mjs",
  "generate-llms-files": "./generate-llms-files.mjs",
  "generate-changelog-index": "./generate-changelog-index.mjs",
  "generate-search-index": "./generate-search-index.mjs",
  "generate-shiki-bundle": "./generate-shiki-bundle.mjs",
}

if (!command || !commands[command]) {
  console.error(`Usage: react-docs-ui <${Object.keys(commands).join("|")}>`)
  process.exit(1)
}

await import(commands[command])

import * as React from "react"

import type { TocInlineNode } from "./rehype-toc"

function expandTextDecorators(text: string): TocInlineNode[] {
  const parts = text.split(/(`[^`]+`|~~[^~]+~~)/g).filter(Boolean)

  return parts.map(part => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return { type: "inlineCode", value: part.slice(1, -1) } satisfies TocInlineNode
    }
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return {
        type: "delete",
        children: [{ type: "text", value: part.slice(2, -2) }],
      } satisfies TocInlineNode
    }
    return { type: "text", value: part } satisfies TocInlineNode
  })
}

function normalizeNodes(nodes: TocInlineNode[]): TocInlineNode[] {
  return nodes.flatMap(node => {
    switch (node.type) {
      case "text":
        return expandTextDecorators(node.value)
      case "strong":
      case "emphasis":
      case "delete":
        return [{ ...node, children: normalizeNodes(node.children) }]
      case "link":
        return [{ ...node, children: normalizeNodes(node.children) }]
      default:
        return [node]
    }
  })
}

function renderNodes(nodes: TocInlineNode[], keyPrefix = "toc"): React.ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`

    switch (node.type) {
      case "text":
        return <span key={key}>{node.value}</span>
      case "inlineCode":
        return (
          <code key={key} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">
            {node.value}
          </code>
        )
      case "strong":
        return <strong key={key}>{renderNodes(node.children, `${key}-strong`)}</strong>
      case "emphasis":
        return <em key={key}>{renderNodes(node.children, `${key}-em`)}</em>
      case "delete":
        return <del key={key}>{renderNodes(node.children, `${key}-del`)}</del>
      case "link":
        return (
          <span key={key} className="underline underline-offset-2">
            {renderNodes(node.children, `${key}-link`)}
          </span>
        )
      default:
        return null
    }
  })
}

function renderFallbackText(
  title: string,
  keyPrefix = "toc-fallback"
): React.ReactNode[] {
  const parts = title
    .split(/(`[^`]+`|~~[^~]+~~)/g)
    .filter(Boolean)

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith("~~") && part.endsWith("~~")) {
      return <del key={key}>{part.slice(2, -2)}</del>
    }

    return <span key={key}>{part}</span>
  })
}

export function renderTocTitle(
  title: string,
  richTitle?: TocInlineNode[]
): React.ReactNode {
  if (richTitle && richTitle.length > 0) {
    return renderNodes(normalizeNodes(richTitle))
  }
  return renderFallbackText(title)
}

import { visit } from 'unist-util-visit';
import type { Root, Heading, Parent } from 'mdast';

export type TocInlineNode =
  | { type: 'text'; value: string }
  | { type: 'inlineCode'; value: string }
  | { type: 'strong'; children: TocInlineNode[] }
  | { type: 'emphasis'; children: TocInlineNode[] }
  | { type: 'delete'; children: TocInlineNode[] }
  | { type: 'link'; url?: string; children: TocInlineNode[] };

export interface TocItem {
  title: string;
  url: string;
  depth: number;
  richTitle?: TocInlineNode[];
}

function splitTextDecorators(value: string): TocInlineNode[] {
  return value
    .split(/(`[^`]+`|~~[^~]+~~)/g)
    .filter(Boolean)
    .map(part => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return { type: 'inlineCode', value: part.slice(1, -1) } satisfies TocInlineNode;
      }
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return {
          type: 'delete',
          children: [{ type: 'text', value: part.slice(2, -2) }],
        } satisfies TocInlineNode;
      }
      return { type: 'text', value: part } satisfies TocInlineNode;
    });
}

function extractHeadingPlainText(node: any): string {
  try {
    if (!node) return '';
    if (Array.isArray(node)) {
      return node.map(extractHeadingPlainText).join('');
    }
    if (node.type === 'text' || node.type === 'inlineCode') {
      return node.value || '';
    }
    if (typeof node === 'object' && 'children' in node && Array.isArray((node as Parent).children)) {
      return (node as Parent).children.map(extractHeadingPlainText).join('');
    }
    return '';
  } catch {
    return '';
  }
}

function serializeInlineNodes(node: any): TocInlineNode[] {
  try {
    if (!node) return [];
    if (Array.isArray(node)) {
      return node.flatMap(serializeInlineNodes);
    }
    if (node.type === 'text') {
      return splitTextDecorators(node.value || '');
    }
    if (node.type === 'inlineCode') {
      return [{ type: 'inlineCode', value: node.value || '' }];
    }

    if (node.type === 'strong' || node.type === 'emphasis' || node.type === 'delete') {
      return [{
        type: node.type,
        children: serializeInlineNodes(node.children || []),
      }];
    }

    if (node.type === 'link') {
      return [{
        type: 'link',
        url: node.url,
        children: serializeInlineNodes(node.children || []),
      }];
    }

    if (typeof node === 'object' && 'children' in node && Array.isArray((node as Parent).children)) {
      return serializeInlineNodes((node as Parent).children);
    }

    return [];
  } catch {
    return [];
  }
}

export function rehypeToc(options: { maxLevel?: number } = {}) {
  const maxLevel = options.maxLevel || 3;

  return (tree: Root) => {
    const toc: TocItem[] = [];
    const slugCounts = new Map<string, number>();

    visit(tree, 'heading', (node: Heading) => {
      try {
        if (node.depth > maxLevel) {
          return;
        }

        const plainText = extractHeadingPlainText(node).trim();
        const richTitle = serializeInlineNodes(node.children || []);

        if (!plainText) {
          return;
        }

        let slug = plainText
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
          .replace(/\s+/g, '-');

        const count = slugCounts.get(slug) || 0;
        slugCounts.set(slug, count + 1);

        if (count > 0) {
          slug = `${slug}-${count}`;
        }

        const url = `#${slug}`;
        toc.push({
          title: plainText,
          url,
          depth: node.depth,
          richTitle,
        });
      } catch (error) {
        console.warn('[TOC] Failed to parse heading for TOC:', error);
      }
    });

    (tree as any).data = {
      ...(tree as any).data,
      toc
    };
  };
}

import { visit } from 'unist-util-visit';
import type { Root, Heading } from 'mdast';

export interface TocItem {
  title: string;
  url: string;
  depth: number;
}

export function rehypeToc(options: { maxLevel?: number } = {}) {
  const maxLevel = options.maxLevel || 3;

  return (tree: Root) => {
    const toc: TocItem[] = [];
    const slugCounts = new Map<string, number>();

    visit(tree, 'heading', (node: Heading) => {
      if (node.depth <= maxLevel) {
        const text = node.children
          .filter((child: any) => child.type === 'text')
          .map((child: any) => child.value)
          .join('');

        if (text) {
          let slug = text
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
          toc.push({ title: text, url, depth: node.depth });
        }
      }
    });

    (tree as any).data = {
      ...(tree as any).data,
      toc
    };
  };
}
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

    visit(tree, 'heading', (node: Heading) => {
      if (node.depth <= maxLevel) {
        const text = node.children
          .filter((child: any) => child.type === 'text')
          .map((child: any) => child.value)
          .join('');

        if (text) {
          // 使用与 rehype-slug 一致的算法生成 slug
          // 1. 转换为小写
          // 2. 移除特殊字符
          // 3. 将空格替换为连字符
          // 4. 中文保持原样
          let slug = text
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '') // 保留字母、数字、中文、空格和连字符
            .replace(/\s+/g, '-'); // 空格替换为连字符

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
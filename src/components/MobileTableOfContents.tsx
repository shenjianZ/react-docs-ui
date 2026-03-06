import { useState } from 'react';
import { X, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import type { TocItem } from '@/lib/rehype-toc';

interface MobileTableOfContentsProps {
  toc: TocItem[];
}

export function MobileTableOfContents({ toc }: MobileTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (toc.length === 0) return null;

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 z-40",
          "h-12 w-12 rounded-full shadow-lg",
          "bg-primary text-primary-foreground",
          "flex items-center justify-center",
          "transition-all duration-300",
          "lg:hidden"
        )}
      >
        <List className="h-6 w-6" />
      </button>

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 目录面板 */}
      <div
        className={cn(
          "fixed left-0 right-0 top-0 z-50",
          "max-h-[70vh] mx-4 mt-4 rounded-lg bg-background shadow-xl",
          "transition-all duration-300 ease-in-out",
          "lg:hidden",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">目录</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 目录内容 */}
        <ScrollArea className="h-[calc(70vh-4rem)] px-4 py-3">
          <nav className="space-y-2">
            {toc.map((item, index) => (
              <a
                key={index}
                href={item.url}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block py-2 text-sm text-muted-foreground hover:text-foreground",
                  "transition-colors",
                  item.depth === 2 && "pl-4",
                  item.depth === 3 && "pl-8"
                )}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}
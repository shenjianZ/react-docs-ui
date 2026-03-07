import { useState } from 'react';
import { Menu, Navigation, BookOpen, PanelLeftOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/lib/rehype-toc';

interface FloatingActionBallProps {
  lang: string;
  navItems?: { title: string; link: string; external?: boolean }[];
  toc?: TocItem[];
  showSidebar?: boolean;
  onOpenSidebar?: () => void;
}

export function FloatingActionBall({
  lang,
  navItems = [],
  toc = [],
  showSidebar = true,
  onOpenSidebar
}: FloatingActionBallProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showTocPanel, setShowTocPanel] = useState(false);

  // 判断是否显示各个按钮
  const hasNav = navItems && navItems.length > 0;
  const hasToc = toc && toc.length > 0;

  // 打开导航菜单
  const handleOpenNav = () => {
    setShowNavMenu(true);
    setIsOpen(false);
  };

  // 打开目录面板
  const handleOpenToc = () => {
    setShowTocPanel(true);
    setIsOpen(false);
  };

  // 打开侧边栏
  const handleOpenSidebar = () => {
    if (onOpenSidebar) {
      onOpenSidebar();
    }
    setIsOpen(false);
  };

  // 关闭所有面板
  const handleCloseAll = () => {
    setIsOpen(false);
    setShowNavMenu(false);
    setShowTocPanel(false);
  };

  return (
    <>
      {/* 主按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-12 w-12 rounded-full shadow-xl",
          "bg-primary text-primary-foreground",
          "flex items-center justify-center",
          "transition-all duration-300 ease-in-out",
          "hover:scale-110 active:scale-95",
          "lg:hidden",
          isOpen ? "rotate-45" : ""
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* 子按钮容器 - 竖向展开 */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        {/* 侧边栏按钮 */}
        {showSidebar && (
          <button
            onClick={handleOpenSidebar}
            className={cn(
              "fixed h-10 w-10 rounded-full shadow-lg",
              "bg-primary text-primary-foreground",
              "flex items-center justify-center",
              "transition-all duration-300 ease-in-out",
              "hover:scale-110 active:scale-95",
              isOpen ? "bottom-[7rem] right-6 opacity-100" : "bottom-6 right-6 opacity-0 pointer-events-none"
            )}
            style={{ transitionDelay: isOpen ? '50ms' : '0ms' }}
            title="侧边栏"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}

        {/* 导航菜单按钮 */}
        {hasNav && (
          <button
            onClick={handleOpenNav}
            className={cn(
              "fixed h-10 w-10 rounded-full shadow-lg",
              "bg-primary text-primary-foreground",
              "flex items-center justify-center",
              "transition-all duration-300 ease-in-out",
              "hover:scale-110 active:scale-95",
              isOpen ? "bottom-[10rem] right-6 opacity-100" : "bottom-6 right-6 opacity-0 pointer-events-none"
            )}
            style={{ transitionDelay: isOpen ? '100ms' : '0ms' }}
            title="导航菜单"
          >
            <Navigation className="h-5 w-5" />
          </button>
        )}

        {/* 目录导航按钮 */}
        {hasToc && (
          <button
            onClick={handleOpenToc}
            className={cn(
              "fixed h-10 w-10 rounded-full shadow-lg",
              "bg-primary text-primary-foreground",
              "flex items-center justify-center",
              "transition-all duration-300 ease-in-out",
              "hover:scale-110 active:scale-95",
              isOpen ? "bottom-[13rem] right-6 opacity-100" : "bottom-6 right-6 opacity-0 pointer-events-none"
            )}
            style={{ transitionDelay: isOpen ? '150ms' : '0ms' }}
            title="目录导航"
          >
            <BookOpen className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 导航菜单面板 */}
      {showNavMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={handleCloseAll}
          />
          <div className="fixed bottom-20 right-6 z-50 w-48 bg-background shadow-xl rounded-lg lg:hidden">
            <nav className="p-2">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.external ? item.link : `/${lang}${item.link}`}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={handleCloseAll}
                  className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* 目录导航面板 */}
      {showTocPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={handleCloseAll}
          />
          <div className="fixed bottom-20 right-6 z-50 w-64 max-h-[60vh] bg-background shadow-xl rounded-lg lg:hidden overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold">目录</h3>
              <button
                onClick={handleCloseAll}
                className="rounded-full p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(60vh-3.5rem)] px-4 py-3">
              <nav className="space-y-2">
                {toc!.map((item, index) => (
                  <a
                    key={`${item.url}-${index}`}
                    href={item.url}
                    onClick={handleCloseAll}
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
            </div>
          </div>
        </>
      )}
    </>
  );
}
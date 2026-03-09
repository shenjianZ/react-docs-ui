// Public library entry for react-docs-ui-vite
// Expose components, utilities, and types for consumers

// Ensure styles are bundled and available for consumers
import "./index.css"

// Simple Buffer polyfill for browser environments
// if (typeof window !== 'undefined' && !(window as any).Buffer) {
//   (window as any).Buffer = {
//     from: (data: any) => new Uint8Array(data),
//     isBuffer: (obj: any) => obj instanceof Uint8Array,
//     alloc: (size: number) => new Uint8Array(size),
//     allocUnsafe: (size: number) => new Uint8Array(size)
//   };
// }

// Core layout components
export { DocsLayout } from "./components/DocsLayout"
export { HeaderNav } from "./components/HeaderNav"
export { SidebarNav } from "./components/SidebarNav"
export { TableOfContents } from "./components/TableOfContents"
export { Footer } from "./components/Footer"
export { PageNavigation } from "./components/PageNavigation"

// Theming
export { ThemeProvider, useTheme } from "./components/theme-provider"
export { FontProvider, useFonts } from "./components/FontProvider"
export { ModeToggle } from "./components/mode-toggle"
export { LanguageSwitcher } from "./components/LanguageSwitcher"

// Primitives (re-export selected UI components)
export { ScrollArea } from "./components/ui/scroll-area"
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip"
export { buttonVariants } from "./components/ui/button"
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/ui/collapsible"
export { Separator } from "./components/ui/separator"
export { Badge } from "./components/ui/badge"
export { Label } from "./components/ui/label"
export { Command, CommandDialog } from "./components/ui/command"
export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./components/ui/context-menu"
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog"
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu"

// Markdown renderer
export { MdxContent } from "./components/MdxContent"

// MDX components
export { Tip, Warning, Card } from './components/mdx-components'
export { ComponentProvider, useComponents } from './components/ComponentProvider'

// Component scanner utilities
export { scanComponents, importComponent, loadComponents, mergeComponents } from './lib/component-scanner'
export type { ComponentRegistry, ComponentConfig } from './lib/component-scanner'

// Library utilities and types
export { cn } from "./lib/utils"
export { getConfig } from "./lib/config"
export { getPrevNextPage } from "./lib/navigation"
export type { SiteConfig } from "./lib/config"
export type { NavigationResult } from "./lib/navigation"

// Ready-to-use app
export { DocsApp } from "./app/DocsApp"

// Rehype TOC utilities
export { rehypeToc } from './lib/rehype-toc'
export type { TocItem } from './lib/rehype-toc'

// AI components
export {
  AIProvider,
  useAI,
  AISelectionTrigger,
  AIChatDialog,
  AIChatMessage,
  AIChatInput,
  AISettingsPanel,
} from './components/ai'

// AI utilities and types
export {
  getDefaultModelConfig,
  getDefaultAIConfig,
  saveAIConfig,
  getAIConfig,
  isAIConfigured,
  getCurrentProviderConfig,
  updateProviderConfig,
  deleteProvider,
  clearAIConfig,
  validateModelConfig,
  createAIProvider,
  getProviderDisplayName,
  getProviderDefaultModels,
  getProviderHelpInfo,
  sendChatMessage,
  testAIConnection,
  generateMessageId,
  createUserMessage,
  createAssistantMessage,
} from './lib/ai'

export type {
  AIModelConfig,
  AIFeaturesConfig,
  AIUIConfig,
  AIConfig,
  ChatMessageRole,
  ChatMessage,
  ChatContext,
  ChatSession,
  ChatOptions,
  AIProviderConfig,
  StreamEvent,
  TestConnectionResult,
  AIState,
} from './lib/ai'

// Search components
export {
  SearchProvider,
  useSearch,
  SearchDialog,
  SearchInput,
  SearchResults,
  SearchItem,
  SearchTrigger,
} from './components/search'

// Search utilities and types
export {
  SearchEngine,
  searchEngine,
  highlightText,
  generateSnippet,
  highlightSnippet,
  tokenizeQuery,
} from './lib/search'

export type {
  SearchSection,
  SearchIndex,
  SearchResult,
  SearchOptions,
} from './lib/search'

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface TabProps {
  title: string
  children?: React.ReactNode
}

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

interface TabsProps {
  defaultValue?: string
  children?: React.ReactNode
}

function normalizePanelMarkdown(value: string) {
  const lines = value.replace(/\r\n/g, "\n").split("\n")
  const trimmedEdges = lines.join("\n").trim()
  const normalizedLines = trimmedEdges.split("\n")
  const indents = normalizedLines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^(\s*)/)?.[1].length ?? 0)
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0

  return normalizedLines
    .map((line) => line.slice(minIndent))
    .join("\n")
}

function getTabTitle(element: React.ReactElement<any>) {
  return element.props.title || element.props["data-title"] || ""
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement<TabProps>)
  const firstTitle = items[0] ? getTabTitle(items[0]) : ""
  const [active, setActive] = React.useState(defaultValue || firstTitle || "")
  const normalizedItems = items.map((item, index) => ({
    key: `${getTabTitle(item)}-${index}`,
    element: item,
  }))

  if (items.length === 0) return null

  const activeItem = normalizedItems.find((entry) => getTabTitle(entry.element) === active) || normalizedItems[0]
  const panelChildren = activeItem?.element.props.children
  const markdownContent = React.Children.toArray(panelChildren).every((child) => typeof child === "string")
    ? normalizePanelMarkdown(React.Children.toArray(panelChildren).join(""))
    : null

  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm dark:border-border/60 dark:bg-card">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-2 dark:border-border/60 dark:bg-muted/30">
        {normalizedItems.map(({ key, element }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(getTabTitle(element))}
            className={`rounded-xl px-3 py-1.5 text-sm transition ${
              active === getTabTitle(element)
                ? "border border-slate-300 border-b-sky-500 bg-white font-medium text-slate-950 shadow-sm dark:border-transparent dark:border-b-sky-400 dark:bg-background dark:text-foreground"
                : "border border-transparent text-slate-600 hover:bg-white hover:text-slate-950 dark:text-muted-foreground dark:hover:text-foreground"
            }`}
          >
            {getTabTitle(element)}
          </button>
        ))}
      </div>
      <div className="prose max-w-none bg-white p-4 dark:prose-invert dark:bg-transparent">
        {markdownContent !== null ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        ) : (
          activeItem ? React.cloneElement(activeItem.element, { key: activeItem.key }) : null
        )}
      </div>
    </div>
  )
}

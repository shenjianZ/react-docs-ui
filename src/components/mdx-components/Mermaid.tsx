import * as React from "react"

interface MermaidProps {
  chart: string
}

let mermaidModulePromise: Promise<typeof import("mermaid")> | null = null
let initialized = false

function loadMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("mermaid")
  }
  return mermaidModulePromise
}

export function Mermaid({ chart }: MermaidProps) {
  const id = React.useId().replace(/:/g, "")
  const [svg, setSvg] = React.useState("")

  React.useEffect(() => {
    let cancelled = false

    loadMermaid()
      .then((module) => {
        const mermaid = module.default
        if (!initialized) {
          mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "strict" })
          initialized = true
        }
        return mermaid.render(`mermaid-${id}`, chart)
      })
      .then((result) => {
        if (!cancelled) setSvg(result.svg)
      })
      .catch((error) => {
        console.error("[Mermaid] render failed:", error)
        if (!cancelled) setSvg("")
      })

    return () => {
      cancelled = true
    }
  }, [chart, id])

  if (!svg) {
    return (
      <pre className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
        <code>{chart}</code>
      </pre>
    )
  }

  return <div className="not-prose my-6 overflow-x-auto rounded-2xl border border-border/60 bg-background p-4" dangerouslySetInnerHTML={{ __html: svg }} />
}

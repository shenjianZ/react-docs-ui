import { prefetchGeneratedComponents } from "./lib/component-scanner"
import { DocsApp, prefetchMdxRuntime } from "./app/DocsApp"

let docsRuntimePreloaded = false

export function preloadDocsRuntime() {
  if (docsRuntimePreloaded) {
    return
  }

  docsRuntimePreloaded = true
  prefetchMdxRuntime()
  prefetchGeneratedComponents()
}

export { DocsApp }
export type { ShikiBundle } from "./lib/shiki-highlighter"

import { useEffect } from "react"
import { trackDuration, trackPageView } from "@/lib/api/analytics"

interface UseAnalyticsOptions {
  enabled?: boolean
  pageSlug?: string
  pageTitle?: string
  lang?: string
}

export function useAnalytics(options: UseAnalyticsOptions) {
  useEffect(() => {
    if (options.enabled === false || !options.pageSlug) return

    const startedAt = Date.now()
    const payload = {
      pageSlug: options.pageSlug,
      pageTitle: options.pageTitle,
      lang: options.lang,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
    }

    trackPageView(payload).catch((error) => {
      console.warn("[useAnalytics] page view failed:", error)
    })

    return () => {
      const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000))
      trackDuration({ ...payload, durationSeconds }).catch((error) => {
        console.warn("[useAnalytics] duration failed:", error)
      })
    }
  }, [options.enabled, options.lang, options.pageSlug, options.pageTitle])
}

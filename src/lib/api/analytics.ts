import { apiClient } from "./client"
import type { TrackDurationRequest, TrackPageViewRequest } from "./types"

function toPageViewPayload(payload: TrackPageViewRequest) {
  return {
    pageSlug: payload.pageSlug,
    pageTitle: payload.pageTitle,
    lang: payload.lang,
    path: payload.path,
    referrer: payload.referrer,
  }
}

function toDurationPayload(payload: TrackDurationRequest) {
  return {
    ...toPageViewPayload(payload),
    durationSeconds: payload.durationSeconds,
  }
}

export async function trackPageView(payload: TrackPageViewRequest): Promise<void> {
  await apiClient.request("/analytics/view", {
    method: "POST",
    body: JSON.stringify(toPageViewPayload(payload)),
  })
}

export async function trackDuration(payload: TrackDurationRequest): Promise<void> {
  await apiClient.request("/analytics/duration", {
    method: "POST",
    body: JSON.stringify(toDurationPayload(payload)),
  })
}

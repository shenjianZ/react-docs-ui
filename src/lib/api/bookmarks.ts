import { apiClient } from "./client"
import type { ApiResult, BookmarkItem, CreateBookmarkRequest } from "./types"

interface BackendBookmark {
  id: string
  page_slug: string
  page_title?: string | null
  folder?: string | null
  notes?: string | null
  lang: string
  created_at: string
}

function normalizeBookmark(bookmark: BackendBookmark): BookmarkItem {
  return {
    id: bookmark.id,
    pageSlug: bookmark.page_slug,
    pageTitle: bookmark.page_title,
    folder: bookmark.folder,
    notes: bookmark.notes,
    lang: bookmark.lang,
    createdAt: bookmark.created_at,
  }
}

function toBackendPayload(payload: CreateBookmarkRequest) {
  return {
    page_slug: payload.pageSlug,
    page_title: payload.pageTitle,
    folder: payload.folder,
    notes: payload.notes,
    lang: payload.lang,
  }
}

export async function listBookmarks(): Promise<BookmarkItem[]> {
  const response = await apiClient.request<BackendBookmark[]>("/bookmarks")
  return (response.data ?? []).map(normalizeBookmark)
}

export async function createBookmark(payload: CreateBookmarkRequest): Promise<ApiResult<BookmarkItem>> {
  const response = await apiClient.request<BackendBookmark>("/bookmarks", {
    method: "POST",
    body: JSON.stringify(toBackendPayload(payload)),
  })

  if (!response.data) throw new Error(response.message || "Bookmark response is empty")
  return {
    data: normalizeBookmark(response.data),
    message: response.message,
  }
}

export async function getBookmarkStatus(
  pageSlug: string,
  lang?: string
): Promise<{ bookmarked: boolean; id?: string | null }> {
  const params = new URLSearchParams({ page_slug: pageSlug })
  if (lang) params.set("lang", lang)

  const response = await apiClient.request<{ bookmarked: boolean; id?: string | null }>(`/bookmarks/check?${params}`)
  return response.data ?? { bookmarked: false }
}

export async function deleteBookmark(id: string): Promise<string> {
  const response = await apiClient.request<void>(`/bookmarks/${id}`, { method: "DELETE" })
  return response.message
}

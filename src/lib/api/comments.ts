import { apiClient } from "./client"
import type { ApiResult, CommentItem, CreateCommentRequest } from "./types"

interface BackendComment {
  id: string
  page_slug: string
  author_label: string
  author_username?: string | null
  author_avatar_url?: string | null
  author_bio?: string | null
  can_edit: boolean
  can_reply?: boolean
  parent_id?: string | null
  thread_root_id?: string
  reply_to_comment_id?: string | null
  reply_to_author_label?: string | null
  content: string
  status: string
  lang: string
  like_count: number
  created_at: string
}

function normalizeComment(comment: BackendComment): CommentItem {
  return {
    id: comment.id,
    pageSlug: comment.page_slug,
    authorLabel: comment.author_label,
    authorUsername: comment.author_username,
    authorAvatarUrl: comment.author_avatar_url,
    authorBio: comment.author_bio,
    canEdit: comment.can_edit,
    canReply: comment.can_reply ?? false,
    parentId: comment.parent_id,
    threadRootId: comment.thread_root_id || comment.id,
    replyToCommentId: comment.reply_to_comment_id,
    replyToAuthorLabel: comment.reply_to_author_label,
    content: comment.content,
    status: comment.status,
    lang: comment.lang,
    likeCount: comment.like_count,
    createdAt: comment.created_at,
  }
}

function toBackendPayload(payload: CreateCommentRequest) {
  return {
    page_slug: payload.pageSlug,
    parent_id: payload.parentId,
    content: payload.content,
    lang: payload.lang,
  }
}

export async function listComments(pageSlug: string, lang?: string): Promise<CommentItem[]> {
  const params = new URLSearchParams({ page_slug: pageSlug })
  if (lang) params.set("lang", lang)

  const response = await apiClient.request<BackendComment[]>(`/comments?${params}`)
  return (response.data ?? []).map(normalizeComment)
}

export async function createComment(payload: CreateCommentRequest): Promise<ApiResult<CommentItem>> {
  const response = await apiClient.request<BackendComment>("/comments", {
    method: "POST",
    body: JSON.stringify(toBackendPayload(payload)),
  })

  if (!response.data) throw new Error(response.message || "Comment response is empty")
  return {
    data: normalizeComment(response.data),
    message: response.message,
  }
}

export async function updateComment(id: string, content: string): Promise<ApiResult<CommentItem>> {
  const response = await apiClient.request<BackendComment>(`/comments/${id}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  })

  if (!response.data) throw new Error(response.message || "Comment response is empty")
  return {
    data: normalizeComment(response.data),
    message: response.message,
  }
}

export async function deleteComment(id: string): Promise<string> {
  const response = await apiClient.request<void>(`/comments/${id}`, { method: "DELETE" })
  return response.message
}

export async function likeComment(id: string): Promise<ApiResult<CommentItem>> {
  const response = await apiClient.request<BackendComment>(`/comments/${id}/like`, {
    method: "POST",
  })

  if (!response.data) throw new Error(response.message || "Comment response is empty")
  return {
    data: normalizeComment(response.data),
    message: response.message,
  }
}

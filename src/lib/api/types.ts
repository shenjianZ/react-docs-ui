export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

export interface ApiResult<T> {
  data: T
  message: string
}

export interface ApiTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id?: string
  email: string
  username?: string | null
  nickname?: string | null
  avatarUrl?: string | null
  bio?: string | null
  role?: string | null
  status?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface UpdateProfileRequest {
  username?: string | null
  nickname?: string | null
  bio?: string | null
}

export interface CommentItem {
  id: string
  pageSlug: string
  authorLabel: string
  authorUsername?: string | null
  authorAvatarUrl?: string | null
  authorBio?: string | null
  canEdit: boolean
  parentId?: string | null
  content: string
  status: string
  lang: string
  likeCount: number
  createdAt: string
}

export interface CreateCommentRequest {
  pageSlug: string
  parentId?: string | null
  content: string
  lang?: string
}

export interface BookmarkItem {
  id: string
  pageSlug: string
  pageTitle?: string | null
  folder?: string | null
  notes?: string | null
  lang: string
  createdAt: string
}

export interface CreateBookmarkRequest {
  pageSlug: string
  pageTitle?: string
  folder?: string
  notes?: string
  lang?: string
}

export interface TrackPageViewRequest {
  pageSlug: string
  pageTitle?: string
  lang?: string
  path?: string
  referrer?: string
}

export interface TrackDurationRequest extends TrackPageViewRequest {
  durationSeconds: number
}

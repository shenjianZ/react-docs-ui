import { apiClient } from "./client"
import type { ApiResult, ApiTokens, AuthUser, LoginRequest, RegisterRequest, UpdateProfileRequest } from "./types"

interface AuthResult extends ApiTokens, AuthUser {}

interface BackendAuthResult {
  id?: string
  email: string
  username?: string | null
  nickname?: string | null
  avatar_url?: string | null
  bio?: string | null
  role?: string | null
  status?: string | null
  created_at?: string
  access_token: string
  refresh_token: string
}

function normalizeAuthResult(result: BackendAuthResult): AuthResult {
  return {
    id: result.id,
    email: result.email,
    username: result.username,
    nickname: result.nickname,
    avatarUrl: result.avatar_url,
    bio: result.bio,
    role: result.role,
    status: result.status,
    createdAt: result.created_at,
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
  }
}

interface BackendUserProfile {
  id: string
  email: string
  username?: string | null
  nickname?: string | null
  avatar_url?: string | null
  bio?: string | null
  role?: string | null
  status?: string | null
  created_at: string
  updated_at?: string
}

export async function login(payload: LoginRequest): Promise<ApiResult<AuthResult>> {
  const response = await apiClient.request<BackendAuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.data) {
    throw new Error(response.message || "Login response is empty")
  }

  return {
    data: normalizeAuthResult(response.data),
    message: response.message,
  }
}

export async function register(payload: RegisterRequest): Promise<ApiResult<AuthResult>> {
  const response = await apiClient.request<BackendAuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.data) {
    throw new Error(response.message || "Register response is empty")
  }

  return {
    data: normalizeAuthResult(response.data),
    message: response.message,
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.request<BackendUserProfile>("/auth/me")

  if (!response.data) {
    throw new Error(response.message || "Current user response is empty")
  }

  return {
    id: response.data.id,
    email: response.data.email,
    username: response.data.username,
    nickname: response.data.nickname,
    avatarUrl: response.data.avatar_url,
    bio: response.data.bio,
    role: response.data.role,
    status: response.data.status,
    createdAt: response.data.created_at,
    updatedAt: response.data.updated_at,
  }
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<ApiResult<AuthUser>> {
  const response = await apiClient.request<BackendUserProfile>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify({
      username: payload.username || null,
      nickname: payload.nickname || null,
      bio: payload.bio || null,
    }),
  })

  if (!response.data) throw new Error(response.message || "Profile response is empty")
  return {
    data: {
      id: response.data.id,
      email: response.data.email,
      username: response.data.username,
      nickname: response.data.nickname,
      avatarUrl: response.data.avatar_url,
      bio: response.data.bio,
      role: response.data.role,
      status: response.data.status,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
    },
    message: response.message,
  }
}

export async function uploadAvatar(file: File): Promise<ApiResult<AuthUser>> {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await apiClient.request<BackendUserProfile>("/auth/avatar", {
    method: "POST",
    body: formData,
  })

  if (!response.data) throw new Error(response.message || "Avatar response is empty")
  return {
    data: {
      id: response.data.id,
      email: response.data.email,
      username: response.data.username,
      nickname: response.data.nickname,
      avatarUrl: response.data.avatar_url,
      bio: response.data.bio,
      role: response.data.role,
      status: response.data.status,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
    },
    message: response.message,
  }
}

export async function logout(): Promise<string> {
  const response = await apiClient.request<void>("/auth/delete-refresh-token", {
    method: "POST",
  })
  return response.message
}

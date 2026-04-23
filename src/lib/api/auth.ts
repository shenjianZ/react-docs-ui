import { apiClient } from "./client"
import type {
  ApiResult,
  ApiTokens,
  AuthUser,
  EmailCodeLoginRequest,
  LoginRequest,
  OAuthProvider,
  RegisterRequest,
  SendEmailCodeRequest,
  UpdateProfileRequest,
} from "./types"

interface AuthResult extends ApiTokens, AuthUser {}

interface BackendAuthResult {
  id?: string
  email: string
  email_verified?: boolean
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

interface BackendUserProfile {
  id: string
  email: string
  email_verified?: boolean
  username?: string | null
  nickname?: string | null
  avatar_url?: string | null
  bio?: string | null
  role?: string | null
  status?: string | null
  created_at: string
  updated_at?: string
}

interface OAuthPopupMessage {
  type?: string
  success?: boolean
  provider?: OAuthProvider
  message?: string
  data?: BackendAuthResult
}

export const OAUTH_POPUP_MESSAGE_TYPE = "auth:oauth:result"

function normalizeAuthResult(result: BackendAuthResult): AuthResult {
  return {
    id: result.id,
    email: result.email,
    emailVerified: result.email_verified,
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

function toRegisterPayload(payload: RegisterRequest) {
  return {
    email: payload.email,
    password: payload.password,
    verification_code: payload.verificationCode,
  }
}

function toEmailCodeLoginPayload(payload: EmailCodeLoginRequest) {
  return {
    email: payload.email,
    verification_code: payload.verificationCode,
  }
}

function popupFeatures() {
  const width = 520
  const height = 680
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)
  return `popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`
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

export async function loginWithEmailCode(payload: EmailCodeLoginRequest): Promise<ApiResult<AuthResult>> {
  const response = await apiClient.request<BackendAuthResult>("/auth/login/email-code", {
    method: "POST",
    body: JSON.stringify(toEmailCodeLoginPayload(payload)),
  })

  if (!response.data) {
    throw new Error(response.message || "Email code login response is empty")
  }

  return {
    data: normalizeAuthResult(response.data),
    message: response.message,
  }
}

export async function sendEmailCode(payload: SendEmailCodeRequest): Promise<string> {
  const response = await apiClient.request<void>("/auth/email/send-code", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return response.message
}

export async function register(payload: RegisterRequest): Promise<ApiResult<AuthResult>> {
  const response = await apiClient.request<BackendAuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(toRegisterPayload(payload)),
  })

  if (!response.data) {
    throw new Error(response.message || "Register response is empty")
  }

  return {
    data: normalizeAuthResult(response.data),
    message: response.message,
  }
}

export async function loginWithProvider(provider: OAuthProvider): Promise<ApiResult<AuthResult>> {
  if (typeof window === "undefined") {
    throw new Error("OAuth login is only available in the browser")
  }

  return new Promise((resolve, reject) => {
    const popup = window.open(`/api/auth/oauth/${provider}/start`, `oauth-${provider}`, popupFeatures())
    if (!popup) {
      reject(new Error("浏览器拦截了登录弹窗，请允许弹窗后重试"))
      return
    }

    let settled = false
    const cleanup = () => {
      window.removeEventListener("message", handleMessage)
      window.clearInterval(closeWatcher)
      if (!popup.closed) popup.close()
    }

    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      cleanup()
      callback()
    }

    const handleMessage = (event: MessageEvent<OAuthPopupMessage>) => {
      if (event.origin !== window.location.origin) return
      if (event.source !== popup) return
      const payload = event.data
      if (!payload || payload.type !== OAUTH_POPUP_MESSAGE_TYPE) return

      if (!payload.success || !payload.data) {
        finish(() => reject(new Error(payload.message || "第三方登录失败")))
        return
      }

      finish(() => resolve({
        data: normalizeAuthResult(payload.data),
        message: payload.message || "登录成功",
      }))
    }

    const closeWatcher = window.setInterval(() => {
      if (popup.closed && !settled) {
        finish(() => reject(new Error("登录已取消")))
      }
    }, 500)

    window.addEventListener("message", handleMessage)
  })
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.request<BackendUserProfile>("/auth/me")

  if (!response.data) {
    throw new Error(response.message || "Current user response is empty")
  }

  return {
    id: response.data.id,
    email: response.data.email,
    emailVerified: response.data.email_verified,
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
      emailVerified: response.data.email_verified,
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
      emailVerified: response.data.email_verified,
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

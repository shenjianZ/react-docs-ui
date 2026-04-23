import type { ApiResponse } from "./types"

export interface ApiClientOptions {
  baseUrl?: string
  getAccessToken?: () => string | null
}

const defaultOptions: Required<Pick<ApiClientOptions, "baseUrl">> = {
  baseUrl: "/api",
}

const ACCESS_TOKEN_KEY = "auth.access_token"
const REFRESH_TOKEN_KEY = "auth.refresh_token"
export const TOKEN_REFRESH_FAILED_EVENT = "auth:token-refresh-failed"

interface BackendRefreshResult {
  access_token: string
  refresh_token: string
}

let refreshPromise: Promise<string | null> | null = null

function shouldSetJsonContentType(body: BodyInit | null | undefined) {
  return body != null && !(body instanceof FormData)
}

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

function storeTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

function clearStoredTokens() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.dispatchEvent(new Event(TOKEN_REFRESH_FAILED_EVENT))
}

async function refreshAccessToken(baseUrl: string): Promise<string | null> {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) return null

  refreshPromise ??= fetch(`${baseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null) as ApiResponse<BackendRefreshResult> | null
      if (!response.ok || !payload?.data) throw new Error(payload?.message || "登录状态已过期，请重新登录")
      storeTokens(payload.data.access_token, payload.data.refresh_token)
      return payload.data.access_token
    })
    .catch(() => {
      clearStoredTokens()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly getAccessToken?: () => string | null

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? defaultOptions.baseUrl
    this.getAccessToken = options.getAccessToken
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(init.headers)
    const accessToken = this.getAccessToken?.() ?? getStoredAccessToken()

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }

    if (shouldSetJsonContentType(init.body) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    let response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    })

    if (response.status === 401 && path !== "/auth/refresh") {
      const nextAccessToken = await refreshAccessToken(this.baseUrl)
      if (nextAccessToken) {
        headers.set("Authorization", `Bearer ${nextAccessToken}`)
        response = await fetch(`${this.baseUrl}${path}`, {
          ...init,
          headers,
        })
      }
    }

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(payload?.message ?? `API request failed: ${response.status}`)
    }

    return payload as ApiResponse<T>
  }
}

export const apiClient = new ApiClient({
  getAccessToken: getStoredAccessToken,
})

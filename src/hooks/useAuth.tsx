import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react"
import * as authApi from "@/lib/api/auth"
import { TOKEN_REFRESH_FAILED_EVENT } from "@/lib/api/client"
import type { AuthUser, UpdateProfileRequest } from "@/lib/api/types"

const ACCESS_TOKEN_KEY = "auth.access_token"
const REFRESH_TOKEN_KEY = "auth.refresh_token"

interface AuthState {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<string>
  register: (email: string, password: string) => Promise<string>
  logout: () => Promise<string>
  updateProfile: (payload: UpdateProfileRequest) => Promise<string>
  uploadAvatar: (file: File) => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const token = getStoredAccessToken()
    if (!token) {
      setState({ user: null, loading: false, isAuthenticated: false })
      return
    }
    authApi
      .getCurrentUser()
      .then((user) => {
        setState({ user, loading: false, isAuthenticated: true })
      })
      .catch(() => {
        clearTokens()
        setState({ user: null, loading: false, isAuthenticated: false })
      })
  }, [])

  useEffect(() => {
    const handleRefreshFailed = () => {
      setState({ user: null, loading: false, isAuthenticated: false })
    }
    window.addEventListener(TOKEN_REFRESH_FAILED_EVENT, handleRefreshFailed)
    return () => window.removeEventListener(TOKEN_REFRESH_FAILED_EVENT, handleRefreshFailed)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password })
    const user = result.data
    storeTokens(user.accessToken, user.refreshToken)
    setState({
      user,
      loading: false,
      isAuthenticated: true,
    })
    return result.message
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const result = await authApi.register({ email, password })
    const user = result.data
    storeTokens(user.accessToken, user.refreshToken)
    setState({
      user,
      loading: false,
      isAuthenticated: true,
    })
    return result.message
  }, [])

  const updateProfile = useCallback(async (payload: UpdateProfileRequest) => {
    const result = await authApi.updateProfile(payload)
    setState((current) => ({
      ...current,
      user: result.data,
      loading: false,
      isAuthenticated: true,
    }))
    return result.message
  }, [])

  const uploadAvatar = useCallback(async (file: File) => {
    const result = await authApi.uploadAvatar(file)
    setState((current) => ({
      ...current,
      user: result.data,
      loading: false,
      isAuthenticated: true,
    }))
    return result.message
  }, [])

  const logout = useCallback(async () => {
    const message = await authApi.logout().catch((err) => {
      if (err instanceof Error) return err.message
      return "已退出登录"
    })
    clearTokens()
    setState({ user: null, loading: false, isAuthenticated: false })
    return message
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      login: async () => "",
      register: async () => "",
      logout: async () => "",
      updateProfile: async () => "",
      uploadAvatar: async () => "",
    }
  }
  return ctx
}

export { getStoredAccessToken }

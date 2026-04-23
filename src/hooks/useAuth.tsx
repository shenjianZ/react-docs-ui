import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react"
import * as authApi from "@/lib/api/auth"
import { TOKEN_REFRESH_FAILED_EVENT } from "@/lib/api/client"
import type {
  AuthUser,
  EmailCodePurpose,
  OAuthProvider,
  UpdateProfileRequest,
} from "@/lib/api/types"

const ACCESS_TOKEN_KEY = "auth.access_token"
const REFRESH_TOKEN_KEY = "auth.refresh_token"

interface AuthState {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<string>
  loginWithEmailCode: (email: string, verificationCode: string) => Promise<string>
  register: (email: string, password: string, verificationCode: string) => Promise<string>
  sendEmailCode: (email: string, purpose: EmailCodePurpose) => Promise<string>
  loginWithProvider: (provider: OAuthProvider) => Promise<string>
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

  const applyAuthResult = useCallback((user: AuthUser & { accessToken: string, refreshToken: string }) => {
    storeTokens(user.accessToken, user.refreshToken)
    setState({
      user,
      loading: false,
      isAuthenticated: true,
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password })
    applyAuthResult(result.data)
    return result.message
  }, [applyAuthResult])

  const loginWithEmailCode = useCallback(async (email: string, verificationCode: string) => {
    const result = await authApi.loginWithEmailCode({ email, verificationCode })
    applyAuthResult(result.data)
    return result.message
  }, [applyAuthResult])

  const register = useCallback(async (email: string, password: string, verificationCode: string) => {
    const result = await authApi.register({ email, password, verificationCode })
    applyAuthResult(result.data)
    return result.message
  }, [applyAuthResult])

  const sendEmailCode = useCallback(async (email: string, purpose: EmailCodePurpose) => {
    return authApi.sendEmailCode({ email, purpose })
  }, [])

  const loginWithProvider = useCallback(async (provider: OAuthProvider) => {
    const result = await authApi.loginWithProvider(provider)
    applyAuthResult(result.data)
    return result.message
  }, [applyAuthResult])

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
    <AuthContext.Provider value={{
      ...state,
      login,
      loginWithEmailCode,
      register,
      sendEmailCode,
      loginWithProvider,
      logout,
      updateProfile,
      uploadAvatar,
    }}>
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
      loginWithEmailCode: async () => "",
      register: async () => "",
      sendEmailCode: async () => "",
      loginWithProvider: async () => "",
      logout: async () => "",
      updateProfile: async () => "",
      uploadAvatar: async () => "",
    }
  }
  return ctx
}

export { getStoredAccessToken }

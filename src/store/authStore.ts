import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User } from '../types'
import { clearAccessToken, setAccessToken } from '@/utils/authToken'

// 会话元信息，方便后续设备管理、风控扩展（仅存储非敏感信息）
export interface AuthMeta {
  sessionId?: string
  deviceId?: string
  lastLoginAt?: string
}

interface AuthState {
  // 仅在内存中持有 accessToken，禁止持久化到 localStorage
  user: User | null
  authMeta: AuthMeta | null
  // 标记是否完成初始化（例如是否已经尝试过基于 refreshToken 的自动登录）
  isInitialized: boolean
  setLogin: (params: {
    accessToken: string
    accessExpire: number
    user: User
    authMeta?: AuthMeta | null
  }) => void
  logout: () => void
  setInitialized: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
        
      user: null,
      authMeta: null,
      isInitialized: false,
      // 登录成功后由业务层调用，内部会设置内存中的 accessToken
      setLogin: ({ accessToken, accessExpire, user, authMeta }) => {
        // 使用专门的工具管理 Token 生命周期，仅存储在内存中
        setAccessToken(accessToken, accessExpire)
        set({
          user,
          authMeta: authMeta ?? null,
        })
      },
      logout: () => {
        // 清空内存 Token 与用户会话信息
        clearAccessToken()
        set({
          user: null,
          authMeta: null,
        })
      },
      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 仅持久化非敏感字段，避免 accessToken 被写入本地
      // 注意：不持久化 isInitialized，让每次浏览器刷新都重新运行 bootstrapAuthSession
      partialize: (state) => ({
        user: state.user,
        authMeta: state.authMeta,
      }),
    }
  )
)

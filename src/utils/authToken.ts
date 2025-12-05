// 中央 Token 管理工具：仅在内存中保存 accessToken，负责生命周期与刷新队列
import { login, refreshToken as refreshTokenApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

// 内存中的 accessToken 及过期时间（毫秒时间戳）
let accessToken: string | null = null
let accessExpireAt: number | null = null

// 单例刷新 Promise，防止并发多次刷新
let refreshPromise: Promise<void> | null = null

// 主动刷新阈值（秒），当 Token 剩余寿命低于该值时触发后台刷新
const REFRESH_THRESHOLD_SECONDS = 60

export function setAccessToken(token: string, accessExpireSeconds: number): void {
  accessToken = token
  // 后端返回的是秒级过期时间（相对秒），这里转换为绝对时间戳（毫秒）
  accessExpireAt = Date.now() + accessExpireSeconds * 1000
}

export function clearAccessToken(): void {
  accessToken = null
  accessExpireAt = null
  refreshPromise = null
}

export function getAccessToken(): string | null {
  return accessToken
}

// 获取 Token 剩余寿命（秒），若未知则返回 null
export function getAccessTokenRemainingSeconds(): number | null {
  if (!accessToken || !accessExpireAt) return null
  const remainingMs = accessExpireAt - Date.now()
  return Math.floor(remainingMs / 1000)
}

// 判断当前 Token 是否仍然有效
export function hasValidAccessToken(): boolean {
  const remaining = getAccessTokenRemainingSeconds()
  return !!accessToken && remaining !== null && remaining > 0
}

// 单例刷新逻辑：确保同一时间只会有一个刷新请求在进行
export function refreshAccessToken(): Promise<void> {
  // 已经有刷新操作在进行，直接复用
  if (refreshPromise) {
    return refreshPromise
  }

  // 若当前已经没有 Token 且 store 中也没有用户信息，认为不需要刷新
  const currentUser = useAuthStore.getState().user
  if (!currentUser && !accessToken) {
    return Promise.reject(new Error('no-session'))
  }

  refreshPromise = (async () => {
    try {
      // 调用专门的刷新接口，由后端根据 HttpOnly refreshToken Cookie 判断是否允许刷新
      const resp = await refreshTokenApi()
      const { accessToken: newToken, accessExpire, id, username, role, sessionId, deviceId } = resp

      const user: User = {
        id,
        username,
        email: currentUser?.email ?? '',
        role,
      }

      useAuthStore
        .getState()
        .setLogin({
          accessToken: newToken,
          accessExpire,
          user,
          authMeta: {
            sessionId,
            deviceId,
            lastLoginAt: new Date().toISOString(),
          },
        })
    } catch (error) {
      // 刷新失败通常意味着 refreshToken 已失效或被撤销，必须强制登出
      useAuthStore.getState().logout()
      throw error
    } finally {
      // 刷新结束后无论成功失败都清空单例 Promise
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// 在请求前可以调用该方法触发一次“懒刷新”（不阻塞当前请求）
export function ensureProactiveRefresh(): void {
  const remaining = getAccessTokenRemainingSeconds()
  if (remaining !== null && remaining > 0 && remaining < REFRESH_THRESHOLD_SECONDS) {
    // 后台静默刷新，不关心结果，真正的错误会在后续请求中统一处理
    void refreshAccessToken().catch(() => {
      // 错误由全局错误处理负责，这里仅忽略
    })
  }
}

// 提供一个初始化入口，页面刷新后可以调用一次，根据 refreshToken Cookie 自动恢复会话
export async function bootstrapAuthSession(): Promise<void> {
  const store = useAuthStore.getState()
  if (store.isInitialized) return

  try {
    await refreshAccessToken()
  } catch {
    // 若刷新失败说明当前没有有效会话，静默失败即可
  } finally {
    useAuthStore.getState().setInitialized()
  }
}




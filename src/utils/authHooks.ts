// 预留认证生命周期 Hook，方便后续集成 MFA / OAuth / 埋点 / A/B Test 等

import type { LoginReq, User } from '@/types'

export interface AuthLifecycleHooks {
  // 登录请求发起前，可以用于插入 MFA 流程或埋点
  onBeforeLogin?: (payload: LoginReq) => void
  // 登录成功后（包括刷新 Token 成功），用于记录埋点或拉取额外配置
  onAfterLogin?: (user: User) => void
  // 登出后（包括 refreshToken 撤销）统一回调
  onLogout?: () => void
}

const hooks: AuthLifecycleHooks = {}

export function getAuthHooks(): AuthLifecycleHooks {
  return hooks
}

// 在应用初始化时可以调用 setAuthHooks 自定义生命周期回调
export function setAuthHooks(next: Partial<AuthLifecycleHooks>): void {
  Object.assign(hooks, next)
}




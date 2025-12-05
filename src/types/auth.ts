// src/types/auth.ts

// 对应后端 UserResp
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
}

export interface ListUserResp {
  list: User[]
}

// 对应后端 LoginReq
export interface LoginReq {
  email: string
  // 说明：前端会对原始密码进行 SHA-256 + 盐哈希后再传给后端
  password: string
}

// 对应后端 LoginResp
export interface LoginResp {
  accessToken: string
  accessExpire: number
  id: string
  username: string
  role: 'admin' | 'user'
  csrfToken?: string
  // 可选：会话/设备信息，方便后续扩展
  sessionId?: string
  deviceId?: string
}

// 刷新 Token 返回
export interface RefreshTokenResp {
  accessToken: string
  accessExpire: number
  id: string
  username: string
  role: 'admin' | 'user'
  sessionId?: string
  deviceId?: string
}

// 校验 Token 返回
export interface VerifyTokenResp {
  valid: boolean
  // 若后端在校验时顺便返回用户信息，可直接用于本地对齐
  user?: User
}

// 对应后端 CreateUserReq
export interface CreateUserReq {
  username: string
  email: string
  password: string
}

// 对应后端 DeleteUserReq
export interface DeleteUserReq {
  id: string
}

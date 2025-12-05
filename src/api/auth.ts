import request from '@/utils/request'
import type {
  LoginReq,
  LoginResp,
  CreateUserReq,
  ListUserResp,
  RefreshTokenResp,
  VerifyTokenResp,
} from '@/types'

// 登录接口，前端会在调用前对密码进行 SHA-256 加盐哈希
export const login = (data: LoginReq) => {
  return request.post<any, LoginResp>('/user/users/login', data)
}

// 刷新 accessToken，依赖后端基于 HttpOnly refreshToken Cookie 进行验证
export const refreshToken = () => {
  return request.post<any, RefreshTokenResp>('/user/users/refresh-token')
}

// 校验当前 accessToken 是否仍然有效（可选，一般只在路由守卫中按需调用）
export const verifyToken = () => {
  return request.get<any, VerifyTokenResp>('/user/users/verify-token')
}

// 登出接口，由后端根据 refreshToken Cookie 撤销会话
export const logout = () => {
  return request.post('/user/users/logout')
}

export const createUser = (data: CreateUserReq) => {
  return request.post<{ id: string }>('/user/users', data)
}

export const deleteUser = (id: string) => {
  return request.delete(`/user/users/${id}`)
}

export const getUsers = () => {
  return request.get<any, ListUserResp>('/user/users')
}

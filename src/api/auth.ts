import request from '@/utils/request'
import type { LoginReq, LoginResp, CreateUserReq, ListUserResp } from '@/types'

export const login = (data: LoginReq) => {
     return request.post<any, LoginResp>('/user/users/login', data)
}

export const createUser = (data: CreateUserReq) => {
     return request.post<{ id: string }>('/user/users', data)
}

export const deleteUser = (id: string) => {
     return request.delete(`/user/users/${id}`)
}

export const getUsers = () => {
     return request.get<any, ListUserResp>('/user/users');
};
// src/types/auth.ts

// 对应后端 UserResp
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ListUserResp {
  list: User[];
}

// 对应后端 LoginReq
export interface LoginReq {
  email:     string;
  password:  string;
}

// 对应后端 LoginResp
export interface LoginResp {
  accessToken:  string;
  accessExpire: number;
  id:           string;
  username:     string;
  role:         'admin' | 'user';
}

// 对应后端 CreateUserReq
export interface CreateUserReq {
  username:  string;
  email:     string;
  password:  string;
}

// 对应后端 DeleteUserReq
export interface DeleteUserReq {
  id: string;
}
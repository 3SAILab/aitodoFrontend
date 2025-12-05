import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { ensureProactiveRefresh, getAccessToken, refreshAccessToken } from '@/utils/authToken'
import { getCsrfToken } from '@/utils/csrf'

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==========================================
// 请求拦截器：注入 Authorization / CSRF / 主动刷新
// ==========================================
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 简单防御：禁止向非我们后端域名发送凭证（如有跨域配置需在这里放行白名单）
    // 此处 baseURL 已指向后端网关，因此无需额外判断 domain

    const token = getAccessToken()
    if (token) {
      // 使用标准 Bearer Token 头
      config.headers.Authorization = `Bearer ${token}`
      // 触发一次懒刷新（不阻塞当前请求）
      ensureProactiveRefresh()
    }

    // CSRF 双重提交：前端从 meta / storage 中读取 csrfToken，随每个请求写入 Header
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      // 具体 header 名称需与后端约定
      config.headers['X-CSRF-Token'] = csrfToken
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// ==========================================
// 响应拦截器：统一错误处理 + 401 刷新 Token 队列
// ==========================================
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一返回 data，业务层不再关心 Axios 的包装结构
    return response.data
  },
  async (error: AxiosError) => {
    const { response, config } = error

    if (!response) {
      if (error.message.includes('timeout')) {
        console.error('请求超时，请检查网络')
      } else {
        console.error('网络连接异常')
      }
      return Promise.reject(error)
    }

    const originalConfig = config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // 401 且尚未重试：尝试通过 refreshToken 刷新 accessToken
    if (response.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true
      try {
        await refreshAccessToken()
        // 刷新成功后重放原始请求
        return service(originalConfig)
      } catch (refreshError) {
        // 刷新失败通常意味着 refreshToken 已失效或被撤销，需要强制登出
        const store = useAuthStore.getState()
        store.logout()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    handleError(response.status, response.data)
    return Promise.reject(error)
  }
)

// 全局错误映射，可与 i18n 集成
const ERROR_CODE_MAP: Record<number, string> = {
  400: 'error.badRequest',
  401: 'error.unauthorized',
  403: 'error.forbidden',
  404: 'error.notFound',
  429: 'error.tooManyRequests',
  500: 'error.serverError',
}

const handleError = (status: number, data: any) => {
  const errorKey = ERROR_CODE_MAP[status] ?? 'error.unknown'

  switch (status) {
    case 400:
      console.error('请求参数错误', data)
      break
    case 401:
      console.error('未授权或登录已过期', data)
      break
    case 403:
      console.error('拒绝访问，权限不足', data)
      break
    case 404:
      console.error('请求地址出错', data)
      break
    case 429:
      console.error('请求过于频繁，请稍后再试', data)
      break
    case 500:
      console.error('服务器内部错误', data)
      break
    default:
      console.error('网络请求错误', status, data)
  }

  // 在这里可以对接全局错误上报系统，例如 Sentry / 自研日志平台
  // reportError({ status, data, errorKey })
}

export default service

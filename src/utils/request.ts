import type {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig,
    AxiosResponse,
} from 'axios'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const service: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// ==========================================
// 请求拦截器
// ==========================================
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)
// ==========================================
// 响应拦截器
// ==========================================
service.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data
    },
    (error: AxiosError) => {
        const { response } = error
        if (response) {
            handleError(response.status, response.data)
        } else {
            if (error.message.includes('timeout')) {
                console.error('请求超时，请检查网络');
            } else {
                console.error('网络连接异常');
            }
        }
        return Promise.reject(error)
    }
)

const handleError = (status: number, data: any) => {
    switch (status) {
        case 400:
            console.error('请求参数错误', data)
            break
        case 401:
            console.error('未授权，请登录')
            // 清除本地 Token 并跳转登录
            useAuthStore.getState().logout()
            // 避免无限循环跳转，可以加个判断
            if (window.location.pathname != '/login') {
                window.location.href = '/login'
            }
            break
        case 403:
            console.error('拒绝访问，权限不足')
            break
        case 404:
            console.error('请求地址出错')
            break
        case 500:
            console.error('服务器内部错误')
            break
        default:
            console.error('网络请求错误', status)
    }
}

export default service











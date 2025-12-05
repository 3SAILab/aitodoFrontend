import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-toastify'
import { isStrongPassword, isValidEmail } from '@/utils/validators'
import { getAuthHooks } from '@/utils/authHooks'

// 本地连续失败计数的阈值，超过后增加延迟或触发图形验证码
const MAX_LOCAL_FAILURE_BEFORE_SLOWDOWN = 3

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [failureCount, setFailureCount] = useState(0)
  const lastSubmitTimeRef = useRef<number>(0)

  const setLogin = useAuthStore((state) => state.setLogin)
  const navigate = useNavigate()
  const location = useLocation()

  const hooks = getAuthHooks()

  // 登录按钮点击处理，包含防抖与安全检查
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const now = Date.now()
    // 简易防抖：两次点击间隔小于 1s 则忽略
    if (now - lastSubmitTimeRef.current < 1000) {
      return
    }
    lastSubmitTimeRef.current = now

    if (loading) return

    // 基础输入校验，防止非法数据进入后端
    if (!isValidEmail(email)) {
      toast.error('邮箱格式不正确')
      return
    }
    if (!isStrongPassword(password)) {
      toast.error('密码至少 8 位，且需包含字母和数字')
      return
    }

    setLoading(true)
    try {
      // 触发登录前 Hook（可用于埋点或 MFA 前置）
      hooks.onBeforeLogin?.({ email, password: '***masked***' })

      // 将明文密码交给后端，由后端统一做 bcrypt 等强哈希
      // 注意：请确保整站启用 HTTPS，避免明文在网络中被窃听
      const res = await login({ email, password })

      // 写入 CSRF Token 到 meta，供全局请求拦截器读取并附加到 Header
      if (res.csrfToken) {
        let meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        if (!meta) {
          meta = document.createElement('meta')
          meta.name = 'csrf-token'
          document.head.appendChild(meta)
        }
        meta.content = res.csrfToken
      }

      // 存储用户信息并初始化会话
      setLogin({
        accessToken: res.accessToken,
        accessExpire: res.accessExpire,
        user: {
          id: res.id,
          username: res.username,
          email,
          role: res.role,
        },
        authMeta: {
          sessionId: res.sessionId,
          deviceId: res.deviceId,
          lastLoginAt: new Date().toISOString(),
        },
      })

      hooks.onAfterLogin?.({
        id: res.id,
        username: res.username,
        email,
        role: res.role,
      })

      setFailureCount(0)
      toast.success('登录成功，欢迎回来！')

      // 登录后根据来源路径进行回跳
      const from = (location.state as { from?: string } | null)?.from
      navigate(from || '/', { replace: true })
    } catch (err: any) {
      const nextFailureCount = failureCount + 1
      setFailureCount(nextFailureCount)

      // 根据返回状态码映射更友好的错误消息 / i18n 文案 key
      const status = err?.response?.status
      if (status === 401) {
        toast.error('账号或密码错误')
      } else if (status === 403) {
        toast.error('权限不足，无法登录当前系统')
      } else if (status === 429) {
        toast.error('请求过于频繁，请稍后再试')
      } else if (status >= 500) {
        toast.error('服务器异常，请稍后再试')
      } else {
        toast.error('登录失败，请检查网络或稍后重试')
      }

      // 连续失败超过 N 次后，增加简单延迟（模拟图形验证码/风控）
      if (nextFailureCount >= MAX_LOCAL_FAILURE_BEFORE_SLOWDOWN) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.min(nextFailureCount, 5)))
        // 在实际生产中，此处应触发图形验证码或调用风控接口
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">系统登录</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="current-password"
              required
            />
          </div>
          {/* 这里可以扩展“忘记密码 / MFA”等入口 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}

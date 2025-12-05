import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import Layout from '@/layout'
import LoginPage from '@/views/auth/login'
import TaskBoard from '@/views/task/board'
import { useAuthStore } from '@/store/authStore'
import SaleManagement from '@/views/task/sales'
import TypeManagement from '@/views/task/types'
import UserManagement from '@/views/admin/user'
import { hasValidAccessToken } from '@/utils/authToken'

// 路由元信息，用于描述访问控制策略
interface RouteMeta {
  requiresAuth?: boolean
  roles?: Array<'admin' | 'user'>
  isPublic?: boolean
}

// 基础鉴权 Hook，可在任意组件中复用
export function useAuthGuard(meta?: RouteMeta): { allowed: boolean; reason?: string } {
  const user = useAuthStore((state) => state.user)
  const isLoggedIn = !!user && hasValidAccessToken()

  if (meta?.requiresAuth && !isLoggedIn) {
    return { allowed: false, reason: 'unauthenticated' }
  }

  if (meta?.roles && user && !meta.roles.includes(user.role)) {
    return { allowed: false, reason: 'forbidden' }
  }

  return { allowed: true }
}

// 受保护路由组件：未登录时记录来源路径并跳转登录页
const ProtectedRoute = ({
  children,
  meta,
}: {
  children: JSX.Element
  meta?: RouteMeta
}) => {
  const location = useLocation()
  const { allowed, reason } = useAuthGuard({ requiresAuth: true, ...meta })

  if (!allowed && reason === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (!allowed && reason === 'forbidden') {
    return (
      <div className="p-8 text-center text-gray-500">
        权限不足：需要管理员身份
      </div>
    )
  }

  return children
}

// 仅匿名可访问的路由（如登录页）：已登录用户访问时自动跳转首页
const PublicOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const user = useAuthStore((state) => state.user)
  const isLoggedIn = !!user && hasValidAccessToken()

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return children
}

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { allowed, reason } = useAuthGuard({ requiresAuth: true, roles: ['admin'] })

  if (!allowed && reason === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  if (!allowed && reason === 'forbidden') {
    return (
      <div className="p-8 text-center text-gray-500">
        权限不足：需要管理员身份
      </div>
    )
  }

  return children
}

export const router = createBrowserRouter([
  {
    path: '/login',
    // 示例：使用组件守卫实现登录页的“已登录自动跳转”
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
    // 示例：使用 route meta 维护权限信息，便于将来集成基于 loader 的服务端校验
    handle: {
      meta: {
        isPublic: true,
      } satisfies RouteMeta,
    },
  },
  {
    path: '/',
    element: (
      <ProtectedRoute meta={{ requiresAuth: true }}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TaskBoard /> },
      // 销售人员页面路由，挂载销售任务看板
      { path: 'sales', element: <SaleManagement /> },
      { path: 'task-types', element: <TypeManagement /> },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        ),
      },
    ],
  },
  // 404 兜底路由
  { path: '*', element: <Navigate to="/" replace /> },
])

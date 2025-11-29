import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '@/layout';
import LoginPage from '@/views/auth/login';
import TaskBoard from '@/views/task/board';
import { useAuthStore } from '@/store/authStore';
import SaleManagement from '@/views/task/sales';
import TypeManagement from '@/views/task/types';
import UserManagement from '@/views/admin/user';

// 路由守卫组件
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }: { children: JSX.element }) => {
    const user = useAuthStore((state) => state.user)
    if (user?.role !== 'admin') {
        return (
            <div className='p-8 text-center text-gray-500'>
                权限不足：需要管理员身份
            </div>
        )
    }
    return children
}


export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
        { index: true, element: <TaskBoard /> },
        { path: 'sales', element: <SaleManagement />},
        { path: 'task-types', element: <TypeManagement />},
        { 
            path: 'admin/users', 
            element: <AdminRoute><UserManagement /></AdminRoute> 
        },
    ],
  },
  { path: '&', element: <Navigate to="/" replace></Navigate>}
]);
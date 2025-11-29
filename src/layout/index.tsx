import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'  
import { LayoutDashboard, Users, LogOut, Briefcase, Tag } from 'lucide-react'

import clsx from 'clsx'

export default function Layout() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const linkClass = (path: string) => clsx(
        "flex items-center gap-2 rounded-md px-4 py-2 transition-colors",
        location.pathname === path
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    )

    return (
        <div className='flex h-screen bg-gray-50'>
            <aside className='w-64 bg-white shadow-md'>
                <div className='p-6'>
                    <h1 className='text-xl font-bold text-blue-600'>Todo 系统</h1>
                    <p className='text-xs text-gray-500 mt-1'>当前用户: {user?.username}</p>
                </div>
                <nav className='mt-6 px-4 space-y-2'>
                    <Link to="/" className='flex items-center gap-2 rounded-md px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600'>
                        <LayoutDashboard size={20} />
                        任务看板
                    </Link>

                    <Link to="/sales" className={linkClass("/sales")}>
                        <Briefcase size={18} /> 
                        销售人员
                    </Link>

                    <Link to="/task-types" className={linkClass("/task-types")}>
                        <Tag size={18} /> 任务类型
                    </Link>

                    {user?.role === 'admin' && (
                        <Link to="/admin/users" className='flex items-center gap-2 rounded-md px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600'>
                            <Users size={20}/>
                            用户管理
                        </Link>
                    )}

                    <button onClick={handleLogout} className='flex w-full items-center gap-2 rounded-md px-4 py-2 text-red-600 hover:bg-red-50 mt-10'>
                        <LogOut size={20}/>
                        退出登录
                    </button>
                </nav>
            </aside>
            <main className='flex-1 overflow-auto p-8'>
                <Outlet />
            </main>
        </div>
    )
}
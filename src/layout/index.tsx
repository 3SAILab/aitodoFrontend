import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'  
import { LayoutDashboard, Users, LogOut, Briefcase, Tag } from 'lucide-react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import clsx from 'clsx'
import { toast } from 'react-toastify'; 

export default function Layout() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation() // 获取当前路由位置

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // 统一样式生成函数：根据当前路径判断是否激活
    const linkClass = (path: string) => clsx(
        "flex items-center gap-2 rounded-md px-4 py-2 transition-colors",
        location.pathname === path
            ? "bg-blue-50 text-blue-600 font-medium" // 选中状态：蓝色背景和文字
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600" // 默认状态：灰色文字，Hover变蓝
    )

    return (
        <div className='flex h-screen bg-gray-50'>
            {/* <ToastContainer /> */}
            <ToastContainer 
                position="top-center"
                autoClose={2000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <aside className='w-64 bg-white shadow-md'>
                <div className='p-6'>
                    <h1 className='text-xl font-bold text-blue-600'>Todo 系统</h1>
                    <p className='text-xs text-gray-500 mt-1'>当前用户: {user?.username}</p>
                </div>
                <nav className='mt-6 px-4 space-y-2'>
                    {/* 修复：使用 linkClass 统一处理样式 */}
                    <Link to="/" className={linkClass("/")}>
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
                        /* 修复：使用 linkClass 统一处理样式 */
                        <Link to="/admin/users" className={linkClass("/admin/users")}>
                            <Users size={20}/>
                            用户管理
                        </Link>
                    )}

                    <button onClick={handleLogout} className='flex w-full items-center gap-2 rounded-md px-4 py-2 text-red-600 hover:bg-red-50 mt-10 transition-colors'>
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
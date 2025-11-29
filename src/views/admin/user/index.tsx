import { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '@/api/auth';
import type { User } from '@/types';
import { UserPlus, Trash2, Shield, User as UserIcon, Mail } from 'lucide-react';
import CreateUserModal from './CreateUserModal';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';

export default function UserManagement() {
  const [list, setList] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 获取当前登录用户，防止自己删除自己
  const currentUser = useAuthStore(state => state.user);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setList(res.list || []);
    } catch (e) {
      console.error("获取用户列表失败", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert("无法删除当前登录账号！");
      return;
    }
    if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作无法撤销。`)) return;
    
    try {
      await deleteUser(user.id);
      // 乐观更新：直接从列表中移除
      setList(prev => prev.filter(item => item.id !== user.id));
    } catch (e) {
      alert('删除失败');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理系统内所有账户及其权限</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
        >
          <UserPlus size={18} /> 新建用户
        </button>
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">用户名称</div>
          <div className="col-span-4">电子邮箱</div>
          <div className="col-span-3">角色权限</div>
          <div className="col-span-2 text-right">操作</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-400">
              加载中...
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <UserIcon size={48} className="mb-4 opacity-20" />
              <p>暂无用户数据</p>
            </div>
          ) : (
            list.map(user => (
              <div 
                key={user.id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors items-center"
              >
                {/* Username */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <UserIcon size={16} />
                  </div>
                  <span className="font-medium text-gray-900">{user.username}</span>
                </div>

                {/* Email */}
                <div className="col-span-4 flex items-center gap-2 text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  {user.email}
                </div>

                {/* Role */}
                <div className="col-span-3">
                  <span className={clsx(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    user.role === 'admin' 
                      ? "bg-purple-50 text-purple-700 border border-purple-100" 
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  )}>
                    {user.role === 'admin' ? <Shield size={12} /> : null}
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end">
                  {/* 只有当这一行不是当前登录用户时，才显示删除按钮 */}
                  {user.id !== currentUser?.id && (
                    <button 
                      onClick={() => handleDelete(user)}
                      // ✅ 删除了 opacity-0 group-hover:opacity-100，让按钮一直可见
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="删除用户"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
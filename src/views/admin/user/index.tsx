import React from 'react'; // 添加 React 导入
import { getUsers, deleteUser } from '@/api/auth';
import type { User } from '@/types';
import { UserPlus, Trash2, Shield, User as UserIcon, Mail } from 'lucide-react';
import CreateUserModal from './CreateUserModal';
import { Button } from '@/components/Common/Button'; // 引入组件
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useManageList } from '@/hooks/useManageList';

export default function UserManagement() {
  const currentUser = useAuthStore(state => state.user);
  const { list, setList, loading, refresh } = useManageList<User>(getUsers);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert("无法删除当前登录账号！");
      return;
    }
    if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作无法撤销。`)) return;
    try {
      await deleteUser(user.id);
      setList(prev => prev.filter(item => item.id !== user.id));
    } catch (e) {
      alert('删除失败');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理系统内所有账户及其权限</p>
        </div>
        <Button 
            onClick={() => setIsModalOpen(true)} 
            icon={<UserPlus size={18} />}
        >
            新建用户
        </Button>
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
          <div className="col-span-3">用户名称</div>
          <div className="col-span-4">电子邮箱</div>
          <div className="col-span-3">角色权限</div>
          <div className="col-span-2 text-right">操作</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-400">加载中...</div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <UserIcon size={48} className="mb-4 opacity-20" />
              <p>暂无用户数据</p>
            </div>
          ) : (
            list.map(user => (
              <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 items-center">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <UserIcon size={16} />
                  </div>
                  <span className="font-medium text-gray-900">{user.username}</span>
                </div>
                <div className="col-span-4 flex items-center gap-2 text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  {user.email}
                </div>
                <div className="col-span-3">
                  <span className={clsx(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    user.role === 'admin' ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-gray-100 text-gray-600 border border-gray-200"
                  )}>
                    {user.role === 'admin' ? <Shield size={12} /> : null}
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  {user.id !== currentUser?.id && (
                    <Button 
                        variant="danger" // 使用 danger 样式
                        className="px-2 py-1 h-auto" // 调整尺寸
                        onClick={() => handleDelete(user)} 
                        title="删除"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={refresh} />
    </div>
  );
}
import { useState } from "react";
import { createUser } from "@/api/auth";
import { X } from "lucide-react";

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: Props) {
    const [formData, setFormData] = useState({ username: '', email: '', password: ''})
    const [loading, setLoading] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createUser(formData)
            onSuccess()
            onClose()
            setFormData({ username: '', email: '', password: '' })
        } catch (error) {
            alert('创建用户失败，可能是权限不足或邮箱已存在');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blue-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="flex justify-between mb-4">
                    <h3>创建新用户 (Admin)</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">用户名</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2" 
                            required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">邮箱 (登录账号)</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2" 
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">初始密码</label>
                        <input 
                        type="text" className="w-full border rounded-lg px-3 py-2" required 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        placeholder="建议设置为复杂密码"
                        />
                    </div>
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        {loading ? '创建中...' : '确认创建'}
                    </button>
                </form>
            </div>
        </div>
    )
}





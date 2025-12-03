import React, { useState } from "react";
import { createUser } from "@/api/auth";
import Modal from "@/components/Common/Modal";
import { FormInput } from "@/components/Common/FormInput";
import { Button } from "@/components/Common/Button";

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

    return (
        <Modal title="创建新用户" isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="用户名"
                    required
                    value={formData.username}
                    onChange={e => setFormData( {...formData, username: e.target.value })}
                />
                <FormInput
                    label="邮箱(登录账号)"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value})}
                />
                <FormInput
                    label="密码"
                    type="text"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value})}
                />
                <div className="pt-2">
                    <Button type="submit" className="w-full" isLoading={loading}>
                        确认创建
                    </Button>
                </div>
                
            </form>

        </Modal>
    )
}





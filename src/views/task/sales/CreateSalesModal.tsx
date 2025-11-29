import React, { useState } from "react";
import { createSalesPerson } from "@/api/task";
import { X } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateSalesModal({ isOpen, onClose, onSuccess }: Props) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createSalesPerson( { name, phone })
            onSuccess()
            onClose()
            setName('')
            setPhone('')
        } catch (error) {
            alert('创建失败');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blue-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold">添加销售人员</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">姓名<span className="text-red-500">*</span></label>
                        <input 
                            className="w-full border rounded-lg px-3 py-2" 
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">电话</label>
                        <input 
                            className="w-full border rounded-lg px-3 py-2" 
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                    </div>
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        {loading ? '提交中...' : '确认添加'}
                    </button>
                </form>                
            </div>
        </div>
    )
}


import React, { useState } from "react";
import { createSalesPerson } from "@/api/task";
import Modal from '@/components/Common/Modal';
import { FormInput } from "@/components/Common/FormInput";
import { toast } from 'react-toastify'; 

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
            toast.success('销售人员添加成功');
            onSuccess()
            onClose()
            setName('')
            setPhone('')
        } catch (error) {
            toast.error('添加失败');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal title="添加销售人员" isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput 
                    label="姓名"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <FormInput 
                    label="电话"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {loading ? '添加中...' : "确认添加"}
                </button>
            </form>
        </Modal>

    )
}


import { useState, useEffect } from "react";
import { getSalesPersons, deleteSalesPerson } from "@/api/task";
import type { SalesPerson } from "@/types";
import { Trash2, Phone, User as UserIcon} from "lucide-react";
import CreateSalesModal from "./CreateSalesModal";
import { useConfirm } from "@/hooks/useConfirm";
import ConfirmModal from "@/components/Common/ConfirmModal";

export default function SaleManagement() {
    const [list, setList] = useState<SalesPerson[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchData = async () => {
        try {
            const res = await getSalesPersons()
            setList(res.list || [])
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除该销售吗?')) return
        try {
            await deleteSalesPerson(id)
            fetchData()
        } catch (e) {
            alert('删除失败');
        }
    }

    const deleteConfirm = useConfirm<string>({
        title: "删除销售人员",
        content: "确定要删除该销售人员吗？", // 这里比较简单，直接用字符串即可
        variant: "danger",
        onConfirm: async (id) => {
            await deleteSalesPerson(id)
            fetchData()
        }
    })

    return (
        <div className="p-6">
            <div className="flex justify-between  items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">销售人员管理</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                + 添加销售
            </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone size={12}/>
                                    {item.phone || '无电话'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => deleteConfirm.confirm(item.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                        >
                            <Trash2 size={18}></Trash2>
                        </button>
                    </div>
                ))}
                {list.length === 0 && <p className="text-gray-400 col-span-full text-center py-10">暂无数据</p>}
            </div>
            <CreateSalesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
            <ConfirmModal {...deleteConfirm.modalProps}/>
        </div>
    )

}

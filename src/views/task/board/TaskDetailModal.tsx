import React, { useState, useEffect } from "react";
import { getTaskProgress, createTaskProgress, UpdateTask } from "@/api/task";
import type { Task, TaskProgress } from "@/types";
import { X, Send, Clock } from "lucide-react";

interface Props {
    task: Task | null
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
}

const formatDate = (timestamp: number) => {
    if (!timestamp) return '无'
    const date = new Date(timestamp * 1000)
    
    // 用 UTC 系列方法，直接读取 UTC 时间，不加时区偏移
    const year = date.getUTCFullYear()
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = date.getUTCDate().toString().padStart(2, '0')
    const hour = date.getUTCHours().toString().padStart(2, '0')
    const minute = date.getUTCMinutes().toString().padStart(2, '0')

    return `${year}-${month}-${day} ${hour}:${minute}`
}

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate }: Props) {
    const [logs, setLogs] = useState<TaskProgress[]>([])
    const [newContent, setNewContent] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (task && isOpen) {
            getTaskProgress(task.id).then(res => setLogs(res.list || []))
        }
    }, [task, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!task || !newContent.trim()) return

        try {
            await createTaskProgress(task.id, newContent)
            setNewContent('')
            const res = await getTaskProgress(task.id)
            console.log(res)
            setLogs(res.list || [])
        } catch (error) {
            alert("记录失败")
        }
    }

    const handleStatusChange = async (newStatus: 'TODO' | 'DOING' | 'DONE') => {
        if (!task) return
        await UpdateTask(task.id, { ...task, status: newStatus })
        onUpdate()
        onClose()
    }
    if (!isOpen || !task) return null

    return (
        <div className="fixed inset-0 flex z-50 items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-400 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
                        <span className="text-sm text-gray-500 mt-1 block">当前状态: {task.status}</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600" onClick={onClose}><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* <div className="w-1/3 p-6 border-r border-gray-100 overflow-y-auto">
                        <h4 className="font-medium mb-2 text-gray-700">任务描述</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>

                        <div className="mt-8 space-y-3">
                            <h4 className="font-medium text-gray-700">操作</h4>
                            {task.status != 'DONE' && (
                                <button
                                    onClick={() => handleStatusChange('DONE')}
                                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                >
                                    ✅ 标记为完成
                                </button>
                            )}
                        </div>
                    </div> */}
                    
                    <div className="w-2/3 p-6 flex flex-col">
                        <h4 className="font-medium">
                            <Clock size={16}/> 进度记录 / 中间结果
                        </h4>
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                            {logs.length === 0 && <p className="text-gray-400 text-center text-sm py-4">暂无进度记录，开始添加一条吧</p>}
                            {logs.map(log => (
                                <div key={log.id} className="flex gap-3">
                                    <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none flex-1">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{log.content}</p>
                                        <div className="text-xs text-gray-400 mt-1 text-right">
                                            {formatDate(log.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="border-t pt-4">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 border rounded-lg px-4 py-2 text-sm focus-ring-2 focus:ring-blue-500 outline-none"
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    placeholder="记录当前的中间结果、遇到的问题..."
                                />
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>


        </div>
    )

}






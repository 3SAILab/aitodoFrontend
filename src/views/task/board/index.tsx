import { useEffect, useState } from "react"
import { getTasks, UpdateTask, getTaskTypes, updateTaskType } from "@/api/task"
import type { Task, TaskType } from "@/types"
import CreateTaskModal from "./CreateTaskModal"

import clsx from 'clsx'


const COLUMNS = [
    { id: 'TODO', title: '待办事项', color: 'bg-gray-100 border-gray-200' },
    { id: 'DOING', title: '进行中', color: 'bg-blue-50 border-blue-200' },
    { id: 'DONE', title: '已完成', color: 'bg-green-50 border-green-200' }
]

export default function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [types, setTypes] = useState<TaskType[]>([])

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const fetchData = async () => {
        try {
            const [taskRes, typeRes] = await Promise.all([getTasks(), getTaskTypes()])
            setTasks(taskRes.list || [])
            setTypes(typeRes.list || [])
        } catch (error) {
            console.error("加载数据失败", error)
        }
    }

    useEffect(() => {
        
        fetchData()
    }, [])

    const moveTask = async (task: Task) => {
        let nextStatus: Task['status'] = 'TODO'
        if (task.status === 'TODO') nextStatus = 'DOING'
        else if (task.status === 'DOING') nextStatus = 'DONE'
        else return
        try {
            await UpdateTask(task.id, {...task, status: nextStatus})
            setTasks(tasks.map(t => t.id === task.id ? {...t, status: nextStatus} : t))
        } catch(e) {
            alert("更新失败");
        }
    }

    const getTypeName = (typeId: string) => {
        const t = types.find(item => item.id === typeId)
        return t ? t.name : '未知类型'
    }

    const getTypeColor = (typeId: string) => {
        const t = types.find(item => item.id === typeId)
        return t ? t.colorCode : '未知类型'
    }
    
    return (
        <div className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">任务看板</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm"
                >
                    +新建任务
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6 h-[calc(100%-4rem)]:">
                {COLUMNS.map(col => (
                    <div key={col.id} className={clsx("flex flex-col rounded-xl border p-4", col.color)}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">{col.title}</h3>
                            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border">
                                {tasks.filter(t => t.status === col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <div 
                                    key={task.id} 
                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                                    onClick={() => moveTask(task)}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: getTypeColor(task.typeId)}}
                                        ></span>
                                        <span className="text-xs text-gray-500">{getTypeName(task.typeId)}</span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                                    
                                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                        <span>优先级: {task.priority}</span>
                                        <span className="opacity-0 group-hover:opacity-100 text-blue-500 font-medium">
                                            {task.status != 'DONE' ? '点击推进 >' : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    )
}


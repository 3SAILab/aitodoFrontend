import { useEffect, useState } from "react"
import { getTasks, UpdateTask, getTaskTypes } from "@/api/task"
import type { Task, TaskType } from "@/types"
import CreateTaskModal from "./CreateTaskModal"
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'

const COLUMNS = [
    { id: 'TODO', title: '待办事项', color: 'bg-gray-100 border-gray-200' },
    { id: 'DOING', title: '进行中', color: 'bg-blue-50 border-blue-200' },
    { id: 'DONE', title: '已完成', color: 'bg-green-50 border-green-200' }
]

// 格式化日期：确保显示 年-月-日 时:分
const formatDate = (timestamp: number) => {
    if (!timestamp) return '无'
    const date = new Date(timestamp * 1000)
    
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')

    return `${year}-${month}-${day} ${hour}:${minute}`
}

// 计算耗时
const getDuration = (createdAt?: number, completedAt?: number, status?: string) => {
    if (!createdAt || createdAt === 0 || status === 'TODO') {
        return <span className="text-gray-400">未开始</span>
    }

    // 结束时间点：如果已完成且有完成时间，用完成时间；否则用当前时间
    const end = (status === 'DONE' && completedAt) ? completedAt : Math.floor(Date.now() / 1000)
    
    let diff = end - createdAt
    if (diff < 0) diff = 0
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)

    let text = ''
    if (days > 0) text = `${days}天${hours}小时${minutes}分`
    else if (hours > 0) text = `${hours}小时${minutes}分`
    else text = `${minutes}分钟`

    return <span>{text}</span>
}

export default function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [types, setTypes] = useState<TaskType[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const user = useAuthStore(state => state.user)

    const isOverdue = (task: Task) => {
        // 1. 如果没有截止日期，永远不逾期
        if (!task.dueDate) return false
        
        // 2. 如果任务已完成
        if (task.status === 'DONE') {
            // 如果有记录完成时间，判断：完成时间 > 截止时间
            if (task.completedAt) {
                return task.completedAt > task.dueDate
            }
            // 如果是旧数据没有 completedAt，暂时认为不逾期（或者你可以选择 return false）
            return false
        }

        // 3. 如果任务未完成，判断：当前时间 > 截止时间
        const now = Math.floor(Date.now() / 1000)
        return now > task.dueDate
    }

    const fetchData = async () => {
        try {
            const [taskRes, typeRes] = await Promise.all([getTasks(), getTaskTypes()])
            const allTasks = taskRes.list || []
            
            if (user?.role === 'admin') {
                setTasks(allTasks)
            } else {
                setTasks(allTasks.filter(task => 
                    task.creatorId === user?.id || task.assigneeId === user?.id
                ))
            }

            setTypes(typeRes.list || [])
        } catch (error) {
            console.error("加载数据失败", error)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const moveTask = async (task: Task) => {
        let nextStatus: Task['status'] = 'TODO'
        let nextStatusText = ''
        
        if (task.status === 'TODO') {
            nextStatus = 'DOING'
            nextStatusText = '进行中'
        } else if (task.status === 'DOING') {
            nextStatus = 'DONE'
            nextStatusText = '已完成'
        } else {
            return
        }

        if (!window.confirm(`确定要将任务 "${task.title}" 推进到 "${nextStatusText}" 状态吗？`)) {
            return
        }

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
        return t ? t.colorCode : '#9ca3af'
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

            <div className="grid grid-cols-3 gap-6 h-[calc(100%-4rem)]">
                {COLUMNS.map(col => (
                    <div key={col.id} className={clsx("flex flex-col rounded-xl border p-4 max-h-full", col.color)}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">{col.title}</h3>
                            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border">
                                {tasks.filter(t => t.status === col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {tasks.filter(t => t.status === col.id).map(task => {
                                // [修改] 在这里计算是否逾期
                                const overdue = isOverdue(task)
                                
                                return (
                                    <div 
                                        key={task.id} 
                                        // [修改] 动态 className：如果逾期则使用红色背景和边框
                                        className={clsx(
                                            "p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer group flex flex-col gap-2",
                                            overdue 
                                                ? "bg-red-50 border-red-200" // 逾期样式
                                                : "bg-white border-gray-100" // 正常样式
                                        )}
                                        onClick={() => moveTask(task)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: getTypeColor(task.typeId)}}
                                            ></span>
                                            <span className="text-xs text-gray-500">{getTypeName(task.typeId)}</span>
                                            <span className="ml-auto text-xs text-gray-400 font-mono">
                                                #{task.priority}
                                            </span>
                                        </div>

                                        <div>
                                            {/* 如果逾期，标题也可以稍微标红，或者加个标记 */}
                                            <h4 className={clsx(
                                                "font-medium leading-tight mb-1",
                                                overdue ? "text-red-700" : "text-gray-900"
                                            )}>
                                                {task.title}
                                                {overdue && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">已逾期</span>}
                                            </h4>
                                            <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50/50 p-2 rounded text-xs">
                                                {task.description || '暂无描述'}
                                            </p>
                                        </div>
                                        
                                        <div className="border-t border-gray-100/50 pt-2 mt-1 space-y-1 text-xs text-gray-500">
                                            <div className="flex justify-between">
                                                <span>创建:</span>
                                                <span>{formatDate(task.createdAt)}</span>
                                            </div>
                                            {task.dueDate ? (
                                                <div className={clsx(
                                                    "flex justify-between",
                                                    // 截止时间文字颜色也做相应强调
                                                    overdue ? "text-red-600 font-bold" : "text-gray-500"
                                                )}>
                                                    <span>截止:</span>
                                                    <span>{formatDate(task.dueDate)}</span>
                                                </div>
                                            ) : null}
                                            <div className="flex justify-between text-blue-400">
                                                <span>{task.status === 'DONE' ? '总耗时:' : '已耗时:'}</span>
                                                {getDuration(task.createdAt, task.completedAt, task.status)}
                                            </div>
                                        </div>

                                        <div className="mt-1 pt-1 flex justify-end">
                                            {task.status !== 'DONE' && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveTask(task);
                                                    }}
                                                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition"
                                                >
                                                    推进 &gt;
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
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
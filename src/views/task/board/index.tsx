import { useEffect, useState } from "react"
import { getTasks, UpdateTask, getTaskTypes } from "@/api/task"
import type { Task, TaskType, User } from "@/types"
import CreateTaskModal from "./CreateTaskModal"
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'
import TaskDetailModal from "./TaskDetailModal"
import TaskCard from "./TaskCard"
import { Button } from "@/components/Common/Button"
import { getUsers } from "@/api/auth";


const COLUMNS = [
    { id: 'TODO', title: '待办事项', color: 'bg-gray-100 border-gray-200' },
    { id: 'DOING', title: '进行中', color: 'bg-blue-50 border-blue-200' },
    { id: 'DONE', title: '已完成', color: 'bg-green-50 border-green-200' }
]

export default function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [types, setTypes] = useState<TaskType[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const user = useAuthStore(state => state.user)

    const fetchData = async () => {
        try {
            const [taskRes, typeRes, usersRes] = await Promise.all([getTasks(), getTaskTypes(), getUsers()])
            const allTasks = taskRes.list || []
            const allUsers = usersRes.list || []
            if (user?.role === 'admin') {
                setTasks(allTasks)
            } else {
                setTasks(allTasks.filter(task => 
                    task.creatorId === user?.id || task.assigneeId === user?.id
                ))
            }

            // TODO: 普通用户肯定不能获取所有的users
            setUsers(usersRes.list || []) // [新增]
            setTypes(typeRes.list || [])
        } catch (error) {
            console.error("加载数据失败", error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const moveTask = async (task: Task) => {
        const nextMap: Record<string, {s: string, t: string}> = {
            'TODO': { s: 'DOING', t: '进行中'},
            'DOING': { s: 'DONE', t: '已完成'},
        }
        const next = nextMap[task.status]
        if (!next) return

        if (!confirm(`确定要将任务 "${task.title}" 推进到 "${next.t}" 状态吗？`)) {
            return
        }

        try {
            await UpdateTask(task.id, {...task, status: next.s})
            setTasks(prev => prev.map(t => t.id === task.id ? {...t, status: next.s as any} : t))
        } catch(e) {
            alert("更新失败");
        }
    }
    
    return (
        <div className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">任务看板</h2>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    +新建任务
                </Button>
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
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <TaskCard 
                                    key={task.id}
                                    task={task}
                                    users={users}
                                    types={types}
                                    onClick={setSelectedTask}
                                    onMove={moveTask}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <TaskDetailModal 
                isOpen={!!selectedTask}
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={fetchData}
            />
            <CreateTaskModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    )
}
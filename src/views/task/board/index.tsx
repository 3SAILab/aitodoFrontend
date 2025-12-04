import { useEffect, useState, useMemo } from "react"
import { getTasks, UpdateTask, getTaskTypes, deleteTask, getSalesPersons } from "@/api/task"
import type { Task, TaskType, User, SalesPerson } from "@/types"
import CreateTaskModal from "./CreateTaskModal"
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'
import TaskDetailModal from "./TaskDetailModal"
import TaskCard from "./TaskCard"
import { Button } from "@/components/Common/Button"
import { getUsers } from "@/api/auth";
import { isSameDay, isBeforeOrSameDay } from "@/utils/date";
import { Calendar, Layers, Filter } from "lucide-react";
import ConfirmModal from "@/components/Common/ConfirmModal"
import { useConfirm } from "@/hooks/useConfirm"
import { toast } from 'react-toastify';


const COLUMNS = [
    { id: 'TODO', title: '待办事项', color: 'bg-gray-100 border-gray-200' },
    { id: 'DOING', title: '进行中', color: 'bg-blue-50 border-blue-200' },
    { id: 'DONE', title: '已完成', color: 'bg-green-50 border-green-200' }
]

type FilterMode = 'focus' | 'all';

export default function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [types, setTypes] = useState<TaskType[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([])

    // --- 新增过滤状态 ---
    const [filterMode, setFilterMode] = useState<FilterMode>('focus'); // 默认 'focus'
    // 默认选中今天 (使用本地时间 YYYY-MM-DD)
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;

    });

    const [adminFilterUserId, setAdminFilterUserId] = useState<string>('ALL');

    const user = useAuthStore(state => state.user)

    const fetchData = async () => {
        try {
            const [taskRes, typeRes, usersRes, salesRes] = await Promise.all([
                getTasks(), getTaskTypes(), getUsers(), getSalesPersons()
            ])
            const allTasks = (taskRes.list || []).map(task => ({
                ...task,
                completedAt: task.complete_at,
            }))

            if (user?.role === 'admin') {
                setTasks(allTasks)
            } else {
                setTasks(allTasks.filter(task => 
                    task.creatorId === user?.id || task.assigneeId === user?.id
                ))
                
            }
            setUsers(usersRes.list || [])
            setTypes(typeRes.list || [])
            setSalesPersons(salesRes.list || [])
        } catch (error) {
            console.error("加载数据失败", error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const moveConfirm = useConfirm<Task>({
        title: "推进任务",
        content: "确定要将任务推进到下一个阶段吗？",
        onConfirm: async (task) => {
            const nextMap: Record<string, {s: string, t:string}> = {
                'TODO': { s: 'DOING', t: '进行中'},
                'DOING': { s: 'DONE', t: '已完成' }
            }
            const next = nextMap[task.status]
            if (!next) return
            try {
                await UpdateTask(task.id, {...task, status: next.s})
                setTasks(prev => prev.map(t =>
                    t.id === task.id ? {...t, status: next.s as any,
                        completedAt: next.s === 'DONE' ? Math.floor(Date.now() / 1000) : t.completedAt} : t
                ))
                toast.success(`任务已推进至${next.t}`)
            } catch (e) {
                toast.error('任务推进失败');
            }
            
        }
    })

    const deleteConfirm = useConfirm<string>({
        title: "删除任务",
        content: "确定要删除该任务吗？此操作无法撤销。",
        variant: 'danger',
        onConfirm: async (id) => {
            try {
                await deleteTask(id)
                setTasks(prev => prev.filter(t => t.id !== id))
                toast.success('任务已删除');
            } catch (e) {
                toast.error('删除任务失败');
            }
        }
    })

    // --- 核心过滤逻辑 ---
    const filteredTasks = useMemo(() => {

        let baseTasks = tasks;
        if (user?.role === 'admin' && adminFilterUserId !== 'ALL') {
            baseTasks = tasks.filter(t => t.creatorId === adminFilterUserId || t.assigneeId === adminFilterUserId);
        }
        if (filterMode === 'all') return baseTasks;

        return baseTasks.filter(task => { // 使用 baseTasks 代替 tasks
            // 1. 进行中 (DOING): 永远显示
            if (task.status === 'DOING') return true;

            // 2. 已完成 (DONE): 仅显示 [完成时间] 为 [选中日期] 的任务
            if (task.status === 'DONE') {
                if (!task.completedAt) return false;
                return isSameDay(task.completedAt, selectedDate);
            }

            // 3. 待办 (TODO): 显示 [截止日期 <= 选中日期] (包含逾期和当天的) 或 [无截止日期]
            if (task.status === 'TODO') {
                if (!task.dueDate) return true; 
                return isBeforeOrSameDay(task.dueDate, selectedDate);
            }

            return true;
        });
    }, [tasks, filterMode, selectedDate, adminFilterUserId, user]);

    // 计算今日完成数，给用户正反馈
    const doneTodayCount = useMemo(() => {
        let baseTasks = tasks;
        if (user?.role === 'admin' && adminFilterUserId !== 'ALL') {
            baseTasks = tasks.filter(t => t.creatorId === adminFilterUserId || t.assigneeId === adminFilterUserId);
        }
        return baseTasks.filter(t => t.status === 'DONE' && t.completedAt && isSameDay(t.completedAt, selectedDate)).length;
    }, [tasks, selectedDate, adminFilterUserId, user]);
    
    return (
        <div className="h-full flex flex-col">
            {/* 顶部工具栏 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        任务看板
                    </h2>
                    
                    {/* 分割线 */}
                    <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                    {/* 过滤器控件 */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setFilterMode('focus')}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                                filterMode === 'focus' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Calendar size={16} />
                            每日聚焦
                        </button>
                        <button
                            onClick={() => setFilterMode('all')}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                                filterMode === 'all' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Layers size={16} />
                            所有历史
                        </button>
                    </div>         
                    {/* [!code ++] 管理员用户筛选下拉框 */}
                    {user?.role === 'admin' && (
                        <div className="flex items-center gap-2 ml-2">
                            <span className="text-sm text-gray-400 hidden lg:inline"><Filter size={14}/></span>
                            <select
                                value={adminFilterUserId}
                                onChange={(e) => setAdminFilterUserId(e.target.value)}
                                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                            >
                                <option value="ALL">全部用户</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                        </div>
                    )}       
                </div>

                <div className="flex items-center gap-4">
                     {/* 统计小标签 */}
                    {filterMode === 'focus' && (
                        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                           <span className="text-green-600">✨ 今日完成: {doneTodayCount}</span>
                        </div>
                    )}
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        + 新建任务
                    </Button>
                </div>
            </div>

            {/* 看板区域 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                {COLUMNS.map(col => {
                    // 过滤出当前列的任务
                    const colTasks = filteredTasks.filter(t => t.status === col.id);
                    
                    return (
                        <div key={col.id} className={clsx("flex flex-col rounded-xl border p-4 h-full bg-gray-50/50", col.color)}>
                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-inherit z-10 pb-2 border-b border-gray-200/50">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    {col.title}
                                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border border-gray-200 shadow-sm">
                                        {colTasks.length}
                                    </span>
                                </h3>
                                {/* 如果是完成列，且在聚焦模式，给个提示 */}
                                {col.id === 'DONE' && filterMode === 'focus' && (
                                    <span className="text-[10px] text-gray-400">仅显示 {selectedDate.split('-').slice(1).join('-')}</span>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                                {colTasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-lg">
                                        {col.id === 'TODO' ? '暂无待办' : 
                                         col.id === 'DONE' ? '今日暂无完成' : '暂无进行中'}
                                    </div>
                                )}
                                {colTasks.map(task => (
                                    <TaskCard 
                                        key={task.id}
                                        task={task}
                                        users={users}
                                        types={types}
                                        onClick={setSelectedTask}
                                        onMove={() => moveConfirm.confirm(task)}
                                        onDelete={() => deleteConfirm.confirm(task.id)}
                                        salesPersons={salesPersons}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
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

            <ConfirmModal
                {...moveConfirm.modalProps}
            />

            <ConfirmModal
                {...deleteConfirm.modalProps}
            />
        </div>
    )
}
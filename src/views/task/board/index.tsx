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
import { Calendar, Layers } from "lucide-react";
import ConfirmModal from "@/components/Common/ConfirmModal"

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
    const [movingTask, setMovingTask] = useState<Task | null>(null)
    const [isMoveLoading, setIsMoveLoading] = useState(false)

    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

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

    const handleMoveClick = (task: Task) => {
        setMovingTask(task)
    }
    
    const handleDeleteClick = (id: string) => {
        setDeletingTaskId(id);
    }

    // [!code focus] 确认删除逻辑
    const handleConfirmDelete = async () => {
        if (!deletingTaskId) return;
        setIsDeleteLoading(true);
        try {
            await deleteTask(deletingTaskId);
            // 乐观更新，直接从本地移除，减少加载闪烁
            setTasks(prev => prev.filter(t => t.id !== deletingTaskId));
            setDeletingTaskId(null); // 关闭弹窗
        } catch(e) {
            alert("删除失败");
            fetchData(); // 失败回滚
        } finally {
            setIsDeleteLoading(false);
        }
    }

    const handleConfirmMove = async () => {
        if (!movingTask) return
        
        const nextMap: Record<string, {s: string, t: string}> = {
            'TODO': { s: 'DOING', t: '进行中'},
            'DOING': { s: 'DONE', t: '已完成'},
        }
        const next = nextMap[movingTask.status]
        if (!next) return

        setIsMoveLoading(true)
        try {
            await UpdateTask(movingTask.id, {...movingTask, status: next.s})
            setTasks(prev => prev.map(t => t.id === movingTask.id ? {...t, status: next.s as any, completedAt: next.s === 'DONE' ? Math.floor(Date.now() / 1000) : t.completedAt } : t))
            setMovingTask(null) // 关闭弹窗
        } catch(e) {
            alert("更新失败");
            fetchData();
        } finally {
            setIsMoveLoading(false)
        }
    }

    const moveTask = async (task: Task) => {
        const nextMap: Record<string, {s: string, t: string}> = {
            'TODO': { s: 'DOING', t: '进行中'},
            'DOING': { s: 'DONE', t: '已完成'},
        }
        const next = nextMap[task.status]
        if (!next) return

        try {
            await UpdateTask(task.id, {...task, status: next.s})
            // 乐观更新，提升体验
            setTasks(prev => prev.map(t => t.id === task.id ? {...t, status: next.s as any, completedAt: next.s === 'DONE' ? Math.floor(Date.now() / 1000) : t.completedAt } : t))
        } catch(e) {
            alert("更新失败");
            fetchData(); // 失败回滚
        }
    }

    const handleDeleteTask = async (id: string) => {
        if (!confirm('确定要删除该任务吗？此操作无法撤销。')) return;
        try {
            await deleteTask(id);
            // 乐观更新，直接从本地移除，减少加载闪烁
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch(e) {
            alert("删除失败");
            fetchData(); // 失败回滚
        }
    }

    // --- 核心过滤逻辑 ---
    const filteredTasks = useMemo(() => {
        if (filterMode === 'all') return tasks;

        return tasks.filter(task => {
            // 1. 进行中 (DOING): 永远显示，因为这是当前正在做的事，不受日期限制
            if (task.status === 'DOING') return true;

            // 2. 已完成 (DONE): 仅显示 [完成时间] 为 [选中日期] 的任务
            //    这解决了列表堆积的问题
            if (task.status === 'DONE') {

                if (!task.completedAt) return false;
                return isSameDay(task.completedAt, selectedDate);
            }

            // 3. 待办 (TODO): 显示 [截止日期 <= 选中日期] (包含逾期和当天的) 或 [无截止日期] (Backlog)
            if (task.status === 'TODO') {
                // 如果没有截止日期，视为 Backlog，在聚焦视图中显示 (或者你可以选择隐藏)
                if (!task.dueDate) return true; 
                // 如果有截止日期，显示今天及之前的（逾期任务不能丢）
                return isBeforeOrSameDay(task.dueDate, selectedDate);
            }

            return true;
        });
    }, [tasks, filterMode, selectedDate]);

    // 计算今日完成数，给用户正反馈
    const doneTodayCount = useMemo(() => {
        return tasks.filter(t => t.status === 'DONE' && t.completedAt && isSameDay(t.completedAt, selectedDate)).length;
    }, [tasks, selectedDate]);
    
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
                                        onMove={handleMoveClick}
                                        onDelete={handleDeleteClick}
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
                isOpen={!!movingTask}
                onClose={() => setMovingTask(null)}
                onConfirm={handleConfirmMove}
                title="推进任务"
                content={`确定要将任务推进到下一个阶段吗？`}
                isLoading={isMoveLoading}
                variant="primary"
            />

            <ConfirmModal
                isOpen={!!deletingTaskId}
                onClose={() => setDeletingTaskId(null)}
                onConfirm={handleConfirmDelete}
                title="删除任务"
                content="确定要删除该任务吗？此操作无法撤销。"
                isLoading={isDeleteLoading}
                variant="danger"
            />
        </div>
    )
}
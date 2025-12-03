import type { Task, TaskType, User } from "@/types";
import { formatDate, formatDuration } from "@/utils/date"; // [!code focus] 移除了 isTaskOverdue
import clsx from "clsx";
import { Button } from "@/components/Common/Button";
import { useAuthStore } from "@/store/authStore";

interface TaskCardProps {
    task: Task
    types: TaskType[]
    users?: User[]
    onClick: (task: Task) => void
    onMove: (task: Task) => void
}

export default function TaskCard({ task, types, users = [], onClick, onMove }: TaskCardProps) {
    // [!code focus] 删除了 const overdue = ... 
    const currentUser = useAuthStore(state => state.user)
    const typeInfo = types.find(t => t.id === task.typeId)
    
    const durationText = formatDuration(task.createdAt, task.completedAt, task.status)

    const assignee = users.find(u => u.id === task.creatorId)
    const isCreator = currentUser?.id === task.creatorId

    return (
        <div className={clsx(
            "p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-2",
            // [!code focus] 移除了 overdue 的判断，固定使用默认样式
            "bg-white border-gray-100" 
        )}
            onClick={() => onClick(task)}    
        >
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: typeInfo?.colorCode || '#9ca3af'  }}></span>
                <span className="text-xs text-gray-500">{typeInfo?.name || '未知'}</span>
                <span className="ml-auto text-xs text-gray-400 font-mono">#{task.priority}</span>
            </div>

            <div>
                {/* [!code focus] 移除了标题旁边的逾期标签和颜色判断 */}
                <h4 className="font-medium leading-tight mb-1 text-gray-900">
                    {task.title}
                </h4>
                {assignee && (
                    <div className="flex justify-between text-xs text-blue-600 ">
                        <span className="opacity-70">负责人:</span>
                        <span className="font-medium">{assignee.username}</span>
                    </div>
                )}
                <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50/50 p-2 rounded ">
                    {task.description || '暂无描述'}
                </p>
            </div>
            <div className="border-t border-gray-100/50 pt-2 mt-1 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                    <span>创建:</span><span>{formatDate(task.createdAt)}</span>
                </div>
                
                {/* [!code focus] 删除了 task.dueDate 的显示代码块 */}

                <div className="flex justify-between text-blue-400">
                    <span>{task.status === 'DONE' ? '总耗时:' : '已耗时:'}</span>
                    <span className={durationText === '未开始' ? 'text-gray-400' : ''}>{durationText}</span>
                </div>
            </div>
            <div className="mt-1 pt-1 flex justify-end">
                {task.status !== 'DONE' && isCreator && (
                    <Button
                        variant="ghost"
                        className="px-2 py-1 text-xs h-auto"
                        onClick={(e) => { e.stopPropagation(); onMove(task);}}
                    >
                        推进 &gt;
                    </Button>
                )}
            </div>
        </div>
    )
}
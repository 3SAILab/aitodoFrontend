import type { Task, TaskType, User, SalesPerson } from "@/types";
import { formatDate, formatDuration } from "@/utils/date"; 
import clsx from "clsx";
import { Button } from "@/components/Common/Button";
import { useAuthStore } from "@/store/authStore";
// [!code focus] 引入 Trash2 图标
import { Trash2, MessageSquare } from "lucide-react";

interface TaskCardProps {
    task: Task
    types: TaskType[]
    users?: User[]
    onClick: (task: Task) => void
    onMove: (task: Task) => void
    // [!code focus] 新增 onDelete 回调定义
    onDelete: (id: string) => void
    salesPersons?: SalesPerson[],
    isJustMoved?: boolean
}

export default function TaskCard({ task, types, users = [], salesPersons = [], onClick, onMove, onDelete, isJustMoved }: TaskCardProps) {
    const currentUser = useAuthStore(state => state.user)
    const typeInfo = types.find(t => t.id === task.typeId)
    
    const durationText = formatDuration(task.createdAt, task.completedAt, task.status)
    const salesPerson = salesPersons.find(s => s.id === task.salesPersonId)
    const assignee = users.find(u => u.id === task.creatorId)
    const isCreator = currentUser?.id === task.creatorId

    const priorityStyles = {
        0: "border-gray-200 bg-white hover:border-blue-300",         // 普通
        1: "border-orange-200 bg-orange-50/20 hover:border-orange-300", // 重要
        2: "border-red-200 bg-red-50/20 hover:border-red-300"           // 紧急
    }[task.priority] || "border-gray-200 bg-white";

    const priorityTextClass = {
        0: "text-gray-400",
        1: "text-orange-500 font-medium",
        2: "text-red-500 font-bold"
    }[task.priority] || "text-gray-400";

    return (
        <div className={clsx(
            "p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-2",
            "bg-white border-gray-100", priorityStyles,
            isJustMoved && "animate-highlight ring-2 ring-yellow-200 z-20"
        )}
            onClick={() => onClick(task)}    
        >
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: typeInfo?.colorCode || '#9ca3af'  }}></span>
                <span className="text-xs text-gray-500">{typeInfo?.name || '未知'}</span>
                {!!task.progressCount && task.progressCount > 0 && (
                     <span className="flex items-center gap-1 text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md font-medium ml-1">
                        <MessageSquare size={10} />
                        {task.progressCount}
                     </span>
                )}
                <span className={clsx("ml-auto text-xs font-mono", priorityTextClass)}>
                    {task.priority === 2 ? '!!! 紧急' : task.priority === 1 ? '! 重要' : '# 普通'}
                </span>
            </div>

            <div>
                <h4 className="font-medium leading-tight mb-1 text-gray-900">
                    {task.title}
                </h4>
                {assignee && (
                    <div className="flex justify-between text-xs text-blue-600 ">
                        <span className="opacity-70">负责人:</span>
                        <span className="font-medium">{assignee.username}</span>
                    </div>
                )}
                {salesPerson && (
                    <div className="flex justify-between text-xs text-purple-600 mt-0.5">
                        <span className="opacity-70">销售:</span>
                        <span className="font-medium">{salesPerson.name}</span>
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
                {task.status === 'DONE' && (
                    <div className="flex justify-between text-green-600">
                        <span>完成:</span><span>{formatDate(task.completedAt)}</span>
                    </div>
                )}
                <div className="flex justify-between text-blue-400">
                    <span>{task.status === 'DONE' ? '总耗时:' : '已耗时:'}</span>
                    <span className={durationText === '未开始' ? 'text-gray-400' : ''}>{durationText}</span>
                </div>
            </div>
            {/* [!code focus] 修改底部布局为 flex justify-between 以便分别放置删除和推进按钮 */}
            <div className="mt-1 pt-1 flex justify-between items-center">
                {/* [!code focus] 只有创建者显示删除按钮 */}
                {isCreator ? (
                    <button 
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        title="删除任务"
                    >
                        <Trash2 size={14} />
                    </button>
                ) : (
                    <div></div> // 占位，保持布局
                )}

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
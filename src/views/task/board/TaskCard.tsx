import type { Task, TaskType, User, SalesPerson } from "@/types";
import { formatDate, formatDuration } from "@/utils/date"; 
import clsx from "clsx";
import { Button } from "@/components/Common/Button";
import { useAuthStore } from "@/store/authStore";
// [!code focus] 引入 Trash2 图标
import { Trash2 } from "lucide-react";

interface TaskCardProps {
    task: Task
    types: TaskType[]
    users?: User[]
    onClick: (task: Task) => void
    onMove: (task: Task) => void
    // [!code focus] 新增 onDelete 回调定义
    onDelete: (id: string) => void
    salesPersons?: SalesPerson[]
}

export default function TaskCard({ task, types, users = [], salesPersons = [], onClick, onMove, onDelete }: TaskCardProps) {
    const currentUser = useAuthStore(state => state.user)
    const typeInfo = types.find(t => t.id === task.typeId)
    
    const durationText = formatDuration(task.createdAt, task.completedAt, task.status)
    const salesPerson = salesPersons.find(s => s.id === task.salesPersonId)
    const assignee = users.find(u => u.id === task.creatorId)
    const isCreator = currentUser?.id === task.creatorId

    return (
        <div className={clsx(
            "p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-2",
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
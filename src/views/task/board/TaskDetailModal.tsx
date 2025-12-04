import React, { useState, useEffect } from "react";
import { getTaskProgress, createTaskProgress, UpdateTask } from "@/api/task";
import type { Task, TaskProgress } from "@/types";
import { Send, Clock, Edit2, Save, CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/date";
import Modal from "@/components/Common/Modal";
import { Button } from "@/components/Common/Button";
import { FormTextArea } from "@/components/Common/FormTextarea";
import clsx from "clsx";
import { toast } from 'react-toastify'; 

interface Props {
    task: Task | null
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
}

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate }: Props) {
    const [logs, setLogs] = useState<TaskProgress[]>([])
    const [newLogContent, setNewLogContent] = useState('')
    const [loadingLog, setLoadingLog] = useState(false)
    
    // 编辑相关状态
    const [isEditing, setIsEditing] = useState(false)
    const [editDescription, setEditDescription] = useState('') // 只编辑描述
    const [displayDescription, setDisplayDescription] = useState('') // 用于展示的描述(解决保存延迟闪烁问题)
    const [savingTask, setSavingTask] = useState(false)

    const currentUser = useAuthStore(state => state.user)

    useEffect(() => {
        if (task && isOpen) {
            // 获取进度
            getTaskProgress(task.id).then(res => setLogs(res.list || []))
            // 初始化描述
            const desc = task.description || ''
            setEditDescription(desc)
            setDisplayDescription(desc)
            setIsEditing(false)
        }
    }, [task, isOpen])

    // 提交新进度
    const handleSubmitLog = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!task || !newLogContent.trim()) return

        setLoadingLog(true)
        try {
            await createTaskProgress(task.id, newLogContent)
            setNewLogContent('')
            const res = await getTaskProgress(task.id)
            setLogs(res.list || [])
            toast.success('进度记录已添加')
        } catch (error) {
            toast.error('记录添加失败')
        } finally {
            setLoadingLog(false)
        }
    }

    const handleSaveTask = async () => {
        if(!task) return;
        setSavingTask(true);
        try {
            await UpdateTask(task.id, {
                ...task,
                title: task.title, // 保持原标题，或者如果后端允许不传可以去掉
                description: editDescription,
                typeId: task.typeId,
                status: task.status,
                assigneeId: task.assigneeId,
                salesPersonId: task.salesPersonId,
                dueDate: 0,
                priority: task.priority
            });
            
            // 关键：保存成功后立即更新本地展示状态，不需要等待父组件刷新
            setDisplayDescription(editDescription);
            setIsEditing(false);
            
            onUpdate(); // 后台静默刷新父组件列表
            toast.success('任务描述已更新')
        } catch(e) {
            toast.error('保存失败');
        } finally {
            setSavingTask(false);
        }
    }

    if (!isOpen || !task) return null

    const isCreator = currentUser?.id === task.creatorId
    const isDone = task.status === 'DONE'

    // 优先级配置
    const priorityConfig = {
        0: { label: '普通', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        1: { label: '重要', color: 'bg-orange-50 text-orange-600 border-orange-100' },
        2: { label: '紧急', color: 'bg-red-50 text-red-600 border-red-100' },
    }[task.priority] || { label: '未知', color: 'bg-gray-100' };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="任务详情" 
            className="max-w-5xl h-[85vh] flex flex-col overflow-hidden" 
        >
            <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gray-50/30">
                
                {/* 左侧：任务主要信息区域 */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden bg-white mx-1">
                    {/* 顶部状态栏 */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            {/* 状态标签 */}
                            <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1", 
                                task.status === 'DONE' ? "bg-green-100 text-green-700" :
                                task.status === 'DOING' ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-600"
                            )}>
                                {task.status === 'DONE' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                                {task.status === 'TODO' ? '待办' : task.status === 'DOING' ? '进行中' : '已完成'}
                            </span>
                            
                            {/* 优先级标签 */}
                            <span className={clsx("px-3 py-1 rounded-full text-xs font-medium border", priorityConfig.color)}>
                                {priorityConfig.label}
                            </span>

                            {/* 时间 */}
                            <span className="text-xs text-gray-400 flex items-center gap-1 ml-2">
                                <Calendar size={12}/> {formatDate(task.createdAt).split(' ')[0]}
                            </span>
                        </div>

                        {/* 编辑按钮区 */}
                        {isCreator && !isDone && (
                            <div className="shrink-0">
                                {isEditing ? (
                                    <div className="flex gap-2 animate-in fade-in duration-200">
                                        <Button variant="ghost" onClick={() => {
                                            setIsEditing(false);
                                            setEditDescription(displayDescription); // 取消时还原
                                        }} disabled={savingTask} className="h-8 px-3 text-gray-500">
                                            取消
                                        </Button>
                                        <Button onClick={handleSaveTask} isLoading={savingTask} className="h-8 px-3">
                                            <Save size={14} /> 保存
                                        </Button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        <Edit2 size={14} /> 编辑描述
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 描述区域 */}
                    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col ">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            详细描述
                        </h4>
                        
                        {isEditing ? (
                            <div className="flex-1 flex flex-col p-1">
                                <FormTextArea 
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    placeholder="输入任务详细描述..."
                                    className="flex-1 resize-none text-sm leading-relaxed border-blue-200 bg-blue-50/30 focus:bg-white transition-colors"
                                />
                            </div>
                        ) : (
                            <div className="flex-1 p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto hover:bg-gray-50 transition-colors">
                                {displayDescription || <span className="text-gray-400 italic">此任务暂无详细描述...</span>}
                            </div>
                        )}
                    </div>

                </div>

                {/* 右侧：进度记录区域 */}
                <div className="w-full md:w-[24rem] flex flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50">
                    <div className="p-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <Clock size={16} className="text-blue-600"/> 
                            进度记录 <span className="text-gray-400 font-normal text-xs ml-auto">{logs.length} 条</span>
                        </h4>
                    </div>

                    {/* 滚动列表 */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {logs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Clock size={20} className="opacity-50"/>
                                </div>
                                <p>暂无进度，记录一下吧</p>
                            </div>
                        )}
                        
                        {logs.map((log) => (
                            <div key={log.id} className="relative pl-4 border-l-2 border-gray-200 last:border-transparent pb-1 group">
                                {/* 时间轴小圆点 */}
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-blue-400 group-hover:border-blue-600 transition-colors"></div>
                                
                                <div className="flex flex-col gap-1.5">
                                    <div className="text-xs text-gray-400 font-mono pl-1">
                                        {formatDate(log.createdAt)}
                                    </div>
                                    <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm text-sm text-gray-700 break-all leading-relaxed group-hover:shadow-md group-hover:border-blue-100 transition-all">
                                        {log.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 底部输入框 */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        {isCreator && !isDone ? (
                            <form onSubmit={handleSubmitLog} className="flex flex-col gap-3">
                                <FormTextArea
                                    className="min-h-[80px] text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-blue-200 resize-none"
                                    placeholder="记录今日进展、遇到的问题..."
                                    value={newLogContent}
                                    onChange={e => setNewLogContent(e.target.value)}
                                />
                                <Button 
                                    type="submit" 
                                    className="w-full py-2 shadow-none" 
                                    disabled={!newLogContent.trim()}
                                    isLoading={loadingLog}
                                    icon={<Send size={14} />}
                                >
                                    发送记录
                                </Button>
                            </form>
                        ) : (
                            <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                                {isDone ? 
                                    <span className="flex items-center justify-center gap-1 text-green-600 font-medium">
                                        <CheckCircle2 size={14}/> 任务已归档，无法添加进度
                                    </span> : 
                                    "仅任务创建者可记录进度"
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
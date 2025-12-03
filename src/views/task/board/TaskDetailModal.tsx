import React, { useState, useEffect } from "react";
import { getTaskProgress, createTaskProgress, UpdateTask } from "@/api/task";
import type { Task, TaskProgress } from "@/types";
import { Send, Clock, Edit2, Save, XCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/date";
import Modal from "@/components/Common/Modal";
import { Button } from "@/components/Common/Button";
import { FormTextArea } from "@/components/Common/FormTextarea";
import { FormInput } from "@/components/Common/FormInput";
import clsx from "clsx";

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
    const [editForm, setEditForm] = useState({ title: '', description: '' })
    const [savingTask, setSavingTask] = useState(false)

    const currentUser = useAuthStore(state => state.user)

    useEffect(() => {
        if (task && isOpen) {
            // 获取进度
            getTaskProgress(task.id).then(res => setLogs(res.list || []))
            // 初始化编辑表单
            setEditForm({ title: task.title, description: task.description || '' })
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
        } catch (error) {
            alert("记录失败")
        } finally {
            setLoadingLog(false)
        }
    }

    // 保存任务修改（标题/描述）
    const handleSaveTask = async () => {
        if(!task) return;
        setSavingTask(true);
        try {
            await UpdateTask(task.id, {
                ...task,
                title: editForm.title,
                description: editForm.description,
                // 下面这些字段必须带上，否则可能会被后端清空或报错，视具体后端实现而定
                typeId: task.typeId,
                status: task.status,
                assigneeId: task.assigneeId,
                salesPersonId: task.salesPersonId,
                dueDate: task.dueDate,
                priority: task.priority
            });
            setIsEditing(false);
            onUpdate(); // 刷新父组件列表
        } catch(e) {
            alert('保存失败');
        } finally {
            setSavingTask(false);
        }
    }

    if (!isOpen || !task) return null

    const isCreator = currentUser?.id === task.creatorId
    const isDone = task.status === 'DONE'

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="任务详情" 
            className="max-w-4xl h-[85vh] flex flex-col" // 自定义宽高度
        >
            <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
                
                {/* 左侧：任务主要信息区域 */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                    {/* 头部：标题与编辑按钮 */}
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            {isEditing ? (
                                <div className="flex-1 space-y-2">
                                    <FormInput 
                                        label="任务标题"
                                        value={editForm.title}
                                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{task.title}</h2>
                                    <div className="flex gap-2 mt-2">
                                        <span className={clsx("px-2 py-0.5 rounded text-xs font-medium border", 
                                            task.status === 'DONE' ? "bg-green-50 text-green-700 border-green-200" :
                                            task.status === 'DOING' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            "bg-gray-100 text-gray-600 border-gray-200"
                                        )}>
                                            {task.status === 'TODO' ? '待办' : task.status === 'DOING' ? '进行中' : '已完成'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                            优先级: {['普通','重要','紧急'][task.priority] || task.priority}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* 操作按钮区 */}
                            {isCreator && !isDone && (
                                <div className="shrink-0 pt-1">
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={savingTask} className="px-2">
                                                <XCircle size={18} />
                                            </Button>
                                            <Button size="sm" onClick={handleSaveTask} isLoading={savingTask} className="px-2">
                                                <Save size={18} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" onClick={() => setIsEditing(true)} title="编辑任务" className="px-2">
                                            <Edit2 size={16} /> 编辑
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100"/>

                    {/* 描述区域 */}
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">详细描述</h4>
                        {isEditing ? (
                            <FormTextArea 
                                rows={10}
                                value={editForm.description}
                                onChange={e => setEditForm({...editForm, description: e.target.value})}
                                placeholder="输入任务详细描述..."
                                className="h-64"
                            />
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap text-sm min-h-[10rem] border border-gray-100">
                                {task.description || <span className="text-gray-400 italic">暂无描述</span>}
                            </div>
                        )}
                    </div>
                    
                    {/* 元数据展示 */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-auto">
                         <div>创建时间: {formatDate(task.createdAt)}</div>
                         <div>截止时间: {task.dueDate ? formatDate(task.dueDate) : '无'}</div>
                    </div>
                </div>

                {/* 右侧：进度记录区域 */}
                <div className="w-full md:w-[22rem] flex flex-col border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-blue-500"/> 
                        进度记录 ({logs.length})
                    </h4>

                    {/* 滚动列表 */}
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 relative">
                        {logs.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                暂无记录，快去推进任务吧
                            </div>
                        )}
                        
                        {logs.map((log, index) => (
                            <div key={log.id} className="relative pl-6 border-l-2 border-gray-200 last:border-transparent pb-2">
                                {/* 时间轴小圆点 */}
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-white"></div>
                                
                                <div className="flex flex-col gap-1">
                                    <div className="text-xs text-gray-400 font-mono">
                                        {formatDate(log.createdAt)}
                                    </div>
                                    <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm text-sm text-gray-800 break-all hover:border-blue-200 transition-colors">
                                        {log.content}
                                    </div>
                                    <div className="text-xs text-gray-400 text-right">
                                        by {log.createdBy || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 添加进度表单 */}
                    {isCreator && !isDone ? (
                        <form onSubmit={handleSubmitLog} className="mt-auto pt-4 border-t border-gray-100 bg-white">
                            <FormTextArea
                                className="min-h-[5rem] text-sm mb-2"
                                placeholder="记录今日进展、遇到的问题..."
                                value={newLogContent}
                                onChange={e => setNewLogContent(e.target.value)}
                            />
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={!newLogContent.trim()}
                                isLoading={loadingLog}
                                icon={<Send size={14} />}
                            >
                                发送记录
                            </Button>
                        </form>
                    ) : (
                        <div className="mt-auto p-3 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-gray-100">
                            {isDone ? 
                                <span className="flex items-center justify-center gap-1 text-green-600"><CheckCircle2 size={14}/> 任务已归档</span> : 
                                "仅创建者可记录进度"
                            }
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}
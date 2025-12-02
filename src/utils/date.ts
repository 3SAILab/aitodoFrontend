// src/utils/date.ts

// 格式化时间戳 (秒 -> YYYY-MM-DD HH:mm)
export const formatDate = (timestamp?: number) => {
    if (!timestamp) return '无'
    const date = new Date(timestamp * 1000)
    const year = date.getUTCFullYear()
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = date.getUTCDate().toString().padStart(2, '0')
    const hour = date.getUTCHours().toString().padStart(2, '0')
    const minute = date.getUTCMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
}

// 判断任务是否逾期
export const isTaskOverdue = (task: { status: string; dueDate?: number; completedAt?: number }) => {
    if (!task.dueDate) return false
    
    // 已完成：比较完成时间与截止时间
    if (task.status === 'DONE') {
        return task.completedAt ? task.completedAt > task.dueDate : false
    }

    // 未完成：比较当前时间与截止时间
    const now = Math.floor(Date.now() / 1000)
    return now > task.dueDate
}

// 计算耗时文本
export const formatDuration = (createdAt?: number, completedAt?: number, status?: string) => {
    if (!createdAt || createdAt === 0 || status === 'TODO') {
        return '未开始'
    }

    const end = (status === 'DONE' && completedAt) ? completedAt : Math.floor(Date.now() / 1000)
    let diff = end - createdAt
    if (diff < 0) diff = 0
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)

    if (days > 0) return `${days}天${hours}小时${minutes}分`
    if (hours > 0) return `${hours}小时${minutes}分`
    return `${minutes}分钟`
}
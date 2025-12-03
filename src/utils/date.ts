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

// 获取 YYYY-MM-DD 格式的日期字符串 (用于 Input type="date" 和 比较)
export const getDateString = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const year = date.getUTCFullYear()
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = date.getUTCDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 检查是否是同一天 (比较 timestamp 和 YYYY-MM-DD 字符串)
export const isSameDay = (timestamp: number, dateStr: string) => {
    if (!timestamp) return false;
    // 这里要注意时区问题，简单起见我们假设 dateStr 是本地时间，timestamp 是 UTC
    // 但通常 input type="date" 返回的是 YYYY-MM-DD。
    // 为了更准确的比较，建议都转为本地显示的 YYYY-MM-DD 字符串比较
    const targetDate = getDateString(timestamp);
    return targetDate === dateStr;
}

// 检查是否在指定日期之前或当天 (用于 Todo)
export const isBeforeOrSameDay = (timestamp: number, dateStr: string) => {
    if (!timestamp) return false;
    const targetDate = getDateString(timestamp);
    return targetDate <= dateStr;
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

    // 1. 获取本地时区与 UTC 的时差（分钟，东八区返回 -480）
    const timezoneOffset = new Date().getTimezoneOffset();
    // 2. 时差换算成秒数（东八区：-480 分钟 → +28800 秒，即 8 小时）
    const localTimeOffset = -timezoneOffset * 60;
    // 3. UTC 时间戳 + 本地时差 = 本地时间对应的时间戳
    const currentLocalTimestamp = Math.floor(Date.now() / 1000) + localTimeOffset;

    // 最终 end 逻辑（使用本地时间戳）
    const end = (status === 'DONE' && completedAt) ? completedAt : currentLocalTimestamp;
    // console.log(`当前时间：${end}`)
    // console.log(`创建时间：${createdAt}`)
    let diff = end - createdAt
    // console.log(`相差时间：${diff}`)
    if (diff < 0) diff = 0
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    // console.log(`${days}天, ${hours}小时, ${minutes}分钟`)

    if (days > 0) return `${days}天${hours}小时${minutes}分`
    if (hours > 0) return `${hours}小时${minutes}分`
    return `${minutes}分钟`
}
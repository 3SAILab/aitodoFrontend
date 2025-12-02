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


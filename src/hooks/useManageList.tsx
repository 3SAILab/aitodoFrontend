import { useState, useEffect, useCallback } from "react";

type GetListApi<T> = () => Promise<{ list: T[] }>
type DeleteApi = (id: string) => Promise<any>

export function useManageList<T extends { id: string }>(
    getListApi: GetListApi<T>,
    deleteApi?: DeleteApi,
    confirmMsg: string = '确定要删除吗？'
) {
    const [list, setList] = useState<T[]>([])
    const [loading, setLoading] = useState(false)
    
    // 获取数据
    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getListApi()
            setList(res.list || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [getListApi])


    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async (id: string) => {
        if (!deleteApi) return
        if (!confirm(confirmMsg)) return
        try {
            await deleteApi(id)
            setList((prev) => prev.filter((item) => item.id !== id))
        } catch (e) {
            alert('删除失败')
        }
    }
    return { list, loading, fetchData, handleDelete }
}



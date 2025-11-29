import request from '../utils/request'
import type {
    // 任务相关类型
    ListTaskResp,
    CreateTaskReq,
    UpdateTaskReq,
    // 任务类型相关类型
    ListTaskTypeResp,
    CreateTaskTypeReq,
    UpdateTaskTypeReq,
    // 销售相关类型
    ListSalesResp,
    CreateSalesReq,
    UpdateSalesReq
} from '../types'

export const getTasks = () => {
    return request.get<any, ListTaskResp>('/task/tasks')
}

export const createTask = (data: CreateTaskReq) => {
    return request.post<any, { id: string }>('/task/tasks', data)
}

// 使用 Omit 去掉 id，因为 update 接口的 id 是通过 URL 传递的，不需要包含在 body json 中
export const UpdateTask = (id: string, data: Omit<UpdateTaskReq, 'id'>) => {
    return request.put(`/task/tasks/${id}`, data)
}

export const deleteTask = (id: string) => {
    return request.delete(`/task/tasks/${id}`)
}

export const getTaskTypes = () => {
    return request.get<any, ListTaskTypeResp>('/task/task-types')
}

export const createTaskType = (data: CreateTaskTypeReq) => {
    return request.post<any, { id: string }>('/task/task-types', data)
}

export const updateTaskType = (id: string, data: Omit<UpdateTaskTypeReq, 'id'>) => {
    return request.put(`/task/task-types/${id}`, data)
}

export const deleteTaskType = (id: string) => {
    return request.delete(`/task/task-types/${id}`)
}

export const getSalesPersons = () => {
    return request.get<any, ListSalesResp>('/task/sales')
}

export const createSalesPerson = (data: CreateSalesReq) => {
    return request.post<any, { id: string }>('/task/sales', data)
}

export const updateSalesPerson = (id: string, data: Omit<UpdateSalesReq, 'id'>) => {
    return request.put(`/task/sales/${id}`, data)
}

export const deleteSalesPerson = (id: string) => {
    return request.delete(`/task/sales/${id}`)
}
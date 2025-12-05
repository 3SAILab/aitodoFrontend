// src/types/task.ts

// ==========================================
// 任务 (Tasks) 相关
// ==========================================

// 对应后端 TaskResp
export interface Task {
  id:            string;
  typeId:        string;
  creatorId:     string;
  assigneeId:    string; // 如果为空字符串，表示未分配
  salesPersonId: string; // 如果为空字符串，表示无关联销售
  title:         string;
  description:   string;
  status:        'TODO' | 'DOING' | 'DONE';
  priority:      number;
  dueDate:       number; // 时间戳 (秒)
  createdAt:     number; // 时间戳 (秒)
  completedAt:   number;
  progressCount?: number;
}

// 对应后端 CreateTaskReq
export interface CreateTaskReq {
  typeId:         string;
  title:          string;
  description?:   string; // optional
  assigneeId?:    string; // optional
  salesPersonId?: string; // optional
  dueDate?:       number; // optional
  priority?:      number; // optional
}

// 对应后端 UpdateTaskReq
export interface UpdateTaskReq {
  id:             string; // path parameter
  typeId:         string;
  title:          string;
  description?:   string;
  assigneeId?:    string;
  salesPersonId?: string;
  dueDate?:       number;
  status:         string;
  priority?:      number;
}

// 对应后端 ListTaskResp
export interface ListTaskResp {
  list: Task[];
}

// ==========================================
// 任务类型 (Task Types) 相关
// ==========================================

// 对应后端 TaskTypeResp
export interface TaskType {
  id:        string;
  name:      string;
  colorCode: string; // 例如 "#FF5733"
}

// 对应后端 CreateTaskTypeReq
export interface CreateTaskTypeReq {
  name:      string;
  colorCode: string;
}

// 对应后端 UpdateTaskTypeReq
export interface UpdateTaskTypeReq {
  id:        string;
  name:      string;
  colorCode: string;
}

// 对应后端 ListTaskTypeResp
export interface ListTaskTypeResp {
  list: TaskType[];
}

// ==========================================
// 销售人员 (Sales Person) 相关
// ==========================================

// 对应后端 SalesResp
export interface SalesPerson {
  id:    string;
  name:  string;
  phone: string;
}

// 对应后端 CreateSalesReq
export interface CreateSalesReq {
  name:   string;
  phone?: string;
}

// 对应后端 UpdateSalesReq
export interface UpdateSalesReq {
  id:     string;
  name:   string;
  phone?: string;
}

// 对应后端 ListSalesResp
export interface ListSalesResp {
  list: SalesPerson[];
}


export interface TaskProgress {
  id: string;
  taskId: string;
  content: string;
  createdBy: string;
  createdAt: number;
}


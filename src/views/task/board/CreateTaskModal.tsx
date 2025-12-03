import { useState, useEffect } from 'react';
import { createTask, getTaskTypes, getSalesPersons } from '@/api/task';
import type { TaskType, SalesPerson, CreateTaskReq } from '@/types';
import Modal from '@/components/Common/Modal';
import { FormInput } from '@/components/Common/FormInput';
import { FormTextArea } from '@/components/Common/FormTextarea';
import { FormSelect } from '@/components/Common/FormSelect';
import { Button } from '@/components/Common/Button';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);

  // 表单状态
  const [formData, setFormData] = useState<CreateTaskReq>({
    title: '', // 默认为空字符串
    typeId: '',
    description: '',
    salesPersonId: '',
    priority: 0,
    dueDate: 0,
    assigneeId: '' // 暂时留空，或者你可以填入当前用户ID
  });

  // 辅助状态：用于处理日期输入框的显示 (YYYY-MM-DD)
  const [dateStr, setDateStr] = useState('');

  // 初始化加载选项数据
  useEffect(() => {
    if (isOpen) {
      const loadOptions = async () => {
        try {
          const [typesRes, salesRes] = await Promise.all([
            getTaskTypes(),
            getSalesPersons()
          ]);
          setTaskTypes(typesRes.list || []);
          setSalesPersons(salesRes.list || []);
          
          // 如果有类型，默认选中第一个
          if (typesRes.list && typesRes.list.length > 0) {
            setFormData(prev => ({ ...prev, typeId: typesRes.list[0].id }));
          }
        } catch (error) {
          console.error("加载选项失败", error);
        }
      };
      loadOptions();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.typeId) {
        alert('请选择任务类型');
        return;
      }

    setLoading(true);
    try {
      // [!code focus] 移除了日期处理逻辑，dueDate 固定为 0
      const submitData = { ...formData, dueDate: 0 };

      await createTask(submitData);
      onSuccess();
      onClose();
      setFormData({
        title: '',
        typeId: taskTypes[0]?.id || '',
        description: '',
        salesPersonId: '',
        priority: 0,
        dueDate: 0,
        assigneeId: ''
      });
      // [!code focus] 删除了 setDateStr('');
    } catch (error) {
      alert('创建失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (

    <Modal isOpen={isOpen} onClose={onClose} title="新建任务" className='max-w-lg'>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 第一行：任务类型 & 优先级 */}
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="任务类型"
            required
            value={formData.typeId}
            onChange={e => setFormData({ ...formData, typeId: e.target.value })}
          >
            {taskTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </FormSelect>

          <FormSelect
            label="优先级"
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
          >
            <option value={0}>普通</option>
            <option value={1}>重要</option>
            <option value={2}>紧急</option>
          </FormSelect>
        </div>

        {/* 第二行：关联销售 & 截止日期 */}
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="关联销售"
            value={formData.salesPersonId || ''}
            onChange={e => setFormData({ ...formData, salesPersonId: e.target.value })}
          >
            <option value="">无关联销售</option>
            {salesPersons.map(person => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </FormSelect>
        </div>

        {/* 描述 */}
        <FormTextArea
          label="详细描述"
          required
          rows={3}
          value={formData.description || ''}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="请输入任务详情..."
        />

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            立即创建
          </Button>
        </div>
      </form>
    </Modal>
  );
}
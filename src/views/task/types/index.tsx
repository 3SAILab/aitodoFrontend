import { useEffect, useState } from 'react';
import { getTaskTypes, deleteTaskType } from '@/api/task';
import type { TaskType } from '@/types';
import { Trash2, Tag } from 'lucide-react';
import CreateTypeModal from './CreateTypeModal';

export default function TypeManagement() {
  const [list, setList] = useState<TaskType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getTaskTypes();
      setList(res.list || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('如果该类型下有任务，删除可能会失败。确定要删除吗？')) return;
    try {
      await deleteTaskType(id);
      fetchData();
    } catch (e) {
      alert('删除失败，可能该类型下仍有任务');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">任务类型管理</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + 添加类型
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {list.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: item.colorCode }}
              >
                <Tag size={16} />
              </span>
              <h3 className="font-medium text-gray-900">{item.name}</h3>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-gray-400 col-span-full text-center py-10">暂无数据</p>}
      </div>
      <CreateTypeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
}
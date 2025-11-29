import { useState } from 'react';
import { createTaskType } from '@/api/task';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTypeModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [colorCode, setColorCode] = useState('#3b82f6'); // 默认蓝色
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTaskType({ name, colorCode });
      onSuccess();
      onClose();
      setName('');
      setColorCode('#3b82f6');
    } catch (error) {
      alert('创建失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-bold">添加任务类型</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">类型名称</label>
            <input className="w-full border rounded-lg px-3 py-2" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">颜色标识</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                className="h-10 w-20 rounded cursor-pointer" 
                value={colorCode} 
                onChange={e => setColorCode(e.target.value)} 
              />
              <span className="text-gray-500 text-sm">{colorCode}</span>
            </div>
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            {loading ? '提交中...' : '确认添加'}
          </button>
        </form>
      </div>
    </div>
  );
}
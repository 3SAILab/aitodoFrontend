import { createTaskType } from '@/api/task';
import React, { useState } from 'react';
import Modal from '@/components/Common/Modal';
import { Button } from '@/components/Common/Button';
import { FormInput } from '@/components/Common/FormInput';


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
    <Modal title='添加任务类型' isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <FormInput 
          label='类型名称'
          required
          value={name}
          onChange={e => setName(e.target.value)}
        />
        
        <div className='pt-2'>
          <Button
            type='submit'
            className='w-full'
            isLoading={loading}
          >
            确认添加
          </Button>
        </div>

      </form>
    </Modal>
  )
}
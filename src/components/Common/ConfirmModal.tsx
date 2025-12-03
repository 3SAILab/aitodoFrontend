// src/components/Common/ConfirmModal.tsx
import Modal from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    content: string;
    isLoading?: boolean;
    variant?: 'danger' | 'primary'; // 用于区分是删除操作(红色)还是普通操作(蓝色)
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    content,
    isLoading = false,
    variant = 'primary'
}: ConfirmModalProps) {
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    {variant === 'danger' && (
                        <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed mt-1">
                        {content}
                    </p>
                </div>
                
                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        取消
                    </Button>
                    <Button 
                        variant={variant === 'danger' ? 'danger' : 'primary'} 
                        onClick={onConfirm} 
                        isLoading={isLoading}
                    >
                        确认
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
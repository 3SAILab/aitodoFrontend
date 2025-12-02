import React from "react";
import { X } from "lucide-react";
import clsx from 'clsx';


interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
}

export default function Modal({isOpen, onClose, title, children, className}: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={clsx("w-full bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]", className || "max-w-md")}>
                
                {/* 弹窗标题部分 */}
                <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 justify-center m-0">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* 弹窗内容部分 */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}



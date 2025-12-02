import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { twMerge } from "tailwind-merge"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading, icon, children, disabled, ...props }, ref) => {
        
        const variants = {
            // [修正] 完全使用你提供的样式
            primary: "text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm",
            // [修正] 完全使用你提供的样式
            secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
            // 危险按钮保持一致风格
            danger: "text-red-600 bg-red-50 hover:bg-red-100 border border-transparent",
            ghost: "text-blue-600 bg-blue-50 hover:bg-blue-100 border border-transparent"
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                type={props.type || 'button'}
                className={twMerge(clsx(
                    // 基础样式：字号、内边距、圆角、Flex布局
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors outline-none",
                    "flex items-center justify-center gap-2",
                    "disabled:cursor-not-allowed",
                    variants[variant],
                    className
                ))}
                {...props}
            >
                {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                {!isLoading && icon && <span>{icon}</span>}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
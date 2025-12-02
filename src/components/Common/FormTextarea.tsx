import React from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
}

export const FormTextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className, required, rows, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea 
                    ref={ref}
                    rows={rows}
                    required={required}
                    className={clsx(
                        "w-full rounded-lg border border-gray-300 px-3 py-2",
                        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition",
                        "disabled:bg-gray-100 disabled:cursor-not-allowed",
                        "placeholder:text-gray-400",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                        className
                    )}
                    { ...props }
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        )
    }
)

FormTextArea.displayName = 'FormTextArea'


import React from "react"
import clsx from "clsx"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({label, error, className, required, ...props}, ref) => {
        return (    
            <div className="w-full">
                {label && <label className="block text-sm font-medium mb-1 test-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>}
                <input
                    ref={ref}
                    required
                    className={clsx(
                        "w-full rounded-lg border border-gray-300 px-3 py-2",
                        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition",
                        "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
                        "placeholder:text-gray-400",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        )
    }
)

FormInput.displayName = 'FormInput'



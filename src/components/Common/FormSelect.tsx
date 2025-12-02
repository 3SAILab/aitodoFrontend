import React from "react";
import clsx from "clsx";

export interface SelectOption {
    label: string
    value: string | number
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options?: SelectOption[]
}

export const FormSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, className, required, options, children, ...props}, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    required={required}
                    className={clsx(
                        "w-full rounded-lg border border-gray-300 px-3 py-2 bg-white",
                        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition",
                        "disabled:bg-gray-100 disabled:cursor-not-allowed",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                        className
                    )}
                    {...props}
                >
                    {options ? options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )) : children}
                </select>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        )
    }
)



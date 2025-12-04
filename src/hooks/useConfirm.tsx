import { useState, useCallback } from "react";

interface UseConfirmOptions<T> {
    title: string
    content: string | ((data: T) => string)
    variant?: 'primary' | 'danger'
    onConfirm: (data: T) => Promise<void>
}

export function useConfirm<T = void>(options: UseConfirmOptions<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<T | null>(null)

    const confirm = useCallback((data: T) => {
        setData(data)
        setIsOpen(true)
    }, [])

    const handleConfirm = async () => {
        setIsLoading(true)
        try {
            if (data !== null) {
                await options.onConfirm(data)
            }
            setIsOpen(false)
        } catch (error) {
            console.error("Confirm action failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [])

    const displayContent = typeof options.content === 'function' && data
        ? options.content(data)
        : (options.content as string)

    return {
        confirm,
        modalProps: {
            isOpen,
            onClose: handleClose,
            onConfirm: handleConfirm,
            title: options.title,
            content: displayContent,
            isLoading,
            variant: options.variant
        }
    }
    
}




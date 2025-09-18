import { useState } from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastQueue: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toastQueue]))
}

export const toast = (toastData: Toast) => {
  toastQueue.push(toastData)
  notifyListeners()
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t !== toastData)
    notifyListeners()
  }, 3000)
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  React.useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    
    listeners.push(listener)
    
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  return { toast, toasts }
}
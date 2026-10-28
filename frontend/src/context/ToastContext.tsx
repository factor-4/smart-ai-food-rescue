import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        setToast({ message, type });
        // Auto-dismiss after 3 seconds
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* The actual Toast UI */}
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-white ${
                        toast.type === 'success' 
                            ? 'bg-green-600 border-green-700' 
                            : 'bg-red-600 border-red-700'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <p className="text-sm font-semibold">{toast.message}</p>
                        <button onClick={() => setToast(null)} className="ml-4 hover:opacity-75 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}
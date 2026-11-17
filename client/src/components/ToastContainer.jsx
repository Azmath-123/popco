import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
export const ToastContainer = () => {
    const { toasts, dismissToast } = useStore();
    if (toasts.length === 0)
        return null;
    return (<div className="fixed bottom-6 right-6 z-60 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (<div key={toast.id} className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border text-xs font-bold tracking-wide transition-all transform animate-in slide-in-from-bottom-2 ${toast.type === 'success'
                ? 'bg-[var(--primary)] text-white border-[var(--border)]/50'
                : toast.type === 'error'
                    ? 'bg-red-700 text-white border-red-800'
                    : 'bg-white text-[var(--foreground)] border-[var(--border)]/20 shadow-lg'}`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-[var(--secondary-foreground)]"/>}
            {toast.type === 'error' && <AlertCircle size={16} className="text-white"/>}
            {toast.type === 'info' && <Info size={16} className="text-[var(--foreground)]"/>}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => dismissToast(toast.id)} className="p-1 rounded-full hover:bg-black/10 transition-colors ml-2">
            <X size={14}/>
          </button>
        </div>))}
    </div>);
};

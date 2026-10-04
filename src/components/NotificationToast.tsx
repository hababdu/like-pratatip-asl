import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface NotificationToastProps {
  notification: { message: string; type?: 'info' | 'success' | 'error' } | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <aside
      aria-label="Xabarlar"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 text-white shadow-2xl backdrop-blur-md transition-all animate-bounce"
    >
      {isSuccess && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
      {isError && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
      {!isSuccess && !isError && <Info size={16} className="text-sky-400 shrink-0" />}
      <span className="text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap">
        {notification.message}
      </span>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-white text-xs px-1"
        aria-label="Yopish"
      >
        ✕
      </button>
    </aside>
  );
};

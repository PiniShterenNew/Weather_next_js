'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { zIndex } from '@/config/tokens';

function getToastIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} className="text-green-500" />;
    case 'error':
      return <AlertCircle size={20} className="text-red-500" />;
    case 'warning':
      return <AlertTriangle size={20} className="text-yellow-500" />;
    case 'info':
    default:
      return <Info size={20} className="text-blue-500" />;
  }
}


function ToastItem({ id, message, values, type = 'info', duration = 3000, action }: {
  id: number;
  message: string;
  values?: Record<string, string | number>;
  type?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  const t = useTranslations();
  const hideToast = useWeatherStore((s) => s.hideToast);
  const locale = useLocale();
  const isRtl = locale === 'he' || typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  useEffect(() => {
    const timeout = setTimeout(() => {
      hideToast(id);
    }, duration);
    return () => clearTimeout(timeout);
  }, [id, hideToast, duration]);

  const handleActionClick = () => {
    action?.onClick();
    hideToast(id);
  };

  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        'rounded-2xl px-4 py-3 backdrop-blur-md',
        'flex items-center gap-3 relative',
        'transition-all duration-300 ease-in-out w-full',
        'shadow-sm bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/30',
        'text-gray-700 dark:text-gray-200'
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex-shrink-0">{getToastIcon(type)}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed break-words">
          {t(message, values)}
        </p>
      </div>

      {action && (
        <button
          onClick={handleActionClick}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium',
            'transition-colors duration-200',
            'bg-gray-900 text-white hover:bg-gray-800',
            'dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200',
            isRtl ? 'mr-2' : 'ml-2'
          )}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

export default function ToastHost() {
  const toasts = useWeatherStore((s) => s.toasts);

  if (typeof document === 'undefined' || !toasts.length) return null;

  return createPortal(
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 isolate pointer-events-none transform-gpu will-change-[transform]"
      style={{ zIndex: zIndex.tooltip + 100 }}
    >
      <div className="toast-container absolute top-0 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl space-y-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div className="pointer-events-auto" key={toast.id}>
              <ToastItem {...toast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}


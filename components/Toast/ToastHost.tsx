'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

function getToastIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} className="text-green-600 dark:text-green-400" />;
    case 'error':
      return <AlertCircle size={20} className="text-red-600 dark:text-red-400" />;
    case 'warning':
      return <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />;
    case 'info':
    default:
      return <Info size={20} className="text-blue-600 dark:text-blue-400" />;
  }
}

function getToastStyles(type: string) {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200';
    case 'info':
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200';
  }
}

function ToastItem({ id, message, values, type = 'info', duration = 3000 }: {
  id: number;
  message: string;
  values?: Record<string, any>;
  type?: string;
  duration?: number;
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

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'border rounded-lg px-4 py-3 shadow-lg',
        'flex items-start gap-3 relative overflow-hidden',
        'transition-all duration-300 ease-in-out',
        getToastStyles(type)
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex-shrink-0 mt-0.5">{getToastIcon(type)}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">
          {t(message, values)}
        </p>
      </div>

      <button
        onClick={() => hideToast(id)}
        aria-label={t('common.close')}
        className="flex-shrink-0 p-1 rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
      >
        <X size={16} />
      </button>

      <div
        className={cn(
          'absolute bottom-0 h-1 bg-current opacity-30',
          isRtl ? 'right-0' : 'left-0'
        )}
        style={{ animation: `shrink ${duration}ms linear forwards` }}
      />
    </div>
  );
}

export default function ToastHost() {
  const toasts = useWeatherStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[1000] w-[90%] max-w-md space-y-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

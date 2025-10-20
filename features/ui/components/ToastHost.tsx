'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { zIndex } from '@/config/tokens';

function getToastIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle size={24} className="text-success" />;
    case 'error':
      return <AlertCircle size={24} className="text-danger" />;
    case 'warning':
      return <AlertTriangle size={24} className="text-warning" />;
    case 'info':
    default:
      return <Info size={24} className="text-brand-500" />;
  }
}

function getToastStyles(type: string) {
  switch (type) {
    case 'success':
      return 'bg-card/95 border-success/30 text-card-foreground';
    case 'error':
      return 'bg-card/95 border-danger/30 text-card-foreground';
    case 'warning':
      return 'bg-card/95 border-warning/30 text-card-foreground';
    case 'info':
    default:
      return 'bg-card/95 border-brand-500/30 text-card-foreground';
  }
}

function ToastItem({ id, message, values, type = 'info', duration = 3000 }: {
  id: number;
  message: string;
  values?: Record<string, string | number>;
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
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        'border-2 rounded-2xl px-6 py-6 backdrop-blur-md',
        'flex items-start gap-4 relative overflow-hidden',
        'transition-all duration-300 ease-in-out w-full',
        'shadow-lg hover:shadow-xl bg-card/95',
        getToastStyles(type)
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex-shrink-0 mt-1">{getToastIcon(type)}</div>

      <div className="flex-1 min-w-0">
        <p className="text-base font-medium leading-relaxed break-words">
          {t(message, values)}
        </p>
      </div>

      <button
        onClick={() => hideToast(id)}
        aria-label={t('common.close')}
        title={t('common.close')}
        className="flex-shrink-0 p-2 rounded-lg transition-all hover:bg-muted/70 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <X size={20} role="presentation" />
      </button>

      <motion.div
        className={cn(
          'absolute bottom-0 h-1.5 bg-current opacity-40 rounded-full',
          isRtl ? 'right-0' : 'left-0'
        )}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
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


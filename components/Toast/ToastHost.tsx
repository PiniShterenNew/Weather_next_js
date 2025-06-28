'use client';

import { useEffect, useRef } from 'react';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ToastHost() {
  const toasts = useWeatherStore((s) => s.toasts);
  const hideToast = useWeatherStore((s) => s.hideToast);
  const t = useTranslations();

  const timersReference = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    for (const toast of toasts) {
      if (!timersReference.current.has(toast.id)) {
        const timeout = setTimeout(() => {
          hideToast(toast.id); // פשוט תמיד תקרא
          timersReference.current.delete(toast.id);
        }, 3000);
        timersReference.current.set(toast.id, timeout);
      }
    }
    for (const [id, timeout] of timersReference.current.entries()) {
      if (!toasts.find((t) => t.id === id)) {
        clearTimeout(timeout);
        timersReference.current.delete(id);
      }
    }

    return () => {
      for (const timeout of timersReference.current.values()) {
        clearTimeout(timeout);
      }
      timersReference.current.clear();
    };
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[90%] max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-foreground text-background rounded-md px-4 py-2 shadow flex justify-between items-center gap-2 animate-in fade-in slide-in-from-bottom"
        >
          <span>{t(toast.message, toast.values)}</span>
          <button
            onClick={() => hideToast(toast.id)}
            aria-label={t('common.close')}
            role="button"
            name={t('common.close')}
            className="p-1 hover:bg-background/20 rounded"
          >
            <X size={16} role="presentation" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

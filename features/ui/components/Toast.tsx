'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastProps } from '../types';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'text-green-600 bg-green-50 border-green-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
};

export default function Toast({ message, type, duration = 5000, onClose, className }: ToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm",
        colors[type],
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthErrorMessageProps {
  message: string;
  className?: string;
}

export default function AuthErrorMessage({ message, className = '' }: AuthErrorMessageProps) {
  if (!message) return null;

  return (
    <div 
      className={`p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-start gap-2 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm text-red-600 dark:text-red-400 flex-1">{message}</p>
    </div>
  );
}


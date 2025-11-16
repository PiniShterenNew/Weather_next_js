/**
 * UI Feature Types
 * Type definitions for UI-related functionality
 */

import React from 'react';

// UI Component Props
export interface LoadingOverlayProps {
  isLoading?: boolean;
  message?: string;
  className?: string;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  'data-testid'?: string;
}

// UI Store Types
export interface UIStoreState {
  theme: 'light' | 'dark' | 'system';
  direction: 'ltr' | 'rtl';
  isLoading: boolean;
  toasts: ToastProps[];
  modals: string[];
}

export interface UIStoreActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setDirection: (direction: 'ltr' | 'rtl') => void;
  setLoading: (loading: boolean) => void;
  addToast: (toast: Omit<ToastProps, 'onClose'>) => void;
  removeToast: (index: number) => void;
  clearToasts: () => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
}

export type UIStore = UIStoreState & UIStoreActions;

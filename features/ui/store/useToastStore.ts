'use client';

import { create } from 'zustand';

import type { ToastMessage } from '@/types/ui';

interface ToastState {
  toasts: ToastMessage[];
}

interface ToastActions {
  showToast: (toast: Omit<ToastMessage, 'id'> & { id?: number }) => number;
  hideToast: (id: number) => void;
  clearToasts: () => void;
}

type ToastStore = ToastState & ToastActions;

let toastIdCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: ({ id, ...toast }) => {
    toastIdCounter = id ?? toastIdCounter + 1;
    const toastWithId: ToastMessage = { id: toastIdCounter, ...toast };
    set((state) => ({
      toasts: [...state.toasts, toastWithId],
    }));
    return toastIdCounter;
  },
  hideToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }));
  },
  clearToasts: () => set({ toasts: [] }),
}));

export type { ToastState, ToastActions, ToastStore };



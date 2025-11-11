'use client';

import { create } from 'zustand';

interface QuickAddState {
  isOpen: boolean;
}

interface QuickAddActions {
  setOpen: (isOpen: boolean) => void;
}

export type QuickAddStore = QuickAddState & QuickAddActions;

export const useQuickAddStore = create<QuickAddStore>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}));



'use client';

import { create } from 'zustand';
import type { AuthStore } from '../types';

/**
 * Auth Store
 * Client-side state mirror of Clerk authentication
 * Used for optimistic UI updates and local state management
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));


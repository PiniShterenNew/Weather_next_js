import { describe, expect, it, beforeEach } from 'vitest';

import { useToastStore } from '@/features/ui/store/useToastStore';

const resetStore = () => {
  useToastStore.setState({ toasts: [] });
};

describe('useToastStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('adds a toast and returns its id', () => {
    const showToast = useToastStore.getState().showToast;
    const toastId = showToast({ message: 'hello', type: 'info' });

    expect(useToastStore.getState().toasts).toEqual([
      { id: toastId, message: 'hello', type: 'info' },
    ]);
  });

  it('hides a toast by id', () => {
    const { showToast, hideToast } = useToastStore.getState();
    const toastId = showToast({ message: 'remove-me' });

    hideToast(toastId);

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('clears all toasts', () => {
    const { showToast, clearToasts } = useToastStore.getState();
    showToast({ message: 'toast-1' });
    showToast({ message: 'toast-2' });

    clearToasts();

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});

import { describe, expect, it, beforeEach } from 'vitest';

import { useQuickAddStore } from '@/features/search/store/useQuickAddStore';

const resetStore = () => {
  useQuickAddStore.setState({ isOpen: false });
};

describe('useQuickAddStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('starts closed by default', () => {
    expect(useQuickAddStore.getState().isOpen).toBe(false);
  });

  it('updates the open state', () => {
    const { setOpen } = useQuickAddStore.getState();

    setOpen(true);
    expect(useQuickAddStore.getState().isOpen).toBe(true);

    setOpen(false);
    expect(useQuickAddStore.getState().isOpen).toBe(false);
  });
});

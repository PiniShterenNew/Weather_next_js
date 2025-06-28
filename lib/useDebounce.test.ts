import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/lib/useDebounce';

vi.useFakeTimers();

describe('useDebounce', () => {
  it('delays updating the debounced value', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });

    expect(result.current).toBe('initial'); // still old

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });
});

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

vi.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

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

  it('returns initial value immediately on first render', () => {
    const { result } = renderHook(() => useDebounce('test', 1000));
    expect(result.current).toBe('test');
  });

  it('handles multiple rapid changes correctly', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 300 },
    });

    // Multiple rapid changes
    rerender({ value: 'first', delay: 300 });
    rerender({ value: 'second', delay: 300 });
    rerender({ value: 'final', delay: 300 });

    // Should still be initial before timer
    expect(result.current).toBe('initial');

    // Advance time, should update to the last value
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('final');
  });

  it('handles delay changes correctly', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    rerender({ value: 'updated', delay: 1000 }); // Change both value and delay

    act(() => {
      vi.advanceTimersByTime(500); // Old delay time
    });

    expect(result.current).toBe('initial'); // Should not update yet

    act(() => {
      vi.advanceTimersByTime(500); // Complete the new delay (1000ms total)
    });

    expect(result.current).toBe('updated');
  });

  it('works with different data types', () => {
    // Test with numbers
    const { result: numberResult, rerender: rerenderNumber } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 200 } }
    );

    rerenderNumber({ value: 42, delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(numberResult.current).toBe(42);

    // Test with objects
    const initialObj = { id: 1, name: 'test' };
    const updatedObj = { id: 2, name: 'updated' };

    const { result: objectResult, rerender: rerenderObject } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 200 } }
    );

    rerenderObject({ value: updatedObj, delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(objectResult.current).toEqual(updatedObj);
  });

  it('handles zero delay correctly', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 0 },
    });

    rerender({ value: 'updated', delay: 0 });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('cleans up timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { rerender, unmount } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    rerender({ value: 'updated', delay: 500 });
    
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it('cancels previous timer when value changes before delay completes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    rerender({ value: 'first', delay: 500 });

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('initial'); // Should still be initial

    // Change value again before first timer completes
    rerender({ value: 'second', delay: 500 });

    // Complete the remaining time from first timer
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial'); // Should still be initial, first timer was cancelled

    // Complete the second timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('second'); // Now should update to second value
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@/test/utils/renderWithIntl";
import ToastHost from "./ToastHost";
import { ToastMessage } from "@/types/ui";
import React from "react";

const stateMock = {
    toasts: [] as ToastMessage[],
    hideToast: vi.fn(),
};

vi.mock('@/stores/useWeatherStore', () => ({
    useWeatherStore: (selector: any) => selector(stateMock),
    getState: () => stateMock,
}));

beforeEach(() => {
    Object.values(stateMock).forEach(v => typeof v === 'function' && v.mockClear());
    stateMock.toasts = [];
});

afterEach(() => {
    vi.useRealTimers();
});

describe('ToastHost', () => {
    it('renders nothing when there are no toasts', () => {
        stateMock.toasts = [];
        render(<ToastHost />);
        expect(screen.queryByText(/close/i)).not.toBeInTheDocument();
    });

    it('renders single toast with message and close button', () => {
        stateMock.toasts = [
            { id: 1, message: 'exampleMessage' }
        ];
        render(<ToastHost />);
        expect(screen.getByText('Example message')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('calls hideToast with correct id when X button is clicked', () => {
        stateMock.toasts = [
            { id: 2, message: 'clickToast' }
        ];
        render(<ToastHost />);
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(stateMock.hideToast).toHaveBeenCalledWith(2);
    });

    it('calls hideToast automatically after 3 seconds', async () => {
        vi.useFakeTimers();

        stateMock.toasts = [
            { id: 3, message: 'autoTimer' }
        ];

        render(<ToastHost />);

        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        expect(stateMock.hideToast).toHaveBeenCalledWith(3);

        vi.useRealTimers();
    });

    it('does not call hideToast again if toast is removed from store before timer', async () => {
        vi.useFakeTimers();

        stateMock.toasts = [{ id: 4, message: 'shortToast' }];
        const { rerender } = render(<ToastHost />);

        stateMock.toasts = [];
        stateMock.hideToast.mockClear();

        rerender(<ToastHost />);

        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        expect(stateMock.hideToast).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('renders multiple toasts with separate close buttons', () => {
        stateMock.toasts = [
            { id: 10, message: 'firstToast' },
            { id: 11, message: 'secondToast' },
        ];
        render(<ToastHost />);
        expect(screen.getByText('First toast')).toBeInTheDocument();
        expect(screen.getByText('Second toast')).toBeInTheDocument();

        fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);
        expect(stateMock.hideToast).toHaveBeenCalledWith(11);
    });

    it('does not call hideToast if toast is removed before 3 seconds pass', async () => {
        vi.useFakeTimers();
        stateMock.toasts = [{ id: 20, message: 'temporaryToast' }];
        const { rerender } = render(<ToastHost />);

        await act(async () => {
            vi.advanceTimersByTime(2000);
        });

        stateMock.toasts = [];
        stateMock.hideToast.mockClear();
        rerender(<ToastHost />);

        await act(async () => {
            vi.advanceTimersByTime(2000);
        });

        expect(stateMock.hideToast).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('clears timeout when toast is removed from list', async () => {
        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
        const timeoutId = setTimeout(() => { }, 3000);
        const mockToast = { id: 999, message: 'firstToast' };

        const timersMap = new Map();
        timersMap.set(mockToast.id, timeoutId);

        const useRefSpy = vi.spyOn(React, 'useRef').mockImplementation(() => ({ current: timersMap }));

        // First render: toast exists
        stateMock.toasts = [mockToast];
        const { rerender } = render(<ToastHost />);

        // Second render: toast removed
        stateMock.toasts = [];
        await act(async () => {
            rerender(<ToastHost />);
            await Promise.resolve(); // תן לאפקט לרוץ
        });

        // רק בדוק שקראו ל־clearTimeout (לא עם האובייקט)
        expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);

        useRefSpy.mockRestore();
        clearTimeoutSpy.mockRestore();
    });

});
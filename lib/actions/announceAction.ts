'use client';

import { useToastStore } from '@/features/ui/store/useToastStore';

export type ActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface AnnounceActionOptions<T = unknown> {
	run: () => Promise<T>;
	pendingMessageKey?: string;
	successMessageKey?: string;
	errorMessageKey?: string;
	values?: Record<string, string | number>;
	showPendingToast?: boolean;
	pendingMinMs?: number;
	onSuccess?: (result: T) => void;
	onError?: (error: unknown) => void;
}

export interface SequenceStep<T = void> {
	key: string;
	run: () => Promise<T>;
	inlineLabelKey?: string;
}

export interface SequenceOptions<T = unknown> {
	success?: { message: string; values?: Record<string, string | number> };
	error?: { message: string; values?: Record<string, string | number> };
	onStepChange?: (index: number) => void;
	onSuccess?: (result?: T) => void;
	onError?: (error: unknown) => void;
	showPendingToast?: boolean;
	pendingMinMs?: number;
}

export async function announceAction<T = unknown>(options: AnnounceActionOptions<T>): Promise<{ status: ActionStatus; result?: T }> {
	const { run, pendingMessageKey, successMessageKey, errorMessageKey, values, showPendingToast, pendingMinMs = 600, onSuccess, onError } =
		options;
	const { showToast } = useToastStore.getState();
	const stringValues: Record<string, string> | undefined = values
		? Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)]))
		: undefined;
	let pendingTimer: ReturnType<typeof setTimeout> | undefined;

	try {
		if (showPendingToast && pendingMessageKey) {
			pendingTimer = setTimeout(() => {
				showToast({ message: pendingMessageKey, type: 'info', values: stringValues });
			}, pendingMinMs);
		}

		const result = await run();

		if (pendingTimer) clearTimeout(pendingTimer);
		if (successMessageKey) {
			showToast({ message: successMessageKey, type: 'success', values: stringValues });
		}
		onSuccess?.(result);
		return { status: 'success', result };
	} catch (error) {
		if (pendingTimer) clearTimeout(pendingTimer);
		if (errorMessageKey) {
			showToast({ message: errorMessageKey, type: 'error', values: stringValues });
		}
		onError?.(error);
		return { status: 'error' };
	}
}

announceAction.sequence = async function <T = unknown>(
	steps: Array<SequenceStep>,
	options: SequenceOptions<T> = {}
): Promise<{ status: ActionStatus; lastStepIndex: number }> {
	const { showToast } = useToastStore.getState();
	const { success, error, onStepChange, onSuccess, onError, showPendingToast, pendingMinMs = 600 } = options;
	const successValues: Record<string, string> | undefined = success?.values
		? Object.fromEntries(Object.entries(success.values).map(([k, v]) => [k, String(v)]))
		: undefined;
	const errorValues: Record<string, string> | undefined = error?.values
		? Object.fromEntries(Object.entries(error.values).map(([k, v]) => [k, String(v)]))
		: undefined;
	let pendingTimer: ReturnType<typeof setTimeout> | undefined;
	try {
		if (showPendingToast && steps.length > 1) {
			pendingTimer = setTimeout(() => {
				// one pending toast max
				showToast({ message: steps[0]?.inlineLabelKey || 'common.working', type: 'info' });
			}, pendingMinMs);
		}

		for (let i = 0; i < steps.length; i++) {
			onStepChange?.(i);
			await steps[i].run();
		}

		if (pendingTimer) clearTimeout(pendingTimer);
		if (success?.message) {
			showToast({ message: success.message, type: 'success', values: successValues });
		}
		onSuccess?.();
		return { status: 'success', lastStepIndex: steps.length - 1 };
	} catch (err) {
		if (pendingTimer) clearTimeout(pendingTimer);
		// Show a single error toast
		if (error?.message) {
			showToast({ message: error.message, type: 'error', values: errorValues });
		}
		onError?.(err);
		return { status: 'error', lastStepIndex: -1 };
	}
};

export default announceAction;



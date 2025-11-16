'use client';

import { useCallback, useRef, useState } from 'react';
import announceAction, { ActionStatus, AnnounceActionOptions, SequenceOptions, SequenceStep } from '@/lib/actions/announceAction';

export function useActionStatus() {
	const [status, setStatus] = useState<ActionStatus>('idle');
	const busyRef = useRef(false);

	const run = useCallback(async <T,>(opts: AnnounceActionOptions<T>) => {
		if (busyRef.current) return { status: 'pending' as const };
		busyRef.current = true;
		setStatus('pending');
		const result = await announceAction<T>({
			...opts,
			onSuccess: (r) => {
				setStatus('success');
				opts.onSuccess?.(r);
			},
			onError: (e) => {
				setStatus('error');
				opts.onError?.(e);
			},
		});
		busyRef.current = false;
		return result;
	}, []);

	const runSequence = useCallback(async (steps: Array<SequenceStep>, options?: SequenceOptions) => {
		if (busyRef.current) return { status: 'pending' as const, lastStepIndex: -1 };
		busyRef.current = true;
		setStatus('pending');
		const res = await announceAction.sequence(steps, {
			...options,
			onSuccess: () => {
				setStatus('success');
				options?.onSuccess?.();
			},
			onError: (e) => {
				setStatus('error');
				options?.onError?.(e);
			},
		});
		busyRef.current = false;
		return res;
	}, []);

	const reset = () => setStatus('idle');

	return { status, run, runSequence, reset, isPending: status === 'pending' };
}

export default useActionStatus;



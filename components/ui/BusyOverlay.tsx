"use client";

import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { useBusyStore } from '@/store/useBusyStore';

interface BusyOverlayProps {
	className?: string;
}

export default function BusyOverlay({ className }: BusyOverlayProps) {
	const t = useTranslations();
	const mode = useBusyStore((s) => s.mode);
	const status = useBusyStore((s) => s.status);
	const isBusy = useBusyStore((s) => s.isBusy());

	const label = useMemo(() => {
		if (!status) return t('loading');
		try {
			return t(status.key, status.values ?? {});
		} catch {
			return t('loading');
		}
	}, [status, t]);

	if (!mode) return null;

	if (mode === 'blocking') {
		return (
			<div
				className={cn(
					'fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200',
					isBusy ? 'opacity-100' : 'opacity-0 pointer-events-none',
					className
				)}
				role="status"
				aria-live="assertive"
				aria-busy={isBusy}
			>
				<div className="mx-4 w-full max-w-sm rounded-3xl bg-white/95 px-6 py-6 text-center text-gray-900 shadow-xl dark:bg-gray-900/95 dark:text-white">
					<div className="flex flex-col items-center gap-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400/10 to-blue-500/10">
							<Loader2 className="h-6 w-6 text-blue-500 animate-spin" aria-hidden="true" />
						</div>
						<p className="text-sm font-semibold tracking-tight">
							{label}
						</p>
					</div>
				</div>
			</div>
		);
	}

	// non-blocking top bar, intended to be mounted inside a layout area that already reserves vertical space
	return (
		<div className={cn('pointer-events-none sticky top-0 z-[60]', className)}>
			<div
				data-testid="busy-overlay"
				className={cn(
					'flex h-8 md:h-9 items-center justify-center bg-gray-900/70 text-white text-xs font-semibold tracking-wide backdrop-blur rounded-b-md transition-opacity duration-200',
					isBusy ? 'opacity-100' : 'opacity-0'
				)}
				role="status"
				aria-live="polite"
				aria-atomic="true"
				aria-busy={isBusy}
			>
				<span className="mr-2 inline-block h-1 w-24 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 animate-[pulse_1.2s_ease-in-out_infinite]" />
				<span>{label}</span>
			</div>
		</div>
	);
}

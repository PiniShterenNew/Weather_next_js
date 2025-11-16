import { create } from 'zustand';

export type BusyScope = 'global' | 'add' | string;

export interface BusyStatus {
	key: string;
	values?: Record<string, string | number>;
}

interface BusyState {
	// Global blocking/non-blocking mode: null (off), 'blocking', 'nonBlocking'
	mode: 'blocking' | 'nonBlocking' | null;
	// Global counter for generic busy operations
	globalCount: number;
	// Per-key in-flight counters, e.g., { 'add:city:123': 1 }
	inFlight: Record<string, number>;
	// Current status message (i18n key + values)
	status: BusyStatus | null;
	// Internal token registry to map token -> { key, scope, blocking }
	_tokens: Record<string, { fullKey: string; blocking: boolean } | undefined>;

	// Public API
	beginBusy: (
		scope: BusyScope,
		key?: string,
		opts?: { blocking?: boolean; status?: BusyStatus }
	) => string; // returns token to end
	endBusy: (token: string) => void;
	setStatus: (status: BusyStatus | null) => void;

	// Selectors (exposed as store state for convenience)
	isBusy: () => boolean;
	isBusyKey: (scope: BusyScope, key: string) => boolean;
}

function makeFullKey(scope: BusyScope, key?: string): string {
	return key ? `${scope}:${key}` : `${scope}`;
}

function genToken(): string {
	// lightweight unique-ish token without extra deps
	return `${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export const useBusyStore = create<BusyState>((set, get) => ({
	mode: null,
	globalCount: 0,
	inFlight: {},
	status: null,
	_tokens: {},

	beginBusy: (scope, key, opts) => {
		const fullKey = makeFullKey(scope, key);
		const token = genToken();
		const blocking = Boolean(opts?.blocking);
		set((state) => {
			const next = { ...state } as BusyState;
			if (key) {
				next.inFlight = { ...state.inFlight };
				next.inFlight[fullKey] = (state.inFlight[fullKey] || 0) + 1;
			} else {
				next.globalCount = state.globalCount + 1;
			}
			next._tokens = { ...state._tokens, [token]: { fullKey, blocking } };
			if (opts?.status) {
				next.status = opts.status;
			}
			// If any blocking busy starts, set blocking mode; otherwise preserve existing mode
			if (blocking) {
				next.mode = 'blocking';
			} else if (!next.mode) {
				next.mode = 'nonBlocking';
			}
			return next;
		});
		return token;
	},

	endBusy: (token) => {
		set((state) => {
			const entry = state._tokens[token];
			if (!entry) return state;
			const { fullKey } = entry;
			const next = { ...state } as BusyState;
			// clear token
			next._tokens = { ...state._tokens };
			delete next._tokens[token];
			// decrement counters
			if (fullKey.includes(':')) {
				next.inFlight = { ...state.inFlight };
				const count = (state.inFlight[fullKey] || 0) - 1;
				if (count > 0) next.inFlight[fullKey] = count; else delete next.inFlight[fullKey];
			} else {
				next.globalCount = Math.max(0, state.globalCount - 1);
			}
			// recompute mode: blocking if any remaining token is blocking; else nonBlocking if any busy; else null
			const remainingTokens = Object.values(next._tokens).filter(Boolean) as Array<{ fullKey: string; blocking: boolean }>;
			const hasBlocking = remainingTokens.some((t) => t.blocking);
			const hasAnyBusy = hasBlocking || next.globalCount > 0 || Object.keys(next.inFlight).length > 0;
			next.mode = hasBlocking ? 'blocking' : hasAnyBusy ? 'nonBlocking' : null;
			// clear status when nothing is busy
			if (!hasAnyBusy) {
				next.status = null;
			}
			return next;
		});
	},

	setStatus: (status) => set({ status }),

	isBusy: () => {
		const s = get();
		return s.globalCount > 0 || Object.keys(s.inFlight).length > 0;
	},
	isBusyKey: (scope, key) => {
		const s = get();
		const fullKey = makeFullKey(scope, key);
		return (s.inFlight[fullKey] || 0) > 0;
	},
}));

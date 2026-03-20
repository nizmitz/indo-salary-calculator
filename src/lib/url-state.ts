import type { PTKPStatus, BpjsToggles } from './tax-calculator';

export interface ShareableState {
	baseSalary: number;
	allowances: number;
	companyPaidInsurance: number;
	includeThr: boolean;
	thrAmount: number;
	includeBonus: boolean;
	bonusAmount: number;
	ptkpStatus: PTKPStatus;
	bpjsToggles: BpjsToggles;
	isGrossUp: boolean;
	lang: 'id' | 'en';
}

const DEFAULTS: ShareableState = {
	baseSalary: 10_000_000,
	allowances: 0,
	companyPaidInsurance: 0,
	includeThr: false,
	thrAmount: 0,
	includeBonus: false,
	bonusAmount: 0,
	ptkpStatus: 'TK/0',
	bpjsToggles: { jht: true, jp: true, kesehatan: true },
	isGrossUp: false,
	lang: 'id'
};

const VALID_PTKP: PTKPStatus[] = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];
const PTKP_INDEX: Record<PTKPStatus, number> = {
	'TK/0': 0,
	'TK/1': 1,
	'TK/2': 2,
	'TK/3': 3,
	'K/0': 4,
	'K/1': 5,
	'K/2': 6,
	'K/3': 7
};

/**
 * Encode state into a compact URL-safe string.
 *
 * Format: pipe-delimited values, then base64url-encoded into a hash fragment.
 * Order: salary|allowances|insurance|thrActive|thrAmount|bonusActive|bonusAmount|ptkpIdx|bpjsFlags|grossUp|lang
 *
 * bpjsFlags is a 3-bit number: bit0=jht, bit1=jp, bit2=kesehatan
 *
 * Example: salary.nizmitz.com/#c=MTUwMDAwMDB8MHwwfDF8MTUwMDAwMDB8MHwwfDB8N3wwfGVu
 */
export function encodeState(state: ShareableState): string {
	const bpjsBits =
		(state.bpjsToggles.jht ? 1 : 0) |
		(state.bpjsToggles.jp ? 2 : 0) |
		(state.bpjsToggles.kesehatan ? 4 : 0);

	const parts = [
		state.baseSalary,
		state.allowances,
		state.companyPaidInsurance,
		state.includeThr ? 1 : 0,
		state.thrAmount,
		state.includeBonus ? 1 : 0,
		state.bonusAmount,
		PTKP_INDEX[state.ptkpStatus],
		bpjsBits,
		state.isGrossUp ? 1 : 0,
		state.lang === 'en' ? 1 : 0
	];

	const raw = parts.join('|');
	return toBase64Url(raw);
}

/**
 * Decode a compact encoded string back into calculator state.
 */
export function decodeState(encoded: string): ShareableState {
	try {
		const raw = fromBase64Url(encoded);
		const parts = raw.split('|');
		if (parts.length < 11) return { ...DEFAULTS };

		const nums = parts.map((p) => parseInt(p, 10));
		if (nums.some(isNaN)) return { ...DEFAULTS };

		const ptkpIdx = Math.min(Math.max(nums[7], 0), 7);
		const bpjsBits = nums[8];

		return {
			baseSalary: Math.max(0, nums[0]),
			allowances: Math.max(0, nums[1]),
			companyPaidInsurance: Math.max(0, nums[2]),
			includeThr: nums[3] === 1,
			thrAmount: Math.max(0, nums[4]),
			includeBonus: nums[5] === 1,
			bonusAmount: Math.max(0, nums[6]),
			ptkpStatus: VALID_PTKP[ptkpIdx],
			bpjsToggles: {
				jht: (bpjsBits & 1) !== 0,
				jp: (bpjsBits & 2) !== 0,
				kesehatan: (bpjsBits & 4) !== 0
			},
			isGrossUp: nums[9] === 1,
			lang: nums[10] === 1 ? 'en' : 'id'
		};
	} catch {
		return { ...DEFAULTS };
	}
}

/**
 * Check if a URL hash contains calculator state.
 */
export function hasStateInHash(hash: string): boolean {
	return hash.startsWith('#c=') && hash.length > 3;
}

/**
 * Get the hash fragment string for the URL (includes the #c= prefix).
 */
export function toHashFragment(state: ShareableState): string {
	const encoded = encodeState(state);
	// Don't add hash if it's all defaults
	const defaultEncoded = encodeState(DEFAULTS);
	if (encoded === defaultEncoded) return '';
	return `#c=${encoded}`;
}

/**
 * Extract encoded state from a hash fragment.
 */
export function fromHashFragment(hash: string): ShareableState {
	if (!hasStateInHash(hash)) return { ...DEFAULTS };
	return decodeState(hash.slice(3));
}

// --- Base64url encoding (URL-safe, no padding) ---

function toBase64Url(str: string): string {
	if (typeof btoa === 'function') {
		return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}
	return Buffer.from(str).toString('base64url');
}

function fromBase64Url(str: string): string {
	const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	if (typeof atob === 'function') {
		return atob(padded);
	}
	return Buffer.from(padded, 'base64').toString();
}

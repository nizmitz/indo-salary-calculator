import { describe, it, expect } from 'vitest';
import {
	encodeState,
	decodeState,
	hasStateInHash,
	toHashFragment,
	fromHashFragment,
	type ShareableState
} from './url-state';

const defaults: ShareableState = {
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

describe('url-state', () => {
	it('round-trips default state', () => {
		const encoded = encodeState(defaults);
		const decoded = decodeState(encoded);
		expect(decoded).toEqual(defaults);
	});

	it('round-trips a custom state', () => {
		const state: ShareableState = {
			baseSalary: 15_000_000,
			allowances: 2_000_000,
			companyPaidInsurance: 500_000,
			includeThr: true,
			thrAmount: 10_000_000,
			includeBonus: true,
			bonusAmount: 5_000_000,
			ptkpStatus: 'K/2',
			bpjsToggles: { jht: false, jp: true, kesehatan: false },
			isGrossUp: true,
			lang: 'en'
		};

		const encoded = encodeState(state);
		const decoded = decodeState(encoded);
		expect(decoded).toEqual(state);
	});

	it('toHashFragment returns empty for defaults', () => {
		expect(toHashFragment(defaults)).toBe('');
	});

	it('toHashFragment returns #c= prefix for non-defaults', () => {
		const state = { ...defaults, baseSalary: 20_000_000 };
		const hash = toHashFragment(state);
		expect(hash).toMatch(/^#c=.+/);
	});

	it('fromHashFragment round-trips with toHashFragment', () => {
		const state: ShareableState = {
			...defaults,
			baseSalary: 20_000_000,
			ptkpStatus: 'K/1',
			lang: 'en'
		};
		const hash = toHashFragment(state);
		const decoded = fromHashFragment(hash);
		expect(decoded).toEqual(state);
	});

	it('decodes invalid base64 gracefully to defaults', () => {
		const decoded = decodeState('!!!invalid!!!');
		expect(decoded).toEqual(defaults);
	});

	it('decodes empty string gracefully to defaults', () => {
		const decoded = decodeState('');
		expect(decoded).toEqual(defaults);
	});

	it('detects hash state presence', () => {
		expect(hasStateInHash('')).toBe(false);
		expect(hasStateInHash('#')).toBe(false);
		expect(hasStateInHash('#c=')).toBe(false);
		expect(hasStateInHash('#c=abc')).toBe(true);
	});

	it('handles BPJS all-off correctly', () => {
		const state: ShareableState = {
			...defaults,
			bpjsToggles: { jht: false, jp: false, kesehatan: false }
		};

		const encoded = encodeState(state);
		const decoded = decodeState(encoded);
		expect(decoded.bpjsToggles).toEqual({ jht: false, jp: false, kesehatan: false });
	});

	it('produces compact URLs (shorter than 100 chars)', () => {
		const state: ShareableState = {
			baseSalary: 15_000_000,
			allowances: 2_000_000,
			companyPaidInsurance: 500_000,
			includeThr: true,
			thrAmount: 10_000_000,
			includeBonus: true,
			bonusAmount: 5_000_000,
			ptkpStatus: 'K/2',
			bpjsToggles: { jht: false, jp: true, kesehatan: false },
			isGrossUp: true,
			lang: 'en'
		};

		const hash = toHashFragment(state);
		// Hash should be compact — well under 100 chars
		expect(hash.length).toBeLessThan(100);
	});
});

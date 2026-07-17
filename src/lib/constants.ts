import type { PTKPStatus } from './tax-calculator';

export const BPJS = {
	jht: { employeeRate: 0.02, companyRate: 0.037, cap: null as number | null },
	jp: { employeeRate: 0.01, companyRate: 0.02, cap: 11_086_300 as number | null },
	kesehatan: { employeeRate: 0.01, companyRate: 0.04, cap: 12_000_000 as number | null }
} as const;

export const BIAYA_JABATAN = { rate: 0.05, yearlyCap: 6_000_000 } as const;

// Yearly progressive PPh 21 tax brackets
export const PROGRESSIVE_BRACKETS = [
	{ limit: 60_000_000, rate: 0.05 },
	{ limit: 190_000_000, rate: 0.15 }, // 250m - 60m
	{ limit: 250_000_000, rate: 0.25 }, // 500m - 250m
	{ limit: 4_500_000_000, rate: 0.3 }, // 5B - 500m
	{ limit: Infinity, rate: 0.35 }
] as const;

export const formatRatePercent = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;

// PTKP Yearly values
export const PTKP_VALUES: Record<PTKPStatus, number> = {
	'TK/0': 54_000_000,
	'TK/1': 58_500_000,
	'TK/2': 63_000_000,
	'TK/3': 67_500_000,
	'K/0': 58_500_000,
	'K/1': 63_000_000,
	'K/2': 67_500_000,
	'K/3': 72_000_000
};

// TER Categories map
export const TER_CATEGORY_MAP: Record<PTKPStatus, 'A' | 'B' | 'C'> = {
	'TK/0': 'A',
	'TK/1': 'A',
	'K/0': 'A',
	'TK/2': 'B',
	'TK/3': 'B',
	'K/1': 'B',
	'K/2': 'B',
	'K/3': 'C'
};

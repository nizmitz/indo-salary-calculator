import { describe, it, expect } from 'vitest';
import { calculateTax, calculateProgressiveTax, BPJS, formatRatePercent } from './tax-calculator';

describe('tax-calculator', () => {
	it('calculates gross tax for TK/0 status with 10M base salary', () => {
		const income = {
			baseSalary: 10_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};
		const ptkpStatus = 'TK/0';
		const bpjs = {
			jht: true,
			jp: true,
			kesehatan: true
		};

		const result = calculateTax(income, ptkpStatus, bpjs, false);

		// 10M is Category A, rate is 2.0%
		// Gross Monthly = 10M + kesCompany (400k) = 10.4M
		// 10.4M is Category A, rate is 2.25% (thresholds: 10.05M -> 2.0, 10.35M -> 2.25)
		// Let's re-verify TER A table in code: 10.05M -> 2.0, 10.35M -> 2.25, 10.7M -> 2.5
		// Wait, 10.4M > 10.35M, so it should be 2.5% ?
		// Code: if (grossIncome <= row.limit) return row.rate;
		// row {limit: 10.35M, rate: 2.25}, next row {limit: 10.7M, rate: 2.5}
		// 10.4M <= 10.7M -> rate 2.5%

		expect(result.terCategory).toBe('A');
		expect(result.terRate).toBe(2.5);
		expect(result.taxMonthly).toBe(10_400_000 * 0.025); // 260,000
	});

	it('calculates gross-up tax allowance correctly', () => {
		const income = {
			baseSalary: 10_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};
		const ptkpStatus = 'TK/0';
		const bpjs = {
			jht: true,
			jp: true,
			kesehatan: true
		};

		const result = calculateTax(income, ptkpStatus, bpjs, true);

		// In gross up, the tax is covered by employer.
		// The monthly gross will be higher by the tax amount.
		expect(result.taxMonthly).toBeGreaterThan(260_000);
		// Tax allowance should equal tax monthly in stable gross-up
		// Result.taxMonthly is the withholding tax.
		// result.takeHomePayMonthly should be (base - deductions_excluding_tax)
		const deductionsExclTax =
			result.bpjs.jhtEmployee + result.bpjs.jpEmployee + result.bpjs.kesehatanEmployee;
		expect(result.takeHomePayMonthly).toBeCloseTo(10_000_000 - deductionsExclTax, 0);
	});
});

describe('BPJS contributions', () => {
	const bpjsAllOn = { jht: true, jp: true, kesehatan: true };
	const bpjsAllOff = { jht: false, jp: false, kesehatan: false };

	it('caps JP contribution above the wage ceiling', () => {
		const income = {
			baseSalary: 20_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};

		const result = calculateTax(income, 'TK/0', bpjsAllOn, false);

		expect(result.bpjs.jpEmployee).toBeCloseTo(110_863, 0);
		expect(result.bpjs.jpCompany).toBeCloseTo(221_726, 0);
	});

	it('does not cap JP contribution below the wage ceiling', () => {
		const income = {
			baseSalary: 8_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};

		const result = calculateTax(income, 'TK/0', bpjsAllOn, false);

		expect(result.bpjs.jpEmployee).toBeCloseTo(80_000, 0);
		expect(result.bpjs.jpCompany).toBeCloseTo(160_000, 0);
	});

	it('caps JP contribution exactly at the wage ceiling', () => {
		const income = {
			baseSalary: 11_086_300,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};

		const result = calculateTax(income, 'TK/0', bpjsAllOn, false);

		expect(result.bpjs.jpEmployee).toBeCloseTo(110_863, 0);
		expect(result.bpjs.jpCompany).toBeCloseTo(221_726, 0);
	});

	it('locks in existing kesehatan and JHT behavior at 20M base salary', () => {
		const income = {
			baseSalary: 20_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};

		const result = calculateTax(income, 'TK/0', bpjsAllOn, false);

		expect(result.bpjs.kesehatanEmployee).toBeCloseTo(120_000, 0);
		expect(result.bpjs.kesehatanCompany).toBeCloseTo(480_000, 0);
		expect(result.bpjs.jhtEmployee).toBeCloseTo(400_000, 0);
		expect(result.bpjs.jhtCompany).toBeCloseTo(740_000, 0);
	});

	it('produces zero BPJS contributions when all toggles are off', () => {
		const income = {
			baseSalary: 20_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};

		const result = calculateTax(income, 'TK/0', bpjsAllOff, false);

		expect(result.bpjs.jhtEmployee).toBe(0);
		expect(result.bpjs.jhtCompany).toBe(0);
		expect(result.bpjs.jpEmployee).toBe(0);
		expect(result.bpjs.jpCompany).toBe(0);
		expect(result.bpjs.kesehatanEmployee).toBe(0);
		expect(result.bpjs.kesehatanCompany).toBe(0);
	});

	it('terminates the gross-up iteration for a large base salary', () => {
		const income = {
			baseSalary: 500_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};

		const result = calculateTax(income, 'TK/0', bpjsAllOn, true);

		const deductionsExclTax =
			result.bpjs.jhtEmployee + result.bpjs.jpEmployee + result.bpjs.kesehatanEmployee;
		expect(result.takeHomePayMonthly).toBeCloseTo(500_000_000 - deductionsExclTax, 0);
	});
});

describe('constants lock-in', () => {
	it('keeps the JP wage ceiling at 11,086,300', () => {
		expect(BPJS.jp.cap).toBe(11_086_300);
	});

	it('formats rates as trimmed percentages', () => {
		expect(formatRatePercent(0.037)).toBe('3.7%');
		expect(formatRatePercent(0.02)).toBe('2%');
	});
});

describe('calculateProgressiveTax', () => {
	it('returns 0 for non-positive PKP', () => {
		expect(calculateProgressiveTax(0)).toBe(0);
	});

	it('applies the 5% bracket for 60,000,000', () => {
		expect(calculateProgressiveTax(60_000_000)).toBe(3_000_000);
	});

	it('applies the 5%/15% brackets for 100,000,000', () => {
		expect(calculateProgressiveTax(100_000_000)).toBe(9_000_000);
	});

	it('applies the 30% bracket for a value inside it', () => {
		// 60m@5% + 190m@15% + 250m@25% + remaining@30%
		const pkp = 600_000_000;
		const expected =
			60_000_000 * 0.05 + 190_000_000 * 0.15 + 250_000_000 * 0.25 + 100_000_000 * 0.3;
		expect(calculateProgressiveTax(pkp)).toBeCloseTo(expected, 0);
	});

	it('rounds down to the nearest 1000 before computing tax', () => {
		expect(calculateProgressiveTax(60_000_999)).toBe(calculateProgressiveTax(60_000_000));
	});
});

describe('PTKP/TER category mapping via calculateTax', () => {
	const bpjsAllOn = { jht: true, jp: true, kesehatan: true };

	it('maps K/3 to TER category C', () => {
		const income = {
			baseSalary: 10_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};
		const result = calculateTax(income, 'K/3', bpjsAllOn, false);
		expect(result.terCategory).toBe('C');
	});

	it('maps TK/2 to TER category B', () => {
		const income = {
			baseSalary: 10_000_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};
		const result = calculateTax(income, 'TK/2', bpjsAllOn, false);
		expect(result.terCategory).toBe('B');
	});

	it('yields zero yearly tax for a low base salary under TK/0', () => {
		const income = {
			baseSalary: 4_500_000,
			allowances: 0,
			companyPaidInsurance: 0,
			bonus: 0,
			thr: 0
		};
		const result = calculateTax(income, 'TK/0', bpjsAllOn, false);
		expect(result.taxYearly).toBe(0);
	});
});

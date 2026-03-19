import { describe, it, expect } from 'vitest';
import { calculateTax } from './tax-calculator';

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

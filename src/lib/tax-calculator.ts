import {
	BPJS,
	BIAYA_JABATAN,
	PROGRESSIVE_BRACKETS,
	PTKP_VALUES,
	TER_CATEGORY_MAP
} from './constants';
import { TER_TABLES } from './ter-tables';

export type PTKPStatus = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';

export interface Income {
	baseSalary: number;
	allowances: number;
	companyPaidInsurance: number; // Additional insurance added to gross
	bonus: number;
	thr: number;
}

export interface BpjsToggles {
	jht: boolean;
	jp: boolean;
	kesehatan: boolean;
}

export interface CalculationResult {
	grossIncomeMonthly: number;
	grossIncomeYearly: number;
	totalDeductionsMonthly: number;
	taxableIncomeMonthly: number; // For progressive
	terCategory: 'A' | 'B' | 'C' | null;
	terRate: number;
	taxMonthly: number;
	taxYearly: number;
	takeHomePayMonthly: number;
	bpjs: {
		jhtEmployee: number;
		jhtCompany: number;
		jpEmployee: number;
		jpCompany: number;
		kesehatanEmployee: number;
		kesehatanCompany: number;
	};
}

// Re-exports so existing imports (url-state.ts, +page.svelte, tests) keep working.
export {
	BPJS,
	BIAYA_JABATAN,
	PROGRESSIVE_BRACKETS,
	PTKP_VALUES,
	TER_CATEGORY_MAP,
	formatRatePercent
} from './constants';
export { TER_TABLES } from './ter-tables';

const capped = (base: number, cap: number | null) => (cap === null ? base : Math.min(base, cap));

const getTerRate = (category: 'A' | 'B' | 'C', grossIncome: number): number => {
	const table = TER_TABLES[category];
	for (const row of table) {
		if (grossIncome <= row.limit) {
			return row.rate;
		}
	}
	return 34.0;
};

// Yearly Progressive Tax Calculation (for December & Yearly projection)
export const calculateProgressiveTax = (pkp: number): number => {
	let remaining = Math.floor(pkp / 1000) * 1000; // Round down to nearest 1000
	if (remaining <= 0) return 0;

	let tax = 0;

	for (const bracket of PROGRESSIVE_BRACKETS) {
		if (remaining > 0) {
			const amountInBracket = Math.min(remaining, bracket.limit);
			tax += amountInBracket * bracket.rate;
			remaining -= amountInBracket;
		} else {
			break;
		}
	}

	return tax;
};

export const calculateTax = (
	income: Income,
	ptkpStatus: PTKPStatus,
	bpjs: BpjsToggles,
	isGrossUp: boolean = false
): CalculationResult => {
	const baseForBpjs = income.baseSalary; // Usually just base salary, sometimes base + fixed allowance. Assuming base for simplicity.

	// Calculate BPJS
	const jhtCompany = bpjs.jht ? capped(baseForBpjs, BPJS.jht.cap) * BPJS.jht.companyRate : 0;
	const jhtEmployee = bpjs.jht ? capped(baseForBpjs, BPJS.jht.cap) * BPJS.jht.employeeRate : 0;

	const jpBase = capped(baseForBpjs, BPJS.jp.cap);
	const jpCompany = bpjs.jp ? jpBase * BPJS.jp.companyRate : 0;
	const jpEmployee = bpjs.jp ? jpBase * BPJS.jp.employeeRate : 0;

	const kesBase = capped(baseForBpjs, BPJS.kesehatan.cap);
	const kesCompany = bpjs.kesehatan ? kesBase * BPJS.kesehatan.companyRate : 0;
	const kesEmployee = bpjs.kesehatan ? kesBase * BPJS.kesehatan.employeeRate : 0;

	const bpjsResults = {
		jhtEmployee,
		jhtCompany,
		jpEmployee,
		jpCompany,
		kesehatanEmployee: kesEmployee,
		kesehatanCompany: kesCompany
	};

	// Function to calculate pure tax based on a given "Tax Allowance"
	const calculateWithAllowance = (taxAllowance: number) => {
		// Regular monthly gross (Base + Allowances + Company paid benefits + Tax Allowance)
		const monthlyRegularGross =
			income.baseSalary +
			income.allowances +
			income.companyPaidInsurance +
			kesCompany +
			taxAllowance;

		// Total gross for THIS month (including irregular income like Bonus/THR)
		const monthlyTotalGross = monthlyRegularGross + income.bonus + income.thr;

		// TER (Tarif Efektif Rata-Rata) applies to the total monthly Gross Income
		const category = TER_CATEGORY_MAP[ptkpStatus];
		const terRate = getTerRate(category, monthlyTotalGross);

		// Monthly tax via TER (applied to total gross received this month)
		const monthlyTax = (monthlyTotalGross * terRate) / 100;

		// Yearly Projection (To find the true annualized tax and December reconciliation)
		// We project the regular income to 12 months and add the irregular income once.
		const totalYearlyGross = monthlyRegularGross * 12 + income.bonus + income.thr;

		// Deductions
		const biayaJabatan = Math.min(totalYearlyGross * BIAYA_JABATAN.rate, BIAYA_JABATAN.yearlyCap);
		const jhtYearly = jhtEmployee * 12;
		const jpYearly = jpEmployee * 12;
		const totalDeductionsYearly = biayaJabatan + jhtYearly + jpYearly;

		const netIncomeYearly = totalYearlyGross - totalDeductionsYearly;
		const ptkp = PTKP_VALUES[ptkpStatus];
		const pkp = Math.max(netIncomeYearly - ptkp, 0);

		const calculatedTaxYearly = calculateProgressiveTax(pkp);

		return {
			monthlyRegularGross,
			monthlyTotalGross,
			totalYearlyGross,
			monthlyTax,
			calculatedTaxYearly,
			category,
			terRate,
			jhtEmployee,
			jpEmployee,
			kesEmployee
		};
	};

	let result = calculateWithAllowance(0);

	// Gross Up Calculation (Iterative)
	if (isGrossUp) {
		let taxAllowance = 0;
		let diff = 1;
		let iterations = 0;

		// Iteratively find the exact tax allowance needed to cover the monthly tax
		while (diff > 0.01 && iterations++ < 100) {
			const currentResult = calculateWithAllowance(taxAllowance);
			const neededAllowance = currentResult.monthlyTax;
			diff = Math.abs(neededAllowance - taxAllowance);
			taxAllowance = neededAllowance;
		}

		result = calculateWithAllowance(taxAllowance);
	}

	const totalDeductionsMonthly =
		result.jhtEmployee +
		result.jpEmployee +
		result.kesEmployee +
		(isGrossUp ? 0 : result.monthlyTax);

	// Take Home Pay includes Bonus and THR if present
	const takeHomePayMonthly =
		income.baseSalary + income.allowances + income.bonus + income.thr - totalDeductionsMonthly;

	return {
		grossIncomeMonthly: result.monthlyTotalGross,
		grossIncomeYearly: result.totalYearlyGross,
		totalDeductionsMonthly: totalDeductionsMonthly,
		taxableIncomeMonthly: 0,
		terCategory: result.category,
		terRate: result.terRate,
		taxMonthly: result.monthlyTax,
		taxYearly: result.calculatedTaxYearly,
		takeHomePayMonthly: takeHomePayMonthly,
		bpjs: bpjsResults
	};
};

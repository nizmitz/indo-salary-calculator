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

// Simplified TER Tables (Gross Income Thresholds up to Max) -> Rate (%)
// In a full production app, this would contain all 40+ exact rows per category.
// Using a functional approximation/subset for brevity in this technical test.
const TER_TABLES = {
	A: [
		{ limit: 5_400_000, rate: 0 },
		{ limit: 5_650_000, rate: 0.25 },
		{ limit: 5_950_000, rate: 0.5 },
		{ limit: 6_300_000, rate: 0.75 },
		{ limit: 6_750_000, rate: 1.0 },
		{ limit: 7_500_000, rate: 1.25 },
		{ limit: 8_550_000, rate: 1.5 },
		{ limit: 9_650_000, rate: 1.75 },
		{ limit: 10_050_000, rate: 2.0 },
		{ limit: 10_350_000, rate: 2.25 },
		{ limit: 10_700_000, rate: 2.5 },
		{ limit: 11_050_000, rate: 3.0 },
		{ limit: 11_600_000, rate: 3.5 },
		{ limit: 12_500_000, rate: 4.0 },
		{ limit: 13_750_000, rate: 5.0 },
		{ limit: 15_100_000, rate: 6.0 },
		{ limit: 16_950_000, rate: 7.0 },
		{ limit: 19_750_000, rate: 8.0 },
		{ limit: 24_150_000, rate: 9.0 },
		{ limit: 26_450_000, rate: 10.0 },
		{ limit: 28_000_000, rate: 11.0 },
		{ limit: 30_050_000, rate: 12.0 },
		{ limit: 32_400_000, rate: 13.0 },
		{ limit: 35_400_000, rate: 14.0 },
		{ limit: 39_100_000, rate: 15.0 },
		{ limit: 43_850_000, rate: 16.0 },
		{ limit: 47_800_000, rate: 17.0 },
		{ limit: 51_400_000, rate: 18.0 },
		{ limit: 56_300_000, rate: 19.0 },
		{ limit: 62_200_000, rate: 20.0 },
		{ limit: 71_400_000, rate: 21.0 },
		{ limit: 85_500_000, rate: 22.0 },
		{ limit: 113_000_000, rate: 23.0 },
		{ limit: 173_600_000, rate: 24.0 },
		{ limit: 211_300_000, rate: 25.0 },
		{ limit: 259_500_000, rate: 26.0 },
		{ limit: 335_000_000, rate: 27.0 },
		{ limit: 462_500_000, rate: 28.0 },
		{ limit: 704_500_000, rate: 29.0 },
		{ limit: 1_133_300_000, rate: 30.0 },
		{ limit: 1_865_500_000, rate: 31.0 },
		{ limit: 3_668_500_000, rate: 32.0 },
		{ limit: 8_792_000_000, rate: 33.0 },
		{ limit: Infinity, rate: 34.0 }
	],
	B: [
		{ limit: 6_200_000, rate: 0 },
		{ limit: 6_500_000, rate: 0.25 },
		{ limit: 6_850_000, rate: 0.5 },
		{ limit: 7_300_000, rate: 0.75 },
		{ limit: 9_200_000, rate: 1.0 },
		{ limit: 10_750_000, rate: 1.5 },
		{ limit: 11_250_000, rate: 2.0 },
		{ limit: 11_600_000, rate: 2.5 },
		{ limit: 12_600_000, rate: 3.0 },
		{ limit: 13_600_000, rate: 4.0 },
		{ limit: 14_950_000, rate: 5.0 },
		{ limit: 16_400_000, rate: 6.0 },
		{ limit: 18_450_000, rate: 7.0 },
		{ limit: 21_850_000, rate: 8.0 },
		{ limit: 26_000_000, rate: 9.0 },
		{ limit: 27_700_000, rate: 10.0 },
		{ limit: 29_350_000, rate: 11.0 },
		{ limit: 31_450_000, rate: 12.0 },
		{ limit: 33_950_000, rate: 13.0 },
		{ limit: 37_100_000, rate: 14.0 },
		{ limit: 41_100_000, rate: 15.0 },
		{ limit: 45_800_000, rate: 16.0 },
		{ limit: 49_500_000, rate: 17.0 },
		{ limit: 53_800_000, rate: 18.0 },
		{ limit: 58_500_000, rate: 19.0 },
		{ limit: 64_000_000, rate: 20.0 },
		{ limit: 73_700_000, rate: 21.0 },
		{ limit: 88_500_000, rate: 22.0 },
		{ limit: 117_000_000, rate: 23.0 },
		{ limit: 180_000_000, rate: 24.0 },
		{ limit: 218_200_000, rate: 25.0 },
		{ limit: 268_500_000, rate: 26.0 },
		{ limit: 347_000_000, rate: 27.0 },
		{ limit: 480_500_000, rate: 28.0 },
		{ limit: 735_500_000, rate: 29.0 },
		{ limit: 1_188_500_000, rate: 30.0 },
		{ limit: 1_962_000_000, rate: 31.0 },
		{ limit: 3_869_000_000, rate: 32.0 },
		{ limit: 9_336_000_000, rate: 33.0 },
		{ limit: Infinity, rate: 34.0 }
	],
	C: [
		{ limit: 6_600_000, rate: 0 },
		{ limit: 6_950_000, rate: 0.25 },
		{ limit: 7_350_000, rate: 0.5 },
		{ limit: 7_800_000, rate: 0.75 },
		{ limit: 8_850_000, rate: 1.0 },
		{ limit: 9_800_000, rate: 1.25 },
		{ limit: 10_950_000, rate: 1.5 },
		{ limit: 11_200_000, rate: 1.75 },
		{ limit: 11_600_000, rate: 2.0 },
		{ limit: 12_050_000, rate: 2.5 },
		{ limit: 13_200_000, rate: 3.0 },
		{ limit: 14_400_000, rate: 4.0 },
		{ limit: 15_900_000, rate: 5.0 },
		{ limit: 17_400_000, rate: 6.0 },
		{ limit: 19_600_000, rate: 7.0 },
		{ limit: 23_200_000, rate: 8.0 },
		{ limit: 26_500_000, rate: 9.0 },
		{ limit: 28_250_000, rate: 10.0 },
		{ limit: 30_050_000, rate: 11.0 },
		{ limit: 32_250_000, rate: 12.0 },
		{ limit: 34_850_000, rate: 13.0 },
		{ limit: 38_150_000, rate: 14.0 },
		{ limit: 42_350_000, rate: 15.0 },
		{ limit: 47_150_000, rate: 16.0 },
		{ limit: 51_050_000, rate: 17.0 },
		{ limit: 55_550_000, rate: 18.0 },
		{ limit: 60_450_000, rate: 19.0 },
		{ limit: 66_300_000, rate: 20.0 },
		{ limit: 76_400_000, rate: 21.0 },
		{ limit: 92_100_000, rate: 22.0 },
		{ limit: 122_000_000, rate: 23.0 },
		{ limit: 187_600_000, rate: 24.0 },
		{ limit: 226_600_000, rate: 25.0 },
		{ limit: 279_000_000, rate: 26.0 },
		{ limit: 361_500_000, rate: 27.0 },
		{ limit: 501_500_000, rate: 28.0 },
		{ limit: 771_000_000, rate: 29.0 },
		{ limit: 1_251_000_000, rate: 30.0 },
		{ limit: 2_072_000_000, rate: 31.0 },
		{ limit: 4_106_000_000, rate: 32.0 },
		{ limit: 9_940_000_000, rate: 33.0 },
		{ limit: Infinity, rate: 34.0 }
	]
};

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

	const brackets = [
		{ limit: 60_000_000, rate: 0.05 },
		{ limit: 190_000_000, rate: 0.15 }, // 250m - 60m
		{ limit: 250_000_000, rate: 0.25 }, // 500m - 250m
		{ limit: 4_500_000_000, rate: 0.3 }, // 5B - 500m
		{ limit: Infinity, rate: 0.35 }
	];

	for (const bracket of brackets) {
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
	// Limits
	const BPJS_KES_CAP = 12_000_000;
	const BPJS_JP_CAP = 10_042_300; // 2024 limit

	const baseForBpjs = income.baseSalary; // Usually just base salary, sometimes base + fixed allowance. Assuming base for simplicity.

	// Calculate BPJS
	const jhtCompany = bpjs.jht ? baseForBpjs * 0.037 : 0;
	const jhtEmployee = bpjs.jht ? baseForBpjs * 0.02 : 0;

	const jpBase = Math.min(baseForBpjs, BPJS_JP_CAP);
	const jpCompany = bpjs.jp ? jpBase * 0.02 : 0;
	const jpEmployee = bpjs.jp ? jpBase * 0.01 : 0;

	const kesBase = Math.min(baseForBpjs, BPJS_KES_CAP);
	const kesCompany = bpjs.kesehatan ? kesBase * 0.04 : 0;
	const kesEmployee = bpjs.kesehatan ? kesBase * 0.01 : 0;

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
		const biayaJabatan = Math.min(totalYearlyGross * 0.05, 6_000_000);
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

		// Iteratively find the exact tax allowance needed to cover the monthly tax
		while (diff > 0.01) {
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

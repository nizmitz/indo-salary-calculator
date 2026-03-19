<script lang="ts">
	import { calculateTax, TER_TABLES, type PTKPStatus, type BpjsToggles } from '$lib/tax-calculator';

	// Language state
	let lang = $state<'id' | 'en'>('id');

	let showTerModal = $state(false);

	const terCategoryMapping = {
		A: ['TK/0', 'TK/1', 'K/0'],
		B: ['TK/2', 'TK/3', 'K/1', 'K/2'],
		C: ['K/3']
	};

	const translations = {
		en: {
			title: 'Salary & Tax Calculator ID',
			subtitle: 'Calculate your monthly & yearly tax using the latest TER rules.',
			incomeDetails: 'Income Details',
			baseSalary: 'Base Salary',
			allowances: 'Fixed Allowances',
			insurance: 'Company Paid Additional Insurance',
			insuranceHint: 'E.g., external medical insurance. This will be added to your gross income.',
			includeThr: 'Include THR',
			includeBonus: 'Include Bonus',
			taxConfig: 'Tax Settings',
			ptkpStatus: 'Tax Relief Status (PTKP)',
			bpjsPart: 'BPJS Contributions',
			jht: 'Old Age Security (JHT)',
			jp: 'Pension Security (JP)',
			kes: 'Health Insurance (BPJS-K)',
			calcMethod: 'Tax Calculation Method',
			gross: 'Gross',
			grossDesc: 'Tax is deducted from your base salary.',
			grossUp: 'Gross-Up',
			grossUpDesc: 'Company provides a tax allowance to cover your tax.',
			estThp: 'Estimated Monthly Take Home Pay',
			monGross: 'Monthly Gross Income',
			monTax: 'Monthly Tax (PPh 21)',
			monBreakdown: 'Monthly Breakdown',
			grossAdditions: 'Gross Income Additions',
			thrIncluded: 'THR (Included this month)',
			bonusIncluded: 'Bonus (Included this month)',
			kesCompany: 'BPJS Kesehatan (Company 4%)',
			taxAllowance: 'Tax Allowance (Gross-up)',
			totalMonGross: 'Total Monthly Gross',
			deductions: 'Deductions from Take Home Pay',
			totalDeductions: 'Total Deductions',
			yearlyProj: 'Yearly Projection',
			yearlyProjSubtitle: 'Estimated total tax burden for the year including THR & Bonuses.',
			totalYearlyGross: 'Total Yearly Gross Income',
			estYearlyTax: 'Estimated Yearly PPh 21 Tax',
			note: 'Note: Monthly tax is withheld based on TER. True final tax is reconciled in December based on the progressive yearly calculation. If you receive bonuses/THR, you might owe more tax in December.',
			checkTer: 'Check TER Tables',
			close: 'Close',
			terTitle: 'TER Tax Rates (PP 58/2023)',
			category: 'Category',
			monthlyGross: 'Monthly Gross Income',
			taxRate: 'Tax Rate'
		},
		id: {
			title: 'Kalkulator Gaji & Pajak ID',
			subtitle: 'Hitung pajak bulanan & tahunan Anda menggunakan aturan TER terbaru.',
			incomeDetails: 'Detail Penghasilan',
			baseSalary: 'Gaji Pokok',
			allowances: 'Tunjangan Tetap',
			insurance: 'Asuransi Tambahan Dibayar Perusahaan',
			insuranceHint:
				'Misal, asuransi kesehatan eksternal. Nilai ini akan menambah penghasilan bruto Anda.',
			includeThr: 'Sertakan THR',
			includeBonus: 'Sertakan Bonus',
			taxConfig: 'Pengaturan Pajak',
			ptkpStatus: 'Status PTKP',
			bpjsPart: 'Kontribusi BPJS',
			jht: 'Jaminan Hari Tua (JHT)',
			jp: 'Jaminan Pensiun (JP)',
			kes: 'BPJS Kesehatan',
			calcMethod: 'Metode Perhitungan Pajak',
			gross: 'Gross',
			grossDesc: 'Pajak dipotong langsung dari gaji pokok Anda.',
			grossUp: 'Gross-Up',
			grossUpDesc: 'Perusahaan memberikan tunjangan pajak untuk menanggung pajak Anda.',
			estThp: 'Estimasi Take Home Pay Bulanan',
			monGross: 'Penghasilan Bruto Bulanan',
			monTax: 'Pajak Bulanan (PPh 21)',
			monBreakdown: 'Rincian Bulanan',
			grossAdditions: 'Tambahan Penghasilan Bruto',
			thrIncluded: 'THR (Termasuk bulan ini)',
			bonusIncluded: 'Bonus (Termasuk bulan ini)',
			kesCompany: 'BPJS Kesehatan (Perusahaan 4%)',
			taxAllowance: 'Tunjangan Pajak (Gross-up)',
			totalMonGross: 'Total Bruto Bulanan',
			deductions: 'Potongan dari Take Home Pay',
			totalDeductions: 'Total Potongan',
			yearlyProj: 'Proyeksi Tahunan',
			yearlyProjSubtitle: 'Estimasi total beban pajak setahun termasuk THR & Bonus.',
			totalYearlyGross: 'Total Penghasilan Bruto Tahunan',
			estYearlyTax: 'Estimasi PPh 21 Tahunan',
			note: 'Catatan: Pajak bulanan dipotong berdasarkan TER. Pajak akhir yang sebenarnya diselesaikan pada bulan Desember berdasarkan perhitungan tahunan progresif. Jika Anda menerima bonus/THR, Anda mungkin membayar pajak lebih besar di bulan Desember.',
			checkTer: 'Cek Tabel TER',
			close: 'Tutup',
			terTitle: 'Tarif Pajak TER (PP 58/2023)',
			category: 'Kategori',
			monthlyGross: 'Penghasilan Bruto Bulanan',
			taxRate: 'Tarif Pajak'
		}
	};

	let t = $derived(translations[lang]);

	// Form State
	let baseSalary = $state(10000000);
	let allowances = $state(0);
	let companyPaidInsurance = $state(0);

	let includeBonus = $state(false);
	let bonusAmount = $state(0);

	let includeThr = $state(false);
	let thrAmount = $state(0);

	let ptkpStatus: PTKPStatus = $state('TK/0');
	let isGrossUp = $state(false);

	let bpjsToggles: BpjsToggles = $state({
		jht: true,
		jp: true,
		kesehatan: true
	});

	const ptkpOptions: PTKPStatus[] = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];

	// Reactive computation
	let income = $derived({
		baseSalary: Number(baseSalary) || 0,
		allowances: Number(allowances) || 0,
		companyPaidInsurance: Number(companyPaidInsurance) || 0,
		bonus: includeBonus ? Number(bonusAmount) || 0 : 0,
		thr: includeThr ? Number(thrAmount) || 0 : 0
	});

	let result = $derived(calculateTax(income, ptkpStatus, bpjsToggles, isGrossUp));

	// Formatter for display
	const formatIDR = (value: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(Math.round(value));
	};

	// Formatter for input field (thousands separator only)
	const formatInput = (value: number) => {
		if (value === 0) return '0';
		return new Intl.NumberFormat('id-ID').format(value);
	};

	// Parser for input field (strips non-digits)
	const parseInput = (value: string) => {
		const digits = value.replace(/\D/g, '');
		if (!digits) return 0;
		return parseInt(digits, 10);
	};

	function handleInput(e: Event, setter: (val: number) => void) {
		const target = e.target as HTMLInputElement;
		const rawValue = target.value;
		const cursorPosition = target.selectionStart || 0;

		// 1. Calculate how many digits were before the cursor in the old value
		const beforeCursor = rawValue.slice(0, cursorPosition);
		const digitsBefore = beforeCursor.replace(/\D/g, '').length;

		// 2. Parse the new numeric value
		const parsed = parseInput(rawValue);
		setter(parsed);

		// 3. Format the value for display
		const formatted = formatInput(parsed);

		// 4. Update the input field value
		target.value = formatted;

		// 5. Restore cursor position based on digit count
		let newPos = 0;
		let digitsFound = 0;
		while (digitsFound < digitsBefore && newPos < formatted.length) {
			if (/\d/.test(formatted[newPos])) {
				digitsFound++;
			}
			newPos++;
		}

		target.setSelectionRange(newPos, newPos);
	}
</script>

<svelte:head>
	<title>{t.title}</title>
	<meta name="description" content={t.subtitle} />
	<meta property="og:title" content={t.title} />
	<meta property="og:description" content={t.subtitle} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl">
		<!-- Language Switcher & TER Button -->
		<div class="mb-4 flex items-center justify-between">
			<button
				onclick={() => (showTerModal = true)}
				class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				<svg
					class="mr-2 h-4 w-4 text-gray-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				{t.checkTer}
			</button>

			<div class="inline-flex rounded-md shadow-sm">
				<button
					onclick={() => (lang = 'id')}
					class="rounded-l-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium {lang ===
					'id'
						? 'bg-blue-50 text-blue-600'
						: 'text-gray-700 hover:bg-gray-50'}"
				>
					Indonesia
				</button>
				<button
					onclick={() => (lang = 'en')}
					class="rounded-r-md border-y border-r border-gray-300 bg-white px-3 py-1 text-xs font-medium {lang ===
					'en'
						? 'bg-blue-50 text-blue-600'
						: 'text-gray-700 hover:bg-gray-50'}"
				>
					English
				</button>
			</div>
		</div>

		<div class="mb-10 text-center">
			<div class="mb-4 flex justify-center">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-10 w-10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
						/>
						<path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
						<circle cx="10" cy="11" r="1" />
						<circle cx="14" cy="15" r="1" />
						<path d="M10 15l4-4" />
					</svg>
				</div>
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
				{t.title}
			</h1>
			<p class="mt-4 text-lg text-gray-500">
				{t.subtitle}
			</p>
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
			<!-- Left Column: Inputs -->
			<div class="space-y-6 lg:col-span-5">
				<div class="overflow-hidden bg-white p-6 shadow sm:rounded-lg">
					<h2 class="mb-4 text-lg leading-6 font-medium text-gray-900">{t.incomeDetails}</h2>

					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700" for="base-salary"
								>{t.baseSalary}</label
							>
							<div class="relative mt-1 rounded-md shadow-sm">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<span class="text-gray-500 sm:text-sm">Rp</span>
								</div>
								<input
									id="base-salary"
									type="text"
									value={formatInput(baseSalary)}
									oninput={(e) => handleInput(e, (v) => (baseSalary = v))}
									class="block w-full rounded-md border border-gray-300 py-2 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
									placeholder="0"
								/>
							</div>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700" for="allowances"
								>{t.allowances}</label
							>
							<div class="relative mt-1 rounded-md shadow-sm">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<span class="text-gray-500 sm:text-sm">Rp</span>
								</div>
								<input
									id="allowances"
									type="text"
									value={formatInput(allowances)}
									oninput={(e) => handleInput(e, (v) => (allowances = v))}
									class="block w-full rounded-md border border-gray-300 py-2 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
									placeholder="0"
								/>
							</div>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700" for="insurance"
								>{t.insurance}</label
							>
							<div class="relative mt-1 rounded-md shadow-sm">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<span class="text-gray-500 sm:text-sm">Rp</span>
								</div>
								<input
									id="insurance"
									type="text"
									value={formatInput(companyPaidInsurance)}
									oninput={(e) => handleInput(e, (v) => (companyPaidInsurance = v))}
									class="block w-full rounded-md border border-gray-300 py-2 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
									placeholder="0"
								/>
							</div>
							<p class="mt-1 text-xs text-gray-500 italic">
								{t.insuranceHint}
							</p>
						</div>

						<hr class="my-4" />

						<div class="flex items-center">
							<input
								id="thr-check"
								type="checkbox"
								bind:checked={includeThr}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<label class="ml-2 text-sm font-medium text-gray-700" for="thr-check"
								>{t.includeThr}</label
							>
						</div>
						{#if includeThr}
							<div class="relative mt-2 rounded-md shadow-sm">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<span class="text-gray-500 sm:text-sm">Rp</span>
								</div>
								<input
									type="text"
									value={formatInput(thrAmount)}
									oninput={(e) => handleInput(e, (v) => (thrAmount = v))}
									class="block w-full rounded-md border border-gray-300 py-2 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
									placeholder="0"
								/>
							</div>
						{/if}

						<div class="mt-4 flex items-center">
							<input
								id="bonus-check"
								type="checkbox"
								bind:checked={includeBonus}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<label class="ml-2 text-sm font-medium text-gray-700" for="bonus-check"
								>{t.includeBonus}</label
							>
						</div>
						{#if includeBonus}
							<div class="relative mt-2 rounded-md shadow-sm">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<span class="text-gray-500 sm:text-sm">Rp</span>
								</div>
								<input
									type="text"
									value={formatInput(bonusAmount)}
									oninput={(e) => handleInput(e, (v) => (bonusAmount = v))}
									class="block w-full rounded-md border border-gray-300 py-2 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
									placeholder="0"
								/>
							</div>
						{/if}
					</div>
				</div>

				<div class="overflow-hidden bg-white p-6 shadow sm:rounded-lg">
					<h2 class="mb-4 text-lg leading-6 font-medium text-gray-900">{t.taxConfig}</h2>

					<div class="space-y-6">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700" for="ptkp-select"
								>{t.ptkpStatus}</label
							>
							<select
								id="ptkp-select"
								bind:value={ptkpStatus}
								class="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
							>
								{#each ptkpOptions as option (option)}
									<option value={option}>{option}</option>
								{/each}
							</select>
						</div>

						<div>
							<span class="mb-2 block text-sm font-medium text-gray-700">{t.bpjsPart}</span>
							<div class="space-y-3">
								<label class="group flex cursor-pointer items-center">
									<input
										type="checkbox"
										bind:checked={bpjsToggles.jht}
										class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm text-gray-600 group-hover:text-gray-900">{t.jht}</span>
								</label>
								<label class="group flex cursor-pointer items-center">
									<input
										type="checkbox"
										bind:checked={bpjsToggles.jp}
										class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm text-gray-600 group-hover:text-gray-900">{t.jp}</span>
								</label>
								<label class="group flex cursor-pointer items-center">
									<input
										type="checkbox"
										bind:checked={bpjsToggles.kesehatan}
										class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm text-gray-600 group-hover:text-gray-900">{t.kes}</span>
								</label>
							</div>
						</div>

						<div class="pt-2">
							<span class="mb-3 block text-sm font-medium text-gray-700">{t.calcMethod}</span>
							<div class="space-y-4">
								<label
									class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none {!isGrossUp
										? 'border-blue-500 ring-1 ring-blue-500'
										: 'border-gray-300'}"
								>
									<input
										type="radio"
										name="calc-method"
										value={false}
										checked={!isGrossUp}
										onchange={() => (isGrossUp = false)}
										class="sr-only"
									/>
									<div class="mr-3 flex h-5 items-center">
										<div
											class="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 {!isGrossUp
												? 'border-blue-600 bg-blue-600'
												: 'bg-white'}"
										>
											{#if !isGrossUp}
												<div class="h-1.5 w-1.5 rounded-full bg-white"></div>
											{/if}
										</div>
									</div>
									<div class="flex flex-1">
										<div class="flex flex-col">
											<span class="block text-sm font-bold text-gray-900">{t.gross}</span>
											<span class="mt-1 flex items-center text-xs text-gray-500">{t.grossDesc}</span
											>
										</div>
									</div>
								</label>

								<label
									class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none {isGrossUp
										? 'border-blue-500 ring-1 ring-blue-500'
										: 'border-gray-300'}"
								>
									<input
										type="radio"
										name="calc-method"
										value={true}
										checked={isGrossUp}
										onchange={() => (isGrossUp = true)}
										class="sr-only"
									/>
									<div class="mr-3 flex h-5 items-center">
										<div
											class="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 {isGrossUp
												? 'border-blue-600 bg-blue-600'
												: 'bg-white'}"
										>
											{#if isGrossUp}
												<div class="h-1.5 w-1.5 rounded-full bg-white"></div>
											{/if}
										</div>
									</div>
									<div class="flex flex-1">
										<div class="flex flex-col">
											<span class="block text-sm font-bold text-gray-900">{t.grossUp}</span>
											<span class="mt-1 flex items-center text-xs text-gray-500"
												>{t.grossUpDesc}</span
											>
										</div>
									</div>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Results -->
			<div class="space-y-6 lg:col-span-7">
				<!-- Summary Card -->
				<div
					class="overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg"
				>
					<div class="p-6">
						<h3 class="text-lg font-medium opacity-90">{t.estThp}</h3>
						<div class="mt-2 text-4xl font-extrabold">{formatIDR(result.takeHomePayMonthly)}</div>
						<div
							class="mt-4 grid grid-cols-2 gap-4 border-t border-blue-500 pt-4 text-sm opacity-80"
						>
							<div>
								<span class="block text-xs">{t.monGross}</span>
								<span class="text-base font-semibold text-white"
									>{formatIDR(result.grossIncomeMonthly)}</span
								>
							</div>
							<div>
								<span class="block text-xs">{t.monTax}</span>
								<span class="text-base font-semibold text-white"
									>{formatIDR(result.taxMonthly)}</span
								>
							</div>
						</div>
					</div>
				</div>

				<!-- Detail Breakdown -->
				<div class="overflow-hidden bg-white shadow sm:rounded-lg">
					<div
						class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-5"
					>
						<h3 class="text-lg leading-6 font-medium text-gray-900">{t.monBreakdown}</h3>
						<span
							class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
						>
							TER Category {result.terCategory} ({result.terRate}%)
						</span>
					</div>
					<div class="px-6 py-5">
						<dl class="space-y-4">
							<!-- Income -->
							<div>
								<dt class="text-sm font-medium text-gray-500">{t.grossAdditions}</dt>
								<dd class="mt-1 space-y-2 text-sm text-gray-900">
									<div class="flex justify-between">
										<span>{t.baseSalary.split(' (')[0]}</span>
										<span>{formatIDR(income.baseSalary)}</span>
									</div>
									{#if income.allowances > 0}<div class="flex justify-between">
											<span>{t.allowances.split(' (')[0]}</span>
											<span>{formatIDR(income.allowances)}</span>
										</div>{/if}
									{#if income.companyPaidInsurance > 0}<div class="flex justify-between">
											<span>{t.insurance.split(' (')[0]}</span>
											<span>{formatIDR(income.companyPaidInsurance)}</span>
										</div>{/if}
									{#if income.thr > 0}<div class="flex justify-between font-medium text-blue-600">
											<span>{t.thrIncluded}</span> <span>{formatIDR(income.thr)}</span>
										</div>{/if}
									{#if income.bonus > 0}<div class="flex justify-between font-medium text-blue-600">
											<span>{t.bonusIncluded}</span>
											<span>{formatIDR(income.bonus)}</span>
										</div>{/if}
									{#if result.bpjs.kesehatanCompany > 0}<div class="flex justify-between">
											<span>{t.kesCompany}</span>
											<span>{formatIDR(result.bpjs.kesehatanCompany)}</span>
										</div>{/if}
									{#if isGrossUp}<div class="flex justify-between font-medium text-blue-600">
											<span>{t.taxAllowance}</span>
											<span>{formatIDR(result.taxMonthly)}</span>
										</div>{/if}
									<div class="flex justify-between border-t border-gray-100 pt-2 font-bold">
										<span>{t.totalMonGross}</span>
										<span>{formatIDR(result.grossIncomeMonthly)}</span>
									</div>
								</dd>
							</div>

							<hr class="border-gray-200" />

							<!-- Deductions -->
							<div>
								<dt class="text-sm font-medium text-gray-500">{t.deductions}</dt>
								<dd class="mt-1 space-y-2 text-sm text-gray-900">
									{#if result.bpjs.jhtEmployee > 0}<div class="flex justify-between">
											<span>{t.jht} (2%)</span>
											<span>-{formatIDR(result.bpjs.jhtEmployee)}</span>
										</div>{/if}
									{#if result.bpjs.jpEmployee > 0}<div class="flex justify-between">
											<span>{t.jp} (1%)</span>
											<span>-{formatIDR(result.bpjs.jpEmployee)}</span>
										</div>{/if}
									{#if result.bpjs.kesehatanEmployee > 0}<div class="flex justify-between">
											<span>{t.kes} (1%)</span>
											<span>-{formatIDR(result.bpjs.kesehatanEmployee)}</span>
										</div>{/if}
									<div class="flex justify-between font-medium text-red-600">
										<span>{t.monTax}</span> <span>-{formatIDR(result.taxMonthly)}</span>
									</div>
									<div class="flex justify-between border-t border-gray-100 pt-2 font-bold">
										<span>{t.totalDeductions}</span>
										<span>-{formatIDR(result.totalDeductionsMonthly)}</span>
									</div>
								</dd>
							</div>
						</dl>
					</div>
				</div>

				<!-- Yearly Summary -->
				<div class="overflow-hidden bg-white shadow sm:rounded-lg">
					<div class="border-b border-gray-200 bg-gray-50 px-6 py-5">
						<h3 class="text-lg leading-6 font-medium text-gray-900">{t.yearlyProj}</h3>
						<p class="mt-1 max-w-2xl text-sm text-gray-500">
							{t.yearlyProjSubtitle}
						</p>
					</div>
					<div class="px-6 py-5">
						<dl class="space-y-4 text-sm text-gray-900">
							<div class="flex justify-between">
								<span>{t.totalYearlyGross}</span>
								<span class="font-medium">{formatIDR(result.grossIncomeYearly)}</span>
							</div>
							<div class="flex justify-between">
								<span>{t.estYearlyTax}</span>
								<span class="font-bold text-red-600">{formatIDR(result.taxYearly)}</span>
							</div>
							<div class="flex justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
								<span>{t.note}</span>
							</div>
						</dl>
					</div>
				</div>
			</div>
		</div>

		<footer class="mt-16 border-t border-gray-200 pt-8 pb-12 text-center">
			<p class="text-sm text-gray-500">
				&copy; {new Date().getFullYear()}
				<a href="https://nizmitz.com" class="font-medium text-blue-600 hover:text-blue-500"
					>nizmitz.com</a
				>. All rights reserved.
			</p>
			<div class="mt-4 flex justify-center space-x-6">
				<a href="https://github.com/nizmitz" class="text-gray-400 hover:text-gray-500">
					<span class="sr-only">GitHub</span>
					<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
							clip-rule="evenodd"
						/>
					</svg>
				</a>
				<a
					href="https://www.linkedin.com/in/fattah-emir-yanuar-7a1982173/"
					class="text-gray-400 hover:text-gray-500"
				>
					<span class="sr-only">LinkedIn</span>
					<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
						/>
					</svg>
				</a>
			</div>
		</footer>
	</div>
</div>

{#if showTerModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div class="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
			<div class="flex items-center justify-between border-b border-gray-100 p-6">
				<h3 class="text-xl font-bold text-gray-900">{t.terTitle}</h3>
				<button
					onclick={() => (showTerModal = false)}
					class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div
				class="grid max-h-[70vh] grid-cols-1 gap-6 overflow-y-auto bg-gray-50/30 p-6 md:grid-cols-3"
			>
				{#each ['A', 'B', 'C'] as cat (cat)}
					<div class="flex flex-col space-y-3">
						<div class="sticky top-0 z-10 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
							<h4
								class="flex items-center text-sm font-bold tracking-wider text-blue-600 uppercase"
							>
								<span
									class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs"
									>{cat}</span
								>
								{t.category}
								{cat}
							</h4>
							<p class="mt-2 text-[10px] font-medium text-gray-400">
								PTKP: {terCategoryMapping[cat as keyof typeof terCategoryMapping].join(', ')}
							</p>
						</div>

						<div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
							<table class="min-w-full divide-y divide-gray-100">
								<thead class="bg-gray-50">
									<tr>
										<th
											class="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase"
											>{t.monthlyGross}</th
										>
										<th
											class="px-3 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase"
											>{t.taxRate}</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-50">
									{#each TER_TABLES[cat as keyof typeof TER_TABLES] as row, i (row.limit)}
										<tr class="transition-colors hover:bg-blue-50/30">
											<td class="px-3 py-2 text-[10px] whitespace-nowrap text-gray-600">
												{#if i === 0}
													≤ {formatIDR(row.limit)}
												{:else if row.limit === Infinity}
													> {formatIDR(TER_TABLES[cat as keyof typeof TER_TABLES][i - 1].limit)}
												{:else}
													{formatIDR(TER_TABLES[cat as keyof typeof TER_TABLES][i - 1].limit + 1)} - {formatIDR(
														row.limit
													)}
												{/if}
											</td>
											<td
												class="px-3 py-2 text-right text-xs font-bold whitespace-nowrap text-gray-900"
												>{row.rate}%</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/each}
			</div>

			<div class="flex justify-end rounded-b-2xl border-t border-gray-100 bg-gray-50/50 p-6">
				<button
					onclick={() => (showTerModal = false)}
					class="rounded-lg bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
				>
					{t.close}
				</button>
			</div>
		</div>
	</div>
{/if}

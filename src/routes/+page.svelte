<script lang="ts">
	import { onMount } from 'svelte';
	import {
		calculateTax,
		BPJS,
		formatRatePercent,
		type PTKPStatus,
		type BpjsToggles
	} from '$lib/tax-calculator';
	import { hasStateInHash, fromHashFragment, toHashFragment } from '$lib/url-state';
	import { translations, type Lang } from '$lib/i18n';
	import { formatIDR } from '$lib/format';
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import TerModal from '$lib/components/TerModal.svelte';

	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

	// Language state
	let lang = $state<Lang>('id');

	let showTerModal = $state(false);
	let showShareToast = $state(false);
	let isHydrated = $state(false);

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

	// Hydrate from URL hash on mount
	onMount(() => {
		const hash = window.location.hash;
		if (hasStateInHash(hash)) {
			const state = fromHashFragment(hash);
			baseSalary = state.baseSalary;
			allowances = state.allowances;
			companyPaidInsurance = state.companyPaidInsurance;
			includeThr = state.includeThr;
			thrAmount = state.thrAmount;
			includeBonus = state.includeBonus;
			bonusAmount = state.bonusAmount;
			ptkpStatus = state.ptkpStatus;
			bpjsToggles = state.bpjsToggles;
			isGrossUp = state.isGrossUp;
			lang = state.lang;
		}
		isHydrated = true;
	});

	// Reactively update URL hash when state changes
	$effect(() => {
		if (!isHydrated) return;
		const hash = toHashFragment({
			baseSalary,
			allowances,
			companyPaidInsurance,
			includeThr,
			thrAmount,
			includeBonus,
			bonusAmount,
			ptkpStatus,
			bpjsToggles,
			isGrossUp,
			lang
		});
		const newUrl = hash ? `${window.location.pathname}${hash}` : window.location.pathname;
		history.replaceState(null, '', newUrl);
	});

	async function shareLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			showShareToast = true;
			setTimeout(() => (showShareToast = false), 2000);
		} catch {
			// Fallback for older browsers
			const input = document.createElement('input');
			input.value = window.location.href;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
			showShareToast = true;
			setTimeout(() => (showShareToast = false), 2000);
		}
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
							<CurrencyInput id="base-salary" bind:value={baseSalary} />
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700" for="allowances"
								>{t.allowances}</label
							>
							<CurrencyInput id="allowances" bind:value={allowances} />
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700" for="insurance"
								>{t.insurance}</label
							>
							<CurrencyInput id="insurance" bind:value={companyPaidInsurance} />
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
							<CurrencyInput bind:value={thrAmount} />
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
							<CurrencyInput bind:value={bonusAmount} />
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
					class="overflow-hidden rounded-lg bg-linear-to-br from-blue-600 to-blue-800 text-white shadow-lg"
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
						<div class="mt-4 flex items-center justify-between border-t border-blue-500 pt-4">
							<button
								onclick={shareLink}
								class="inline-flex items-center rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-blue-600 focus:outline-none"
							>
								<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
									/>
								</svg>
								{t.share}
							</button>
							{#if showShareToast}
								<span
									class="animate-fade-in rounded-full bg-green-400/20 px-3 py-1 text-xs font-medium text-green-100"
								>
									✓ {t.copied}
								</span>
							{/if}
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
											<span>{t.kesCompany} ({formatRatePercent(BPJS.kesehatan.companyRate)})</span>
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
											<span>{t.jht} ({formatRatePercent(BPJS.jht.employeeRate)})</span>
											<span>-{formatIDR(result.bpjs.jhtEmployee)}</span>
										</div>{/if}
									{#if result.bpjs.jpEmployee > 0}<div class="flex justify-between">
											<span>{t.jp} ({formatRatePercent(BPJS.jp.employeeRate)})</span>
											<span>-{formatIDR(result.bpjs.jpEmployee)}</span>
										</div>{/if}
									{#if result.bpjs.kesehatanEmployee > 0}<div class="flex justify-between">
											<span>{t.kes} ({formatRatePercent(BPJS.kesehatan.employeeRate)})</span>
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
			<div class="mt-6 flex justify-center">
				<div
					class="cf-turnstile"
					data-sitekey={PUBLIC_TURNSTILE_SITE_KEY}
					data-theme="light"
					data-size="normal"
				></div>
			</div>
			<div class="mt-6 flex justify-center space-x-6">
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

<TerModal bind:open={showTerModal} {t} />

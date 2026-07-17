<script lang="ts">
	import { TER_TABLES } from '$lib/tax-calculator';
	import { formatIDR } from '$lib/format';
	import type { Translations } from '$lib/i18n';

	let { open = $bindable(false), t }: { open?: boolean; t: Translations } = $props();

	const terCategoryMapping = {
		A: ['TK/0', 'TK/1', 'K/0'],
		B: ['TK/2', 'TK/3', 'K/1', 'K/2'],
		C: ['K/3']
	};
</script>

<svelte:window
	onkeydown={(e) => {
		if (open && e.key === 'Escape') open = false;
	}}
/>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => {
			if (e.target === e.currentTarget) open = false;
		}}
		onkeydown={(e) => {
			if (e.target === e.currentTarget && e.key === 'Escape') open = false;
		}}
	>
		<div
			class="flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-gray-100 p-6">
				<h3 class="text-xl font-bold text-gray-900">{t.terTitle}</h3>
				<button
					onclick={() => (open = false)}
					aria-label="Close"
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
				class="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto bg-gray-50/30 p-6 md:grid-cols-3 md:overflow-hidden"
			>
				{#each ['A', 'B', 'C'] as cat (cat)}
					<div class="space-y-3 md:flex md:min-h-0 md:flex-col">
						<div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
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

						<div
							class="h-[45vh] min-h-0 overflow-x-auto overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-sm md:h-auto md:max-h-none md:flex-1"
						>
							<table class="min-w-full divide-y divide-gray-100">
								<thead class="sticky top-0 z-10 bg-gray-50">
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

			<div
				class="flex shrink-0 justify-end rounded-b-2xl border-t border-gray-100 bg-gray-50/50 p-6"
			>
				<button
					onclick={() => (open = false)}
					class="rounded-lg bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
				>
					{t.close}
				</button>
			</div>
		</div>
	</div>
{/if}

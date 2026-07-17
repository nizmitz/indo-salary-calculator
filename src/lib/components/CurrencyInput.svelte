<script lang="ts">
	let {
		value = $bindable(0),
		id = undefined,
		placeholder = '0'
	}: { value?: number; id?: string; placeholder?: string } = $props();

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

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const rawValue = target.value;
		const cursorPosition = target.selectionStart || 0;

		// 1. Calculate how many digits were before the cursor in the old value
		const beforeCursor = rawValue.slice(0, cursorPosition);
		const digitsBefore = beforeCursor.replace(/\D/g, '').length;

		// 2. Parse the new numeric value
		const parsed = parseInput(rawValue);
		value = parsed;

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

<div class="relative mt-1 rounded-md shadow-sm">
	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
		<span class="text-gray-500 sm:text-sm">Rp</span>
	</div>
	<input
		{id}
		type="text"
		value={formatInput(value)}
		oninput={handleInput}
		class="block w-full rounded-md border border-gray-300 py-2 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
		{placeholder}
	/>
</div>

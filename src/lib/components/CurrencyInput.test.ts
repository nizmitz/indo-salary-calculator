import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import CurrencyInput from './CurrencyInput.svelte';

describe('CurrencyInput', () => {
	it('renders id-ID thousands grouping for the initial value', () => {
		const { getByRole } = render(CurrencyInput, { value: 10_000_000 });
		const input = getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('10.000.000');
	});

	it('updates the displayed value when typing', async () => {
		const { getByRole } = render(CurrencyInput, { value: 0 });
		const input = getByRole('textbox') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: '5000000' } });
		expect(input.value).toBe('5.000.000');
	});

	it('strips non-digit characters from typed input', async () => {
		const { getByRole } = render(CurrencyInput, { value: 0 });
		const input = getByRole('textbox') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: 'abc123xyz456' } });
		expect(input.value).toBe('123.456');
	});
});

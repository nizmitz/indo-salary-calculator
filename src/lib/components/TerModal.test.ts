import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import TerModal from './TerModal.svelte';
import { translations } from '../i18n';

describe('TerModal', () => {
	it('renders nothing when closed', () => {
		const { container } = render(TerModal, { open: false, t: translations.en });
		expect(container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('renders 3 category headings and table headers when open', () => {
		const { container, getAllByText } = render(TerModal, { open: true, t: translations.en });

		expect(container.querySelectorAll('h4').length).toBe(3);
		expect(getAllByText(translations.en.monthlyGross).length).toBe(3);
		expect(getAllByText(translations.en.taxRate).length).toBe(3);
	});
});

# Salary & Tax Calculator ID (indo-salary-calculator)

A frontend-only web application to calculate Indonesia PPh 21 tax, BPJS contributions, and take-home pay. Specifically designed for the latest **TER (Tarif Efektif Rata-Rata)** rules.

Hosted at: [salary.nizmitz.com](https://salary.nizmitz.com)

## Features

- **PPh 21 Calculation**: Supports both **Gross** (employee pays tax) and **Gross-up** (employer pays tax) methods.
- **Latest Tax Rules**: Implements the 2024 TER (Tarif Efektif Rata-Rata) categories (A, B, C) and monthly withholding rates.
- **BPJS Contributions**:
  - BPJS Ketenagakerjaan: JHT (2% employee, 3.7% employer) and JP (1% employee, 2% employer with caps).
  - BPJS Kesehatan: 1% employee, 4% employer with caps.
- **Irregular Income**: Easily include **THR** and **Bonus** in your monthly calculation to see the impact on withholding tax and take-home pay.
- **Company Benefits**: Add company-paid insurance or other taxable benefits to your gross income.
- **Yearly Projection**: See an estimate of your total annual tax burden and December reconciliation.
- **Security**: 100% frontend calculation. No data is sent to any server. Built with Svelte 5 for built-in XSS protection.

## Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (Runes)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting/Formatting**: ESLint & Prettier

## Development

### Prerequisites

- Node.js (v20 or later recommended)
- npm

### Installation

```bash
npm install
```

### Commands

- `npm run dev`: Start local development server.
- `npm run build`: Build for production.
- `npm test`: Run unit tests.
- `npm run lint`: Run ESLint and Prettier checks.
- `npm run format`: Format code with Prettier.

### Git Hooks

This project uses **Husky** and **lint-staged**. On every commit, it will:

1. Run ESLint and Prettier on staged files.
2. Run all unit tests to ensure no regressions.

## Security

- No `@html` usage in Svelte templates.
- All numeric inputs are sanitized and parsed safely.
- No backend required; your financial data stays in your browser.

## License

MIT

---

Maintained by [nizmitz.com](https://nizmitz.com)

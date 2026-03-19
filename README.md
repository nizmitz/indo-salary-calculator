# Salary & Tax Calculator ID (indo-salary-calculator)

A modern, frontend-only web application designed to help Indonesian employees and employers calculate PPh 21 tax, BPJS contributions, and take-home pay with precision. Built with the latest **2024 TER (Tarif Efektif Rata-Rata)** tax rules.

Live Site: [salary.nizmitz.com](https://salary.nizmitz.com)

## ✨ Features

- **PPh 21 Precision**: Supports both **Gross** (employee pays tax) and **Gross-up** (employer provides tax allowance) methods.
- **2024 TER Rules**: Fully implements the latest Indonesian tax categories (A, B, C) and monthly withholding rates.
- **BPJS Integration**:
  - **BPJS Ketenagakerjaan**: Includes JHT (Jaminan Hari Tua) and JP (Jaminan Pensiun) with current caps.
  - **BPJS Kesehatan**: Comprehensive health insurance calculation for both employer and employee.
- **Irregular Income**: Seamlessly include **THR** and **Bonus** in your calculations. The engine automatically adjusts the TER rate for that specific high-income month.
- **Localization**: Full support for **Indonesia** and **English** languages.
- **User Experience**:
  - **Interactive Formatting**: IDR amounts are automatically formatted with thousands separators as you type.
  - **Responsive Design**: Clean, modern interface built with Tailwind CSS 4.
- **Security & Privacy**: 100% client-side calculation. Your financial data never leaves your browser.

## 🛠 Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (using modern Runes)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Runtime/Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Automation**: GitHub Actions

## 🚀 CI/CD & Security

This project follows professional DevOps practices:

- **Automated Testing**: Every push runs unit tests and build checks.
- **Automatic Deployment**: Merges to `master` are instantly deployed to Cloudflare Pages.
- **Code Scanning**: Integrated **GitHub CodeQL** for continuous security analysis.
- **Secret Scanning**: Automated **Gitleaks** scans to prevent credential leakage.
- **Dependabot**: Weekly automated dependency and GitHub Action updates.
- **Git Hooks**: **Husky** ensures all commits pass linting and unit tests locally.

## 💻 Development

### Prerequisites

- Node.js (v24 or later recommended)
- npm

### Installation

```bash
npm install
```

### Commands

| Command          | Description                                |
| :--------------- | :----------------------------------------- |
| `npm run dev`    | Start local development server             |
| `npm run build`  | Build the production application           |
| `npm test`       | Run unit tests with Vitest                 |
| `npm run lint`   | Check for linting and formatting errors    |
| `npm run format` | Automatically fix formatting with Prettier |

## 🛡 Security Policy

For detailed information on supported versions and how to report vulnerabilities, please see our [SECURITY.md](./SECURITY.md).

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

Created and maintained by [nizmitz.com](https://nizmitz.com)

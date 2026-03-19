## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, tailwindcss, sveltekit-adapter

---

# PPh21 & BPJS Tax Calculator (Indo Resume Calculator)

## Status

- Core tax logic and Svelte 5 (Runes) UI implemented.
- Added BPJS, PTKP, TER rate mapping, Gross-up logic, and yearly summary.
- **Fixed:** `kesehatanEmployee` undefined error and `takeHomePayMonthly` calculation in gross-up mode.
- **Improved:** Added unit tests with Vitest, ESLint/Prettier formatting, and GitHub Action for CI.
- **Renamed:** Project renamed to `indo-resume-calculator`.

## Architecture

- Frontend-only SvelteKit 5 application.
- `src/lib/tax-calculator.ts`: Core logic for PPh21 and BPJS calculations.
- `src/routes/+page.svelte`: Main UI for inputs, toggles, and results display.
- Deployment via Cloudflare Pages (adapter-cloudflare).
- Testing with Vitest.

## Tasks

- [x] Scaffold project.
- [x] Implement `src/lib/tax-calculator.ts` with BPJS, PTKP, TER, and yearly tax calculation.
- [x] Implement UI in `src/routes/+page.svelte`.
- [x] Fix `kesehatanEmployee` undefined bug.
- [x] Add unit tests for core tax logic.
- [x] Configure ESLint and Prettier for code quality.
- [x] Add GitHub Action for CI (test and build).
- [x] Rename project to `indo-resume-calculator`.
- [x] Verify build for Cloudflare Pages.

## Security Considerations

- **XSS Protection:** Svelte 5's template syntax automatically escapes all dynamic content. No `@html` is used in the project.
- **Input Validation:** All user inputs are cast to Numbers before calculation to prevent injection or logic errors.
- **Frontend-only:** No sensitive data is sent to any backend; all calculations are local.

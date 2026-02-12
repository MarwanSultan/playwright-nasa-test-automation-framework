# 🚀 Playwright NASA Test Automation Framework

End-to-end test automation framework built with **Playwright** to validate critical functionality, performance, accessibility, and security of **https://www.nasa.gov/**.

This project demonstrates a **production-ready SDET architecture** with:

* Cross-browser UI testing
* Accessibility auditing
* Performance checks
* Security scanning
* CI/CD integration with GitHub Actions

---

## 📌 Scope

The framework validates core website behavior across desktop and mobile environments:

### Covered Areas

* Homepage & primary navigation
* Search functionality
* News / article pages
* Multimedia (video & images)
* Accessibility (WCAG AA basics)
* Responsive behavior
* Performance & SEO signals
* Security checks

### Target Environments

* Chrome, Firefox, Safari
* iOS Safari / Android Chrome
* Multiple viewport sizes
* Slow network simulation (3G)

---

## 🧰 Tech Stack

| Tool           | Purpose                           |
| -------------- | --------------------------------- |
| Playwright     | Browser automation                |
| Lighthouse     | Performance metrics               |
| axe / Pa11y    | Accessibility testing             |
| GitHub Actions | CI/CD pipeline                    |
| CodeQL         | Static security analysis          |
| npm audit      | Dependency vulnerability scanning |
| Gitleaks       | Secret detection                  |

---

## 📂 Project Structure (typical)

```
.
├── tests/                # Playwright test specs
├── playwright.config.ts # Playwright configuration
├── package.json
├── .github/workflows/   # CI pipeline
└── playwright-report/   # Generated HTML reports
```

---

## ⚙️ Installation

### 1. Clone

```bash
git clone https://github.com/MarwanSultan/playwright-nasa-test-automation-framework.git
cd playwright-nasa-test-automation-framework
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install Playwright browsers

```bash
npx playwright install --with-deps
```

---

## ▶️ Running Tests Locally

### Run all tests

```bash
npx playwright test
```

### Run in headed mode

```bash
npx playwright test --headed
```

### Run specific file

```bash
npx playwright test tests/search.spec.ts
```

### Open HTML report

```bash
npx playwright show-report
```

---

## 🧪 Test Coverage

### Homepage & Navigation

* Page loads successfully
* Hero content renders
* Navigation & footer links return HTTP 200
* Correct page headings

### Search

* Relevant results
* Empty/malformed queries handled
* No server errors
* Injection-safe inputs

### Articles

* Headline, author, metadata
* Images load
* Social sharing
* Open Graph / Twitter tags
* Graceful 404 handling

### Multimedia

* Video play/pause/seek
* Captions
* Full-screen
* Image downloads (HTTP 200 + correct MIME)

### Accessibility

* axe/Pa11y audits
* Keyboard navigation
* ARIA/semantic markup
* Color contrast

### Performance & SEO

* Lighthouse metrics (FCP, TTI, load time)
* Canonical/meta tags
* Robots compliance

---

## 🔐 CI/CD Pipeline (GitHub Actions)

This project includes a **two-stage automated pipeline** that runs on:

* push → `main` or `master`
* pull requests → `main` or `master`

### Stage 1 — Security Checks

Runs first and blocks tests if issues are found.

Includes:

* npm dependency audit (fails on high+ severity)
* Gitleaks secret scanning
* CodeQL static analysis
* Least-privilege permissions

### Stage 2 — Playwright Tests

Runs only if security passes.

Steps:

* Setup Node (LTS)
* Cache npm dependencies
* Install browsers
* Execute tests headless
* Upload HTML report as artifact

### Artifacts

After each run:

* `playwright-report/` uploaded
* Retained for 30 days

You can download the report directly from the GitHub Actions run page.

---

## 🚦 Concurrency

To save CI time:

* Previous runs are automatically cancelled when new commits are pushed to the same branch.

---

## 📊 Example Commands for CI parity

Run exactly like CI:

```bash
npm ci
npx playwright install --with-deps
npx playwright test
```

---

## 🎯 Goals of This Framework

* Demonstrate real-world SDET practices
* Provide maintainable, scalable test design
* Catch regressions early in CI
* Enforce security + quality gates
* Deliver reliable, fast feedback

---

## 🤝 Contributing

1. Create feature branch
2. Add/modify tests
3. Open PR
4. All security + tests must pass before merge

---

## 📄 License

MIT

```
```

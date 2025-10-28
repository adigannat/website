Mission
-------
Design and ship a handcrafted, high-performance portfolio for Aditya Ganesh. The site must highlight projects, GitHub activity, and in-depth case studies. Deploy to Cloudflare Pages with minimal JavaScript, production-grade quality, and verifiable Proof (Core Web Vitals, accessibility, SEO, security headers).

Global Principles
-----------------
- **Performance**: LCP <= 2.5 s, INP < 200 ms, CLS <= 0.1 on every key page.
- **Accessibility**: WCAG 2.2 AA, keyboard-first navigation, visible focus states, high contrast.
- **Security/Privacy**: Strict CSP (no inline code), least-privilege origins, symmetric consent for analytics.
- **Simplicity**: Vanilla HTML + TypeScript + Tailwind via Vite build. No runtime frameworks.
- **Shareability**: Custom OG images per page, Schema.org JSON-LD.
- **Observability**: Automated Lighthouse + Axe checks, optional privacy-friendly RUM.
- **Content Quality**: Outcome-first messaging. Every project expressed as a one-page case study.

Repository Navigation
---------------------
- `docs/architecture.md` – Canonical architecture brief (routes, CSP, bindings, interface map).
- `content/` – Authoring source (profile YAML, `projects.json`, case-study markdown).
- `scripts/generate-content.ts` – Builds pages from content into `src/pages/**/index.html`.
- `src/` – Source assets.
  - `src/pages/` – Generated static HTML entry points by route.
  - `src/css/tailwind.css` – Tailwind entry with custom tokens.
  - `src/ts/` – Minimal progressive enhancement modules (`main.ts`, `projects.ts`, etc.).
- `functions/` – Cloudflare Pages Functions (to be implemented for `/api/contact`, `/api/github`, optional `/api/og`).
- `public/` – Static assets published verbatim (favicons, robots, fonts, images).
- `postcss.config.cjs`, `tailwind.config.js`, `vite.config.ts` – Build configuration.
- `wrangler.toml` – Environment bindings for Pages Functions (KV, D1, secrets).
- `.github/workflows/` – CI pipelines (to be completed by Release/DevEx agent).
- `dist/` – Production build output (generated).

Agent Roster
------------

### 1. Architect Agent
- **Goal**: Define architecture, folder layout, tooling, and integration contracts.
- **Inputs**: Vision, feature requirements, hosting constraints.
- **Deliverables**: `docs/architecture.md`, repository tree commentary, CSP/headers draft, routing map, wrangler bindings, interface tables.
- **Directives**:
  - Standardize on vanilla HTML + TS + Tailwind + Vite; Cloudflare Pages hosting; `/api/*` via Pages Functions.
  - Specify data schemas for `content/projects.json` and `content/case-studies/*.md`.
  - Enumerate env bindings (GITHUB_CACHE KV, TURNSTILE_SECRET, optional EMAIL_API_KEY, optional D1 DB).
  - Outline CSP and security headers.
  - Provide clear hand-off notes for downstream agents.
- **Acceptance**: Architecture doc reviewed, interfaces defined, risks noted.
- **Kickoff Prompt**: “You are the Architect Agent…” (see prior brief).

### 2. UI/UX Agent
- **Goal**: Produce accessible, responsive UI specs and Tailwind-ready markup.
- **Inputs**: Architecture doc, content schemas, brand voice.
- **Deliverables**: Component specs, semantic HTML/Tailwind snippets, reduced-motion plan, focus states, dark-mode guidance.
- **Directives**:
  - Design from 320–1440 px with grid layout; ensure keyboard operable filters.
  - Components: Navbar, Hero, Project Cards + Filter, Case Study layout, About, Contact (Turnstile), Footer, Vitals bar.
  - Prefer CSS animations; fall back to `requestAnimationFrame` only when necessary.
- **Acceptance**: Axe clean, tab order verified, no contrast issues, Lighthouse >= 95 (lab).
- **Kickoff Prompt**: Provided in original brief.

### 3. Content Strategist Agent
- **Goal**: Craft outcome-driven copy for project cards and case studies.
- **Deliverables**: `content/projects.json`, `content/case-studies/*.md`, About copy, per-page meta (title/description), social blurbs.
- **Directives**:
  - Structure: Context → Problem → Approach → Results → Stack → Links.
  - Integrate concrete metrics, before/after comparisons, latency/SLOs.
  - Keep body copy <= 600 words per page. No filler text.
- **Acceptance**: OG metadata filled, metrics present, LinkedIn/Twitter summaries supplied.
- **Kickoff Prompt**: Provided above.

### 4. Edge/API Agent
- **Goal**: Implement secure Cloudflare Pages Functions.
- **Deliverables**: `functions/api/contact.ts`, `functions/api/github.ts`, optional `functions/api/og.ts`, unit tests.
- **Directives**:
  - `/api/contact`: POST form data, verify Turnstile (server-side), rate-limit by IP + timestamp, dispatch email (EMAIL_API_KEY) or log to D1.
  - `/api/github`: Fetch GitHub repos via REST + bearer token, normalize payload, cache in KV for 900s, handle rate limits.
  - Optional `/api/og`: Generate OG images from front matter (HTML to screenshot/canvas) with KV cache.
  - Never leak secrets, support CORS only when required.
- **Acceptance**: Tests cover success, validation errors, cache hits, rate limits; 400 on bad Turnstile; 429 on rate-limit; 500 gracefully handled.

### 5. Performance Engineer Agent
- **Goal**: Hit aggressive performance budgets and prove it.
- **Deliverables**: Perf budget doc, checklists, Lighthouse CI config, asset optimization plan, “Vitals bar” UI snippet, optional RUM snippet.
- **Directives**:
  - Inline critical CSS, preload fonts, lazy-load non-critical media, defer JS.
  - Ensure Tailwind content paths purge unused CSS; maintain bundle size budgets.
  - Provide steps to measure INP locally and in CI.
- **Acceptance**: Lighthouse >= 95, LCP < 2.5 s, INP < 200 ms, budgets enforced.

### 6. Accessibility Agent
- **Goal**: Guarantee WCAG 2.2 AA compliance.
- **Deliverables**: WCAG checklist mapped to components, Axe/Pa11y automation scripts, manual keyboard walkthrough notes, screen reader test plan.
- **Directives**:
  - Visible, unobstructed focus; sufficient target size; high contrast.
  - Announce filter state changes; announce form errors via `aria-live`.
  - Document SR flows (NVDA/VO) and manual test steps.
- **Acceptance**: Axe clean, manual keyboard review signed off, SR tests pass.

### 7. SEO/Schema Agent
- **Goal**: Maximize discoverability and shareability.
- **Deliverables**: JSON-LD templates (Person, CreativeWork, SoftwareSourceCode), sitemap generator, robots.txt, meta tag templates, OG/Twitter assets plan.
- **Directives**:
  - Add JSON-LD to home (Person) and case studies (CreativeWork/SoftwareSourceCode).
  - Generate OG images per page; ensure canonical URLs; maintain clean slugs.
  - Provide examples wired to case study front matter.
- **Acceptance**: Rich Result test passes on sample page; OG/Twitter previews verified.

### 8. Privacy/Security Agent
- **Goal**: Enforce strong security and privacy defaults.
- **Deliverables**: `_headers` (or function-level headers) covering CSP, HSTS, X-Content-Type-Options, Permissions-Policy; consent UX spec; third-party script checklist.
- **Directives**:
  - Strict CSP, no `unsafe-inline` (use hashes/nonces only if unavoidable).
  - Document consent UX with “Reject all” parity for any analytics.
  - Validate/sanitize form data end-to-end; provide CSP report-only rollout plan.
- **Acceptance**: Security scans pass; CSP enforced without regressions; consent UX implemented if analytics added.

### 9. Release/DevEx Agent
- **Goal**: Create a smooth contributor and deployment experience.
- **Deliverables**: CONTRIBUTING.md, Conventional Commits guide, npm scripts, pre-commit hooks, GitHub Actions CI (typecheck, build, tests, Lighthouse, Axe), Cloudflare Pages deploy config (preview on PR, production on main).
- **Directives**:
  - Ensure env var documentation, local dev instructions, and PR templates.
  - Automate preview deployments and post URLs on pull requests.
  - Keep CI green; enforce quality gates before deploy.
- **Acceptance**: CI pipeline green on sample PR, previews functional, documentation clear.

Handoffs & Communication
------------------------
- Architect ➔ UI/UX, Edge/API, Performance, Privacy/Security (interfaces, headers, env map).
- Content Strategist ➔ UI/UX (copy lengths, tone), SEO/Schema (front matter, metadata).
- Edge/API ➔ UI/UX (API response contracts), Performance (cache strategy), Privacy/Security (headers, secrets).
- Performance/Accessibility/SEO/Security ➔ Release (CI checks, budgets, gating rules).

Definition of Done
------------------
- CI green (typecheck, tests, build, Lighthouse >= 95, Axe clean).
- CSP and security headers enforced; Turnstile verified server-side.
- OG images render; JSON-LD validated; sitemap + robots shipped.
- GitHub projects load via KV-cached API; contact form delivers successfully.
- Core Web Vitals meet stated targets in lab data; manual accessibility checks complete.

# Aditya Ganesh - Applied ML Engineer

Outcome-first portfolio that shows how I ship production ML systems and the engineering craft that supports them. Built as a fast, secure Cloudflare Pages deployment with vanilla HTML + TypeScript + Tailwind, automated quality gates, and measurable performance budgets so recruiters can evaluate both my work and my process.

## Quick links

- Live site: https://adigannat.com
- Case studies: https://adigannat.com/case-studies
- Blog and RSS: https://adigannat.com/blog
- Email: adigannat@gmail.com | LinkedIn: https://www.linkedin.com/in/adityaganesh-ai | GitHub: https://github.com/adigannat

## Why recruiters care

- Three production-grade case studies with real metrics on latency, data quality, and adoption, each documented as a one-page deep dive.
- Portfolio itself is engineered like a production product: progressive enhancement, accessibility, observability, and security shipped end to end.
- Automated Lighthouse and Axe gates keep Core Web Vitals in budget (LCP <= 2.5 s, INP < 200 ms, CLS <= 0.1) on every key page.
- Turnstile-protected contact workflow with Resend email delivery demonstrates secure, auditable forms.
- Content pipeline keeps GitHub activity, testimonials, blog posts, and resume in sync so hiring teams always see the latest signal.

## Flagship case studies

| Case study                                                                                          | Outcomes                                                                        | Stack highlights                                                                  |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [RAG Assistant for WhatsApp Support](https://adigannat.com/case-studies/rag-whatsapp-assistant/)    | 5-8 s p95 response, 99% ingest success, 33% less handle time                    | FastAPI, Postgres, pgvector, Redis, Celery, WhatsApp Cloud API                    |
| [AWS Iceberg Lakehouse with Embedded BI](https://adigannat.com/case-studies/aws-iceberg-lakehouse/) | < 1% data loss across 260k rows, RLS for 7 business units, GitHub Actions CI/CD | Amazon S3, AWS Glue, AWS Athena, Apache Iceberg, Great Expectations, Superset 5.0 |
| [GLEAC Client Interaction Chatbot](https://adigannat.com/case-studies/gleac-chatbot/)               | 91% lift in interactions, 33% less time waste                                   | Automation playbooks, analytics loops, enablement training                        |
| [SAP Ariba Workflow Automations](https://adigannat.com/case-studies/estee-lauder-automation/)       | 48% drop in repetitive work, 20k+ client records automated                      | SAP Ariba, RPA, process mining, orchestration                                     |

## What this site demonstrates

- Theme manager with persisted dark and light mode plus mobile drawer navigation (src/ts/theme.ts, src/ts/mobile-menu.ts).
- Skills visualization dashboard with SVG donut and animated bar charts for data storytelling (src/ts/skills-viz.ts).
- Universal site search (Ctrl or Cmd + K) powered by Fuse.js with keyboard-first navigation and content-type badges (src/ts/site-search.ts, public/search-index.json).
- Testimonials carousel with autoplay, keyboard, and touch support (src/ts/testimonials-carousel.ts).
- Blog engine, RSS feed, sitemap, robots, and JSON-LD generated from structured content (scripts/generate-content.ts, content/blog/\*\*).
- Live Core Web Vitals bar instrumented with PerformanceObserver to surface LCP, INP, and CLS in real time (src/ts/main.ts).
- Cloudflare Pages Functions: Turnstile-verified contact form with Resend email delivery (functions/api/contact.ts), GitHub proxy cached in KV (functions/api/github.ts), dynamic SVG OG image generator (functions/api/og.ts).
- Strict CSP, HSTS, Permissions-Policy, COOP, CORP, and cache directives documented in docs/architecture.md.
- Motion system driven by IntersectionObserver that respects prefers-reduced-motion and adds polish without hurting performance (src/ts/animations.ts).

## Architecture at a glance

- Stack: Vite, TypeScript, Tailwind JIT, vanilla HTML. Total shipped JavaScript stays under 20 KB gzipped per page via code-splitting and lazy enhancement.
- Content pipeline: scripts/generate-content.ts ingests YAML, JSON, and Markdown to render static HTML plus sitemap.xml, rss.xml, search-index.json, and robots.txt.
- Data sources: projects.json, case studies, blog posts, testimonials, and profile.yaml under content/ provide a single editorial workflow.
- Hosting: Cloudflare Pages serves the static bundle; Pages Functions add secure API endpoints. KV namespaces and optional D1 bindings are managed through wrangler.toml.
- Styling: Tailwind tokens and component primitives live in src/css/tailwind.css with critical CSS extraction for the hero and other LCP elements.
- Accessibility: Semantic HTML, skip links, focus rings, ARIA live regions, reduced-motion variants, and keyboard-first controls baked into every interactive feature.

## Proof and quality gates

| Proof point             | How it is verified                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Core Web Vitals budgets | `npm run test:lh` runs Lighthouse CI against `/`, `/projects/`, `/case-studies/`, `/contact/` with perf >= 90, accessibility >= 95, best-practices >= 90, and SEO >= 95. |
| Accessibility           | `npm run test:a11y` executes Pa11y CI (WCAG 2.2 AA) against the Vite preview build.                                                                                      |
| Linting and types       | `npm run lint` (Biome) and `npm run typecheck` (`tsc --noEmit`).                                                                                                         |
| Runtime metrics         | Vitals bar and console logging capture live LCP, INP, and CLS in production.                                                                                             |
| CI/CD                   | .github/workflows/ci.yml runs lint -> typecheck -> build -> accessibility -> Lighthouse -> Cloudflare Pages deploy (preview and production).                             |
| Security headers        | CSP, HSTS, Permissions-Policy, COOP, CORP, and cache policies defined in docs/architecture.md and enforced via `_headers` or Pages Functions.                            |

Vitest, Miniflare, and Playwright are configured in package.json for unit, function, and integration tests as new features land.

## Evaluate locally

```bash
git clone https://github.com/adigannat/portfolio.git
cd portfolio
npm install
npm run dev
```

Additional scripts:

```bash
npm run build          # lint + content build + typecheck + production bundle
npm run preview        # serve dist/ locally
npm run test           # Vitest harness (add suites as needed)
npm run test:functions # Pages Functions with Miniflare
```

Generated HTML lives in src/pages/\*\*/index.html; edit the structured content in content/ and re-run `npm run build:content` instead of touching generated files.

## Deployment and environment

- Deployment target: Cloudflare Pages using the dist/ output. Preview deploys attach to pull requests; pushes to main promote to https://adigannat.com.
- Required environment: `GITHUB_USER`, `GITHUB_TOKEN`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `RESEND_API_KEY`, `GITHUB_CACHE` KV binding. Optional `EMAIL_API_KEY` and `DB` (Cloudflare D1) support extended logging or persistence.
- Security headers can be delivered via `_headers` or response headers in Pages Functions; CSP allows only self-hosted assets plus Cloudflare Turnstile and GitHub avatars.
- Fonts and hero imagery are preloaded, remaining media is lazy-loaded, and Tailwind purges unused classes to keep LCP inside budget.

## Roadmap snapshot

- Tier 1 enhancements shipped: theme toggle, mobile menu, resume download, skills dashboard, table of contents scroll spy.
- Tier 2 enhancements shipped: blog and RSS, testimonials carousel, universal search. Interactive demos and advanced GitHub analytics are queued for the next pass.
- Tier 3+ candidate work: PWA mode, public analytics dashboard, WebGL hero concepts, and experimentation tooling (see PLANS.md sections 16-19 for prioritisation notes).

## Contact

- Fastest response: submit the Turnstile-protected form at https://adigannat.com/contact or email adigannat@gmail.com.
- I reply within two business days and can share additional runbooks, dashboards, or code samples under NDA if needed.

Thanks for reviewing the portfolio. If you are hiring for applied ML, retrieval-augmented systems, or governed data platforms, I would love to connect.

1. Scope & Vision

A fast, resilient portfolio that proves engineering craft with measurable results. No runtime frameworks; deploy on Cloudflare Pages; dynamic features only via Pages Functions.

Out of scope (for v1)

User auth, CMS UI, comments.

Heavy client-side frameworks or SPA routing.

2. Architecture & Repo Layout
   /
   ├─ public/ # static assets (favicons, images, robots.txt, manifest)
   ├─ src/
   │ ├─ css/ # tailwind.css, base styles
   │ ├─ ts/ # modules (ui, filters, analytics-lite)
   │ ├─ pages/ # _.html (home, projects, about, contact)
   │ └─ templates/ # partials (header, footer, og)
   ├─ content/
   │ ├─ projects.json # card data (list)
   │ └─ case-studies/_.md # one-pagers with front-matter
   ├─ functions/
   │ └─ api/
   │ ├─ contact.ts # Turnstile verify + email/D1
   │ ├─ github.ts # GitHub proxy + KV cache
   │ └─ og.ts # optional Open Graph generator
   ├─ .github/workflows/ci.yml # typecheck, build, Axe, Lighthouse, deploy
   ├─ wrangler.toml # KV/D1 bindings, vars
   ├─ tailwind.config.js
   ├─ vite.config.ts
   ├─ package.json
   └─ \_headers # security headers (or set in functions)

Bindings (wrangler.toml):

kv_namespaces = [{ binding = "GITHUB_CACHE", id = "..." }]

vars = { TURNSTILE_SITE_KEY = "...", ORIGIN = "https://your-domain" }

d1_databases = [{ binding = "DB", database_name = "portfolio" }] (optional)

3. Content Schema
   content/projects.json (cards)
   [
   {
   "slug": "rag-assistant",
   "title": "RAG Assistant for Customer Ops",
   "summary": "Reduced handle time with retrieval-augmented responses.",
   "results": ["p95 response 5.8s", "-33% time waste"],
   "tags": ["fastapi", "postgres", "pgvector"],
   "links": { "repo": "https://github.com/you/rag", "case": "/case-studies/rag-assistant" },
   "image": "/images/rag-card.jpg",
   "updatedAt": "2025-09-20"
   }
   ]

## content/case-studies/\*.md (front-matter)

title: "RAG Assistant for Customer Ops"
date: "2025-09-20"
slug: "rag-assistant"
tags: ["fastapi","postgres","pgvector"]
ogTitle: "RAG Assistant — 5.8s p95"
ogDescription: "Production RAG with cost guardrails and WhatsApp integration."
schemaType: "CreativeWork"
metrics:

- "p95 response 5.8s"
- "-33% time waste"
  stack: ["FastAPI","Postgres","pgvector","Redis","Celery"]
  links:
  repo: "https://github.com/you/rag"
  demo: "https://demo.example.com"

---

## Context

...

## Problem

...

## Approach

...

## Results

...

## Stack

...

4. Page Map & Routing

/ Home (hero, three featured projects, CTA).

/projects Grid + filters (data-topic attributes; keyboard operable).

/case-studies/:slug One-page narrative + metrics + architecture sketch.

/about Bio, photo, values, contact CTA.

/contact Form + Turnstile; sends to /api/contact.

/api/github Cards data (server) + KV caching.

/api/contact Turnstile verify → email/D1.

/og/:slug Optional OG generator.

5. Security & Headers (CSP sketch)

headers (simplified — tighten origins to your exact hosts):

/\*
Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: https://avatars.githubusercontent.com; font-src 'self'; connect-src 'self' https://api.github.com; frame-src https://challenges.cloudflare.com; base-uri 'none'; form-action 'self'; object-src 'none'; frame-ancestors 'none';
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()

If you need inline styles/scripts, replace with hashed/nonce’d versions instead.

6. Performance Plan

Preload LCP image and font subsets; compress images; fetchpriority="high" for LCP.

Defer all JS; split modules per page; tree-shake via Vite.

Tailwind purge paths correct to avoid bloat.

Use CSS content-visibility: auto for large sections.

KV cache GitHub responses for 900s.

Lighthouse lab budgets: JS ≤ 75KB gz, CSS ≤ 50KB gz (home), image hero ≤ 200KB.

7. Accessibility Plan (WCAG 2.2)

Focus not obscured; visible outline ≥ 3:1; logical tab order.

Controls ≥ 24×24px; drag alternatives for any drag UI (if any).

Semantic landmarks: header nav main footer; headings in order.

Form: labels + errors announced via aria-live="polite"; Turnstile accessible mode.

Announce filter count changes via aria-live.

8. SEO/Schema & OG

JSON-LD: Person on Home; CreativeWork/SoftwareSourceCode on case studies.

sitemap.xml (generated at build), robots.txt, canonical tags.

Edge OG generator /api/og produces 1200×628 PNG per page using front-matter.

9. Implementation Tasks & Checklists
   Sprint 1 — Foundations

Architect: repo tree, wrangler bindings, CSP draft, interfaces.

DevEx: Vite + Tailwind setup; ESLint/Prettier; npm scripts; GitHub Actions skeleton.

Security: \_headers in place (report-only CSP optional first).

Content: create projects.json & one case study.

Definition of Done (S1):

npm run build succeeds; preview deploy on PR; home page static renders with proper meta.

Sprint 2 — UI & Content

UI/UX: Navbar, Hero, Cards, Case Study layout, About, Contact.

Content: Fill 3 featured projects + 2 case studies with real metrics.

Accessibility: Axe passes, keyboard walkthrough documented.

DoD (S2):

Lighthouse ≥ 95 on Home/Projects; Axe zero criticals; contrast check passed.

Sprint 3 — Edge/API & Integrations

Edge: /api/github with KV caching; /api/contact with Turnstile + email/D1.

SEO/Schema: JSON-LD, sitemap, robots; OG generator.

DoD (S3):

GitHub cards load from server API; contact form functions; rich result test passes.

Sprint 4 — Perf hardening & Release

Perf: font subsetting, image policy, preloads, budgets enforced.

CI: Lighthouse & Axe gates in PR; production deploy on main.

DoD (S4):

Lab targets met; headers locked down; production domain live with SSL.

10. CI/CD (GitHub Actions sketch)

Job 1: Install → Typecheck → Build.

Job 2: Axe + Pa11y on dist/.

Job 3: Lighthouse CI for /, /projects, one case study.

If all green: Cloudflare Pages deploy. PRs create preview; main → prod.

11. Risk Register & Mitigations

CSP breaks third-party → run CSP in report-only first, capture reports, then enforce.

GitHub API rate limits → KV cache + conditional Etags; fall back to last-good cache.

INP regressions → CI Lighthouse budget + manual interaction profiles.

A11y regressions → Axe CI and manual keyboard scripts in PR template.

12. Templates
    PR Template

Changes summary

Screenshots (mobile + desktop)

Accessibility checklist (keyboard path, contrast, labels)

Performance diff (Lighthouse urls)

Security note (CSP origin changes?)

Case Study Front-Matter (copy/paste)
title: ""
date: "YYYY-MM-DD"
slug: ""
tags: []
ogTitle: ""
ogDescription: ""
schemaType: "CreativeWork"
metrics: []
stack: []
links:
repo: ""
demo: ""

13. Local Dev Commands

npm run dev — Vite dev server

npm run build — build to dist/

npm run preview — preview build

npm run test:a11y — Axe/Pa11y against dist/

npm run test:lh — Lighthouse CI for key routes

14. Acceptance Criteria (final)

Pages deploy on Cloudflare with preview + prod.

Core Web Vitals lab targets met.

WCAG 2.2 AA conformity verified.

Strict CSP in place; consent UX symmetric if analytics present.

OG images generated per page; JSON-LD valid; sitemap + robots present.

GitHub projects and contact form functional; no secrets leaked.

Clean codebase with CI gates and contribution docs.

# Architecture Overview

This document defines the technical architecture for Aditya Ganesh's portfolio. The site runs on Cloudflare Pages with vanilla HTML, TypeScript, Tailwind CSS, and Vite. Dynamic behavior is limited to progressive enhancement and Pages Functions so we can maintain performance, accessibility, and security guarantees.

## Objectives
- Keep lab metrics within targets: LCP <= 2.5 s, INP < 200 ms, CLS <= 0.1 on home and case study pages.
- Meet WCAG 2.2 AA with keyboard-first interactions, visible focus, and high color contrast.
- Enforce a strict security posture (CSP with no unsafe-inline, hardened headers, no leaked secrets).
- Provide measurable quality through Lighthouse, Axe, and optional privacy-preserving RUM.

## Tech Stack and Tooling
- Build: Vite, TypeScript, Tailwind CSS (JIT mode, content paths scoped to `src` and `content`).
- Runtime: Static HTML with Tailwind CSS and minimal TypeScript modules (no runtime frameworks).
- Hosting: Cloudflare Pages. Dynamic endpoints implemented with Pages Functions.
- Integrations: Cloudflare KV (`GITHUB_CACHE`), optional Cloudflare D1 (`DB`), email provider via REST API, Cloudflare Turnstile.
- Testing and CI: GitHub Actions (typecheck, unit tests, build, Axe, Lighthouse). Miniflare or Workers test harness for functions. npm scripts for local workflows.

## Repository Layout

```text
/
|- content/                        # Authoring data (projects list, case studies, profile)
|  |- case-studies/                # Markdown case studies with front matter
|  |- projects.json                # Project card metadata
|  |- profile.yaml                 # Global profile, navigation, SEO defaults
|- docs/
|  |- architecture.md              # Architecture reference (this file)
|- functions/
|  |- api/
|     |- contact.ts                # Turnstile verification + email/D1 dispatch + rate limiting
|     |- github.ts                 # GitHub proxy with KV cache and normalization
|     |- og.ts                     # Optional dynamic OG image renderer
|- public/                         # Static assets copied verbatim to dist (favicons, robots, images)
|- src/
|  |- css/
|  |  |- tailwind.css              # Tailwind directives and design tokens
|  |  |- critical.css              # Inline-critical CSS generated per page
|  |- ts/
|  |  |- filters.ts                # Project filter enhancements (announces to screen readers)
|  |  |- contact-form.ts           # Progressive enhancement for contact form submission
|  |  |- vitals-bar.ts             # Performance vitals bar hydration
|  |  |- rum.ts                    # Optional privacy-preserving web vitals reporting
|  |- pages/
|     |- index.html                # Home
|     |- projects.html             # Projects grid and filters
|     |- about.html                # About page
|     |- contact.html              # Contact form with Turnstile widget
|     |- case-studies/             # Generated HTML from markdown content
|        |- [slug].html
|- .github/
|  |- workflows/
|     |- ci.yml                    # Typecheck, build, tests, Lighthouse, Axe, deploy
|- .vscode/                        # Recommended tasks/settings (optional)
|- _headers                        # Security headers if not applied via functions
|- package.json
|- tailwind.config.js
|- tsconfig.json
|- vite.config.ts
|- wrangler.toml                   # Environment bindings for Pages Functions
```

## Content Schema

### `content/projects.json`
```jsonc
[
  {
    "slug": "rag-whatsapp-assistant",
    "title": "RAG Assistant - Production WhatsApp Chatbot",
    "summary": "Reduced handle time with retrieval-augmented automation hitting 5-8 s p95.",
    "results": ["p95 response 5-8 s", "99% ingest success", "-33% time waste"],
    "tags": ["FastAPI", "Postgres", "pgvector"],
    "image": "/images/projects/rag-whatsapp.jpg",
    "links": {
      "caseStudy": "/case-studies/rag-whatsapp-assistant",
      "repo": "https://github.com/adigannat/rag-whatsapp-assistant"
    },
    "updatedAt": "2025-05-01"
  }
]
```

Field guidance:
- `slug`: kebab-case identifier shared with the case study.
- `summary`: <= 140 characters, outcome-first, no buzzwords.
- `results`: up to three short metric strings.
- `tags`: used for filter buttons; keep to four or fewer.
- `image`: optimized JPEG or WEBP (<= 120 KB) stored in `public/images/projects`.
- `links.caseStudy`: internal page path. `links.repo` optional.

### `content/case-studies/*.md`
```markdown
---
title: "RAG Assistant - Production WhatsApp Chatbot"
date: "2025-05-01"
slug: "rag-whatsapp-assistant"
tags: ["fastapi", "pgvector", "whatsapp", "slo"]
ogTitle: "RAG Assistant - 5-8 s p95"
ogDescription: "Production WhatsApp chatbot with pgvector retrieval, cost guardrails, and runbooks."
schemaType: "CreativeWork"
metrics:
  - "p95 response 5-8 s"
  - "99% ingest success"
  - "-33% time waste"
stack: ["FastAPI", "Postgres", "pgvector", "Redis", "Celery", "WhatsApp Cloud API"]
links:
  repo: "https://github.com/adigannat/rag-whatsapp-assistant"
  demo: "https://demo.example.com"
summarySocial:
  linkedin: "Delivered a WhatsApp RAG assistant with 5-8 s p95 and 99% ingest success."
  twitter: "Production WhatsApp RAG assistant hitting 5-8 s p95 and cutting waste by 33%."
---

## Context

## Problem

## Approach

## Results

## Stack

## Links
```

`content/profile.yaml` (already present) provides canonical profile data, navigation, theme preferences, and schema defaults. Vite will ingest this YAML to hydrate global metadata, navigation labels, and schema.org templates.

## Interface Contracts

| Interface | Method | Input | Output | Notes |
|-----------|--------|-------|--------|-------|
| `/api/contact` | POST | `application/x-www-form-urlencoded` or `multipart/form-data` with `name`, `email`, `message`, `token` (Turnstile), `context` (optional slug) | JSON `{ "status": "ok", "id": "uuid" }` or `{ "error": "message" }` | Verifies Turnstile using `TURNSTILE_SECRET`, applies KV/D1 rate limit (IP + timestamp), then sends email (EMAIL_API_KEY) or writes to D1. Returns 400 on validation failure, 429 on rate limit, 500 on provider error. |
| `/api/github` | GET | Query params: `type=featured|recent` (default `recent`), `user` (default env) | JSON `{ "repos": Repo[] }` where `Repo = { "name", "description", "stars", "topics", "url", "updatedAt" }` | Calls GitHub REST API with bearer token (`GITHUB_TOKEN`), normalizes payload, caches in KV for 900 s, responds with `Cache-Control: max-age=300, stale-while-revalidate=600`. Handles rate limit errors gracefully. |
| `/api/og/:slug` (optional) | GET | Path slug and optional query overrides (`title`, `description`) | PNG image (1200x628) | Renders HTML template with case study front matter, captures via Satori or Workers Canvas, caches in KV for 24 h. Enable only if privacy policy allows. |
| Home (`/`) | GET | Static HTML generated from content with optional JSON feed for vitals | Render hero, featured projects, GitHub highlights (lazy), contact CTA | Progressive enhancement loads vitals bar JSON and GitHub data once idle. |
| Projects (`/projects`) | GET | Static HTML with data attributes for filtering | Shows full project list, filter controls, GitHub repos | Filter changes announce state via aria-live region. |
| Case Study (`/case-studies/:slug`) | GET | Static HTML generated from markdown | Outcome narrative, metrics, schema JSON-LD | Provides related projects and contact CTA. |
| About (`/about`) | GET | Static HTML using profile YAML | Bio, timeline, values, CTA | Includes download link for resume hosted in `public/docs`. |
| Contact (`/contact`) | GET | Static HTML | Form fields, Turnstile widget, API endpoint URLs | JS enhances validation, handles success and errors via aria-live. |

## Routing Map
- `/` - Home (hero, featured projects, metrics, vitals bar).
- `/projects` - Project grid with keyboard accessible filters and GitHub highlights.
- `/case-studies/:slug` - One-page case study generated from markdown.
- `/about` - Biography, values, work principles, timeline.
- `/contact` - Contact form with Turnstile verification and server submission.
- `/api/contact` - POST endpoint for form submissions.
- `/api/github` - GET endpoint for GitHub data with KV cache.
- `/api/og/:slug` - Optional OG image generator.
- `/sitemap.xml` - Generated during build and served from `public`.
- `/robots.txt` - Static file for crawl directives.

## Security Headers and CSP

Recommended `_headers` entry (applies to all routes):

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: https://avatars.githubusercontent.com; font-src 'self'; connect-src 'self' https://api.github.com https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; base-uri 'none'; form-action 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests;
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), usb=(), vr=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  Cache-Control: public, max-age=600, stale-while-revalidate=86400
```

Notes:
- Keep the Turnstile origin limited to `https://challenges.cloudflare.com`. Module-wrapped loader is preferred.
- Third-party scripts require CSP and consent updates using the privacy checklist.
- For report-only staging add `Content-Security-Policy-Report-Only` pointing to `/api/csp-report` (optional future work).

## Environment Variables and Bindings (`wrangler.toml`)

```toml
[env.production]
vars = { GITHUB_USER = "adigannat", ORIGIN = "https://adigannat.com", TURNSTILE_SITE_KEY = "1x00000000000000000000AA" }

kv_namespaces = [
  { binding = "GITHUB_CACHE", id = "ffffffffffffffffffffffffffffffff" }
]

d1_databases = [
  { binding = "DB", database_name = "portfolio", database_id = "00000000-0000-0000-0000-000000000000" } # optional
]

[env.production.vars]
TURNSTILE_SECRET = "1x0000000000000000000000000000000AA"
GITHUB_TOKEN = "ghp_example"
EMAIL_API_KEY = "resend_example" # optional
```

For local development define `[vars]` with mock values and `kv_namespaces.preview` for Miniflare.

## Performance and Accessibility Goals
- LCP element: hero heading or first project card image. Preload hero image and fonts, size images with `width` and `height`, include `loading="lazy"` for non-critical images.
- INP: limit JavaScript to essential enhancements, keep handlers short, avoid global listeners.
- CLS: reserve image aspect ratios, avoid injecting content above-the-fold after load, use `font-display: swap`.
- Tailwind purge paths: `content: ["./src/**/*.{html,ts}", "./content/**/*.{md,json,yaml}"]`.
- Provide `prefers-reduced-motion` styles to disable transitions and animations when requested.
- Accessibility validation: `npm run test:a11y` executes Axe (Playwright or axe-core CLI) and Pa11y against the built site.

## Data and Control Flows
1. Build-time ingestion: Vite plugins load `content/projects.json`, `content/case-studies/*.md`, and `content/profile.yaml` to generate static HTML, search metadata, and JSON-LD.
2. GitHub data: `/api/github` fetches pinned or recent repositories with `GITHUB_TOKEN`, caches normalized payload in KV for 900 s, and includes stale-while-revalidate cache headers for clients.
3. Contact form: Front-end renders Turnstile widget (site key). JS disables submit button after click, performs fetch POST to `/api/contact`, announces status changes with aria-live. Function verifies Turnstile, checks rate limit (KV store keyed by IP hash and timestamp), sends email via provider or writes to D1 `contact_messages`, and returns JSON response.
4. OG images: Build step pre-generates static defaults. Optional `/api/og` handles fallbacks using case study front matter and caches result in KV.

## Observability and Testing
- Lighthouse CI will run against `/`, `/projects`, and `/case-studies/rag-whatsapp-assistant`.
- Axe and Pa11y scripts execute on built pages to guard accessibility regressions.
- Pages Functions use Miniflare tests covering success, Turnstile failure, rate limit, cache hit, and GitHub API error scenarios.
- Optional RUM: minimal `web-vitals` snippet sends anonymized metrics to a future `/api/vitals` endpoint (opt-in with user consent).

## Handoffs
- **UI/UX Agent**: Use this layout, schemas, and goals to produce component specs, HTML, and Tailwind snippets.
- **Edge/API Agent**: Implement `/api/contact`, `/api/github`, and optional `/api/og` following interface contracts, env bindings, and security requirements.
- **Performance Engineer**: Establish budgets, configure Lighthouse CI, design vitals bar, and enforce critical-path optimizations.
- **Accessibility Agent**: Create WCAG 2.2 AA checklist, Axe/Pa11y automation, and keyboard walkthrough based on the defined routes and interactions.
- **SEO/Schema Agent**: Implement JSON-LD templates, OG/Twitter meta, sitemap builder, and robots directives leveraging front matter and `profile.yaml`.
- **Privacy/Security Agent**: Finalize CSP, consent UX, Turnstile integration, and security review process.
- **Release/DevEx Agent**: Provide CONTRIBUTING guide, npm scripts, Git hooks, CI pipeline, and Cloudflare Pages deployment configuration grounded in this architecture.

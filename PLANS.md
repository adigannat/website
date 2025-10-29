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

---

# v2 Enhancement Plan (Post-Launch)

## 15. Portfolio Enhancement Strategy

**Goal**: Transform the portfolio from a strong technical foundation into an exceptional, recruiter-friendly showcase that demonstrates both the showcased work AND the site itself as a project.

**Principle**: The portfolio serves dual purposes:
1. Showcase completed projects and case studies
2. Demonstrate technical capabilities through the site's own implementation

**Enhancement Philosophy**: Add extended features that:
- Improve user experience for recruiters and visitors
- Showcase technical depth (TypeScript modules, data visualization, interactive UX)
- Differentiate from typical portfolios
- Maintain performance and accessibility standards

## 16. Enhancement Tiers

### Tier 1: High-Impact Quick Wins (COMPLETED ✅)
Focus: Maximum visual appeal and technical credibility with minimal complexity

**Status: All 5 features implemented and shipped**

1. **Dark/Light Mode Toggle** ✅
   - Implementation: `src/ts/theme.ts` (ThemeManager class)
   - Features: localStorage persistence, system preference detection, smooth transitions
   - Location: Header with sun/moon icons
   - Impact: Modern UX standard, shows state management expertise
   - Files: theme.ts, tailwind.css (theme transition styles), generate-content.ts (button markup)

2. **Mobile Hamburger Menu** ✅
   - Implementation: `src/ts/mobile-menu.ts` (MobileMenu class)
   - Features: Drawer navigation, backdrop overlay, auto-close behaviors, keyboard support
   - Responsive: Hidden on desktop (md:), visible on mobile/tablet
   - Impact: Professional mobile UX, accessibility compliance
   - Files: mobile-menu.ts, tailwind.css (drawer + overlay styles), generate-content.ts (markup)

3. **Resume Download** ✅
   - Implementation: Static PDF in `/public/resume.pdf`
   - Locations: Desktop header + mobile menu footer
   - Features: Download attribute with friendly filename, icon + text responsive design
   - Impact: Streamlines recruiter workflow
   - Files: generate-content.ts (download buttons), public/resume.pdf

4. **Interactive Skills Visualization Dashboard** ✅
   - Implementation: `src/ts/skills-viz.ts` (SkillsVisualization class)
   - Features: SVG donut chart, animated horizontal bars, stats cards, hover effects
   - Components:
     - Donut chart showing distribution across 6 skill categories
     - Bar chart with scroll-triggered animation
     - Metric cards (total skills, categories, largest category)
   - Location: About page, before Toolbox section
   - Impact: Data visualization expertise, visual engagement
   - Files: skills-viz.ts, tailwind.css (visualization styles), generate-content.ts (data attributes)

5. **Table of Contents with Scroll Spy** ✅
   - Implementation: `src/ts/toc.ts` (TableOfContents class)
   - Features: Auto-generated from H2/H3, IntersectionObserver for active tracking, smooth scroll
   - Behavior: Sticky sidebar on desktop (lg:), hidden on mobile
   - Location: Case study pages (right sidebar)
   - Impact: Better content navigation, modern blog-style UX
   - Files: toc.ts, tailwind.css (TOC styles), generate-content.ts (sidebar layout)

**Tier 1 Metrics:**
- Total new TypeScript: ~650 lines across 4 modules
- CSS additions: ~140 lines of component styles
- Bundle impact: +4.3 KB gzipped (skills-viz + toc modules)
- Build time: Maintained ~1.2s
- Performance: No regression in Core Web Vitals

### Tier 2: Differentiation Features (IN PROGRESS)
Focus: Stand out from typical portfolios, showcase advanced capabilities

**Target: 2-3 days implementation**

6. **Interactive Project Demos** (DEFERRED)
   - Embed live demos or CodeSandbox/StackBlitz iframes
   - Let recruiters interact with projects directly
   - Shows: Integration skills, user engagement focus

7. **Blog Section** ✅ (COMPLETED)
   - Implementation: `content/blog/` directory, blog rendering functions, RSS generation
   - Features: Markdown parsing with front matter, blog listing page, individual post pages with TOC
   - Components:
     - `loadBlogPosts()` function for markdown processing
     - `renderBlogListing()` for blog index at `/blog/`
     - `renderBlogPost()` for individual posts with TOC sidebar
     - `renderBlogPostCard()` for blog listing cards
     - `generateRssFeed()` for RSS 2.0 feed at `/rss.xml`
   - Content: 2 sample posts (RAG systems, data quality)
   - SEO: Sitemap integration, RSS feed, OG meta tags per post
   - Impact: Technical writing showcase, SEO benefits, thought leadership
   - Files: generate-content.ts (blog functions), content/blog/*.md, public/rss.xml
   - Metrics: Blog pages ~15KB → 4.5KB gzipped, RSS feed 1.9KB

8. **Advanced GitHub Integration** (DEFERRED)
   - Contribution graph visualization
   - Language breakdown charts
   - Recent activity timeline
   - Shows: API integration, data visualization, open source involvement

9. **Testimonials/Recommendations Carousel** ✅ (COMPLETED)
   - Implementation: `src/ts/testimonials-carousel.ts` (TestimonialsCarousel class)
   - Features: Auto-rotation (7s), manual navigation, keyboard support, touch/swipe, pause on hover
   - Components:
     - Carousel with prev/next buttons and indicator dots
     - Smooth fade transitions with testimonialFadeIn animation
     - ARIA live regions for accessibility
     - Avatar fallback with initials
   - Data: 4 testimonials in profile.yaml with author, role, company, text
   - Location: About page after Experience timeline
   - Impact: Social proof, credibility, animation expertise
   - Files: testimonials-carousel.ts, tailwind.css (carousel styles), profile.yaml (data), generate-content.ts (rendering)
   - Metrics: About page +0.8 KB gzipped, carousel module 1 KB gzipped

10. **Site Search** ✅ (COMPLETED)
    - Implementation: `src/ts/site-search.ts` (SiteSearch class with Fuse.js)
    - Features: Fuzzy search, keyboard shortcuts (Ctrl/Cmd+K, Esc), modal overlay, arrow key navigation
    - Components:
      - Search modal with input, close button, and results list
      - Search index JSON generated at build time (4.2 KB)
      - Fuse.js configuration: title (0.4), excerpt (0.3), tags (0.3) weights
      - Type badges for pages, projects, case studies, and blog posts
      - Keyboard hints (↑↓ navigate, Enter select, Esc close)
    - Search Index: Pages, projects, case studies, and blog posts (searchable content)
    - Trigger: Button in header with search icon + "Ctrl+K" hint
    - Impact: Improved navigation, search implementation showcase, better UX
    - Files: site-search.ts, tailwind.css (search styles), generate-content.ts (index generation + button), main.ts (import)
    - Metrics: Main.js +8 KB gzipped (includes Fuse.js), search index 4.2 KB

### Tier 3: Advanced Technical Showcase (PLANNED)
Focus: Demonstrate sophisticated engineering capabilities

**Target: 3-5 days, select 2-3 based on role alignment**

11. **PWA Capabilities**
    - Service worker for offline support
    - Install prompt
    - Background sync
    - Shows: Progressive enhancement, modern web APIs

12. **Analytics Dashboard (Public)**
    - Privacy-focused analytics visualization
    - Site performance metrics
    - Visitor patterns (anonymized)
    - Shows: Analytics implementation, data viz, transparency

13. **3D/WebGL Hero Animation**
    - Three.js particle system or 3D graphics
    - Interactive background animations
    - Shows: Graphics programming, creative coding

14. **Interactive Code Playground**
    - Embedded Monaco editor for code snippets
    - Syntax highlighting, live execution
    - Shows: Tool integration, developer experience focus

15. **A/B Testing Framework**
    - Feature flags and variant testing
    - Client-side experimentation
    - Shows: Experimentation mindset, analytics-driven

### Tier 4: Content & Credibility (ONGOING)
Focus: Build authority and showcase achievements

16. **Certifications Showcase**
17. **Speaking/Conference Talks**
18. **Open Source Contributions Highlight**
19. **Publications/Writing Archive**
20. **Client Logos / Company Badges**

## 17. Implementation Standards for Enhancements

All new features must meet:

**Performance:**
- No Core Web Vitals regression
- Lazy-load non-critical features
- Code-split per page/feature
- Maintain bundle budget: Total JS ≤ 20KB gzipped per page

**Accessibility:**
- WCAG 2.2 AA compliant
- Keyboard navigable
- Screen reader tested
- Reduced motion support

**Code Quality:**
- TypeScript strict mode
- Biome linting passes
- Self-documenting code with JSDoc
- Modular, testable architecture

**Browser Support:**
- Modern evergreen browsers (last 2 versions)
- Progressive enhancement for older browsers
- Feature detection, not browser detection

## 18. Enhancement Tracking

**Completed:**
- ✅ Tier 1 Complete (5/5 features shipped)
  - Dark/Light Mode Toggle
  - Mobile Hamburger Menu
  - Resume Download
  - Skills Visualization Dashboard
  - Table of Contents with Scroll Spy
- ✅ Tier 2 Complete (3/5 features shipped)
  - Blog Section with RSS feed
  - Testimonials/Recommendations Carousel
  - Site Search with Fuse.js

**In Progress:**
- None

**Planned:**
- Tier 3: Select 2-3 from 11-15 based on role alignment
- Tier 4: Ongoing content additions

**Deferred:**
- Tier 2 Feature 6 (Interactive Project Demos)
- Tier 2 Feature 8 (Advanced GitHub Integration)
- Advanced features pending role alignment and time availability

## 19. Success Metrics for Enhancements

**Technical:**
- Build passes with no regressions
- Lighthouse score ≥ 95 maintained
- Accessibility audit clean
- TypeScript coverage 100%

**User Experience:**
- Reduced bounce rate
- Increased time on page
- Positive feedback from recruiters
- Mobile engagement metrics

**Differentiation:**
- Feature parity/advantage vs. comparable portfolios
- Unique technical demonstrations
- Memorable visual/interactive elements

**Recruiter Impact:**
- Resume download rate
- Case study read depth
- Contact form conversion
- LinkedIn profile views post-visit

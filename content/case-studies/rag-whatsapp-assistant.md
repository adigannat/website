---
title: "RAG Assistant - Production WhatsApp Chatbot"
date: "2025-05-01"
slug: "rag-whatsapp-assistant"
tags: ["fastapi", "pgvector", "whatsapp", "slo"]
ogTitle: "RAG Assistant - 5-8 s p95"
ogDescription: "WhatsApp chatbot with pgvector retrieval, cost guardrails, and incident runbooks."
schemaType: "CreativeWork"
metrics:
  - "5-8 s p95 response"
  - "60 s ingest p95"
  - "99% ingest success"
stack:
  - "FastAPI"
  - "Postgres"
  - "pgvector"
  - "Redis"
  - "Celery"
  - "WhatsApp Cloud API"
links:
  repo: ""
  demo: ""
summarySocial:
  linkedin: "Shipped a WhatsApp RAG assistant hitting 5-8 s p95 with 99% ingest success and documented runbooks."
  twitter: "WhatsApp RAG assistant: 5-8 s p95, 99% ingest success, full incident playbooks."
---

## Context

La Capitale needed a compliant conversational assistant on WhatsApp to unblock customer operations. Agents relied on siloed playbooks stored across SharePoint, PDFs, and ad-hoc chats. Any answer involving policy language required manual review by senior staff, driving long handle times and inconsistent responses. I was the lone engineer responsible for delivery and ongoing operations.

## Problem

- Agents waited 12-18 minutes for complex responses and could not search historical guidance.
- Media messages (identity documents, statements) required human triage before responses.
- Compliance demanded auditable answers, rate limiting, and cost guardrails before launch.

## Approach

1. **Architecture** — Built a FastAPI webhook running on Cloudflare Pages Functions to receive WhatsApp Cloud API events. Detached media handling workers on Celery pulled files via signed URLs, normalized them, and queued enrichment jobs.
2. **Retrieval and orchestration** — Stored embeddings in Postgres + pgvector with hybrid search (semantic + keyword filters) scoped by intent. Implemented prompt chaining with controllable templates and fallback citations for audits.
3. **Ingest pipeline** — Created Git-backed markdown sources, validated with Great Expectations, and scheduled automatic re-indexing. Added cost guardrails and runbooks triggered by GitHub Actions when ingestion exceeded limits.
4. **Observability and SLOs** — Instrumented OpenTelemetry traces, structured logs, and metrics (p95 latency, success ratio, token spend). Exposed a daily SLO dashboard in Superset for operations staff.
5. **Safeguards** — Enforced policy filters, masked PII in logs, and implemented responder confirmation for high-risk intents. Added playbook diff alerts to Slack when knowledge changed.

## Results

- 5-8 second p95 response time (including media handling) across 14k monthly requests.
- 99 percent ingest success with automatic retries; incidents resolved within 30 minutes using runbooks.
- 33 percent reduction in agent time waste and a 22 percent improvement in first-response accuracy.
- Average assistant token cost kept under AED 0.38 per interaction with guardrail alerts.

## Stack

- FastAPI webhook hosted on Cloudflare Pages Functions.
- Postgres 15 with pgvector 0.5 for hybrid retrieval.
- Redis + Celery workers for media normalization and enrichment.
- Great Expectations + GitHub Actions to validate and deploy knowledge.
- Superset dashboard exposing SLOs, spend, and retraining cadence.

## Links

- Architecture diagram and runbooks available on request (part of internal documentation).

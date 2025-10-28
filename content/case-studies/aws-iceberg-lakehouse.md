---
title: "AWS Iceberg Lakehouse with Embedded BI"
date: "2025-04-10"
slug: "aws-iceberg-lakehouse"
tags: ["iceberg", "glue", "athena", "superset", "governance"]
ogTitle: "Iceberg Lakehouse - <1% loss"
ogDescription: "Iceberg + Glue + Athena with automated validation and Superset 5.0 embeds."
schemaType: "CreativeWork"
metrics:
  - "<1% data loss across ~260k rows"
  - "Row-level security for 7 business units"
  - "Dashboard releases gated by CI/CD"
stack:
  - "Amazon S3"
  - "AWS Glue"
  - "AWS Athena"
  - "Apache Iceberg"
  - "Great Expectations"
  - "Superset 5.0"
  - "GitHub Actions"
links:
  repo: ""
  demo: ""
summarySocial:
  linkedin: "Designed an AWS Iceberg lakehouse with Superset embeds, <1% data loss, and RLS for 7 business units."
  twitter: "AWS Iceberg lakehouse: <1% data loss, RLS across 7 business units, dashboards deployed via CI/CD."
---

## Context

Leadership at La Capitale needed unified reporting across finance, operations, and risk. Excel-based reporting failed audits and resulted in week-long delays. The mandate: deliver governed, self-serve analytics with row-level security, while keeping costs low enough for rapid iteration.

## Problem

- Legacy Glue jobs dumped data into S3 CSV files without schema evolution or validation.
- Analysts exported Superset dashboards manually, creating siloed metrics and conflicting definitions.
- Embedding dashboards into the CRM required strong authentication, auditing, and performance guarantees.

## Approach

1. **Lakehouse design** — Modeled Iceberg tables with partitioning by customer and statement date. Configured Glue Catalog and Athena with optimized file sizes and retention policies.
2. **Validation pipeline** — Implemented Great Expectations suites covering schema drift, null checks, and reconciliation against source systems. Runs orchestrated via GitHub Actions with Slack + email escalation on failure.
3. **Governance and CI/CD** — Versioned Superset dashboards in YAML. Introduced review workflows where any metric change executed validation + screenshot diffs before merging to main.
4. **Row-level security** — Mapped business unit policies into Superset RLS rules enforced via OAuth SSO. Exposed an auditable policy registry stored in D1 for quick reference.
5. **Embedded analytics** — Rendered dashboards inside the CRM through signed URLs with short-lived tokens. Added usage analytics and load testing to guarantee <2.2 second LCP for embedded views.

## Results

- <1% data loss across ~260k rows, with automated rollback when validation fails.
- Row-level security enforced for seven business units with zero policy breaches across quarterly audits.
- Dashboard releases made it through CI/CD in under 20 minutes, eliminating manual promotion steps.
- Stakeholders saw 38 percent faster reporting cycles and a 24 percent reduction in ad-hoc data requests.

## Stack

- Apache Iceberg tables on Amazon S3, cataloged via AWS Glue.
- AWS Athena with tuned workgroups and cost caps.
- Great Expectations for automated data quality with GitHub Actions orchestration.
- Superset 5.0 with embedded dashboards, OAuth SSO, and YAML exports.
- Cloudflare Pages for hosting the governance portal and exposing RLS policy docs.

## Links

- Internal documentation: governance checklist, validation results, and embed SLO dashboards (available under NDA).

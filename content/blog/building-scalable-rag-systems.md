---
title: "Building Scalable RAG Systems: Lessons from Production"
date: "2025-10-15"
slug: "building-scalable-rag-systems"
tags: ["RAG", "FastAPI", "Production", "Architecture"]
excerpt: "Five critical lessons learned from deploying retrieval-augmented generation systems in regulated environments with strict SLO requirements."
author: "Aditya Ganesh"
readingTime: "8 min read"
---

## Introduction

Over the past year, I've deployed multiple RAG (Retrieval-Augmented Generation) systems in production, handling thousands of queries daily with strict SLO requirements. Here are the key lessons that made the difference between a proof-of-concept and a reliable production system.

## Lesson 1: Hybrid Search is Non-Negotiable

Pure semantic search sounds elegant, but in practice, users expect exact keyword matches to work. I learned this the hard way when a system couldn't find "Form W-9" despite having perfect embeddings, because users typed the exact form number.

**The Solution:**
- Implement hybrid search combining pgvector semantic search with PostgreSQL full-text search
- Weight keyword matches higher for short, specific queries
- Use semantic search for exploratory questions

```python
# Hybrid search example
semantic_results = await search_embeddings(query_vector, limit=20)
keyword_results = await search_fulltext(query, limit=20)

# Merge and rerank
combined = rerank_results(semantic_results, keyword_results, query)
```

## Lesson 2: Cost Guardrails Are Critical

LLM costs can spiral quickly. On day one of a production deployment, a retry loop cost us $180 in 4 hours before we caught it.

**Guard Rails Implemented:**
- Token budgets per user/session with graceful degradation
- Cost caps that trigger alerts at 80% of budget
- Automatic fallback to smaller models
- Circuit breakers for runaway retry loops

## Lesson 3: Observability Makes or Breaks Debugging

When response quality degrades, you need to know WHY. Was it retrieval? Generation? A prompt change?

**Instrumentation Strategy:**
- OpenTelemetry traces linking retrieval → prompt → generation
- Structured logs with query embeddings, chunk IDs, and token counts
- Metrics tracked: p95 latency, chunk relevance scores, generation costs
- Daily Superset dashboards for operations team

## Lesson 4: Version Everything

Knowledge bases evolve. When users report "it used to work," you need to reproduce the exact state.

**Versioning Approach:**
- Git-backed markdown sources with conventional commits
- Immutable chunk IDs with content hashes
- Embedding version tags in metadata
- Blue-green deployments for knowledge updates

## Lesson 5: SLOs Drive Architecture

Our target was p95 ≤ 8s including media handling. This constraint shaped every decision:

**Optimizations:**
- Async workers (Celery) for media normalization
- Response streaming for perceived performance
- Cached embeddings with invalidation strategy
- Separate slow/fast paths based on query complexity

## Conclusion

Production RAG systems require more than good embeddings. Cost control, observability, and operational discipline are equally critical. Start with these patterns early—retrofitting them later is expensive.

**Key Takeaways:**
- Hybrid search beats pure semantic
- Guard rails prevent cost disasters
- Deep observability enables debugging
- Version control everything
- SLOs drive architectural choices

---

*Want to discuss RAG architecture or SLO design? [Let's connect](/contact/).*

---
title: "Data Quality Gates with Great Expectations: A Practical Guide"
date: "2025-09-28"
slug: "data-quality-great-expectations"
tags: ["Data Quality", "Great Expectations", "Python", "Testing"]
excerpt: "How to implement automated data validation in production pipelines using Great Expectations, with real examples from Iceberg ingestion workflows."
author: "Aditya Ganesh"
readingTime: "6 min read"
---

## Why Data Quality Gates Matter

In my AWS Iceberg lakehouse project, we ingested ~260,000 rows daily. A single bad ingestion could corrupt downstream analytics for weeks. Data quality gates weren't optional—they were survival.

## The Great Expectations Setup

Great Expectations provides a framework for defining, testing, and documenting data expectations as code.

**Installation:**
```bash
pip install great-expectations
great-expectations init
```

## Expectation Patterns I Use Daily

### 1. Schema Validation

```python
# Ensure required columns exist
batch.expect_table_columns_to_match_ordered_list(
    column_list=["user_id", "timestamp", "event_type", "metadata"]
)

# Check column types
batch.expect_column_values_to_be_of_type(
    column="user_id",
    type_="uuid"
)
```

### 2. Data Completeness

```python
# No nulls in critical fields
batch.expect_column_values_to_not_be_null(
    column="user_id"
)

# Acceptable null rate for optional fields
batch.expect_column_values_to_be_null(
    column="optional_notes",
    mostly=0.8  # Allow up to 80% nulls
)
```

### 3. Value Constraints

```python
# Bounded numeric ranges
batch.expect_column_values_to_be_between(
    column="age",
    min_value=0,
    max_value=120
)

# Enum validation
batch.expect_column_values_to_be_in_set(
    column="status",
    value_set=["pending", "active", "completed", "failed"]
)
```

### 4. Business Logic Rules

```python
# Custom expectation for data freshness
batch.expect_column_max_to_be_between(
    column="created_at",
    min_value=datetime.now() - timedelta(hours=25),
    max_value=datetime.now()
)
```

## Integration with GitHub Actions

We run expectations on every PR affecting data schemas:

```yaml
- name: Validate Data Quality
  run: |
    great_expectations checkpoint run ingestion_checkpoint

- name: Generate Data Docs
  run: |
    great_expectations docs build

- name: Comment PR with Results
  uses: actions/github-script@v6
  with:
    script: |
      // Post validation results to PR
```

## Handling Failures Gracefully

Not all expectation failures should block production. We use severity levels:

```python
# CRITICAL: Block deployment
batch.expect_column_values_to_not_be_null(
    column="user_id",
    meta={"severity": "critical"}
)

# WARNING: Alert but allow
batch.expect_column_mean_to_be_between(
    column="transaction_amount",
    min_value=10,
    max_value=5000,
    meta={"severity": "warning"}
)
```

## Monitoring in Production

Great Expectations integrates with observability tools:

- Send validation results to Slack
- Track failure rates in Datadog/CloudWatch
- Store validation history in PostgreSQL
- Visualize trends in Superset

## Results: Data Loss < 1%

After implementing systematic expectations:
- Data loss dropped from ~5% to <1%
- Mean time to detection: 4 minutes (down from hours)
- Zero downstream analytics corruption incidents
- Validation overhead: ~30 seconds per ingestion

## Conclusion

Great Expectations turns implicit assumptions into explicit, testable contracts. Start with critical fields, expand gradually, and treat expectations as living documentation.

**Key Principles:**
- Define expectations early in development
- Use severity levels for nuanced handling
- Integrate validation into CI/CD
- Monitor validation metrics in production
- Document business logic as expectations

---

*Questions about data quality or Great Expectations? [Reach out](/contact/).*

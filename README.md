# ClauseChain

Agentic Compliance: From Regulatory Text to Operational Action

A solution for SEBI Hackathon — Problem Statement 2

## Overview

ClauseChain is an agentic compliance platform that closes the loop between SEBI's regulatory text and an intermediary's day-to-day operations. It addresses both halves of PS2 with a single architecture:

1. **Regulatory Intelligence Engine** — continuously converts new and amended circulars into structured, machine-actionable obligations
2. **Compliance Operations Engine** — tracks obligations against real evidence, maintains an immutable audit trail, and proactively surfaces gaps before they become findings

## Problem Statement Alignment

### Target Intermediary & Regulatory Corpus

Built against the **SEBI Master Circular for Stock Brokers**:
- Publicly available with clearly numbered chapters and clauses
- High-frequency obligation categories (margin reporting, client fund segregation, cyber security, investor grievance redressal, algo trading controls)
- Generalises to Investment Advisers, Depository Participants and RTAs

## Solution Overview

ClauseChain operates as a continuous loop:

```
Watch → Understand → Translate → Operate → Audit → Remediate
```

1. **Watch** — Monitor SEBI's circular repository for new issuances and amendments
2. **Understand** — Segment documents, extract obligations with conditions, deadlines, roles and penalties
3. **Translate** — Compile obligations into structured Compliance Rule Objects
4. **Operate** — Assign tasks, collect evidence, track fulfilment status
5. **Audit** — Maintain tamper-evident, timestamped trail linking obligations to evidence
6. **Remediate** — Scan for overdue/missing evidence and escalate before findings occur

Human compliance officers remain in the loop at two key points:
- Reviewing/approving newly extracted obligations
- Reviewing evidence flagged as borderline

## Architecture

### High-Level Data Flow

```
SEBI Circular (PDF/HTML)
  → Ingestion Agent            [fetch + normalise]
  → Diff Agent                 [compare vs. last version]
  → Segmentation Agent         [clause-level chunking]
  → Extraction Agent           [obligation, actor, deadline, penalty]
  → Classification Agent       [map to process taxonomy]
  → Rule Compilation Agent     [→ Compliance Rule Object, JSON]
  → Human Review Checkpoint    [compliance officer approves/edits]
  → Workflow Generation Agent  [creates/updates task templates]
  → Compliance Register        [live obligation ↔ evidence ↔ status]
  → Gap Detection Agent        [flags overdue/missing/weak evidence]
  → Audit Log                  [append-only, hash-chained record]
```

### Agents

| Agent | Responsibility |
|-------|----------------|
| **Ingestion** | Polls SEBI circular index, downloads/converts documents, computes content hash |
| **Diff & Change-Detection** | Compares new vs. last version at clause granularity |
| **Segmentation** | Splits sections into addressable clauses with stable citation IDs |
| **Extraction** | Extracts structured obligation records via constrained generation |
| **Classification** | Maps obligations to internal process taxonomy |
| **Rule Compilation** | Converts to versioned Compliance Rule Objects |
| **Human Review** | Diff-style UI for approve/edit/reject with reason |
| **Workflow Generation** | Creates recurring task templates in Compliance Register |
| **Evidence Mapping & Gap Detection** | Reconciles evidence, computes fulfilment status, escalates gaps |
| **Compliance Copilot** | RAG-based natural-language interface for querying obligations |

### Compliance Rule Object (Example)

```json
{
  "id": "CRO-2026-0143",
  "obligation": "Stock broker shall conduct VAPT of critical systems at least once a year and submit report to the stock exchange within the prescribed timeline.",
  "source": { "circular": "SEBI/HO/MIRSD/CSCRF/2026", "clause": "Ch.4, Cl.12" },
  "actor_role": "Chief Information Security Officer",
  "taxonomy": "Cyber Security & Resilience",
  "frequency": "ANNUAL",
  "deadline_rule": "within 30 days of VAPT completion",
  "evidence_required": ["Signed VAPT report", "Exchange submission acknowledgement"],
  "penalty": "As per SEBI enforcement schedule, Ch.9",
  "status": "approved",
  "version": 2
}
```

## Concrete Regulatory Scenario

The prototype demonstrates end-to-end against the **Cyber Security and Cyber Resilience Framework (CSCRF)** obligations:

1. Load CSCRF section into Ingestion Agent
2. Show Extraction Agent output: VAPT and incident-reporting obligations as structured records
3. Human Review Checkpoint: compliance officer approves rule objects
4. Workflow Generation Agent creates recurring annual VAPT task and conditional incident-reporting task
5. Upload sample VAPT report → task moves to "Compliant" with audit log entry
6. Simulate missed deadline → Gap Detection Agent escalates
7. Ask Compliance Copilot: "Which CSCRF obligations are currently open for our RMS/CISO team?"

## Security & Privacy

- **Tenant isolation** — logically isolated per intermediary
- **Encryption** — TLS 1.3 in transit, AES-256 at rest
- **Access control** — RBAC with least-privilege roles
- **Data privacy** — DPDP Act 2023 alignment, PII redaction
- **Audit logging** — hash-chained entries, tamper-evident

## Differentiation

- **Dual-loop design** — addresses both translation and tracking in one system
- **Full citation** — every output traced to exact clause
- **Durable orchestration** — Temporal-based, not single LLM prompts
- **Human-in-the-loop** — accountability preserved at critical checkpoints
- **Generalisable taxonomy** — extends to other intermediary categories

## Execution Plan

| Phase | Timeline | Focus |
|-------|----------|-------|
| Phase 0 | Now | Architecture finalisation, benchmark subset, JSON schema |
| Phase 1 | Week 1 | Core pipeline: ingestion, segmentation, extraction, classification |
| Phase 2 | Week 2 | Operations: register, evidence, gap detection, audit log |
| Phase 3 | Week 3 | Experience: dashboard, copilot, end-to-end demo |
| Phase 4 | Week 4 | Hardening: evaluation metrics, security pass, jury prep |

## Post-Hackathon Roadmap

- Extend to Investment Advisers, Depository Participants, RTAs, AMCs
- Integrate with ticketing (Jira/ServiceNow), document management, HR systems
- Explore SEBI SCORES/Unified Investor Platform API integration
- Publish open evaluation report for accuracy benchmarking
- Migrate to full Temporal-based durable execution

## License

[Add license information]

---

*Built for SEBI Hackathon — Problem Statement 2*
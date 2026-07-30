# ClauseChain — Comprehensive Documentation

*All plan documents, problem statement analysis, and build specifications consolidated into a single reference.*

---

## Table of Contents

1. [Problem Statement Analysis](#1-problem-statement-analysis)
2. [Solution Architecture](#2-solution-architecture)
3. [Agent-by-Agent Build Specification](#3-agent-by-agent-build-specification)
4. [Data Model](#4-data-model)
5. [Prototype Scope — What Gets Built vs. Cut](#5-prototype-scope)
6. [Demo Script](#6-demo-script)
7. [UI Screens](#7-ui-screens)
8. [Technology Stack](#8-technology-stack)
9. [Evaluation Criteria Mapping](#9-evaluation-criteria-mapping)
10. [Timeline & Execution Plan](#10-timeline--execution-plan)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Security, Privacy & IP](#12-security-privacy--ip)
13. [Post-Hackathon Roadmap](#13-post-hackathon-roadmap)
14. [Repository Structure](#14-repository-structure)
15. [Open Items](#15-open-items)

---

## 1. Problem Statement Analysis

### 1.1 Official Problem Statement (PS2)

**Title:** Agentic Compliance — From Regulatory Text to Operational Action

**Source:** SEBI Securities Market TechSprint, Problem Statement 2

**Deadline:** Submission by 21 Aug 2026, 11:59 PM · Jury round 22–25 Aug 2026

### 1.2 The Two Core Challenges

SEBI's problem statement identifies two distinct but deeply related compliance challenges:

#### Challenge 1: Dynamic Regulatory Translation
- Interpreting new or amended regulatory requirements
- Mapping them to the affected intermediary's operational processes
- Updating compliance workflows in a timely and consistent manner
- **Current state:** depends heavily on manual legal interpretation, internal compliance teams, and circular-by-circular tracking
- **Result:** uneven implementation, delayed adaptation, divergent interpretations across similarly situated intermediaries

#### Challenge 2: Ongoing Compliance Management
- Tracking existing regulatory obligations
- Mapping each obligation to evidence of fulfilment
- Maintaining audit trails
- Identifying and remediating compliance gaps before they become regulatory findings
- **Current state:** operationally intensive, often manual, prone to gaps especially in smaller intermediaries with limited compliance resources

### 1.3 The Root Cause

Both challenges share a common root: **the regulatory framework exists as unstructured, human-readable text, while operational compliance systems require structured, machine-actionable rules.** Bridging this gap — transforming regulatory intent into programmable, auditable compliance logic — is the core unsolved problem.

### 1.4 Desired Outcome

A technology-based solution that:
- Reduces the gap between regulatory issuance and operational compliance action
- Materially improves efficiency, accuracy, and auditability of compliance management
- Specifies the intermediary category and regulatory corpus
- Demonstrates performance on at least one concrete regulatory scenario

### 1.5 Our Selected Scope

| Dimension | Choice | Rationale |
|---|---|---|
| **Intermediary** | Stockbrokers | Highest-frequency obligation categories (margins, cyber security, investor grievance); taxonomy generalises to IAs, DPs, RTAs |
| **Regulatory Corpus** | SEBI Master Circular for Stock Brokers | Publicly available, clearly numbered chapters/clauses, ideal for extraction benchmark |
| **Concrete Scenario** | CSCRF (Cyber Security & Cyber Resilience Framework) | Has testable parameters (frequency, deadlines, evidence types); includes both periodic (annual VAPT) and event-driven (incident reporting) obligations |

---

## 2. Solution Architecture

### 2.1 System Philosophy

ClauseChain operates as a **continuous loop**, not a one-shot tool:

```
Watch → Understand → Translate → Operate → Audit → Remediate
```

A human compliance officer remains in the loop at two critical points:
1. **Reviewing/approving newly extracted obligations** before they go live (legal interpretation is ultimately human accountability)
2. **Reviewing evidence** the system flags as borderline

This keeps the system auditable and trustworthy rather than a black box making compliance determinations unsupervised.

### 2.2 Layered Architecture

| Layer | Name | Responsibility |
|---|---|---|
| **Layer 1** | Ingestion Layer | Fetch and normalise circulars from SEBI sources |
| **Layer 2** | Agentic Reasoning Layer | Complete agent pipeline from segmentation through rule compilation |
| **Layer 3** | Knowledge & Rules Layer | Canonical store of obligations, versions, taxonomy and compiled rules |
| **Layer 4** | Workflow & Orchestration Layer | Durable, resumable execution of recurring compliance tasks |
| **Layer 5** | Compliance Operations Layer | Task assignment, evidence upload/linking and status computation |
| **Layer 6** | Audit & Trust Layer | Immutable, hash-chained log of every state change |
| **Layer 7** | Experience Layer | Compliance officer dashboard, obligation explorer and copilot |
| **Layer 8** | Security & Access Layer | Authentication, authorization, encryption and tenant isolation |

### 2.3 High-Level Data Flow

```
SEBI Circular (PDF/HTML)
  → Ingestion Agent            [fetch + normalise]
  → Diff Agent                 [compare vs. last master circular version]
  → Segmentation Agent         [clause-level chunking with citations]
  → Extraction Agent           [obligation, actor, deadline, penalty, condition]
  → Classification Agent       [map to internal process taxonomy]
  → Rule Compilation Agent     [→ structured Compliance Rule Object, JSON]
  → Human Review Checkpoint    [compliance officer approves / edits]
  → Workflow Generation Agent  [creates/updates recurring task templates]
  → Compliance Register        [live obligation ↔ evidence ↔ status]
  → Gap Detection Agent        [flags overdue / missing / weak evidence]
  → Audit Log                  [append-only, hash-chained record]
```

---

## 3. Agent-by-Agent Build Specification

### 3.1 Ingestion Agent
- **Input:** CSCRF excerpt from the Master Circular for Stock Brokers (PDF or clean text file)
- **Output:** Normalized structured text preserving chapter/clause numbering + a content hash for change detection
- **Implementation:** One-time load/parse job triggered from the UI ("Ingest new circular" button). No live polling. Polls SEBI's circular index on a schedule in production; prototype uses a static file upload.
- **Key detail:** Converts to clean structured text, computes SHA-256 content hash to detect true changes vs. re-publication

### 3.2 Diff Agent (Simulated)
- **Input:** Two pre-loaded versions of the same clause (authored "old" and "amended" versions)
- **Output:** Change-set: added / modified / removed / unchanged clauses
- **Implementation:** Real diff logic (text-diff + LLM-summarized change description) run against two seeded versions. Pre-load two known versions, run real diff logic. Don't build a live SEBI site poller.
- **Purpose:** Demonstrates "the system reacts to what actually changed" rather than reprocessing the entire corpus

### 3.3 Segmentation Agent
- **Input:** Normalized circular text
- **Output:** List of clauses, each with a stable citation ID (e.g., `Ch.4, Cl.12`)
- **Implementation:** Hybrid regex + LLM pass. SEBI circulars have fairly regular clause numbering, so a regex-based first pass with LLM fallback for edge cases should be reliable.
- **Purpose:** Every downstream obligation can be traced back to an exact source passage

### 3.4 Extraction Agent
- **Input:** A single clause
- **Output (per clause):**
  - Obligation statement (normalised, controlled vocabulary)
  - Responsible role(s) within the intermediary (e.g., Compliance Officer, Designated Director, RMS)
  - Trigger / applicability condition
  - Frequency (one-time, monthly, quarterly, annual, event-driven)
  - Deadline / turnaround time
  - Evidence type required (report, board resolution, system log, filing acknowledgement)
  - Penalty / consequence of non-compliance, where stated
- **Implementation:** Structured/function-calling output (JSON mode) against the LLM provider. **Highest-value agent** — precision here is what "demonstrate performance" is judged on.
- **Validation:** Hand-annotate 5–10 clauses from the CSCRF excerpt as ground truth first; iterate the extraction prompt against it before building downstream agents

### 3.5 Classification Agent
- **Input:** Extracted obligation
- **Output:** Taxonomy category
- **Implementation:** Fixed taxonomy list rather than open-ended:
  - Cyber Security & Resilience
  - KYC/AML
  - Funds & Securities Segregation
  - Investor Grievance
  - Reporting
- **Approach:** Simple classification prompt or keyword-assisted classification; doesn't need to be sophisticated

### 3.6 Rule Compilation Agent
- **Input:** Classified obligation
- **Output:** A validated Compliance Rule Object (JSON, schema in §4)
- **Implementation:** Converts the classified obligation into a versioned, machine-actionable Compliance Rule Object. Validate against a JSON Schema before allowing into the Human Review queue — cheap to add and directly supports the "auditable compliance logic" language in PS2.

### 3.7 Human Review Checkpoint
- **Input:** Pending Compliance Rule Objects
- **Output:** Approved / edited / rejected, with a reason logged
- **Implementation:** Real UI screen — a queue view, diff-style if time allows, simple approve/reject buttons if not. **This is the accountability feature** that answers the jury's "who's responsible if the AI is wrong" objection. Must be visibly demoed, not just present in the code.

### 3.8 Workflow Generation Agent
- **Input:** Approved Compliance Rule Object
- **Output:** A task template in the Compliance Register (owner, frequency, due date, evidence required)
- **Implementation:** Near-deterministic logic off the rule object's fields; doesn't need much "agentic" reasoning. Creates or updates recurring task templates and schedules the next occurrence.

### 3.9 Evidence Mapping & Gap Detection Agent
- **Input:** Uploaded evidence file + the obligation it's linked to
- **Output:** Status (Compliant / Pending / Overdue / At-Risk) + escalation if overdue with no evidence
- **Implementation:** Rule-based deadline math:
  - `today > due_date and no evidence uploaded → Overdue`
  - `evidence exists but doesn't match required type → At-Risk`
  - Evidence nearing deadline with no upload → escalation to owner, then compliance head
- **Approach:** Legitimate and reliable rule-based logic; don't over-engineer into an LLM call

### 3.10 Audit Log
- **Input:** Every state change (rule approved, task created, evidence uploaded, status changed)
- **Output:** Append-only, SHA-256 hash-chained record
- **Implementation:** A table with `prev_hash`, `entry_hash`, `payload`, computed on write. Each entry's hash includes the previous entry's hash, making silent edits to compliance history detectable.
- **Differentiator:** Genuinely simple to implement, strong demo feature — "here's how we'd detect a silent edit to this record."

### 3.11 Compliance Copilot Agent
- **Input:** Natural language question
- **Output:** Grounded answer citing the specific rule object(s)/clause(s) it's based on
- **Implementation:** RAG scoped only to approved Compliance Rule Objects. With ~10–20 records total, pgvector is unnecessary; a simple embedding similarity search in-memory (or keyword + LLM re-ranking) is enough.
- **Example query:** *"Which CSCRF obligations are currently open for our RMS/CISO team?"*

---

## 4. Data Model

### 4.1 Compliance Rule Object (Target Schema)

```json
{
  "id": "CRO-2026-0143",
  "obligation": "Stock broker shall conduct VAPT of critical systems at least once a year and submit report to the stock exchange within the prescribed timeline.",
  "source": {
    "circular": "SEBI/HO/MIRSD/CSCRF/2026",
    "clause": "Ch.4, Cl.12"
  },
  "actor_role": "Chief Information Security Officer",
  "taxonomy": "Cyber Security & Resilience",
  "frequency": "ANNUAL",
  "deadline_rule": "within 30 days of VAPT completion",
  "evidence_required": [
    "Signed VAPT report",
    "Exchange submission acknowledgement"
  ],
  "penalty": "As per SEBI enforcement schedule, Ch.9",
  "status": "approved",
  "approved_by": "compliance_officer_id_88",
  "version": 2
}
```

### 4.2 Supporting Entities (Minimum for Demo)

| Entity | Fields | Purpose |
|---|---|---|
| **Circular** | id, title, source URL/file, ingested date, status | Tracks ingested regulatory documents |
| **Clause** | circular_id, citation_id, raw_text | Individual clauses with stable citation IDs |
| **ComplianceRuleObject** | (see §4.1 schema above) | The core artifact bridging regulation and operations |
| **ComplianceTask** | rule_object_id, owner, due_date, frequency, status, linked evidence | Operational tasks generated from approved rules |
| **Evidence** | task_id, file_url, uploaded_by, uploaded_at | Proof of fulfilment linked to tasks |
| **AuditEntry** | entity_type, entity_id, action, payload, prev_hash, entry_hash, timestamp | Hash-chained append-only audit trail |

---

## 5. Prototype Scope

### 5.1 Build Real

| Component | Notes |
|---|---|
| Ingestion Agent | Parses a static CSCRF excerpt (file you feed it) — not live polling SEBI's site |
| Segmentation Agent | Clause-level chunking with stable citation IDs |
| Extraction Agent | Structured/function-calling extraction: obligation, actor role, condition, deadline, frequency, evidence type, penalty |
| Classification Agent | Maps to process taxonomy (fixed list: Cyber Security & Resilience, KYC/AML, Funds Segregation, Investor Grievance, Reporting) |
| Rule Compilation Agent | Produces the Compliance Rule Object JSON (schema in §4.1), validated |
| Human Review Checkpoint | Real UI: approve / edit / reject, seeded with the CSCRF obligations |
| Workflow Generation Agent | Creates real task templates in the Compliance Register |
| Compliance Register | Live obligation ↔ evidence ↔ status table |
| Evidence upload + linking | Real file upload, linked to obligation |
| Gap Detection | Rule-based deadline logic — doesn't need to be a separate LLM call |
| Audit Log | Real SHA-256 hash-chained records in Postgres — cheap to build, strong differentiator |
| Compliance Copilot | RAG scoped to approved rule objects only — in-memory similarity search is enough |

### 5.2 Simulate (Real Logic, Fake Trigger)

| Component | Notes |
|---|---|
| Diff Agent | Pre-load two known versions of the same clause, run **real diff logic** on them. Don't build a live SEBI site poller. |

### 5.3 Cut from Code — Roadmap Only

| Item | Rationale |
|---|---|
| Temporal.io orchestration | Use BullMQ + Redis (MVP fallback) |
| Docker/Kubernetes/CI pipelines | Single deploy target (Render/Railway) |
| OAuth2/SAML SSO, multi-role RBAC | Single demo login |
| unstructured.io/LlamaParse + OCR fallback | Simple parser for known circular text |
| Langfuse/Prometheus/Grafana monitoring | Not demoable |
| Multi-tenant org switching | One hardcoded tenant |
| Custom domain / product landing page | Optional Phase 4 polish only |

---

## 6. Demo Script

The jury sees this end-to-end, live (7 steps):

| Step | Action | What the Jury Sees |
|---|---|---|
| **1** | Load the CSCRF section of the Master Circular into the Ingestion Agent | Raw regulatory text enters the system |
| **2** | Show Extraction Agent output | VAPT + incident-reporting obligations as structured records, each citing its exact clause |
| **3** | Human Review Checkpoint: approve both rule objects | Compliance officer approves the rule objects — accountability is human |
| **4** | Workflow Generation creates tasks | Recurring annual VAPT task + conditional incident-reporting task appear in the Register |
| **5** | Upload a sample VAPT report as evidence | Task moves to "Compliant" → audit log entry appears |
| **6** | Simulate a missed deadline on the second obligation | Gap Detection escalates it → show the fully cited audit trail |
| **7** | Ask the Copilot: *"Which CSCRF obligations are currently open for our RMS/CISO team?"* | Grounded, cited answer from the RAG system |

**Prep needed before this can run:**
- The CSCRF excerpt itself (~10–15 clauses covering VAPT + incident reporting)
- Hand-annotated ground truth for those clauses
- One "old version" of a clause for the Diff Agent demo

---

## 7. UI Screens

Only these screens are needed (matches the validated jury-facing shape):

| # | Screen | Content |
|---|---|---|
| 1 | **Dashboard** | Overview counts (new circulars, pending approvals, open tasks, overdue tasks) + recent activity feed |
| 2 | **Circulars** | List of ingested circulars with status |
| 3 | **Rule Review** | Human Review Checkpoint queue (approve/reject, confidence score optional but nice) |
| 4 | **Compliance Register** | Master table: obligation, clause, owner, due date, evidence count, status |
| 5 | **Tasks** | Kanban board (To do / In progress / In review / Done) |
| 6 | **Copilot** | Chat interface, cited answers |
| 7 | **Audit Trail** | Simple append-only log viewer |

**Visual theme:** TBD — explicitly not the dark navy AI-assistant look from the Lovable mock. Revisit after core functionality works.

---

## 8. Technology Stack

### Production-Grade Stack (Full Vision)

| Layer | Technology |
|---|---|
| **Frontend** | Next.js + TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js (NestJS) / Python (FastAPI) — layered microservices |
| **AI & Agents** | LangGraph (stateful, resumable, retry-safe workflows), OpenRouter (model-agnostic LLM layer), RAG for extraction & Copilot |
| **Document Processing** | unstructured.io / LlamaParse, Tesseract OCR (fallback) |
| **Data & Storage** | PostgreSQL (Neon) + pgvector, Prisma ORM, Cloudflare R2 (S3-compatible) |
| **Workflow Engine** | Temporal.io (production) / BullMQ + Redis (MVP) |
| **Security** | OAuth2 / SAML SSO, RBAC, TLS 1.3 in transit, AES-256 at rest |
| **Audit & Monitoring** | SHA-256 hash-chained audit trail, Langfuse (LLM tracing), Prometheus + Grafana |
| **Deployment** | Docker, Kubernetes, GitHub Actions CI/CD |

### Simplified Prototype Stack (What Actually Gets Built)

| Layer | Technology |
|---|---|
| **Frontend** | Next.js + TypeScript + Tailwind + shadcn/ui |
| **Backend** | Node.js (NestJS) or FastAPI |
| **Agent Orchestration** | BullMQ + Redis (not Temporal) |
| **LLM Layer** | OpenRouter (model-agnostic) |
| **Data** | PostgreSQL (Neon/Supabase) + Prisma — skip pgvector, in-memory similarity is enough |
| **Storage** | Cloudflare R2 or Supabase storage for evidence files |
| **Deploy** | Render or Railway, single service |

---

## 9. Evaluation Criteria Mapping

SEBI scores on five criteria. How each is addressed:

| Criterion | How It's Addressed | What the Jury Sees |
|---|---|---|
| **Market Impact** | Compliance Register + Gap Detection dashboard; tiered SaaS business model | Turning weeks of manual circular-reading into a live, queryable register |
| **Technology & Innovation** | Agent pipeline with structured extraction; versioned Compliance Rule Object schema | The RAG Copilot with citations is the visible "wow" |
| **Feasibility** | Deliberate scope cuts protect this — working deployed pipeline beats ambitious half-broken one | A bug-free end-to-end demo |
| **Scalability** | Architecture doc's roadmap (Temporal, multi-tenant, other intermediary categories); taxonomy-based design generalizes | Referenced in the demo, not built |
| **Alignment with SEBI's Objectives** | Dual-loop design directly answers PS2's "two distinct but deeply related challenges" framing | Say this explicitly in the jury walkthrough, don't make them infer it |

### PS2 Language → Build Mapping

| PS2 Language | Requirement | Where It Lives |
|---|---|---|
| "interpreting a new or amended regulatory requirement, mapping it to operational processes" | Dynamic regulatory translation | Ingestion → Segmentation → Extraction → Classification → Rule Compilation |
| "updating compliance workflows in a timely and consistent manner" | Automated workflow updates | Workflow Generation Agent |
| "tracking existing regulatory obligations, mapping to evidence of fulfilment, maintaining audit trails" | Ongoing compliance management | Compliance Register + Evidence upload + Audit Log |
| "identifying and remediating compliance gaps before they become regulatory findings" | Proactive, not reactive | Gap Detection Agent |
| "transforming regulatory intent into programmable, auditable compliance logic" | The literal artifact | The Compliance Rule Object (JSON) |

---

## 10. Timeline & Execution Plan

**Phase 1 (Idea Submission):** Cleared ✅

**Phase 2 (Prototype Build):** 13 Jul 2026 → 21 Aug 2026

### Week 1 (Now → Aug 2)
- [ ] Finalize the CSCRF excerpt (10–15 clauses covering VAPT + incident reporting)
- [ ] Hand-annotate expected extraction output for each clause (ground truth)
- [ ] Repo scaffolding: Next.js + backend + Postgres/Prisma schema
- [ ] Build Ingestion Agent + Segmentation Agent; validate clause chunking
- [ ] Build Extraction Agent; check output against ground truth, iterate on prompt

### Week 2 (Aug 3–9)
- [ ] Build Classification Agent + Rule Compilation Agent; get a validated CRO flowing end-to-end
- [ ] Build Human Review Checkpoint UI
- [ ] Build Diff Agent against two seeded clause versions

### Week 3 (Aug 10–16)
- [ ] Build Workflow Generation → Compliance Register
- [ ] Build Evidence upload + linking + status computation
- [ ] Build Gap Detection + Audit Log (hash-chaining)
- [ ] Build Compliance Copilot (RAG over approved rule objects)
- [ ] Deploy live; GitHub repo demo-ready

### Week 4 (Aug 17–21)
- [ ] Full dry-run of the 7-step demo script; fix what breaks
- [ ] Record backup demo video (in case of live connectivity issues)
- [ ] Prep jury Q&A — including "vs. generic AI chatbot" differentiation
- [ ] Optional: custom domain, visual theme pass (only if core is solid)

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Extraction accuracy too low on demo clauses | Hand-annotate ground truth early (Week 1), iterate prompt against it before building downstream agents on top of bad output |
| Running out of time before Copilot/Gap Detection | These are Week 3 — if behind schedule, cut Copilot polish before cutting the core pipeline (the extraction pipeline is non-negotiable, Copilot is the most cuttable "extra") |
| Live demo breaks during jury round | Backup recorded demo video, rehearsed in Week 4 |
| Jury asks "why isn't X built" (Temporal/multi-tenant/SSO) | Have the roadmap answer ready — reference the full plan doc, explain it's a deliberate 4-week scope decision, not an oversight |

---

## 12. Security, Privacy & IP

### Security Posture
- **Tenant isolation:** each intermediary's obligations, tasks and evidence are logically (and optionally physically) isolated
- **Encryption:** TLS 1.3 in transit, AES-256 at rest for evidence documents and the audit log
- **Access control:** RBAC with least-privilege roles (Compliance Officer, Task Owner, Auditor — read-only, Admin)
- **Data minimisation & DPDP Act 2023 alignment:** evidence documents scanned for personal data; PII redacted before indexing where not required for compliance proof
- **No client data** used to train or fine-tune third-party models; LLM calls use zero-retention API modes where supported
- **Immutable audit logging:** hash-chained entries make silent edits to compliance history detectable — matters for both internal audit and SEBI inspection defensibility

### Intellectual Property
- Architecture, agent pipeline, rule-object schema, and codebase are original work
- Only third-party inputs: SEBI's publicly published circulars (used as reference text, not reproduced beyond short cited excerpts) and standard open-source/commercial infrastructure components used within licence terms
- No proprietary datasets, scraped confidential material, or third-party compliance content

---

## 13. Post-Hackathon Roadmap

| Phase | Items |
|---|---|
| **Near-term** | Extend taxonomy and rule compilation to Investment Advisers, Depository Participants, RTAs, and AMCs |
| **Integration** | Connect with intermediaries' existing systems — Jira/ServiceNow, document management, HR systems for role-based task routing |
| **Regulatory integration** | Explore integration with SEBI's SCORES/Unified Investor Platform and exchange reporting portals where public APIs exist |
| **Benchmarking** | Formal accuracy benchmarking across the full master circular corpus, published as an open evaluation report |
| **Production infra** | Move from BullMQ-based MVP to full Temporal-based durable execution |

---

## 14. Repository Structure

```
clausechain/
  apps/
    web/              # Next.js frontend
    api/              # NestJS or FastAPI backend
  packages/
    agents/           # ingestion, segmentation, extraction, classification,
                      # rule-compilation, gap-detection, copilot logic
    schema/           # Compliance Rule Object JSON Schema + validators
  data/
    cscrf-excerpt.txt # the seeded circular text used for the demo
    ground-truth.json # hand-annotated expected extraction output
  PROTOTYPE_SCOPE.md
  ClauseChain_Prototype_Build_Plan.md
```

---

## 15. Open Items

| Item | Status | Priority |
|---|---|---|
| UI visual direction — dark navy theme rejected | Replacement TBD | Medium (after core works) |
| Differentiation talking point: "how is this different from a generic AI chatbot" | Needs a crisp answer before jury round | High |
| Custom domain + product landing page | Optional Phase 4 polish | Low |
| Hand-annotate CSCRF excerpt ground truth | Not started | High (Week 1 blocker) |
| Pick and finalize the CSCRF excerpt clauses | Not started | High (Week 1 blocker) |

---

*This document consolidates: PS2_Problem_Statement.md, ClauseChain_PS2_Plan_WellFormatted.md, Phase_2_plan.md, PROTOTYPE_SCOPE.md, and ClauseChain_Prototype_Build_Plan.md. Last updated: 26 Jul 2026.*

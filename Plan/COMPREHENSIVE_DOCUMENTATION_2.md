# ClauseChain — Comprehensive Documentation (v2)

*Consolidated reference: problem statement, architecture, build spec, and jury prep. Supersedes the v1 draft per the structural/content critique.*

**Today:** 26 Jul 2026 · **Submission:** 21 Aug 2026, 11:59 PM · **Jury round:** 22–25 Aug 2026 (~26 days remaining)

---

## Table of Contents

1. [Decisions Record](#1-decisions-record)
2. [Problem Statement Analysis](#2-problem-statement-analysis)
3. [Solution Architecture](#3-solution-architecture)
4. [Agent Reference](#4-agent-reference)
5. [Data Model](#5-data-model)
6. [Demo Script](#6-demo-script)
7. [Demo Failure Runbook](#7-demo-failure-runbook)
8. [Judge Prep — Five Hardest Questions](#8-judge-prep)
9. [UI Screens](#9-ui-screens)
10. [Technology Stack](#10-technology-stack)
11. [Evaluation Criteria Mapping](#11-evaluation-criteria-mapping)
12. [Timeline](#12-timeline)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Security, Privacy & IP](#14-security-privacy--ip)
15. [Repository Structure](#15-repository-structure)
16. [Post-Hackathon Roadmap](#16-post-hackathon-roadmap)
17. [Open Items](#17-open-items)

---

## 1. Decisions Record

Every choice that was previously listed as "X or Y" is resolved here. If it's not on this list, it isn't decided yet — check §17.

| Decision | Choice | Why |
|---|---|---|
| Backend framework | **Express (Node.js)**, not NestJS or FastAPI | Matches the stack already used repeatedly on other builds — reuse under deadline pressure beats a new framework's structure, and it stays in one language (JS/TS) with the frontend and agent-calling code |
| Agent orchestration | **BullMQ + Redis**, not Temporal.io | Temporal is a real skill investment; a queue is enough to demonstrate the orchestration pattern for a 4-week solo-heavy build. Temporal stays on the production roadmap. |
| Vector search / RAG | **In-memory similarity search**, not pgvector | At ~10–20 Compliance Rule Objects total, an embedding index in Postgres is infra you'd be debugging for no visible benefit. Revisit only if the Copilot corpus grows. |
| Extraction accuracy target | **Pragmatic, not formal**: every clause in the hand-annotated CSCRF demo set extracts all required fields (obligation, actor, deadline, evidence type) correctly | This is a prototype validation, not a benchmark study. Formal precision/recall across the full corpus is explicitly a roadmap item (§16), not a Week 1–4 deliverable. Don't over-claim rigor you don't have time to earn. |
| Diff Agent's place in the live demo | **Not part of the 7-step main script.** Demoed as a separate, short beat during/after the Ingestion step, run against two pre-seeded clause versions — not against the live CSCRF excerpt the rest of the pipeline processes. | The main pipeline (steps 1–7 in §6) runs end-to-end on the *new* CSCRF excerpt. The Diff Agent's job — "react to what changed" — needs an old + new version pair, which isn't otherwise in the story. Keeping it separate avoids implying the whole pipeline re-runs on every diff. |
| Team split | **Not decided** | Genuinely open — see §17. Flagging here so it's not silently assumed. |

---

## 2. Problem Statement Analysis

### 2.1 Official Problem Statement (PS2)

**Title:** Agentic Compliance — From Regulatory Text to Operational Action
**Source:** SEBI Securities Market TechSprint, Problem Statement 2

### 2.2 The Two Core Challenges

**Challenge 1 — Dynamic Regulatory Translation:** interpreting new/amended regulatory requirements, mapping them to an intermediary's operational processes, updating compliance workflows consistently. Currently manual, circular-by-circular — resulting in uneven implementation and delayed adaptation.

**Challenge 2 — Ongoing Compliance Management:** tracking existing obligations, mapping each to evidence of fulfilment, maintaining audit trails, catching gaps before they become regulatory findings. Currently manual and gap-prone, especially at smaller intermediaries.

**Root cause (shared by both):** regulation exists as unstructured text; compliance systems need structured, machine-actionable rules. Bridging that is the core unsolved problem PS2 names.

### 2.3 Desired Outcome

A solution that reduces the regulatory-issuance-to-operational-action gap, or materially improves efficiency/accuracy/auditability of compliance management — with a named intermediary category, named regulatory corpus, and demonstrated performance on at least one concrete regulatory scenario.

### 2.4 Our Selected Scope

| Dimension | Choice | Rationale |
|---|---|---|
| **Intermediary** | Stockbrokers | High-frequency obligation categories; taxonomy generalises to IAs, DPs, RTAs |
| **Regulatory Corpus** | SEBI Master Circular for Stock Brokers | Publicly available, clause-numbered, benchmarkable — also SEBI's own suggested corpus |
| **Concrete Scenario** | CSCRF (Cyber Security & Cyber Resilience Framework) | Testable parameters; includes both periodic (annual VAPT) and event-driven (incident reporting) obligations — proves the system handles both recurrence models |

---

## 3. Solution Architecture

### 3.1 System Philosophy

A continuous loop, not a one-shot tool:

```
Watch → Understand → Translate → Operate → Audit → Remediate
```

Human compliance officer stays in the loop at two points: **approving newly extracted obligations** before they go live, and **reviewing borderline evidence**. This is what keeps the system defensible rather than a black box.

### 3.2 Layered Architecture

| Layer | Name | Responsibility |
|---|---|---|
| 1 | Ingestion | Fetch and normalise circulars |
| 2 | Agentic Reasoning | Segmentation through rule compilation |
| 3 | Knowledge & Rules | Canonical store of obligations, versions, taxonomy, compiled rules |
| 4 | Workflow & Orchestration | Durable execution of recurring compliance tasks |
| 5 | Compliance Operations | Task assignment, evidence linking, status computation |
| 6 | Audit & Trust | Immutable, hash-chained log |
| 7 | Experience | Dashboard, obligation explorer, copilot |
| 8 | Security & Access | Auth, authorization, encryption, tenant isolation |

### 3.3 High-Level Data Flow

```
SEBI Circular (PDF/HTML)
  → Ingestion Agent            [fetch + normalise]
  → Segmentation Agent         [clause-level chunking with citations]
  → Extraction Agent           [obligation, actor, deadline, penalty, condition]
  → Classification Agent       [map to internal process taxonomy]
  → Rule Compilation Agent     [→ structured Compliance Rule Object, JSON]
  → Human Review Checkpoint    [compliance officer approves / edits]
  → Workflow Generation Agent  [creates/updates recurring task templates]
  → Compliance Register        [live obligation ↔ evidence ↔ status]
  → Gap Detection Agent        [flags overdue / missing / weak evidence]
  → Audit Log                  [append-only, hash-chained record]

(Diff Agent runs separately, on demand, against two pre-seeded clause
 versions — see Decisions Record §1 for why it's not inline above.)
```

---

## 4. Agent Reference

One entry per agent: spec, build status, and demo role — all in one place, no cross-referencing required.

### 4.1 Ingestion Agent
- **Input:** CSCRF excerpt (PDF or clean text file, supplied by you)
- **Output:** Normalized structured text preserving chapter/clause numbering + SHA-256 content hash
- **Build:** Real. One-time load/parse triggered from the UI ("Ingest new circular"). No live polling.
- **Demo role:** Step 1 — jury sees raw regulatory text enter the system.

### 4.2 Diff Agent
- **Input:** Two pre-loaded versions of the same clause ("old" and "amended," you author both)
- **Output:** Change-set (added/modified/removed/unchanged)
- **Build:** Real diff logic, simulated trigger (not a live SEBI poller).
- **Demo role:** Separate short beat, not one of the 7 main steps — see §1 and §6.

### 4.3 Segmentation Agent
- **Input:** Normalized circular text
- **Output:** Clauses with stable citation IDs (e.g., `Ch.4, Cl.12`)
- **Build:** Real. Hybrid regex + LLM pass — SEBI's numbering is regular enough for regex to do most of the work.
- **Demo role:** Invisible to the jury directly, but its output is what makes every later citation possible — worth one sentence in the walkthrough.

### 4.4 Extraction Agent
- **Input:** A single clause
- **Output:** Obligation statement, actor role, trigger/condition, frequency, deadline, evidence type required, penalty
- **Build:** Real. Structured/function-calling (JSON mode) output. **Highest-value agent** — this is what "demonstrate performance" is judged on.
- **Validation:** Hand-annotate 10–15 CSCRF clauses first; iterate the prompt against that ground truth before building anything downstream.
- **Demo role:** Step 2 — jury sees the VAPT and incident-reporting obligations as structured, cited records.

### 4.5 Classification Agent
- **Input:** Extracted obligation
- **Output:** Taxonomy category (fixed list: Cyber Security & Resilience, KYC/AML, Funds & Securities Segregation, Investor Grievance, Reporting)
- **Build:** Real, simple. Doesn't need to be sophisticated — keyword-assisted or a light prompt is enough.
- **Demo role:** Implicit — shows up as the category tag on obligations elsewhere in the UI.

### 4.6 Rule Compilation Agent
- **Input:** Classified obligation
- **Output:** Validated Compliance Rule Object JSON (schema in §5)
- **Build:** Real. Validate against JSON Schema before it enters the Human Review queue.
- **Demo role:** Feeds directly into Step 3.

### 4.7 Human Review Checkpoint
- **Input:** Pending Compliance Rule Objects
- **Output:** Approved / edited / rejected + reason logged
- **Build:** Real UI (not an LLM agent) — approve/reject queue, diff-style if time allows.
- **Demo role:** Step 3 — **this is the answer to "who's responsible if the AI is wrong."** Must be visibly demoed, not just present in code.

### 4.8 Workflow Generation Agent
- **Input:** Approved Compliance Rule Object
- **Output:** Task template (owner, frequency, due date, evidence required)
- **Build:** Real, near-deterministic logic off the rule object's fields.
- **Demo role:** Step 4 — recurring VAPT task + conditional incident-reporting task appear.

### 4.9 Evidence Mapping & Gap Detection
- **Input:** Uploaded evidence + linked obligation
- **Output:** Status (Compliant / Pending / Overdue / At-Risk) + escalation
- **Build:** Real, rule-based (`today > due_date and no evidence → Overdue`). Deliberately not an LLM call.
- **Demo role:** Steps 5–6 — evidence upload turns a task Compliant; a simulated missed deadline triggers escalation.

### 4.10 Audit Log
- **Input:** Every state change
- **Output:** Append-only, SHA-256 hash-chained record (`prev_hash` + `entry_hash` per row)
- **Build:** Real, genuinely simple to implement.
- **Demo role:** Appears throughout Steps 5–6 — a real differentiator worth narrating explicitly ("here's how we'd detect a silent edit").

### 4.11 Compliance Copilot
- **Input:** Natural language question
- **Output:** Grounded, cited answer
- **Build:** Real. RAG over approved rule objects only, in-memory similarity search (see Decisions Record).
- **Demo role:** Step 7 — the closing "wow" moment.

---

## 5. Data Model

### 5.1 Compliance Rule Object (target schema)

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
  "approved_by": "compliance_officer_id_88",
  "version": 1
}
```

**Versioning (resolving the "how does this become v2" gap):** for the prototype, a rule object's version increments only when a *materially changed* upstream clause (caught by the Diff Agent) produces a re-compiled rule for the same obligation. New obligations start at `version: 1`. A full version-history table is a roadmap item — for the demo, one edit-triggers-new-version example is enough to make the concept real.

### 5.2 Supporting Entities

| Entity | Fields | Purpose |
|---|---|---|
| Circular | id, title, source, ingested date, status | Ingested regulatory documents |
| Clause | circular_id, citation_id, raw_text | Individually citable source passages |
| ComplianceRuleObject | see §5.1 | The core artifact |
| ComplianceTask | rule_object_id, owner, due_date, frequency, status, evidence link | Operational tasks from approved rules |
| Evidence | task_id, file_url, uploaded_by, uploaded_at | Proof of fulfilment |
| AuditEntry | entity_type, entity_id, action, payload, prev_hash, entry_hash, timestamp | Hash-chained audit trail |

---

## 6. Demo Script

The main pipeline runs live, end-to-end, on the CSCRF excerpt:

| Step | Action | What the Jury Sees |
|---|---|---|
| 1 | Load CSCRF excerpt into Ingestion Agent | Raw regulatory text enters the system |
| 2 | Show Extraction Agent output | VAPT + incident-reporting obligations, each cited to its clause |
| 3 | Human Review Checkpoint: approve both | Compliance officer approves — accountability stays human |
| 4 | Workflow Generation creates tasks | Recurring VAPT task + conditional incident-reporting task appear in the Register |
| 5 | Upload sample VAPT report as evidence | Task → "Compliant" → audit log entry appears |
| 6 | Simulate a missed deadline on the second obligation | Gap Detection escalates → show the cited audit trail |
| 7 | Ask Copilot: *"Which CSCRF obligations are currently open for our RMS/CISO team?"* | Grounded, cited answer |

**Diff Agent (separate beat, not numbered above):** shown either right after Step 1 or as a standalone aside — "here's what happens when a clause you're already tracking gets amended" — run against your two pre-seeded clause versions.

**Prep needed before this can run:**
- Finalized CSCRF excerpt (~10–15 clauses covering VAPT + incident reporting)
- Hand-annotated ground truth for those clauses
- One "old version" of a clause, authored for the Diff Agent beat
- One evidence file (sample VAPT report) ready to upload live

**Rough cost/latency shape:** the live demo only needs 2 clauses processed on stage (VAPT + incident reporting) — a handful of LLM calls, each a few seconds. The full ~10–15 clause excerpt can be pre-processed ahead of time and just displayed as "already ingested" data in the Circulars/Register views, so live latency stays low regardless of corpus size. Since Big Pickle (free tier) is the default model, per-call cost for the demo is effectively zero.

---

## 7. Demo Failure Runbook

What to do if something breaks live, by stage:

- **Before you start:** have a chaptered backup video recorded in Week 4, one chapter per demo step (§6), so you can jump to the exact step that failed rather than restarting from zero.
- **General rule:** if a step is stuck for more than ~60 seconds, stop debugging live. Narrate what should have happened, switch to that step's video chapter, and continue the walkthrough verbally.
- **If the Extraction/Classification/Rule Compilation call fails (API/network issue):** switch immediately to the pre-recorded Step 2–3 chapter; note out loud that you're showing the recorded run due to a live API hiccup — juries respect transparency over a stalled silence.
- **If the deployed app itself is down:** switch to the full backup video and narrate over it live, rather than trying to redeploy during your slot.
- **If evidence upload fails:** have a second, pre-uploaded evidence file already linked to a different obligation in the Register as a fallback visual, and explain the live upload hit an issue.
- **Always:** keep a local, pre-seeded "safe" database snapshot matching the state right before each demo step, so if you do recover live, you can jump back in at the correct step instead of re-running the whole pipeline on stage.

---

## 8. Judge Prep — Five Hardest Questions

**1. "What happens when the LLM gets the interpretation wrong?"**
Nothing goes live without the Human Review Checkpoint — every extracted obligation is approved, edited, or rejected by a compliance officer before it generates a single task. The system drafts; a human is accountable. That's a design choice, not a limitation we're excusing.

**2. "How is this different from feeding a PDF to ChatGPT?"**
Three things a chat interface doesn't give you: structured, versioned, machine-actionable output (the Compliance Rule Object) instead of a one-off answer; a continuous operational loop — tasks, evidence tracking, gap detection — not a single Q&A turn; and every claim, including Copilot answers, traces back to an exact clause citation and passed human approval. That traceability is what a compliance head could actually defend to SEBI.

**3. "What's your accuracy on extraction?"**
We validated against a hand-annotated set of CSCRF clauses and the extraction agent correctly captured all required fields for [fill in your actual result once tested]. This is prototype-stage validation, not a formal precision/recall benchmark — that's explicitly next-phase work (§16), and we'd rather be honest about that than overstate rigor we haven't built yet.

**4. "How would this work at scale with thousands of intermediaries?"**
The taxonomy-based design generalizes to other intermediary categories without re-architecture — same core pipeline, different obligation taxonomy. Multi-tenant isolation and Temporal-based durable orchestration are the identified next steps for production scale, and the tiered SaaS model (Starter/Growth/Enterprise) was designed with that range of intermediary sizes in mind from the start.

**5. "Why didn't you build with [Temporal / full RBAC / production infra]?"**
Deliberate 4-week scope decision, not an oversight. BullMQ+Redis proves the same orchestration pattern Temporal would at production scale, without the setup risk of learning new infra mid-hackathon. The architecture doc names the production path explicitly — we chose feasibility for this round over building things that wouldn't be visible or verifiable in a jury demo.

---

## 9. UI Screens

| # | Screen | Content |
|---|---|---|
| 1 | Dashboard | Overview counts + recent activity feed |
| 2 | Circulars | Ingested circulars with status |
| 3 | Rule Review | Human Review Checkpoint queue |
| 4 | Compliance Register | Master table: obligation, clause, owner, due date, evidence, status |
| 5 | Tasks | Kanban board |
| 6 | Copilot | Chat interface, cited answers |
| 7 | Audit Trail | Append-only log viewer |

**Visual theme:** TBD — explicitly not the dark navy AI-assistant look from the earlier Lovable mock. Revisit after core functionality works.

---

## 10. Technology Stack

| Layer | Prototype (what we build) | Production vision (roadmap only) |
|---|---|---|
| Frontend | Next.js + TypeScript + Tailwind + shadcn/ui | Same |
| Backend | **Express (Node.js)** | Layered microservices |
| Agent orchestration | **BullMQ + Redis** | Temporal.io |
| LLM layer | OpenRouter (Big Pickle default, Claude for extraction-prompt tuning) | Same, plus fine-tuned/specialized models |
| Data | PostgreSQL (Neon/Supabase) + Prisma, **in-memory similarity search** | + pgvector at scale |
| Storage | Cloudflare R2 / Supabase storage | Same |
| Auth | Single demo login | OAuth2/SAML SSO, full RBAC |
| Monitoring | None | Langfuse, Prometheus, Grafana |
| Deploy | Render or Railway, single service | Docker, Kubernetes, GitHub Actions CI/CD |

---

## 11. Evaluation Criteria Mapping

| Criterion | How It's Addressed | What the Jury Sees |
|---|---|---|
| Market Impact | Compliance Register + Gap Detection; tiered SaaS model | Weeks of manual reading → a live, queryable register |
| Technology & Innovation | Structured extraction pipeline; versioned Compliance Rule Object; cited RAG Copilot | The Copilot is the visible "wow" |
| Feasibility | Deliberate scope cuts (§1, §4) protect this | A working, bug-free end-to-end demo |
| Scalability | Roadmap (§16); taxonomy generalizes without re-architecture | Referenced explicitly in the walkthrough, not built |
| Alignment with SEBI's Objectives | Dual-loop design mirrors PS2's "two distinct but deeply related challenges" framing exactly | State this explicitly — don't make the jury infer it |

### PS2 Language → Build Mapping

| PS2 Language | Where It Lives |
|---|---|
| "interpreting... mapping... to operational processes" | Ingestion → Segmentation → Extraction → Classification → Rule Compilation |
| "updating compliance workflows in a timely and consistent manner" | Workflow Generation Agent |
| "tracking... mapping to evidence... maintaining audit trails" | Compliance Register + Evidence + Audit Log |
| "identifying and remediating compliance gaps before they become regulatory findings" | Gap Detection Agent |
| "transforming regulatory intent into programmable, auditable compliance logic" | The Compliance Rule Object |

---

## 12. Timeline

**~26 days remain (26 Jul → 21 Aug).**

**Week 1 (26 Jul → 2 Aug — 7 days):**
- Finalize CSCRF excerpt (10–15 clauses, VAPT + incident reporting)
- Hand-annotate ground truth
- Repo scaffolding (Express + Next.js + Postgres/Prisma per §15)
- Build Ingestion + Segmentation; validate chunking
- Build Extraction Agent; check against ground truth, iterate prompt

**Week 2 (3–9 Aug):**
- Classification + Rule Compilation → validated CRO flowing end-to-end
- Human Review Checkpoint UI
- Diff Agent against two seeded clause versions

**Week 3 (10–16 Aug):**
- Workflow Generation → Compliance Register
- Evidence upload + linking + status computation
- Gap Detection + Audit Log
- Compliance Copilot
- Deploy live; GitHub repo demo-ready

**Week 4 (17–21 Aug):**
- Full dry-run of the demo script (§6); fix what breaks
- Record chaptered backup video (§7)
- Rehearse judge prep (§8)
- Optional polish only if core is solid: visual theme, custom domain

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Extraction accuracy too low on demo clauses | Ground truth + prompt iteration in Week 1, before anything downstream is built on top |
| Behind schedule by Week 3 | Cut Copilot polish before cutting the core pipeline — Copilot is the most cuttable "extra" |
| Live demo breaks during jury round | Chaptered backup video + runbook (§7) |
| Jury questions an infra cut | Judge prep answers (§8), reference the Decisions Record (§1) |
| Only one of two people actively building | Revisit team split (§17) before Week 2 if bandwidth is a bottleneck |

---

## 14. Security, Privacy & IP

- **Tenant isolation:** logical isolation per intermediary (production); prototype uses one hardcoded tenant
- **Encryption:** TLS 1.3 in transit, AES-256 at rest (production target)
- **Access control:** RBAC with least-privilege roles (production); single demo login for prototype
- **Data minimisation / DPDP Act 2023 alignment:** PII redaction before Copilot indexing, where not required for compliance proof
- **No client data used to train third-party models**; zero-retention API modes where supported
- **Immutable audit logging:** hash-chained entries, real in the prototype (§4.10)
- **IP:** architecture, pipeline, schema, and codebase are original; only third-party inputs are SEBI's publicly published circulars (cited, not reproduced) and standard open-source/commercial infra within licence terms

---

## 15. Repository Structure

Mapped to the 8 architecture layers (§3.2), not just a generic monorepo shape:

```
clausechain/
  apps/
    web/                    # Layer 7 (Experience): Next.js — dashboard,
                             # circulars, rule-review, register, tasks,
                             # copilot, audit-trail pages
    api/
      src/
        auth/                # Layer 8 (Security & Access) — demo login stub
        ingestion/           # Layer 1
        workflow/            # Layer 4 — BullMQ job definitions
        tasks/                # Layer 5 — ComplianceTask, evidence linking
        evidence/             # Layer 5
        audit/                # Layer 6 — hash-chain logic
        rules/                # Layer 3 — ComplianceRuleObject store
  packages/
    agents/                  # Layer 2 (Agentic Reasoning)
      ingestion/
      diff/
      segmentation/
      extraction/
      classification/
      rule-compilation/
      gap-detection/
      copilot/
    schema/                  # Compliance Rule Object JSON Schema + validators
  data/
    cscrf-excerpt.txt        # seeded circular text
    ground-truth.json        # hand-annotated expected extraction output
    clause-versions/         # old/new pair for the Diff Agent demo
  docs/
    PS2_Problem_Statement.md
    ClauseChain_PS2_Plan_WellFormatted.md
    PROTOTYPE_SCOPE.md
    COMPREHENSIVE_DOCUMENTATION.md   # this file
```

---

## 16. Post-Hackathon Roadmap

| Phase | Items |
|---|---|
| Near-term | Extend taxonomy to Investment Advisers, DPs, RTAs, AMCs |
| Integration | Jira/ServiceNow, document management, HR systems for role-based routing |
| Regulatory integration | SEBI's SCORES/Unified Investor Platform, exchange reporting portals |
| Benchmarking | Formal precision/recall study across the full master circular corpus |
| Production infra | BullMQ → Temporal; in-memory RAG → pgvector at scale; single-tenant → multi-tenant with full RBAC/SSO |

---

## 17. Open Items

| Item | Status | Priority |
|---|---|---|
| Two-person team split | **Not decided** | Revisit before Week 2 if bandwidth becomes a bottleneck |
| UI visual direction (dark navy theme rejected) | Replacement TBD | Medium — after core works |
| Custom domain + landing page | Optional Phase 4 polish | Low |
| Hand-annotate CSCRF ground truth | Not started | High — Week 1 blocker |
| Finalize CSCRF excerpt clauses | Not started | High — Week 1 blocker |
| Fill in actual extraction accuracy result (§8, Q3) | Pending Week 1 testing | High — needed before jury prep is truly done |

---

*Consolidates: PS2_Problem_Statement.md, ClauseChain_PS2_Plan_WellFormatted.md, Phase_2_plan.md, PROTOTYPE_SCOPE.md, ClauseChain_Prototype_Build_Plan.md, and the v1→v2 critique. Last updated: 26 Jul 2026.*

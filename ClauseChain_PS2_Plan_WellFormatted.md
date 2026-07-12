ClauseChain

Agentic Compliance: From Regulatory Text to Operational Action

A Detailed Solution & Execution Plan for SEBI Hackathon — Problem Statement 2



# Table of Contents



# 1. Executive Summary

ClauseChain is an agentic compliance platform that closes the loop between SEBI's regulatory text and an intermediary's day-to-day operations. It addresses both halves of PS2 with a single architecture: a Regulatory Intelligence Engine that continuously converts new and amended circulars into structured, machine-actionable obligations, and a Compliance Operations Engine that tracks those obligations against real evidence, maintains an immutable audit trail, and proactively surfaces gaps before they become findings.

Rather than a single chatbot wrapped around a PDF, ClauseChain is designed as a pipeline of specialised, auditable agents — each with a narrow responsibility, a defined input/output contract, and human checkpoints at the points that matter (legal interpretation sign-off, evidence review). This makes the system explainable and defensible in a regulatory context, which is the property that distinguishes a hackathon demo from something an intermediary's compliance head could actually deploy.

The plan below covers the target user and corpus, the full system architecture, the agent-by-agent workflow design, the data model, a production-grade technology stack, one fully worked regulatory scenario for the prototype demo, evaluation metrics, security/privacy posture, and a phase-by-phase execution timeline through the jury round.

# 2. Problem Statement Alignment

# 2.1 Target Intermediary & Regulatory Corpus

ClauseChain is built and demonstrated against the SEBI Master Circular for Stock Brokers. This is a deliberate choice for three reasons:

It is publicly available, structured into clearly numbered chapters and clauses — ideal for a defensible extraction benchmark.

Stockbrokers face some of the highest-frequency obligation categories (margin reporting, client fund segregation, cyber security, investor grievance redressal, algo trading controls), giving the prototype several concrete, demoable obligation types.

The obligation taxonomy built for stockbrokers generalises with light modification to Investment Advisers, Depository Participants and RTAs — supporting the roadmap toward a multi-category production platform.

# 2.2 The Two Problems, One System



# 3. Solution Overview

ClauseChain operates as a continuous loop rather than a one-shot tool:

Watch — monitor SEBI's circular repository for new issuances and amendments to the master circular.

Understand — segment the document, extract obligations with their conditions, deadlines, responsible roles and penalties, and diff them against the prior version to isolate what actually changed.

Translate — compile each obligation into a structured, machine-actionable “compliance rule object” and generate/update the corresponding operational task template.

Operate — assign recurring or one-time compliance tasks to owners, collect evidence (documents, system logs, screenshots, filings), and mark fulfilment status.

Audit — maintain a tamper-evident, timestamped trail linking every obligation to the evidence that satisfied it, ready for internal audit or SEBI inspection.

Remediate — continuously scan for overdue, missing, or weak evidence and escalate to the compliance owner before it becomes a regulatory finding.

A human compliance officer remains in the loop at two points by design: reviewing/approving newly extracted obligations before they go live (legal interpretation is ultimately a human accountability), and reviewing evidence the system flags as borderline. This keeps the system auditable and trustworthy rather than a black box making compliance determinations unsupervised.

# 4. System Architecture

# 4.1 Layered Architecture



# 4.2 High-Level Data Flow

SEBI Circular (PDF/HTML)

-> Ingestion Agent            [fetch + normalise]

-> Diff Agent                 [compare vs. last master circular version]

-> Segmentation Agent         [clause-level chunking with citations]

-> Extraction Agent           [obligation, actor, deadline, penalty, condition]

-> Classification Agent       [map to internal process taxonomy]

-> Rule Compilation Agent     [-> structured Compliance Rule Object, JSON]

-> Human Review Checkpoint    [compliance officer approves / edits]

-> Workflow Generation Agent  [creates/updates recurring task templates]

-> Compliance Register        [live obligation <-> evidence <-> status]

-> Gap Detection Agent        [flags overdue / missing / weak evidence]

-> Audit Log                  [append-only, hash-chained record]



# 5. Agentic Workflow Design

Each agent below is scoped narrowly on purpose — narrow scope is what makes outputs verifiable and errors traceable to a single step, which matters when the output feeds a regulatory audit trail.

# 5.1 Ingestion Agent

Polls SEBI's circular index on a schedule, downloads new/amended circulars, converts to clean structured text (preserving chapter/clause numbering), and computes a content hash to detect true changes vs. re-publication.

# 5.2 Diff & Change-Detection Agent

Compares the new document against the last known version of the master circular at clause granularity, producing a change-set (added / modified / removed / unchanged clauses). This is what allows the system to react only to what actually changed, rather than reprocessing the entire corpus on every update — the core of “reducing the gap between regulatory issuance and operational action.”

# 5.3 Segmentation Agent

Splits changed sections into individually addressable clauses with stable citation IDs (chapter, clause, sub-clause), so every downstream obligation can be traced back to an exact source passage.

# 5.4 Extraction Agent

For each clause, extracts a structured obligation record via constrained/function-calling generation:

Obligation statement (normalised, in the system's controlled vocabulary)

Responsible role(s) within the intermediary (e.g., Compliance Officer, Designated Director, RMS)

Trigger / applicability condition (e.g., “if algo trading is offered to clients”)

Frequency (one-time, monthly, quarterly, annual, event-driven)

Deadline / turnaround time

Evidence type required (report, board resolution, system log, filing acknowledgement)

Penalty / consequence of non-compliance, where stated

# 5.5 Classification & Mapping Agent

Maps each obligation to an internal process taxonomy (e.g., Client Onboarding & KYC, Funds & Securities Segregation, Risk Management & Margins, Cyber Security & Resilience, Investor Grievance Redressal, Algorithmic Trading Controls, Surveillance & Reporting) so obligations surface inside the workflow area a compliance team already organises itself around.

# 5.6 Rule Compilation Agent

Converts the classified obligation into a versioned, machine-actionable Compliance Rule Object (schema in Section 6) — this is the artefact that literally bridges unstructured regulatory text and structured operational systems, the core unsolved problem named in PS2.

# 5.7 Human Review Checkpoint

A compliance officer reviews newly generated or materially changed rule objects in a diff-style UI before they go live — approve, edit, or reject with a reason. This preserves human accountability for legal interpretation while the system carries the drafting and tracking burden.

# 5.8 Workflow Generation Agent

Once approved, creates or updates recurring task templates in the Compliance Register (e.g., “Submit VAPT report — annually — owner: CISO — evidence: signed VAPT report”) and schedules the next occurrence.

# 5.9 Evidence Mapping & Gap Detection Agent

Continuously reconciles uploaded evidence against open obligations, computes a fulfilment status (Compliant / Pending / Overdue / At-Risk), and flags obligations nearing deadline with no evidence, or evidence that doesn't match the required type — escalating to the responsible owner and, if unresolved, to the compliance head.

# 5.10 Compliance Copilot Agent

A retrieval-augmented natural-language interface for compliance officers to ask questions such as “which obligations from the June 2026 amendment affect our cyber security team?” or “show me every obligation currently overdue for the RMS desk,” with every answer citing the exact clause and rule object it is grounded in.

# 6. Data Model

# 6.1 Core Entities



# 6.2 Example Compliance Rule Object (Simplified)

{

"id": "CRO-2026-0143",

"obligation": "Stock broker shall conduct VAPT of critical

systems at least once a year and submit report to the

stock exchange within the prescribed timeline.",

"source": { "circular": "SEBI/HO/MIRSD/CSCRF/2026",

"clause": "Ch.4, Cl.12" },

"actor_role": "Chief Information Security Officer",

"taxonomy": "Cyber Security & Resilience",

"frequency": "ANNUAL",

"deadline_rule": "within 30 days of VAPT completion",

"evidence_required": ["Signed VAPT report", "Exchange

submission acknowledgement"],

"penalty": "As per SEBI enforcement schedule, Ch.9",

"status": "approved",

"approved_by": "compliance_officer_id_88",

"version": 2

}



# 7. Technology Stack (Production-Grade)

This stack is chosen for what a real intermediary or startup evaluator would expect from a system that touches audit trails and regulatory obligations — durability, explainability and security take priority over minimalism. Individual choices can be swapped without changing the architecture.



# 8. Concrete Regulatory Scenario for Prototype Demo

To satisfy the requirement to “demonstrate performance on at least one concrete regulatory scenario,” the prototype will be built and evaluated end-to-end against the Cyber Security and Cyber Resilience Framework (CSCRF) obligations in the SEBI Master Circular for Stock Brokers.

Why this scenario

It has clearly stated, testable parameters (frequency, deadlines, evidence type), which makes extraction accuracy and workflow correctness objectively verifiable in a demo.

It includes both periodic obligations (annual VAPT) and event-driven obligations (cyber incident reporting within a fixed window), showing the system handles both recurrence models.

It is high-stakes and high-visibility for stockbrokers — a compelling narrative for a jury evaluating real-world applicability.

End-to-end walkthrough for the jury

Load the CSCRF section of the master circular into the Ingestion Agent.

Show the Extraction Agent output: the VAPT and incident-reporting obligations as structured records, each citing its exact clause.

Show the Human Review Checkpoint: compliance officer approves the rule objects.

Show the Workflow Generation Agent creating the recurring annual VAPT task and the conditional incident-reporting task.

Upload a sample VAPT report as evidence; show the task move to “Compliant” with the audit log entry.

Simulate a missed deadline on a second obligation; show the Gap Detection Agent escalate it, and the compliance officer view the fully cited audit trail.

Ask the Compliance Copilot: “Which CSCRF obligations are currently open for our RMS/CISO team?” and show a grounded, cited answer.

# 9. Performance & Evaluation Metrics



# 10. Security, Confidentiality & Data Privacy

Tenant isolation: each intermediary's obligations, tasks and evidence are logically (and optionally physically) isolated.

Encryption: TLS 1.3 in transit, AES-256 at rest for evidence documents and the audit log.

Access control: RBAC with least-privilege roles (Compliance Officer, Task Owner, Auditor — read-only, Admin).

Data minimisation & DPDP Act 2023 alignment: evidence documents are scanned for personal data; where not required for compliance proof, PII is redacted before indexing for the copilot's vector store.

No client data is used to train or fine-tune third-party models; LLM calls use zero-retention API modes where the provider supports them.

Immutable audit logging: hash-chained entries make silent edits to compliance history detectable, which matters for both internal audit and SEBI inspection defensibility.

# 11. Originality & Intellectual Property

The architecture, agent pipeline, rule-object schema and codebase are original work built for this hackathon. The only third-party inputs are: SEBI's publicly published circulars (used strictly as reference regulatory text, not reproduced beyond short cited excerpts), and standard open-source/commercial infrastructure components listed in Section 7, all used within their licence terms. No proprietary datasets, scraped confidential material, or third-party compliance content are used.

# 12. Differentiation

Dual-loop design directly mirrors both halves of PS2 in one coherent system, rather than solving only translation or only tracking.

Every output — obligation, task, or copilot answer — is cited back to an exact clause, which is the difference between a plausible-sounding LLM demo and something a compliance head could defend to SEBI.

Durable, resumable agent orchestration (Temporal-based) rather than a single long LLM prompt — this is what “production-grade” actually requires for a system with legal consequences.

Human-in-the-loop checkpoints preserve accountability, which addresses the natural objection a jury of regulators/practitioners will raise: “who is responsible if the AI gets the interpretation wrong?”

Taxonomy-based design generalises cleanly from stockbrokers to other intermediary categories without re-architecting.

# 13. Step-by-Step Execution Plan

Phase 0 — Idea Submission (Now)

Finalise this architecture document and obligation taxonomy.

Pre-select and manually annotate a 15–20 clause benchmark subset from the CSCRF section for later evaluation.

Draft the Compliance Rule Object JSON Schema and validate it against 5 hand-worked examples.

Phase 1 — Core Pipeline (Prototype Build, Week 1)

Set up repo structure: ingestion service, agent orchestration service, Postgres schema (Prisma), object storage bucket.

Build Ingestion + Segmentation agents; validate clause-level chunking against the benchmark set.

Build Extraction Agent with structured/function-calling output; measure precision/recall against the benchmark.

Build Classification + Rule Compilation agents; produce validated Compliance Rule Objects.

Phase 2 — Operations Loop (Week 2)

Build Compliance Register + task generation from approved rule objects.

Build evidence upload + linking + status computation.

Build Gap Detection Agent and escalation logic; add hash-chained audit logging.

Build the Human Review Checkpoint UI (approve/edit/reject rule objects).

Phase 3 — Experience Layer & Copilot (Week 3)

Build the compliance officer dashboard (obligation explorer, task board, audit trail viewer).

Build the RAG-based Compliance Copilot over approved rule objects and clauses.

Wire up the CSCRF end-to-end demo scenario (Section 8) with seeded sample data.

Phase 4 — Hardening & Jury Prep (Week 4)

Run the evaluation metrics in Section 9 and capture results/screenshots for the submission deck.

Security pass: RBAC checks, encryption verification, redaction test on sample evidence.

Rehearse the jury walkthrough end-to-end; prepare fallback recorded demo in case of live-connectivity issues.

Prepare the pitch deck: problem → architecture → live demo → metrics → roadmap.

# 14. Risks & Mitigations



# 15. Post-Hackathon Roadmap

Extend taxonomy and rule compilation to Investment Advisers, Depository Participants, RTAs and AMCs.

Integrate with intermediaries' existing systems — ticketing (Jira/ServiceNow), document management, and HR systems for role-based task routing.

Explore integration with SEBI's SCORES/Unified Investor Platform and exchange reporting portals where public APIs exist, to auto-submit acknowledgements as evidence.

Formal accuracy benchmarking across the full master circular corpus, published as an open evaluation report to build trust with prospective enterprise customers.

Move from BullMQ-based MVP orchestration to full Temporal-based durable execution for production reliability at scale.
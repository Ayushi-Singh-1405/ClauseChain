# Phase 1 - Idea Submission (Cleared)#

## Content submitted during Phase-1##

**Title with tagline**

-ClauseChain - Where regulation meets real-time compliance


**Idea Brief**

ClauseChain is an agentic compliance platform that turns SEBI's regulatory text into operational action, automatically. It watches SEBI circulars and amendments, extracts obligations clause-by-clause with an LLM-based agent pipeline, and compiles them into versioned, machine-actionable "Compliance Rule Objects." These are turned into recurring tasks assigned to the right role at a stockbroker, tracked against uploaded evidence, and backed by a hash-chained, tamper-evident audit trail. A human compliance officer approves every new rule before it goes live, so the system carries the drafting and tracking burden while accountability stays human. The result: what today takes weeks of manual reading and spreadsheet tracking happens in minutes, with every claim traceable back to its exact source clause.

**TECHNOLOGY STACK**

-Frontend
• Next.js + TypeScript
• Tailwind CSS
• shadcn/ui

-Backend
• Node.js (NestJS) / Python (FastAPI)
• Layered microservices architecture

-AI & Agent Orchestration
• LangGraph (stateful, resumable, retry-safe workflows)
• OpenRouter (model-agnostic LLM layer)
• RAG-powered extraction & Compliance Copilot

-Document Processing
• unstructured.io / LlamaParse
• Tesseract OCR (fallback)

-Data & Storage
• PostgreSQL (Neon) + pgvector
• Prisma ORM
• Cloudflare R2 (S3-compatible object storage)

-Workflow Engine
• Temporal.io
• BullMQ + Redis (MVP)

-Security
• OAuth2 / SAML SSO
• RBAC
• TLS 1.3 (in transit)
• AES-256 (at rest)

-Audit & Monitoring
• SHA-256 hash-chained audit trail
• Langfuse (LLM tracing)
• Prometheus + Grafana

-Deployment
• Docker
• Kubernetes
• GitHub Actions CI/CD

**Proposed solution Business model/commercial potential**

Solution: 
ClauseChain runs as a continuous loop — 
Watch → Understand → Translate → Operate → Audit → Remediate 
bridging PS2's two challenges (dynamic regulatory translation and ongoing compliance management) in one shared system, rather than solving either in isolation.

Business model: 
SaaS, sold to SEBI-regulated intermediaries on a tiered subscription:

Starter — small intermediaries (e.g., boutique investment advisers), single obligation category, capped users
Growth — mid-size stockbrokers/DPs, multi-category taxonomy, evidence storage at scale
Enterprise — large brokers/AMCs, SSO, dedicated audit-export tooling, SLA-backed uptime

Secondary revenue:
 a compliance-benchmark report (aggregated, anonymised) licensed to industry bodies, and an API tier for RegTech/LegalTech partners who want obligation data feeding their own tools.

Commercial potential: 
India has thousands of SEBI-registered intermediaries — stockbrokers, investment advisers, DPs, RTAs, AMCs — most of whom face the same translation/tracking burden but few of whom can afford a large in-house compliance team. 
A taxonomy-driven, multi-category-ready architecture means the same core product expands across intermediary types without a rebuild, giving a clear path from a single-category MVP to a horizontal compliance-infrastructure play across the securities market ecosystem.

**Process flow/architecture**

SEBI Circular
↓
Ingestion Agent
- Fetch & normalise circulars
- Hash for change detection
↓
Diff Agent
- Compare against last known Master Circular version
↓
Segmentation Agent
- Clause-level chunking
- Stable citation IDs
↓
Extraction Agent
- Extract obligation, actor role, condition, deadline, frequency, evidence type, penalty
↓
Classification Agent
- Map to process taxonomy (KYC, Funds Segregation, Cyber Security, Investor Grievance, Algo Trading, etc.)
↓
Rule Compilation Agent
- Compile versioned Compliance Rule Object
- JSON Schema validated
↓
Human Review Checkpoint
- Compliance officer approves, edits or rejects
↓
Workflow Generation Agent
- Create/update recurring task templates
↓
Compliance Register
- Live obligation ↔ evidence ↔ status
↓
Evidence & Gap Detection Agent
- Reconcile evidence uploads
- Flag overdue, missing or weak evidence
- Escalate gaps
↓
Audit Log
- Append-only, hash-chained, tamper-evident
↓
Compliance Copilot Agent
- Natural language Q&A over approved rules
- Every answer cited to the source clause

Layered System Architecture

Layer 1 – Ingestion Layer
Fetch and normalise circulars from SEBI sources

Layer 2 – Agentic Reasoning Layer
The complete agent pipeline from segmentation through rule compilation

Layer 3 – Knowledge & Rules Layer
Canonical store of obligations, versions, taxonomy and compiled rules

Layer 4 – Workflow & Orchestration Layer
Durable, resumable execution of recurring compliance tasks

Layer 5 – Compliance Operations Layer
Task assignment, evidence upload/linking and status computation

Layer 6 – Audit & Trust Layer
Immutable, hash-chained log of every state change

Layer 7 – Experience Layer
Compliance officer dashboard, obligation explorer and copilot

Layer 8 – Security & Access Layer
Authentication, authorization, encryption and tenant isolation

## Things required for Phase-2 Prototype Development and demo (Yet to built)##

so we cleared the round one (idea submission where we explained the idea the tech stack and business viability and a demo video (made using lovable cause the idea had to be shorlisted for us to work on a prototype.....literally added a voice over and captions)) and now we have to work on the prototype -> these are the requirements -> Prototype Development Live In this phase, shortlisted teams are required to build and submit a working prototype that demonstrates their solution to the selected problem statement. The prototype should showcase the core functionality, technical implementation, and real-world applicability of the solution. Evaluation Criteria

* Market Impact: Potential to create meaningful value for the securities market.
* Technology & Innovation: Effective use of relevant technologies and innovative approaches.
* Feasibility: Practicality and readiness for real-world implementation.
* Scalability: Ability to support future growth and wider adoption.
* Alignment with SEBI's Objectives: Relevance to the problem statement and SEBI's mandate.

Demo & Jury Evaluation Shortlisted teams will present their working prototypes during the Demo & Jury Round (22–25 August 2026). Evaluations will be conducted by experienced professionals and domain experts from SEBI based on the evaluation criteria above. Submission Tips

* Demonstrate a functional prototype rather than static designs or mockups.
* Ensure your deployment and GitHub links are accessible.
* Keep your demo video focused on the problem, solution, and key features.
* Be prepared to explain your implementation and key decisions during the jury evaluation.

-mode - Online
-Elimination round 
-duration - 13 Jul 2026, 06:00 AM21 Aug 2026, 11:59 PM 
-current date - today is july 26th
-got the result on july 21st



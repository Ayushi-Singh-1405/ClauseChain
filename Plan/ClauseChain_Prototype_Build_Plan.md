# ClauseChain — Detailed Prototype Build Plan

This is the working build spec for what we're actually implementing for the SEBI TechSprint prototype round, written directly against PS2's language and evaluation criteria. It's more granular than `PROTOTYPE_SCOPE.md` — that one says *what* to build; this one says *how*, screen by screen and agent by agent.

---

## 1. PS2, restated as build requirements

PS2's problem has two named halves. Everything below maps to one or both.

| PS2 language | What it requires | Where it lives in the build |
|---|---|---|
| "interpreting a new or amended regulatory requirement, mapping it to operational processes" | Dynamic regulatory translation | Ingestion → Segmentation → Extraction → Classification → Rule Compilation |
| "updating compliance workflows in a timely and consistent manner" | Automated, not manual, workflow updates | Workflow Generation Agent |
| "tracking existing regulatory obligations, mapping to evidence of fulfilment, maintaining audit trails" | Ongoing compliance management | Compliance Register + Evidence upload + Audit Log |
| "identifying and remediating compliance gaps before they become regulatory findings" | Proactive, not reactive | Gap Detection Agent |
| "transforming regulatory intent into programmable, auditable compliance logic" | The literal artifact | The Compliance Rule Object (JSON) |
| "specify the intermediary category and regulatory corpus" | Named scope | Stockbrokers · SEBI Master Circular for Stock Brokers |
| "demonstrate performance on at least one concrete regulatory scenario" | A real, working demo | CSCRF: VAPT (periodic) + Incident Reporting (event-driven) |

Every agent we build exists because a line in this table needs it. If a feature doesn't trace back to this table or the demo script in §5, it's not in scope for the prototype.

---

## 2. Evaluation criteria → concrete features

SEBI scores on five criteria. Mapping each to what a juror will actually see:

- **Market Impact** — the Compliance Register + Gap Detection dashboard makes the "meaningful value" case concrete: turning weeks of manual circular-reading into a live, queryable register. The business model (tiered SaaS) from the round-1 brief backs this up narratively.
- **Technology & Innovation** — the agent pipeline with structured extraction + a versioned Compliance Rule Object schema is the actual innovation; the RAG Copilot with citations is the visible "wow."
- **Feasibility** — this is the criterion the scope cuts protect. A working, deployed, bug-free 6-step pipeline beats an ambitious but half-broken 10-agent one. Everything in `PROTOTYPE_SCOPE.md`'s "build real" list exists to score here.
- **Scalability** — covered by the architecture doc's roadmap (Temporal, multi-tenant, other intermediary categories), *referenced* in the demo, not built. The taxonomy-based design (already generalizes past stockbrokers) is the credible argument.
- **Alignment with SEBI's Objectives** — the dual-loop (translation + tracking) directly answers PS2's "two distinct but deeply related challenges" framing. Say this explicitly in the jury walkthrough, don't make them infer it.

---

## 3. Agent-by-agent build spec

For each agent: input, output, and the specific implementation approach for the prototype (not the full production version).

### 3.1 Ingestion Agent
- **Input:** a CSCRF excerpt from the Master Circular for Stock Brokers (you supply the file — PDF or clean text)
- **Output:** normalized structured text preserving chapter/clause numbering + a content hash
- **Build note:** no live polling. A one-time load/parse job triggered from the UI ("Ingest new circular" button) is enough — it demonstrates the mechanism without needing a scheduler.

### 3.2 Diff Agent (simulated)
- **Input:** two pre-loaded versions of the same clause (you author both — "old" and "amended")
- **Output:** change-set: added / modified / removed / unchanged clauses
- **Build note:** real diff logic (even a straightforward text-diff + LLM-summarized change description) run against your two seeded versions. The point being demonstrated is "the system reacts to what changed," not that it watches SEBI's website live.

### 3.3 Segmentation Agent
- **Input:** normalized circular text
- **Output:** list of clauses, each with a stable citation ID (e.g., `Ch.4, Cl.12`)
- **Build note:** LLM-assisted chunking is fine — clause numbering in SEBI circulars is fairly regular, so a hybrid regex + LLM pass should be reliable enough for your chosen excerpt.

### 3.4 Extraction Agent
- **Input:** a single clause
- **Output (per clause):** obligation statement, actor role, trigger/condition, frequency, deadline, evidence type required, penalty (where stated)
- **Build note:** use structured/function-calling output (JSON mode) against your LLM provider — this is the highest-value agent to get right, since precision here is what "demonstrate performance" is judged on. Hand-annotate your CSCRF excerpt first (5–10 clauses) so you have ground truth to check extraction against.

### 3.5 Classification Agent
- **Input:** extracted obligation
- **Output:** taxonomy category
- **Build note:** fixed taxonomy list (Cyber Security & Resilience, KYC/AML, Funds & Securities Segregation, Investor Grievance, Reporting — 5 is enough) rather than an open-ended one. Simple classification prompt or even keyword-assisted classification is acceptable here; this agent doesn't need to be sophisticated to do its job.

### 3.6 Rule Compilation Agent
- **Input:** classified obligation
- **Output:** a validated Compliance Rule Object (schema in §4)
- **Build note:** validate against a JSON Schema before it's allowed into the Human Review queue — this is cheap to add and directly supports the "auditable compliance logic" language in PS2.

### 3.7 Human Review Checkpoint
- **Input:** pending Compliance Rule Objects
- **Output:** approved / edited / rejected, with a reason logged
- **Build note:** this is a real UI screen (not an agent) — a queue view, diff-style if time allows, simple approve/reject buttons if not. This is the accountability feature the jury's "who's responsible if the AI is wrong" objection is answered by — make sure it's visibly demoed, not just present in the code.

### 3.8 Workflow Generation Agent
- **Input:** approved Compliance Rule Object
- **Output:** a task template in the Compliance Register (owner, frequency, due date, evidence required)
- **Build note:** straightforward — this can be near-deterministic logic off the rule object's fields, doesn't need much "agentic" reasoning.

### 3.9 Evidence Mapping & Gap Detection
- **Input:** uploaded evidence file + the obligation it's linked to
- **Output:** status (Compliant / Pending / Overdue / At-Risk) + escalation if overdue with no evidence
- **Build note:** rule-based deadline math (`today > due_date and no evidence uploaded → Overdue`) is legitimate and reliable — don't over-engineer this into an LLM call it doesn't need.

### 3.10 Audit Log
- **Input:** every state change (rule approved, task created, evidence uploaded, status changed)
- **Output:** append-only, SHA-256 hash-chained record (each entry's hash includes the previous entry's hash)
- **Build note:** genuinely simple to implement (a table with `prev_hash`, `entry_hash`, `payload`, computed on write) and it's a real differentiator worth calling out explicitly in the demo — "here's how we'd detect a silent edit to this record."

### 3.11 Compliance Copilot
- **Input:** natural language question
- **Output:** grounded answer citing the specific rule object(s)/clause(s) it's based on
- **Build note:** RAG scoped only to your approved Compliance Rule Objects — with maybe 10–20 records total, you don't need pgvector; a simple embedding similarity search in-memory (or even keyword + LLM re-ranking) is enough and far less infra to debug under deadline.

---

## 4. Data model (target schema)

### Compliance Rule Object
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
  "version": 2
}
```

### Supporting entities (minimum needed for the demo)
- **Circular** — id, title, source URL/file, ingested date, status
- **Clause** — circular_id, citation_id, raw_text
- **ComplianceTask** — rule_object_id, owner, due_date, frequency, status, linked evidence
- **Evidence** — task_id, file_url, uploaded_by, uploaded_at
- **AuditEntry** — entity_type, entity_id, action, payload, prev_hash, entry_hash, timestamp

---

## 5. Demo script (build backward from this — same as scope doc, kept here for reference)

1. Load CSCRF excerpt → Ingestion Agent
2. Show Extraction Agent output: VAPT + incident-reporting obligations, each cited to its clause
3. Human Review Checkpoint: approve both rule objects
4. Workflow Generation creates the recurring VAPT task + conditional incident-reporting task
5. Upload a sample VAPT report → task moves to Compliant → audit log entry appears
6. Simulate a missed deadline on the second obligation → Gap Detection escalates → show cited audit trail
7. Ask the Copilot: *"Which CSCRF obligations are currently open for our RMS/CISO team?"* → grounded, cited answer

**Prep needed before this can run:** the CSCRF excerpt itself (pick ~10–15 clauses covering VAPT + incident reporting), hand-annotated ground truth for those clauses, and one "old version" of a clause for the Diff Agent demo.

---

## 6. UI screens (derived from the Lovable mock, minus its color theme)

Only these screens are needed — matches what you already validated works as a jury-facing shape:

1. **Dashboard** — overview counts (new circulars, pending approvals, open tasks, overdue tasks) + recent activity feed
2. **Circulars** — list of ingested circulars with status
3. **Rule Review** — the Human Review Checkpoint queue (approve/reject, confidence score optional but nice)
4. **Compliance Register** — master table: obligation, clause, owner, due date, evidence count, status
5. **Tasks** — kanban board (To do / In progress / In review / Done)
6. **Copilot** — chat interface, cited answers
7. **Audit Trail** — simple append-only log viewer

Visual theme: TBD (explicitly not the dark navy AI-assistant look from the mock) — revisit after core functionality works.

---

## 7. Repo structure (suggested, adjust once opencode is running)

```
clausechain/
  apps/
    web/              # Next.js frontend
    api/               # NestJS or FastAPI backend
  packages/
    agents/            # ingestion, segmentation, extraction, classification,
                        # rule-compilation, gap-detection, copilot logic
    schema/             # Compliance Rule Object JSON Schema + validators
  data/
    cscrf-excerpt.txt   # the seeded circular text used for the demo
    ground-truth.json   # hand-annotated expected extraction output
  PROTOTYPE_SCOPE.md
  ClauseChain_Prototype_Build_Plan.md
```

---

## 8. Week-by-week (granular)

**Week 1 (now → Aug 2)**
- Pick and finalize the CSCRF excerpt (10–15 clauses, covering VAPT + incident reporting)
- Hand-annotate expected extraction output for each clause (your ground truth)
- Repo scaffolding: Next.js + backend + Postgres/Prisma schema for the entities in §4
- Build Ingestion + Segmentation; validate clause chunking against the excerpt
- Build Extraction Agent; check output against ground truth, iterate on prompt

**Week 2 (Aug 3–9)**
- Build Classification + Rule Compilation; get a validated Compliance Rule Object flowing end-to-end
- Build the Human Review Checkpoint UI
- Build Diff Agent against your two seeded clause versions

**Week 3 (Aug 10–16)**
- Build Workflow Generation → Compliance Register
- Build evidence upload + linking + status computation
- Build Gap Detection + Audit Log (hash-chaining)
- Build the Copilot (RAG over approved rule objects)
- Deploy live; GitHub repo demo-ready

**Week 4 (Aug 17–21)**
- Full dry-run of the §5 demo script, fix what breaks
- Record a backup demo video (in case of live connectivity issues)
- Prep jury Q&A — including the "vs. generic AI chatbot" differentiation answer
- Optional polish only if core is solid: custom domain, visual theme pass

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Extraction accuracy too low on demo clauses | Hand-annotate ground truth early (Week 1), iterate prompt against it before building downstream agents on top of bad output |
| Running out of time before Copilot/Gap Detection | These are Week 3 — if behind schedule, cut Copilot polish before cutting the core pipeline (§1 table is non-negotiable, Copilot is the most cuttable "extra") |
| Live demo breaks during jury round | Backup recorded demo video, rehearsed in Week 4 |
| Jury asks "why isn't X (Temporal/multi-tenant/SSO) built" | Have the roadmap answer ready — reference the full plan doc, explain it's a deliberate 4-week scope decision, not an oversight |

---

## 10. Explicitly out of scope for this round

Same as `PROTOTYPE_SCOPE.md` §3.3 — Temporal, Kubernetes/CI, SSO/full RBAC, OCR fallback, monitoring stack, multi-tenant switching, custom domain/landing page. All stay in the architecture doc and deck as roadmap, not in the code.

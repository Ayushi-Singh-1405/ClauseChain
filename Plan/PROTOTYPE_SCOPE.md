# ClauseChain — Prototype Scope (SEBI TechSprint, PS2)

**Deadline:** submission by 21 Aug 2026, 11:59 PM · Jury round 22–25 Aug 2026
**Team:** 2
**Goal of this doc:** single source of truth for what gets built for real vs. simulated vs. cut-to-roadmap. When in doubt, build what's on this list — nothing else — until it's all working end-to-end.

---

## 1. Problem statement alignment (why this scope)

PS2 asks for a system that bridges two challenges:
1. **Dynamic regulatory translation** — new/amended regulation → mapped operational obligation
2. **Ongoing compliance management** — tracking obligations against evidence, audit trails, gap remediation

Required: name an intermediary category + regulatory corpus, and demonstrate performance on **at least one concrete regulatory scenario**.

**Our answer:** Stockbrokers · SEBI Master Circular for Stock Brokers · CSCRF (Cyber Security & Cyber Resilience Framework) scenario — VAPT (periodic obligation) + Incident Reporting (event-driven obligation). Two obligation types in one scenario proves the system handles both recurrence models, not just one.

---

## 2. The demo script (build backward from this)

This is what the jury sees, end to end, live:

1. Load the CSCRF section of the Master Circular into the Ingestion Agent
2. Extraction Agent output: VAPT + incident-reporting obligations as structured records, each citing its exact clause
3. Human Review Checkpoint: compliance officer approves the rule objects
4. Workflow Generation Agent creates the recurring annual VAPT task + the conditional incident-reporting task
5. Upload a sample VAPT report as evidence → task moves to "Compliant" → audit log entry appears
6. Simulate a missed deadline on the second obligation → Gap Detection escalates it → show the cited audit trail
7. Ask the Compliance Copilot: *"Which CSCRF obligations are currently open for our RMS/CISO team?"* → grounded, cited answer

Every feature we build should exist because this script needs it. Nothing else.

---

## 3. Build list

### 3.1 Build real
| Component | Notes |
|---|---|
| Ingestion Agent | Parses a static CSCRF excerpt (file you feed it) — not live polling SEBI's site |
| Segmentation Agent | Clause-level chunking with stable citation IDs |
| Extraction Agent | Structured/function-calling extraction: obligation, actor role, condition, deadline, frequency, evidence type, penalty |
| Classification Agent | Maps to process taxonomy (can be a small fixed list, Cyber Security & Resilience is all the demo strictly needs, but keep 4–5 categories for UI credibility) |
| Rule Compilation Agent | Produces the Compliance Rule Object JSON (schema in §4), validated |
| Human Review Checkpoint | Real UI: approve / edit / reject, seeded with the CSCRF obligations |
| Workflow Generation Agent | Creates real task templates in the Compliance Register |
| Compliance Register | Live obligation ↔ evidence ↔ status table |
| Evidence upload + linking | Real file upload, linked to obligation |
| Gap Detection | Rule-based deadline logic is fine — doesn't need to be a separate LLM call to count as an "agent" in the pitch |
| Audit Log | Real SHA-256 hash-chained records in Postgres — cheap to build, strong differentiator, keep it |
| Compliance Copilot | RAG scoped only to your approved rule objects (a handful of records) — in-memory similarity search is enough, skip pgvector infra |

### 3.2 Simulate (real logic, fake trigger)
| Component | Notes |
|---|---|
| Diff Agent | Pre-load two known versions of the same clause, run **real diff logic** on them. Don't build a live "watch SEBI's site" poller. |

### 3.3 Cut from code — keep as roadmap in the deck/doc
- Temporal.io orchestration → use BullMQ + Redis (already your own plan's MVP fallback)
- Docker/Kubernetes/CI pipelines → single deploy target (Render/Railway), no orchestration infra
- OAuth2/SAML SSO, multi-role RBAC → single demo login
- unstructured.io/LlamaParse + OCR fallback → simple parser is enough for known circular text
- Langfuse/Prometheus/Grafana monitoring → not demoable, skip
- Multi-tenant org switching (the "Kotak Securities" dropdown from the Lovable mock) → one hardcoded tenant
- Custom domain / product landing page → nice-to-have polish, only after the app works end-to-end (Phase 4, optional)

None of the cut items are lies in the pitch — they're legitimate "designed for, not yet built" roadmap answers, and your plan doc already frames them that way.

---

## 4. Data model — Compliance Rule Object (target schema)

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

---

## 5. Stack (simplified for this build)

- **Frontend:** Next.js + TypeScript + Tailwind + shadcn/ui (keep — no reason to change)
- **Backend:** Node.js (NestJS) or FastAPI — whichever you're faster in
- **Agent orchestration:** BullMQ + Redis (not Temporal for now)
- **LLM layer:** OpenRouter (model-agnostic, as planned)
- **Data:** PostgreSQL (Neon/Supabase) + Prisma — skip pgvector, in-memory/simple similarity is enough at this scale
- **Storage:** Any S3-compatible bucket for evidence files (Cloudflare R2 or Supabase storage)
- **Deploy:** Render or Railway, single service — custom domain later if time allows

---

## 6. Timeline (Aug 21 submission)

- **Week 1 (now → Aug 2):** Lock the exact CSCRF excerpt + expected obligations. Build Ingestion → Segmentation → Extraction, validated against your own hand-annotated benchmark.
- **Week 2 (Aug 3–9):** Classification → Rule Compilation → Human Review UI. Get a Compliance Rule Object flowing end-to-end from raw clause to approved JSON.
- **Week 3 (Aug 10–16):** Workflow Generation → Register → Evidence upload → Gap Detection → Audit Log. Wire the Copilot. Deploy live. GitHub repo demo-ready.
- **Week 4 (Aug 17–21):** Full dry-run of the 7-step demo script. Fix what breaks. Record backup demo video. Prep jury Q&A (incl. the "vs generic AI chatbot" answer). Polish only if core is solid — domain/landing page here if time allows, not before.

---

## 7. Open items (not blocking build start)

- UI visual direction — dark navy "AI assistant" theme from the Lovable mock is rejected, replacement TBD
- Differentiation talking point: "how is this different from a generic AI chatbot" — needs a crisp answer before jury round
- Custom domain + product landing page — optional Phase 4 polish

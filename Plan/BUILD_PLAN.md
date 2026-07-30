# ClauseChain — 2-Person Build Plan (Revised per Review)

**Current date:** 26 Jul 2026 · **Deadline:** 21 Aug 2026 · **Jury:** 22–25 Aug 2026
**Team:** Person A (Backend/Agents/Infra) · Person B (Frontend/API Integration/UI)

---

## Review Feedback Incorporated

| Feedback | What Changed |
|----------|-------------|
| Over-engineering risk (BullMQ, Redis, Kubernetes, etc.) | Cut BullMQ + Redis. Direct API calls for MVP. No async queue infra. |
| "One polished end-to-end workflow" > many partial features | Cut Diff Agent from prototype. Cut embedding/RAG infra. Copilot = simple LLM query over CROs. |
| Extraction accuracy is highest-value | Phase 1 is now entirely about extraction iteration against ground truth |
| Human Review Checkpoint is the biggest strength | Prominent in every phase, confidence scores + source clause shown |
| Jury wants to see one complete flow | Demo script is the plan's backbone; every feature exists because the demo needs it |

---

## What We're Building (and What We're NOT)

### BUILD — One Complete End-to-End Flow

```
Upload CSCRF text → Segmentation → LLM Extraction → Classification → Rule Compilation
  → Human Review (approve) → Workflow Generation → Tasks Created
  → Evidence Upload → Status Update → Gap Detection → Audit Log
  → Copilot Q&A (simple LLM over CROs)
```

### NOT Building (Roadmap / Cut)

| Cut Item | Why |
|----------|-----|
| Diff Agent | Separate demo beat, not in main flow. Don't build. |
| BullMQ + Redis | Over-engineering for a demo. Direct HTTP calls work fine. |
| Embeddings / pgvector / RAG infra | 10-20 CROs. Simple prompt with context injection is enough. |
| File storage (S3/R2) | Store evidence as base64 in DB or local filesystem for MVP. |
| Real auth (JWT/OAuth) | Hardcoded demo user. Login page just for visual flow. |
| Docker / CI / Deploy infra | Single deploy target. Set up in Week 4. |
| Multi-tenant | Single hardcoded tenant. |

---

## Team Split

| Person A (Backend) | Person B (Frontend & API Integration) |
|--------------------|--------------------------------------|
| Express server + all API routes | Next.js scaffold + pages |
| Prisma schema + migrations | Layout, sidebar, routing |
| Ingestion agent (text parsing + hash) | Login page + Settings page |
| Segmentation agent (clause splitting) | Dashboard page |
| Extraction agent (LLM → structured CRO) | Circulars page |
| Classification + Rule Compilation agents | Rule Review page (approve/reject/edit) |
| Workflow Generation agent | Compliance Register page |
| Gap Detection logic | Tasks page (Kanban) |
| Audit Log (hash-chaining) | Evidence page |
| Copilot endpoint (simple LLM query) | Audit Trail page |
| Seed data + ground truth validation | Copilot page |
| DB queries for all dashboard metrics | Wire EVERY page to real API endpoints |

---

## Phase 1: Core Pipeline — Upload → Extract → Store (Days 1–4)

### Goal: Upload CSCRF text → segmented clauses → LLM extracts obligations → stored as pending CROs

### Person A
- [ ] Express + TypeScript project scaffold
- [ ] Prisma schema: Circular, Clause, ComplianceRuleObject (all fields per schema at bottom)
- [ ] PostgreSQL setup (Neon/Supabase)
- [ ] OpenRouter client wrapper (Big Pickle default)
- [ ] `POST /api/circulars/ingest` — accepts text file → compute SHA-256 hash → store Circular
- [ ] Segmentation agent — parse text by clause numbering → store Clause records linked to Circular
- [ ] Extraction agent — for each Clause → call OpenRouter with JSON-mode prompt → parse response into CRO fields → store as `pending` ComplianceRuleObject with confidence score
- [ ] `GET /api/circulars` — list circulars
- [ ] `GET /api/circulars/:id` — circular with clauses
- [ ] `GET /api/rules/pending` — pending CROs with confidence
- [ ] Seed `data/cscrf-excerpt_2.md` into DB
- [ ] **Iterate extraction prompt** against `data/ground-truth_2.json` until VAPT + incident reporting obligations extract all required fields correctly

### Person B
- [ ] Next.js + TypeScript scaffold
- [ ] Tailwind CSS + shadcn/ui setup
- [ ] Layout with sidebar (Dashboard, Circulars, Rule Review, Register, Tasks, Evidence, Audit, Copilot, Settings)
- [ ] API client utility (`lib/api.ts`) — points to backend
- [ ] Circulars page — fetch + display table, "Ingest New" button (file upload)
- [ ] Rule Review page — fetch pending CROs, display each with: source clause, obligation text, confidence, approve/reject buttons

### Gate: Extraction passes against ground truth for both demo obligations
- [ ] VAPT obligation extracts: actor_role, frequency, deadline, evidence_required
- [ ] Incident reporting obligation extracts: actor_role, frequency, deadline, evidence_required
- [ ] Both appear as pending on Rule Review page

---

## Phase 2: Approval → Tasks → Evidence → Status (Days 5–8)

### Goal: Approve a CRO → tasks auto-create → upload evidence → status updates → gap detection

### Person A
- [ ] `POST /api/rules/:id/approve` — mark CRO approved, trigger Workflow Gen
- [ ] `POST /api/rules/:id/reject` — mark CRO rejected (with reason)
- [ ] `POST /api/rules/:id/edit` — accept edited body, re-validate, store
- [ ] **Workflow Generation agent** — on approval → create ComplianceTask records (owner, due_date, frequency, evidence_required from CRO)
- [ ] `POST /api/evidence/upload` — accept file (base64/local), store Evidence, link to Task, update Task status, compute SHA-256, write AuditEntry
- [ ] `PATCH /api/tasks/:id/move` — change task status (todo → in-progress → done)
- [ ] **Gap Detection** — `GET /api/gaps` — compute: tasks past due + no evidence = "Overdue", due within 7 days + no evidence = "At-Risk"
- [ ] `GET /api/tasks` — list tasks with filters
- [ ] `GET /api/evidence` — list evidence entries
- [ ] `GET /api/dashboard/metrics` — aggregate: total circulars, pending rules, open tasks, overdue, compliance score
- [ ] **Audit Log** — `GET /api/audit` — list entries. On write: compute prev_hash → SHA-256(prev_hash + payload + timestamp) → store entry_hash

### Person B
- [ ] Wire Rule Review approve/reject/edit to real API
- [ ] Compliance Register page — table of approved CROs with status, owner, due date
- [ ] Tasks page — Kanban with 4 columns (todo, in-progress, in-review, done), drag-and-drop calls PATCH API
- [ ] Evidence page — list evidence + upload modal (file picker → POST API)
- [ ] Dashboard page — KPI cards + recent activity feed from metrics API
- [ ] Audit Trail page — table from GET /api/audit, show entry hashes

### Gate: Full flow works end-to-end
- [ ] Upload CSCRF → obligations extracted → approve → tasks created → upload evidence → status changes → gap detection flags overdue tasks
- [ ] All 6 pages (Dashboard, Circulars, Rule Review, Register, Tasks, Evidence, Audit) show real data from API
- [ ] Audit trail shows every action

---

## Phase 3: Copilot + Auth + Settings + Polish (Days 9–12)

### Goal: Working Copilot, login flow, settings, all edge cases handled

### Person A
- [ ] `POST /api/copilot/query` — accept question, inject all approved CROs as context into LLM prompt, return answer with cited CRO IDs
- [ ] `GET /api/settings` — return app config
- [ ] `PATCH /api/settings` — update config (stored in DB or env)
- [ ] `POST /api/auth/login` — hardcoded demo user check, return session token
- [ ] `POST /api/auth/logout`
- [ ] `GET /api/auth/me` — return current user

### Person B
- [ ] Copilot page — chat interface (user input → POST /api/copilot/query → display answer with CRO source badges)
- [ ] Login page — email/password form → POST /api/auth/login → store token → redirect to dashboard
- [ ] Settings page — display + edit app settings
- [ ] Add auth check to all pages (redirect to login if no token)
- [ ] Loading skeletons for all pages
- [ ] Error messages for API failures
- [ ] Empty states for zero-data views

### Gate: All 9 pages work
- [ ] Login → Dashboard (with real metrics)
- [ ] All navigation works
- [ ] Copilot answers questions citing real CROs
- [ ] Loading/error/empty states handled everywhere

---

## Phase 4: Demo Dry-Run + Deploy + Buffer (Days 13–26)

### Goal: Everything deployed, demo script runs flawlessly

### Both
- [ ] Walk through 7-step demo script end-to-end
- [ ] Fix bugs found during dry-run
- [ ] Pre-seed DB with demo state (multiple circulars, obligations, evidence)
- [ ] Record backup demo video (chaptered per step)
- [ ] Rehearse jury walkthrough

### Person A
- [ ] Deploy backend (Render/Railway)
- [ ] Final prompt tuning for extraction accuracy
- [ ] API response time optimization

### Person B
- [ ] Deploy frontend (Vercel/Render)
- [ ] Visual theme polish
- [ ] Responsive fixes

### Gate: Submission-ready
- [ ] Demo script runs without errors on deployed URLs
- [ ] Backup video recorded
- [ ] Jury Q&A answers prepared (from Review.md §8)

---

## Prisma Schema (Final)

```prisma
model Circular {
  id          String   @id @default(cuid())
  title       String
  source      String   // filename
  ref         String?  // SEBI circular number
  rawText     String
  contentHash String   // SHA-256
  status      String   @default("ingested")
  createdAt   DateTime @default(now())
  clauses     Clause[]
  rules       ComplianceRuleObject[]
}

model Clause {
  id         String   @id @default(cuid())
  circularId String
  citationId String   // e.g. "Cl. 4.3.1"
  rawText    String
  circular   Circular @relation(fields: [circularId], references: [id])
  createdAt  DateTime @default(now())
}

model ComplianceRuleObject {
  id               String   @id @default(cuid())
  circularId       String
  clauseId         String?
  obligation       String
  actorRole        String
  taxonomy         String
  frequency        String   // "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "EVENT_DRIVEN"
  triggerCondition String?  // what triggers this obligation
  deadlineRule     String   // human-readable, e.g. "within 1 month of completion"
  deadlineDays     Int?     // machine-readable days for Gap Detection
  evidenceRequired String[]
  source           Json?    // { circular: "...", clauses_merged: [...] }
  penalty          String?
  status           String   @default("pending")
  confidence       Float?
  version          Int      @default(1)
  approvedBy       String?
  rejectionReason  String?
  circular         Circular @relation(fields: [circularId], references: [id])
  clause           Clause?  @relation(fields: [clauseId], references: [id])
  tasks            ComplianceTask[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model ComplianceTask {
  id           String   @id @default(cuid())
  ruleObjectId String
  title        String
  owner        String
  dueDate      DateTime
  frequency    String
  status       String   @default("todo")
  ruleObject   ComplianceRuleObject @relation(fields: [ruleObjectId], references: [id])
  evidence     Evidence[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Evidence {
  id          String   @id @default(cuid())
  taskId      String
  filename    String
  fileData    String?
  fileSize    String?
  contentHash String   // SHA-256
  uploadedBy  String
  task        ComplianceTask @relation(fields: [taskId], references: [id])
  createdAt   DateTime @default(now())
}

model AuditEntry {
  id         String   @id @default(cuid())
  entityType String   // "circular" | "rule" | "task" | "evidence"
  entityId   String
  action     String   // "created" | "approved" | "rejected" | "uploaded" | "escalated"
  actor      String
  actorType  String   // "user" | "system"
  details    String?
  prevHash   String?
  entryHash  String   // SHA-256(prevHash + payload + timestamp)
  createdAt  DateTime @default(now())
}
```

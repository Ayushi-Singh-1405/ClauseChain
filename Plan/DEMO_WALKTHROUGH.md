# ClauseChain Demo Walkthrough & Failure-Point Trace

Assumption: fresh DB, demo follows steps 1-10. `[B]` = backend endpoint, `[F]` = frontend page. Auth: `POST /api/auth/login` (`auth.ts:8`) → token in localStorage → `AuthGuard` (`auth-guard.tsx`) + `AppSidebar` (`app-sidebar.tsx:47`) both check `localStorage.getItem('token')`.

---

## Step 1 - Upload Circular

| Side | Call / Page |
|---|---|
| [F] | `/circulars` (`circulars/page.tsx`) - "Ingest New" dialog, pastes text |
| [F] | `POST /api/circulars/ingest` `{title, rawText}` (`circulars/page.tsx:39`) |
| [B] | `POST /api/circulars/ingest` (`circulars.ts:47`) - SHA-256 dedupe, stores `Circular` |

**Failure points**
- **Missing API call (Critical):** after ingest there is **no call to segment/extract/process** - the demo's core pipeline stops here. `/process` (`circulars.ts:153`) is the only endpoint that does segmentation *and* extraction, but nothing in the UI invokes it. You can only continue by curling the API or using the seed.
- **Missing validation:** only `title`/`rawText` presence is checked (client + `circulars.ts:53`). No trim → pasting a document with leading whitespace produces `contentHash` over untrimmed text; no size cap client-side (10 MB express JSON cap `index.ts:12`).
- **Loading bug:** optimistic local append (`circulars/page.tsx:40`) hardcodes `source: ''`, `ref: null`, `_count: {clauses:0,rules:0}` - row never reflects real `_count` until reload.
- **Null-pointer risk:** none here.

---

## Step 2 - Segmentation

| Side | Call / Page |
|---|---|
| [B] | `POST /api/circulars/:id/segment` (`circulars.ts:73`) → `segmentClauses()` (`segmentation.ts`) |

**Failure points**
- **Missing API call (Critical):** zero frontend references to `/segment` exist. Only reachable via curl.
- **Null-pointer risk (High):** if `:id` is invalid, `circulars.ts:75` reads a non-existent circular and calls `.clauses` on it → `TypeError` on `undefined` → raw 500. No `res.status(404)` guard (unlike `:id` GET which has one).
- **Segmentation fidelity:** regex only splits lines matching clause headers; the stray `**4.3.**` header becomes an empty extra clause (documented in `SESSION.md`). Unaudited-format circulars collapse to a single `Cl. 1` (`segmentation.ts:40-42`) - silent mis-segmentation, no warning.

---

## Step 3 - Extraction

| Side | Call / Page |
|---|---|
| [B] | `POST /api/circulars/:id/extract` (`circulars.ts:105`) - per-clause `extractCRO()` (`extraction.ts`) → OpenRouter |
| [B] | `POST /api/circulars/:id/process` (`circulars.ts:153`) - segment + extract in one |

**Failure points**
- **Missing API call (Critical):** same as Step 2 - no UI trigger. Rule Review stays empty after a UI-only demo.
- **Race condition (High):** `/extract` and `/process` do **not** dedupe CROs (`createMany`/`create` with `skipDuplicates` only used for clauses). Running either twice duplicates every pending rule; a double-clicked "Process" button (if ever wired) would double rules.
- **Missing validation:** if OpenRouter returns 402 (balance), the per-clause `try/catch` pushes errors into `results` but `status: 'extracted'` is still set (`circulars.ts:145-148`) - circular marked extracted with zero rules. Silent partial failure.
- **Slow/hang:** sequential loop over clauses, each an LLM round-trip with no timeout on `fetch` (`openrouter.ts`) - a hung call blocks the whole request until server timeout.
- **Null-pointer risk:** extraction result fields are cast, not validated; a null `extraction.obligation` would write `null` into a non-null column → Prisma error → caught per-clause, but the circular still flips to `extracted`.

---

## Step 4 - Human Review

| Side | Call / Page |
|---|---|
| [F] | `/rule-review` - `GET /api/rules/pending` (`rule-review/page.tsx:33`) |
| [F] | `POST /api/rules/:id/approve` `{approvedBy:'demo-user'}` (`rule-review/page.tsx:37`) |
| [B] | `POST /api/rules/:id/approve` (`rules.ts:55`) → `generateTasks()` (`workflow.ts:3`) → `writeAudit()` (`audit.ts:4`) |
| [F] | `POST /api/rules/:id/reject` `{rejectionReason}` (`rule-review/page.tsx:43`) |

**Failure points**
- **Race condition (High):** `handleApprove` has **no loading/disabled state and no catch** (`rule-review/page.tsx:36-39`). Double-click → two POSTs → **two tasks per rule** (approve isn't idempotent). Failed approve → unhandled rejection, button no feedback.
- **Race condition (Medium):** approve/reject optimistically removes the card (`page.tsx:38,44`) without a refetch - if the POST actually failed, the rule vanishes from view but stays `pending`.
- **Missing validation:** `reject` with no reason silently defaults to `'Rejected by reviewer'` (`rules.ts:71`); approve with missing rule id → Prisma `P2025` → raw 500 (no 404 handler).
- **Loading bug:** cards render from the single initial fetch; no refetch after first load.

---

## Step 5 - Workflow Generation

| Side | Call / Page |
|---|---|
| [B] | Triggered inside approve (`rules.ts:63`) → `generateTasks()` (`workflow.ts`) |

**Failure points**
- **Missing implementation (High):** `generateTasks` creates exactly **one** task regardless of `frequency` - ANNUAL/CONTINUOUS obligations (`workflow.ts:9-30`) never recur; the "recurring task template" story from the README is not demonstrable.
- **Deadline logic bug (High):** `deadlineDays === 0` → `dueDate.setHours(now+6)` (`workflow.ts:13-14`); `deadlineDays === null` → +30 days (`workflow.ts:15-17`). An incident-reporting obligation (6-hour deadline) is created with a +6h due - fine - but a *null* deadline silently gets 30 days.
- **Null-pointer risk:** if the rule was deleted between approve render and POST, `workflow.ts:8` throws inside the route → 500 after the rule was already marked approved (state divergence).
- **Audit ordering race (Medium):** `writeAudit` chains on `findFirst({orderBy:{createdAt:'desc'}})` (`audit.ts:11`); two concurrent writes can read the same `prevHash` → **forked chain** (both entries share a predecessor). Timestamp collisions make the chain non-append-only-consistent.

---

## Step 6 - Tasks

| Side | Call / Page |
|---|---|
| [F] | `/tasks` - `GET /api/tasks` (`tasks/page.tsx:26`) |
| [F] | `PATCH /api/tasks/:id/status` `{status}` (`tasks/page.tsx:30`) |
| [B] | `PATCH /api/tasks/:id/move` (`tasks.ts:39`) - accepts `todo|in-progress|in-review|done` |

**Failure points**
- **Broken API call (Critical, #1 blocker):** frontend targets `/api/tasks/:id/status`; backend only defines `/:id/move` → **404 on every move**.
- **Contract mismatch (Critical):** even with the right path, frontend sends `in_progress`/`in_review` (underscores, `tasks/page.tsx:36-37`) but backend rejects everything except hyphens (`tasks.ts:42`) → **400**.
- **Loading/render bug (High):** backend returns `in-progress`/`in-review` statuses, so `grouped[col.key]` (underscore keys) never matches them → those tasks **disappear from the board entirely** after evidence upload sets status to `in-review` (`evidence.ts:44`).
- **Optimistic no-rollback (Medium):** local state updates before the PATCH resolves (`tasks/page.tsx:31`); on failure the card is silently stuck in a state the server doesn't have.
- **Field drift (Low):** UI expects `description`/`priority`/`assignee`; backend returns none → those always render empty.

---

## Step 7 - Upload Evidence

| Side | Call / Page |
|---|---|
| [F] | `/evidence` - `GET /api/evidence` (`evidence/page.tsx:33`) |
| [F] | `POST /api/evidence/upload` `{taskId, filename, fileData(base64)}` (`evidence/page.tsx:50`) |
| [B] | `POST /api/evidence/upload` (`evidence.ts:20`) → sets task to `in-review`, writes audit |

**Failure points**
- **Missing validation (High):** `taskId` is a free-text input (`evidence/page.tsx:76`) with no existence check. An invalid id → `prisma.complianceTask.update` throws, caught by `.catch(() => {})` (`evidence.ts:45`) → evidence saved **unlinked**, task never moves to `in-review`, no user feedback.
- **Missing validation (Medium):** no file type/size limit; a large file exceeds the 10 MB JSON cap → 413 with `alert()`.
- **Hash bug (Medium):** `contentHash` is computed over the **base64 string** (`evidence.ts:28`), not the raw bytes - two clients base64-encoding the same file differently produce different hashes; the "tamper-evident" claim is weaker than intended.
- **Loading bug:** table prepends the new row (`evidence/page.tsx:55`) but the Task board still shows the old status until manual navigation/reload.
- **Null-pointer risk:** `fileData` stored may contain `data:` prefix; displayed nowhere so harmless today.

---

## Step 8 - Audit Log

| Side | Call / Page |
|---|---|
| [F] | `/audit` - `GET /api/audit?page=&limit=` (`audit/page.tsx:32`) |
| [B] | `GET /api/audit` (`audit.ts:6`) - paginated, desc |

**Failure points**
- **Loading bug (Medium):** `loading` is only reset on first mount; changing pages re-fires the effect but `loading` stays `false` → stale rows render while the next page loads (no skeleton).
- **Null-pointer/edge (Low):** `Math.ceil(0/20)=0` → "Page 1 of 0" and the "Next" disabled state is computed from `page >= totalPages` (0) so pagination looks broken on an empty log.
- **Missing verification (Medium):** the page copy claims "hash-chain integrity verification" but only truncates and displays `entryHash` - the chain is never actually re-verified (`audit/page.tsx:72`).

---

## Step 9 - Dashboard Updates

| Side | Call / Page |
|---|---|
| [B] | `GET /api/dashboard/metrics` (`dashboard.ts:6`) |
| [F] | Real page `/dashboard/page.tsx:25` - **orphaned** |

**Failure points**
- **Incorrect redirect (Critical/High):** sidebar "Dashboard" links to `/` (`app-sidebar.tsx:31`), which renders the **static `--` placeholder** (`page.tsx`). The live metrics page lives at `/dashboard` and is unreachable from navigation. After login, `router.push('/')` (`login/page.tsx:24`) also lands on the placeholder.
- **Missing refresh (Medium):** no polling/invalidation - after evidence upload and task moves, `complianceScore`/`overdueTasks` only update on hard reload.
- **Logic drift (Medium):** `dashboard.ts` recomputes overdue/at-risk itself while a dedicated `GET /api/gaps` exists and is never called - two sources of truth that can disagree (e.g., gap thresholds `<=7 days` in `gaps.ts:20` vs `<7` in `dashboard.ts:22`).
- **Null-pointer risk:** if `/metrics` 500s, `data` stays `null` and the page renders "Failed to load" (`dashboard/page.tsx:39`) - but the nav never reaches it anyway.

---

## Step 10 - Copilot Question

| Side | Call / Page |
|---|---|
| [F] | `/copilot` - `POST /api/copilot/query` `{question}` (`copilot/page.tsx:35`) |
| [B] | `POST /api/copilot/query` (`copilot.ts:7`) - injects all *approved* CROs → LLM |

**Failure points**
- **Missing validation:** no question-length/rate guard; no empty-trim client-side beyond `input.trim()`.
- **402 risk (High):** LLM call not resilient to quota exhaustion - `callLLM` throws → message becomes `"Error: ..."` in the chat (`copilot/page.tsx:38`), no retry UI. OpenRouter balance must be topped up before demo.
- **Context completeness (Medium):** only `status: 'approved'` rules are injected (`copilot.ts:15`); anything the demo just uploaded but hasn't approved yet is invisible to the copilot - if the jury asks about a just-extracted rule before approval, the copilot claims ignorance (by design, but a demo trap).
- **Cross-DB null (Low):** `r.deadlineDays || '?'` (`copilot.ts:30`) renders `?` for null deadlines - cosmetic.

---

## Cross-Cutting Summary

| Category | Findings | Severity |
|---|---|---|
| Missing API calls | No UI → `/segment`, `/extract`, `/process`, `/gaps`, `/circulars/:id`, `/rules/:id/edit`; dashboard nav never hits `/metrics` | **Critical** |
| Race conditions | Double-click approve → duplicate tasks; repeat `/extract` → duplicate CROs; concurrent audit writes → forked hash chain; optimistic task move no rollback | High |
| Loading bugs | Audit pagination stale rows; pages missing `.catch` on initial load (8 pages); evidence/task status not refreshed after upload | High |
| Missing validations | Evidence `taskId` unchecked; no file type/size; ingest no trim/size; extract no LLM failure handling (still marks `extracted`) | High |
| Null-pointer risks | `/segment` on bad id → `TypeError` (no 404); `generateTasks` on deleted rule → 500; `new Date` on null `dueDate` in register/tasks | High |
| Incorrect redirects | Sidebar + login → `/` placeholder instead of `/dashboard`; no logout path; stale in-memory token after backend restart | High |

**Top 3 demo kill-switches:** (1) task moves 404/400, (2) no UI path from ingest to extraction, (3) dashboard shows `--` because nav points at the placeholder.

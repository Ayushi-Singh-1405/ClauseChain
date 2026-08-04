# ClauseChain Repository Audit Report

Scope: `backend/` and `frontend/`. No code modified. Both projects pass `tsc --noEmit`; `eslint` reports 2 errors + 3 warnings (frontend).

---

## 1. Project Structure

```
ClauseChain/
├── backend/                          # Express + TypeScript + Prisma (Neon) + OpenRouter
│   ├── prisma/
│   │   └── schema.prisma             # 6 models: Circular, Clause, ComplianceRuleObject, ComplianceTask, Evidence, AuditEntry
│   ├── src/
│   │   ├── index.ts                  # Entry; mounts 10 route groups
│   │   ├── agents/
│   │   │   ├── segmentation.ts       # clause regex splitting
│   │   │   ├── extraction.ts         # LLM JSON extraction → CRO
│   │   │   └── workflow.ts           # generates tasks on rule approval
│   │   ├── lib/
│   │   │   ├── prisma.ts             # Neon pg adapter + IPv4 DNS fix
│   │   │   ├── openrouter.ts         # callLLM / callLLMJson (gpt-4o-mini)
│   │   │   └── audit.ts              # SHA-256 hash-chained audit writer
│   │   ├── routes/                   # circulars, rules, tasks, evidence, audit,
│   │   │                             # dashboard, gaps, copilot, auth, settings
│   │   ├── seed.ts                   # seeds CSCRF excerpt + segmentation
│   │   └── eval-extraction.ts        # dev script vs ground-truth_2.json
├── frontend/                         # Next.js 16 + Tailwind v4 + shadcn/ui
│   └── src/
│       ├── app/                      # /, /dashboard, /circulars, /rule-review,
│       │                             # /register, /tasks, /evidence, /audit,
│       │                             # /copilot, /login, /settings
│       ├── components/               # app-sidebar, auth-guard, ui/* (13 components)
│       ├── hooks/use-mobile.ts
│       └── lib/api.ts, lib/utils.ts
├── data/                             # cscrf-excerpt_2.md, CSCRF_Full_Circular.md,
│                                     # ground-truth_2.json, seed-circulars.json, sample_vapt_report.md
├── phase_1_prototype/                # OLD Vite/React prototype (superseded, untracked)
├── pitch_deck_demo/                  # demo assets (untracked)
├── Plan/                             # 14 planning docs
└── package.json                      # root dev/typecheck/db scripts
```

---

## 2. Missing Implementations

| Item | Where expected | Status | Rank |
|---|---|---|---|
| **No UI path to run segmentation/extraction** | `frontend/src/app/circulars/page.tsx` only POSTs `/ingest`; backend endpoints `/segment`, `/extract`, `/process` (`backend/src/routes/circulars.ts:73,105,153`) are never called by the UI | Core demo flow (upload → extract → review) cannot be executed from the app | **Critical** |
| **Classification agent** | README/plan | Extraction hardcodes `taxonomy: "Cyber Security & Resilience"` (`extraction.ts:22`); no separate classification step | Medium |
| **Rule Compilation agent** | README/plan | No distinct compilation stage — extraction writes CROs directly | Medium |
| **Recurring task generation** | `workflow.ts:3` | `generateTasks` always creates exactly one task, ignoring `frequency` (ANNUAL/CONTINUOUS obligations never recur) | High |
| **Diff / change-detection agent** | README | Not built (intentionally cut per `Plan/BUILD_PLAN.md`) | Low |
| **Gap escalation/remediation UI** | README "Remediate" | `GET /api/gaps` (`gaps.ts`) exists but no frontend consumes it and nothing escalates | Medium |
| **Auth enforcement on APIs** | README Security | Only `/api/auth/me` checks the token; all other routes are open | High |
| **Tests** | none | No test files, no test script in any package.json | Medium |
| **Deployment/CI** | Plan Phase 4 | No Dockerfile, CI, or deploy config; app not deployed | High (demo) |

---

## 3. TODO Comments

None found in `backend/src/` or `frontend/src/`.

---

## 4. Mocked APIs

| Item | Location | Rank |
|---|---|---|
| `POST /api/auth/login` — hardcoded single user `admin@clausechain.app`/`demo`, returns a random token | `backend/src/routes/auth.ts:5-16` | Medium (planned for demo) |
| `GET/PATCH /api/settings` — in-memory object, lost on restart | `backend/src/routes/settings.ts:5-10` | Low |
| `data/seed-circulars.json` — 4 of 5 entries are `seeded_context_only` placeholders (explicitly not pipeline-processed) | `data/seed-circulars.json:2` | Low |
| `data/sample_vapt_report.md` — labeled "DEMO PLACEHOLDER" | `data/sample_vapt_report.md:3` | Low |
| Root dashboard `/` renders literal `--` values instead of live data | `frontend/src/app/page.tsx:10-22` | **High** |

---

## 5. Hardcoded Values

| Value | Location | Rank |
|---|---|---|
| **Task status enum mismatch**: frontend uses `in_progress`/`in_review` (underscores); backend accepts only `in-progress`/`in-review` (hyphens) | `frontend/src/app/tasks/page.tsx:36-37` vs `backend/src/routes/tasks.ts:42` | **Critical** |
| **Wrong API path**: frontend PATCHes `/api/tasks/:id/status`; backend only defines `/api/tasks/:id/move` | `frontend/src/app/tasks/page.tsx:30` vs `backend/src/routes/tasks.ts:39` | **Critical** |
| `approvedBy: 'demo-user'` / `uploadedBy: 'demo-user'` / audit `actor: 'demo-user'` | `rule-review/page.tsx:37`, `evidence.ts:37`, `audit.ts:18`, `tasks.ts:52` | Medium |
| Login defaults `admin@clausechain.app` / `demo` prefilled | `frontend/src/app/login/page.tsx:12-13` | Low |
| Taxonomy always `Cyber Security & Resilience` | `backend/src/agents/extraction.ts:22` | Medium |
| OpenRouter model `openai/gpt-4o-mini` + referer `https://clausechain.app` | `backend/src/lib/openrouter.ts:1,21` | Low |
| `ssl: { rejectUnauthorized: false }` on the Neon pool | `backend/src/lib/prisma.ts:36` | Low |
| CORS open to all origins (`app.use(cors())`) | `backend/src/index.ts:11` | Medium |
| Evidence stored as base64 in Postgres `fileData` (no type/size limits, 10 MB JSON cap) | `backend/src/routes/evidence.ts:27-39`, `index.ts:12` | Medium |
| Backend `tasks.ts:26` deadline defaulting to `now()+30d` when `deadlineDays` is null | `backend/src/agents/workflow.ts:16` | Low |

---

## 6. Unused Code

| Item | Location | Rank |
|---|---|---|
| `api.upload()` FormData helper — zero callers, and it sends FormData to a JSON-only backend | `frontend/src/lib/api.ts:21-24` | Low |
| `components/ui/select.tsx` — no imports anywhere | `frontend/src/components/ui/select.tsx` | Low |
| `Badge` import unused in evidence page (eslint warning) | `frontend/src/app/evidence/page.tsx:7` | Low |
| `CardHeader`, `CardTitle` imports unused in tasks page (eslint warning) | `frontend/src/app/tasks/page.tsx:5` | Low |
| `GET /api/gaps` — no frontend consumer | `backend/src/routes/gaps.ts` | Medium |
| Whole `phase_1_prototype/` Vite app — superseded by `frontend/`, untracked, still ships its own `node_modules` | `phase_1_prototype/` | Low |
| Duplicated auth-check logic in both `app-sidebar.tsx:47-52` and `auth-guard.tsx:11-18` | `frontend/src/components/` | Low |

---

## 7. Broken Imports

None. `tsc --noEmit` passes cleanly for both packages; all `@/components/ui/*` imports resolve. (Only dead/unused imports, listed above.)

---

## 8. Dead Components

| Item | Location | Rank |
|---|---|---|
| Root `/` dashboard `page.tsx` — static `--` placeholder; the real metrics dashboard at `/dashboard/page.tsx` is **orphaned** because the sidebar's "Dashboard" links to `/` | `frontend/src/app/page.tsx`, `app-sidebar.tsx:31` | **High** |
| `components/ui/select.tsx` — never rendered | `frontend/src/components/ui/select.tsx` | Low |

---

## 9. Missing Error Handling

| Item | Location | Rank |
|---|---|---|
| Initial-load fetches across 8 pages have no `.catch` → unhandled promise rejections, silent empty states | `dashboard`, `register`, `tasks`, `evidence`, `audit`, `circulars`, `rule-review`, `settings` pages | **High** |
| Rule approve/reject have no try/catch and no loading/disabled state — double-clicks fire twice | `frontend/src/app/rule-review/page.tsx:36-45` | **High** |
| Circulars ingest + evidence upload use `alert()` for errors (poor demo UX) | `circulars/page.tsx:45`, `evidence/page.tsx:60` | Low |
| Copilot turns API errors into chat messages but gives no retry affordance | `frontend/src/app/copilot/page.tsx:38` | Low |
| `POST /api/circulars/:id/extract` loops clauses synchronously — one bad clause delays all; no per-clause retry/backoff | `backend/src/routes/circulars.ts:118-143` | Medium |
| `GET /api/circulars/:id` and rule/evidence routes throw uncaught Prisma errors → raw 500 with stack | `backend/src/routes/*.ts` (no global error handler in `index.ts`) | Medium |
| No 404 fallback in Next app (default) | `frontend/src/app/` | Low |

---

## 10. Demo Blockers

| # | Blocker | Evidence | Rank |
|---|---|---|---|
| 1 | **Kanban "move" is fully broken** — wrong endpoint (`/status` vs `/move`) and wrong status enums (`in_progress` vs `in-progress`); moves 404/400, and `in-progress`/`in-review` tasks never render in columns | `tasks/page.tsx:30,36-37` vs `tasks.ts:39,42` | **Critical** |
| 2 | **Core pipeline unreachable from UI** — Ingest stores a circular but there is no button/API call to segment/extract/process; Rule Review can never populate from a fresh upload (only via `seed.ts` + manual `/process` curl) | `circulars/page.tsx` (no process call); grep shows zero frontend refs to `/segment`, `/extract`, `/process` | **Critical** |
| 3 | **Dashboard nav shows placeholder** — sidebar "Dashboard" → `/` (static `--` cards); real metrics page `/dashboard` orphaned | `app-sidebar.tsx:31`, `page.tsx` | **High** |
| 4 | No backend/frontend deployment; local-only | `Plan/SESSION.md` Phase 4 unchecked | **High** |
| 5 | OpenRouter balance needed (~$5) to avoid 402 mid-demo | `Plan/SESSION.md:66` | **High** |
| 6 | `Rule Review` approve shows no feedback/error on failure; no way to view/extract a circular's clauses from UI | `rule-review/page.tsx:36-45` | High |
| 7 | Auth is cosmetic: API open, in-memory session dies on restart (stale localStorage token then blocks UI with no re-login path since no logout UI exists) | `auth.ts:6`, `login/page.tsx`, `app-sidebar.tsx` | Medium |
| 8 | Register page shows "Unassigned" for every task (frontend expects `assignee`, backend returns `owner`) and badge colors never match backend `in-progress` | `register/page.tsx:95` vs `schema.prisma:63` | Medium |

---

## Severity Summary

- **Critical (2):** #1 Task status/API contract mismatch; #2 No UI pipeline (ingest→extract→review)
- **High (7):** Dashboard placeholder orphaned; missing `.catch` on page loads; approve/reject error handling; recurring tasks; API auth not enforced; no deployment; root `/` dead
- **Medium (11):** classification/rule-compilation not distinct; gaps API unused; evidence-in-DB + no validation; CORS open; global error handler absent; field mismatches on register page; in-memory auth/settings; no tests; hardcoded demo-user
- **Low (14):** dead `api.upload`, unused `select.tsx` + unused imports, duplicate auth logic, phase_1_prototype cruft, placeholder data files, alert() UX, lint warnings, gitignored-but-untracked demo assets, etc.

**Priority fix order:** (1) tasks `move` contract → (2) dashboard nav to `/dashboard` → (3) add "Process" action to Circulars → (4) `.catch`/loading on page loads → (5) recurring task generation → (6) auth + error middleware.

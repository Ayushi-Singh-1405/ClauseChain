# Session — Jul 30 2026

## Objective
Build a fully functional ClauseChain compliance application for SEBI Hackathon (PS2), replacing the hardcoded `phase_1_prototype` frontend with a real backend + integration.

## Completed

### Schema & Data
- Revised Prisma schema finalized in `Plan/BUILD_PLAN.md` (6 models, camelCase, deadlineDays Int, source Json)
- Cleaned `data/` folder, updated `ground-truth_2.json` to match final schema

### Phase 0 — Scaffold
- Express+TypeScript backend scaffolded
- Next.js 16 + Tailwind v4 + shadcn/ui frontend scaffolded
- Root-level concurrent dev script
- Committed as `eef97e9`

### Phase 1 — Core Pipeline
- Prisma schema with 6 models deployed to Neon
- OpenRouter client wrapper (`src/lib/openrouter.ts`)
- Segmentation agent (10 clauses from CSCRF)
- Extraction agent (OpenRouter JSON mode → CRO)
- Seed script
- Circulars & Rules CRUD routes
- Frontend: Circulars page + Rule Review page
- Extraction evaluated: 51% against ground truth
- IPv4 DNS fix for Neon

### Phase 2 — Approval → Tasks → Evidence → Status
- All Phase 2 backend routes built + mounted in index.ts
- Workflow agent (generateTasks on approve)
- Audit lib (hash-chained entries)
- Rules approve/reject wired to workflow + audit
- Evidence nullable taskId, `filename` backend model
- Frontend pages: Register, Tasks (kanban), Evidence (upload), Audit (paginated), Dashboard (metrics cards)
- Both projects typecheck clean

### Phase 3 — Copilot + Auth + Settings
- **Copilot endpoint** `POST /api/copilot/query` — injects all approved CROs as LLM context, returns answer with CRO citations
- **Copilot chat page** — chat UI with message history, loading state, scroll-to-bottom
- **Auth routes**: `POST /api/auth/login` (demo user check), `POST /api/auth/logout`, `GET /api/auth/me`
- **Login page** — email/password form, stores token in localStorage, redirects to dashboard
- **Settings routes**: `GET /api/settings`, `PATCH /api/settings`
- **Settings page** — editable form fields, save button with feedback
- Evidence frontend/backend field mismatch fixed
- All pages have loading/empty/error states
- **Both projects typecheck clean**

## Review Feedback (Jul 30)
- Pipeline producing output matching ground truth almost exactly (90% confidence, correct EVENT_DRIVEN frequency, correct trigger conditions, correct source citations)
- Audit trail hash-chaining verified working
- Tasks correctly collapse to 2 (matching 2 real obligations) while Rule Review shows clause-level granularity

### Bugs Fixed
1. React key warning in register page — `Fragment` with `key` prop instead of bare `<>`
2. Copilot 402 error — capped `max_tokens` to 1024 in `callLLM()`

### Checked — Not a Bug
- 10 clauses in DB vs 9 in ground truth: extra is `**4.3.**` header line, harmless low-content clause

## Remaining

### Phase 4 — Demo + Deploy + Polish
- [ ] End-to-end demo walkthrough
- [ ] Top up OpenRouter account ($5) to prevent 402 mid-demo
- [ ] Pre-seed DB with demo state
- [ ] Deploy backend (Render/Railway)
- [ ] Deploy frontend (Vercel/Render)
- [ ] Backup demo video
- [ ] Jury Q&A prep

## Dev Commands
```bash
# Backend
cd backend && npm run dev        # tsx watch on :3001
npm run typecheck                # tsc --noEmit
npx prisma generate              # after schema changes
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma db push

# Frontend
cd frontend && npm run dev       # next dev on :3000
npm run typecheck                # tsc --noEmit

# Both concurrently (from root)
npm run dev
```

## Key Files
- `Plan/BUILD_PLAN.md` — build plan + final schema
- `backend/src/index.ts` — Express entry, all route mounts
- `backend/src/routes/` — circulars, rules, tasks, evidence, audit, dashboard, gaps, copilot, auth, settings
- `backend/src/agents/` — segmentation, extraction, workflow
- `backend/src/lib/` — prisma, openrouter, audit
- `backend/prisma/schema.prisma` — 6 models
- `frontend/src/app/` — all 10 pages (dashboard, circulars, rule-review, register, tasks, evidence, audit, copilot, login, settings)
- `frontend/src/lib/api.ts` — API client
- `data/ground-truth_2.json` — extraction ground truth
- `data/cscrf-excerpt_2.md` — 10 clauses

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { extractCRO, ExtractionResult } from './agents/extraction'
import { segmentClauses } from './agents/segmentation'

const DATA_DIR = path.resolve(__dirname, '../../data')

function loadClauses(): { citationId: string; rawText: string }[] {
  const filePath = path.join(DATA_DIR, 'cscrf-excerpt_2.md')
  const rawText = fs.readFileSync(filePath, 'utf-8')
  const segments = segmentClauses(rawText)
  return segments.map((s) => ({
    citationId: s.citationId.replace(/\.$/, '').trim(),
    rawText: s.rawText,
  }))
}

interface GroundTruthClause {
  citationId: string
  obligation: string
  actorRole: string
  triggerCondition: string | null
  frequency: string | null
  deadlineRule: string | null
  evidenceType: string | null
  penalty: string | null
}

function normalizeCitation(id: string): string {
  // Normalize: remove Cl. prefix, trailing dots, extra spaces
  return id.replace(/^Cl\.\s*/i, '').replace(/\.+$/, '').trim().toLowerCase()
}

function isMatch(expected: unknown, actual: unknown): boolean {
  if (expected === null || expected === undefined) {
    return actual === null || actual === undefined || String(actual).toLowerCase() === 'null'
  }
  if (actual === null || actual === undefined) return false

  const exp = String(expected).toLowerCase().trim()
  const act = String(actual).toLowerCase().trim()

  if (exp === act) return true

  // Substring match for long text (>80 chars)
  if (exp.length > 80 || act.length > 80) {
    // Check if one contains the other
    if (exp.includes(act) || act.includes(exp)) return true
    // Check if they share significant overlap (Jaccard on words)
    const expWords = new Set(exp.split(/\s+/))
    const actWords = new Set(act.split(/\s+/))
    const intersection = new Set([...expWords].filter((w) => actWords.has(w) && w.length > 3))
    if (intersection.size > 0 && intersection.size / Math.min(expWords.size, actWords.size) > 0.4) return true
  }

  return false
}

function evidenceMatch(expected: string | null, actual: string[]): boolean {
  if (!expected) return actual.length === 0
  const expStr = expected.toLowerCase()
  // Check if at least one evidence item from actual is mentioned in expected
  return actual.some((item) => expStr.includes(item.toLowerCase().substring(0, 10)))
}

async function evaluate() {
  const groundTruth: { clause_level_extractions: GroundTruthClause[] } = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'ground-truth_2.json'), 'utf-8')
  )

  const clauses = loadClauses()
  const gtByCitation: Record<string, GroundTruthClause> = {}
  // Index ground truth by normalized citation
  for (const gt of groundTruth.clause_level_extractions) {
    const key = normalizeCitation(gt.citationId)
    gtByCitation[key] = gt
  }

  let totalScore = 0
  let totalFields = 0

  for (const clause of clauses) {
    const key = normalizeCitation(clause.citationId)
    const gt = gtByCitation[key]
    if (!gt) {
      console.log(`  SKIP: ${clause.citationId} (normalized: "${key}") — no ground truth`)
      continue
    }

    console.log(`Extracting: ${gt.citationId}...`)
    const extraction = await extractCRO(clause.citationId, clause.rawText)

    const checks: { label: string; pass: boolean }[] = [
      { label: 'obligation', pass: isMatch(gt.obligation, extraction.obligation) },
      { label: 'actorRole', pass: isMatch(gt.actorRole, extraction.actorRole) },
      { label: 'triggerCondition', pass: isMatch(gt.triggerCondition, extraction.triggerCondition) },
      { label: 'frequency', pass: isMatch(gt.frequency, extraction.frequency) },
      { label: 'deadlineRule', pass: isMatch(gt.deadlineRule, extraction.deadlineRule) },
      { label: 'evidenceRequired', pass: evidenceMatch(gt.evidenceType, extraction.evidenceRequired) },
      { label: 'penalty', pass: isMatch(gt.penalty, extraction.penalty) },
    ]

    const matches = checks.filter((c) => c.pass).length
    totalScore += matches
    totalFields += checks.length

    console.log(`  ${matches}/${checks.length} fields match`)
    for (const c of checks) {
      if (!c.pass) console.log(`    ✗ ${c.label}`)
    }

    // Show evidence in detail
    if (gt.evidenceType) {
      console.log(`    evidence: expected="${gt.evidenceType.substring(0, 80)}..." actual="${extraction.evidenceRequired.join('; ').substring(0, 80)}..."`)
    }
  }

  const pct = Math.round((totalScore / totalFields) * 100)
  console.log(`\n=== Total: ${totalScore}/${totalFields} (${pct}%) ===`)
}

evaluate().catch((err) => {
  console.error('Eval failed:', err)
  process.exit(1)
})

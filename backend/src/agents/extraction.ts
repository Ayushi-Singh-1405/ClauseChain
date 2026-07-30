import { callLLMJson } from '../lib/openrouter'

export interface ExtractionResult {
  obligation: string
  actorRole: string
  taxonomy: string
  frequency: string
  triggerCondition: string | null
  deadlineRule: string | null
  deadlineDays: number | null
  evidenceRequired: string[]
  penalty: string | null
  confidence: number
}

const SYSTEM_PROMPT = `You are a compliance extraction agent for SEBI CSCRF circulars. Extract structured obligation data from a single clause. Return ONLY valid JSON.

Fields:
- obligation: The full obligation statement — quote the operative requirement verbatim (string)
- actorRole: The specific entity/person who must act. Be precise: "IT Committee for REs", "RE incident response team", "RE compliance/IT function", etc. (string)
- taxonomy: Always "Cyber Security & Resilience" (string)
- frequency: One of "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "EVENT_DRIVEN" | "CONTINUOUS". Use null if the clause does not specify a recurrence.
- triggerCondition: What event or condition triggers the obligation. Be specific (e.g. "Upon completion of VAPT activity", "Beginning of financial year", "Cybersecurity incident detected"). Use null if no trigger mentioned.
- deadlineRule: Human-readable deadline description. Be specific about all deadlines stated. Use null if no deadline mentioned.
- deadlineDays: Integer for primary deadline. Use null if no deadline applies.
- evidenceRequired: List ALL documents, reports, declarations, registers, formats, or records the clause requires. Examples: "VAPT report (Annexure-A format)", "MD/CEO declaration", "Risk register", "Incident notification email", "closure records", "revalidation records". If none mentioned, return [].
- penalty: Exact penalty description. Use null if none.
- confidence: Float 0-1.

CRITICAL RULES:
- Return null for any field not present. Never use "Not specified", "None", or "N/A".
- For evidenceRequired: scan the clause for ANY named document or deliverable. If you see words like "report", "declaration", "register", "format", "Annexure", "notification", "records", "email", "submission" — extract what they reference.
- deadlineDays conversions: "6 hours"→0, "24 hours"→1, "within X month"→X*30, "within X days"→X, "Q1"→90`

export async function extractCRO(citationId: string, clauseText: string): Promise<ExtractionResult> {
  const prompt = `Extract compliance obligations from this SEBI CSCRF clause.

Citation: ${citationId}
Clause text:
${clauseText}

Return JSON.`

  const result = await callLLMJson<ExtractionResult>(prompt, SYSTEM_PROMPT)
  return result
}

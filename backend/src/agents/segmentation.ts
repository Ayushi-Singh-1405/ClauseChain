export interface ClauseSegment {
  citationId: string
  rawText: string
}

export function segmentClauses(rawText: string): ClauseSegment[] {
  const lines = rawText.split('\n')
  const segments: ClauseSegment[] = []
  let currentId = ''
  let currentLines: string[] = []

  function flush() {
    if (currentId && currentLines.length > 0) {
      segments.push({ citationId: currentId, rawText: currentLines.join('\n').trim() })
    }
  }

  // Matches clause headers like:
  //   **4.3.1.** text
  //   **Annexure-O, Part B, Cl. 1.** text
  //   Cl. 4.3.1 text
  //   4.3.1. text
  const clauseRegex = /^(\*\*)?(Cl\.\s*[\d.]+|Annexure-[A-Z][^:]*?:?\s*(Part\s+[A-Z],\s*)?Cl\.\s*[\d.]+|\d+(?:\.\d+)*\.)(\*\*)?(\s|$)/i

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const match = trimmed.match(clauseRegex)
    if (match) {
      flush()
      currentId = match[2].trim().replace(/\*+/g, '').replace(/:\s*$/, '')
      currentLines = [trimmed]
    } else if (currentId) {
      currentLines.push(trimmed)
    }
  }
  flush()

  if (segments.length === 0) {
    segments.push({ citationId: 'Cl. 1', rawText: rawText.trim() })
  }

  return segments
}

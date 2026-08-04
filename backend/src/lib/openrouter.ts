const DEFAULT_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free'

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

const REQUEST_TIMEOUT_MS = 60000

export async function callLLM(prompt: string, systemPrompt?: string, maxTokens?: number): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://clausechain.app',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter API error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as OpenRouterResponse
  return data.choices[0].message.content
}

export async function callLLMJson<T>(prompt: string, systemPrompt?: string): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://clausechain.app',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter API error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as OpenRouterResponse
  return parseJsonContent<T>(data.choices[0].message.content)
}

function parseJsonContent<T>(content: string): T {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  return JSON.parse(cleaned) as T
}

const DEFAULT_MODEL = 'openai/gpt-4o-mini'

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

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
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter API error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as OpenRouterResponse
  return JSON.parse(data.choices[0].message.content) as T
}

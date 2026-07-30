'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ask me anything about your compliance obligations.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return
    const question = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setLoading(true)
    try {
      const { answer } = await api.post<{ answer: string }>('/api/copilot/query', { question })
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${(e as Error).message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Compliance Copilot</h1>
      <p className="text-muted-foreground">Ask questions about your approved compliance obligations.</p>

      <Card className="flex flex-col h-[600px]">
        <CardHeader><CardTitle>Chat</CardTitle></CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-0">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="mt-1"><Bot className="h-5 w-5 text-muted-foreground" /></div>
              )}
              <div className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="mt-1"><User className="h-5 w-5 text-muted-foreground" /></div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="mt-1"><Bot className="h-5 w-5 text-muted-foreground" /></div>
              <div className="bg-muted rounded-lg px-4 py-2"><Skeleton className="h-4 w-48" /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
        <div className="border-t p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask about compliance..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>Send</Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

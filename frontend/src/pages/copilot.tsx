import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "user",
    content: "Which obligations are most at risk this week?",
  },
  {
    id: 2,
    role: "assistant",
    content: "3 obligations are trending toward breach: OBL-2036 (Client Funds Reconciliation, due Jul 13), OBL-2041 (PAN/Aadhaar verification, due Jul 25), and OBL-2039 (RPT board approval log, due Jul 18). OBL-2036 has already crossed SLA — I recommend escalating to R. Iyer.",
    sources: ["SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", "OBL-2036", "OBL-2041"],
  },
  {
    id: 3,
    role: "user",
    content: "Summarize the new circular SEBI/HO/MIRSD/POD-1/P/CIR/2026/108",
  },
  {
    id: 4,
    role: "assistant",
    content: "The circular tightens KYC for accounts > ₹50L AUM: (1) mandatory PAN-Aadhaar linkage verification, (2) video-KYC refresh every 90 days for HNI clients, (3) reporting of dormant accounts within 15 days. 12 obligations extracted, 3 mapped to existing policies.",
    sources: ["SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", "OBL-2036", "OBL-2041"],
  },
]

const suggestedPrompts = [
  "What's changed in KYC rules this quarter?",
  "Draft an SOP update for client fund segregation",
  "Which obligations are unmapped to evidence?",
  "Compare RPT thresholds vs FY25",
]

const mockResponses = [
  "Based on my analysis of the current compliance register, I found 3 relevant items that match your query. The most critical one is linked to the recent SEBI circular from July 2026. Would you like me to drill down into the specific obligations?",
  "I've cross-referenced this against your firm's compliance history. There are 2 precedent cases from FY25 that are directly applicable. The key difference in the current framework is the tightened reporting timeline.",
  "Here's what I found across your circulars and obligation register: the primary area of concern relates to client fund segregation requirements. I've identified 4 obligations that need updated SOPs.",
]

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        sources: ["SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", "OBL-2036"],
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Copilot</h1>
        <p className="mt-2 text-sm text-text-secondary">Ask questions across circulars, obligations, evidence and precedent.</p>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-8">
        {/* Chat Interface */}
        <Card className="flex flex-col h-[calc(100vh-230px)]">
          <CardContent className="flex-1 overflow-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-primary/10">
                    <Sparkles className="h-4 w-4 text-accent-primary" />
                  </div>
                )}
                <div className={cn("max-w-[80%] space-y-3", msg.role === "user" ? "order-1" : "")}>
                  <div className={cn("rounded-2xl px-5 py-4 text-sm leading-relaxed", msg.role === "user" ? "bg-bg-card-hover text-text-primary" : "bg-bg-base border border-border-subtle text-text-primary")}>
                    {msg.content}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] text-text-tertiary uppercase tracking-wider self-center mr-1">Sources:</span>
                      {msg.sources.map((source) => (
                        <Badge key={source} variant="default" className="text-[10px]">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-primary/10">
                  <Sparkles className="h-4 w-4 text-accent-primary" />
                </div>
                <div className="bg-bg-base border border-border-subtle rounded-2xl px-5 py-4">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t border-border-subtle p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about a circular, obligation, or precedent..."
                className="flex-1 h-12 rounded-xl border border-border-subtle bg-bg-base px-5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1 focus:ring-offset-bg-card"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Suggested Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Suggested Prompts</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="w-full text-left rounded-xl border border-border-subtle bg-bg-base px-4 py-3.5 text-xs text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition-colors leading-relaxed"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Grounding Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-primary/10">
                  <Info className="h-4 w-4 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2">Grounding</p>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Copilot searches your firm's compliance register, 12 years of SEBI circulars, and precedent memos. Answers cite source clauses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
